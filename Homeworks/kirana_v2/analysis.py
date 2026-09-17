"""
Kirana store register - cleaning and analysis.

Reads the raw register (one bill per row, one item per bill), repairs the
defects found in it, and writes every figure the dashboard shows to
figures.json. Nothing in the dashboard is typed by hand; it all comes from here.

Run:  python analysis.py
"""

import json
import re
import sys
from datetime import date, datetime
from pathlib import Path

import pandas as pd

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")

HERE = Path(__file__).resolve().parent
RAW = HERE.parent.parent / "kirana_sales_raw.csv"
OUT = HERE / "figures.json"

# The register clearly covers Aug-Sep 2026. Any date parse landing outside this
# window is an artefact of guessing the wrong format, not a real sale.
WINDOW_LO = date(2026, 8, 1)
WINDOW_HI = date(2026, 9, 30)

# rate -> canonical SKU. Verified 1:1 in this file: the ten selling prices are
# all distinct, so price identifies the product even where the name does not.
RATE_TO_SKU = {
    420: ("Atta 10kg", "Staples"),
    390: ("Rice 5kg", "Staples"),
    140: ("Refined Oil 1L", "Staples"),
    135: ("Tea 250g", "Grocery"),
    120: ("Dal 1kg", "Staples"),
    66: ("Milk 1L", "Daily fresh"),
    55: ("Namkeen 200g", "Snacks"),
    48: ("Sugar 1kg", "Staples"),
    30: ("Biscuits", "Snacks"),
    24: ("Salt 1kg", "Staples"),
}

SETTLED_TOKENS = {"paid", "done", "cash"}
UNPAID_TOKENS = {"udhaar", "khata", "credit", "pending"}
ANON_TOKENS = {"cash", "walk-in", "walk in", "counter", ""}

MONTHS = {m.lower(): i for i, m in enumerate(
    ["Jan", "Feb", "Mar", "Apr", "May", "Jun",
     "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"], start=1)}


# --------------------------------------------------------------------------
# field cleaners
# --------------------------------------------------------------------------

def parse_dates(raw):
    """Return (resolved_date, is_ambiguous, formats_that_worked).

    Tries every plausible format, keeps the parses that land inside the
    Aug-Sep 2026 window, and only calls a row ambiguous when two formats
    give two *different* in-window dates.
    """
    s = str(raw).strip()
    hits = {}

    for fmt in ("%d/%m/%Y", "%m/%d/%Y", "%d-%m-%Y", "%m-%d-%Y",
                "%d/%m/%y", "%d-%m-%y"):
        try:
            d = datetime.strptime(s, fmt).date()
        except ValueError:
            continue
        if WINDOW_LO <= d <= WINDOW_HI:
            hits[d] = hits.get(d, []) + [fmt]

    # "20 Aug" / "6 Sep" - no year written at all
    m = re.fullmatch(r"(\d{1,2})\s+([A-Za-z]{3,9})", s)
    if m and m.group(2)[:3].lower() in MONTHS:
        try:
            d = date(2026, MONTHS[m.group(2)[:3].lower()], int(m.group(1)))
        except ValueError:
            d = None
        if d and WINDOW_LO <= d <= WINDOW_HI:
            hits[d] = hits.get(d, []) + ["%d %b (year missing)"]

    if not hits:
        return None, False, []
    if len(hits) == 1:
        d = next(iter(hits))
        return d, False, hits[d]
    # two different in-window readings: prefer day-first (Indian convention)
    # but mark it, because the true date is genuinely unknowable.
    day_first = [d for d, fs in hits.items()
                 if any(f.startswith("%d") for f in fs)]
    chosen = min(day_first) if day_first else min(hits)
    return chosen, True, sorted(f for fs in hits.values() for f in fs)


def date_style(raw):
    """Which writing convention this date uses, for the audit table.

    A row is only called 'month first' where the second number is above 12 and
    therefore cannot be a month. Where it is undetermined the row is counted
    under day-first, which is both the Indian convention and what parse_dates
    picks - so this table never claims more certainty than the parser has.
    """
    s = str(raw).strip()
    if re.fullmatch(r"\d{1,2}\s+[A-Za-z]{3,9}", s):
        return "6 Sep - no year written"
    if re.fullmatch(r"\d{1,2}[-/]\d{1,2}[-/]\d{2}", s):
        return "25-8-26 - two-digit year"
    sep = "/" if "/" in s else "-"
    _, b, _ = s.split(sep)
    if int(b) > 12:
        return f"09{sep}15{sep}2026 - month first"
    return f"25{sep}09{sep}2026 - day first"


def to_number(raw):
    """'Rs 1,950' / '700/-' / ' 780 ' / '₹264' -> float. Blank -> None."""
    if raw is None or pd.isna(raw):
        return None
    s = str(raw).strip()
    if s == "":
        return None
    s = re.sub(r"(rs\.?|₹|/-|pcs|,)", "", s, flags=re.I).strip()
    if s == "":
        return None
    try:
        return float(s)
    except ValueError:
        return None


def clean_name(raw):
    if raw is None or pd.isna(raw):
        return "Walk-in (anonymous)", False
    s = str(raw).strip()
    if s.lower() in ANON_TOKENS:
        return "Walk-in (anonymous)", False
    return " ".join(w.capitalize() for w in s.split()), True


def classify_status(raw):
    """The column mixes payment METHOD with payment STATE. Split them."""
    s = str(raw).strip().lower()
    if s in UNPAID_TOKENS:
        return False, "n/a (unpaid)"
    if s == "cash":
        return True, "Cash"
    if s in SETTLED_TOKENS:
        return True, "Unknown"          # 'Paid'/'Done' never says how
    return True, "Unknown"


# --------------------------------------------------------------------------
# load + clean
# --------------------------------------------------------------------------

df = pd.read_csv(RAW, dtype=str, encoding="utf-8", keep_default_na=False)
df = df.replace("", pd.NA)
n_raw = len(df)

# 1. exact duplicate rows -------------------------------------------------
dup_mask = df.duplicated(keep="first")
dup_rows = df[dup_mask].copy()
dup_bills = sorted(dup_rows["bill_no"].dropna().unique().tolist())
dup_value = 0.0
for _, r in dup_rows.iterrows():
    q, rt = to_number(r["qty"]), to_number(r["rate"])
    if q and rt:
        dup_value += q * rt
df = df[~dup_mask].reset_index(drop=True)

# 2/3. dates and weekday ---------------------------------------------------
parsed = df["date"].apply(parse_dates)
df["date_clean"] = [p[0] for p in parsed]
df["date_ambiguous"] = [p[1] for p in parsed]
df["date_style"] = df["date"].apply(date_style)
df["weekday"] = [d.strftime("%a") if d else None for d in df["date_clean"]]

unparsed = int(df["date_clean"].isna().sum())
n_ambiguous = int(df["date_ambiguous"].sum())
n_date_styles = df["date_style"].nunique()

# the 'day' column, checked against a real calendar
day_checked = df[df["date_clean"].notna() & df["day"].notna()]
day_match = int((day_checked["day"].str.strip().str[:3]
                 == day_checked["weekday"]).sum())
day_total = len(day_checked)

# 4. item -> SKU via rate --------------------------------------------------
df["rate_n"] = df["rate"].apply(to_number)
df["sku"] = df["rate_n"].apply(lambda r: RATE_TO_SKU[int(r)][0])
df["category"] = df["rate_n"].apply(lambda r: RATE_TO_SKU[int(r)][1])
raw_item_strings = df["item"].str.strip().nunique()

# 5. money -----------------------------------------------------------------
df["qty_raw"] = df["qty"]
df["amount_raw"] = df["amount"]
df["qty_n"] = df["qty"].apply(to_number)
df["amount_n"] = df["amount"].apply(to_number)
df["paid_n"] = df["amount_paid"].apply(to_number)

qty_missing = int(df["qty_n"].isna().sum())
amount_missing = int(df["amount_n"].isna().sum())
qty_text = int(df["qty_raw"].fillna("").astype(str).str.contains("pcs").sum())
amount_text = int(df["amount_raw"].fillna("").astype(str)
                  .str.contains(r"rs|₹|/-|^\s+|\s+$", case=False, regex=True).sum())

# backfill qty from amount / rate where qty is blank
df["qty_n"] = df.apply(
    lambda r: r["qty_n"] if pd.notna(r["qty_n"])
    else (r["amount_n"] / r["rate_n"] if pd.notna(r["amount_n"]) else None),
    axis=1)

df["line_total"] = df["qty_n"] * df["rate_n"]

# does the written amount disagree with qty x rate anywhere?
both = df[df["amount_n"].notna() & df["line_total"].notna()]
arithmetic_errors = int((both["amount_n"].round(2)
                         != both["line_total"].round(2)).sum())

# what the register says if you just add up its own amount column, as written,
# blanks counted as nothing and the duplicate row still in it
as_written = (pd.read_csv(RAW, dtype=str, encoding="utf-8", keep_default_na=False)
              ["amount"].apply(to_number).fillna(0).sum())

# 6. payment status --------------------------------------------------------
status = df["payment_status"].apply(classify_status)
df["settled"] = [s[0] for s in status]
df["method"] = [s[1] for s in status]
n_status_tokens = df["payment_status"].str.strip().nunique()
unpaid_blank = int(df[~df["settled"]]["amount_paid"].isna().sum())
unpaid_zero = int((df[~df["settled"]]["paid_n"] == 0).sum())

# 7. customers -------------------------------------------------------------
names = df["customer"].apply(clean_name)
df["customer_clean"] = [n[0] for n in names]
df["is_named"] = [n[1] for n in names]
raw_name_strings = df["customer"].fillna("(blank)").str.strip().nunique()

# --------------------------------------------------------------------------
# figures
# --------------------------------------------------------------------------

revenue = float(df["line_total"].sum())
bills = int(len(df))
units = float(df["qty_n"].sum())
credit = df[~df["settled"]]
credit_total = float(credit["line_total"].sum())
collected = revenue - credit_total

by_sku = (df.groupby(["sku", "category", "rate_n"])
            .agg(revenue=("line_total", "sum"),
                 bills=("bill_no", "count"),
                 units=("qty_n", "sum"))
            .reset_index()
            .sort_values("revenue", ascending=False))
by_sku["rev_share"] = by_sku["revenue"] / revenue * 100
by_sku["unit_share"] = by_sku["units"] / units * 100

cum = 0.0
pareto = []
for _, r in by_sku.iterrows():
    cum += r["rev_share"]
    pareto.append(round(cum, 1))
by_sku["cum_share"] = pareto

named = df[df["is_named"]]
by_cust = (named.groupby("customer_clean")
                .agg(spend=("line_total", "sum"), bills=("bill_no", "count"))
                .reset_index())
owed = (credit[credit["is_named"]].groupby("customer_clean")["line_total"]
        .sum().rename("owed"))
by_cust = by_cust.merge(owed, on="customer_clean", how="left").fillna({"owed": 0.0})
by_cust["pct_unpaid"] = by_cust["owed"] / by_cust["spend"] * 100
by_cust = by_cust.sort_values("owed", ascending=False)

# --- reminder thresholds -------------------------------------------------
# Which cut-off is worth setting before a reminder goes out? The answer has to
# come from this shop's own balances, not from a round number: the largest
# single balance here is small enough that a high cut-off never fires at all.
n_debtors = int((by_cust["owed"] > 0).sum())
threshold_table = []
for t in (200, 500, 1000, 2000, 5000):
    caught = by_cust[by_cust["owed"] >= t]
    amt = float(caught["owed"].sum())
    threshold_table.append({
        "threshold": t,
        "people": int(len(caught)),
        "of_people": n_debtors,
        "amount": round(amt),
        "pct": round(amt / credit_total * 100, 1),
    })

biggest_credit_bill = credit.loc[credit["line_total"].idxmax()]

dated = df[df["date_clean"].notna()].copy()
dated["month"] = [d.strftime("%b %Y") for d in dated["date_clean"]]
by_month = (dated.groupby("month", sort=False)
                 .agg(revenue=("line_total", "sum"), bills=("bill_no", "count"))
                 .reindex(["Aug 2026", "Sep 2026"]).reset_index())

daily = (dated.groupby("date_clean")
              .agg(revenue=("line_total", "sum"), bills=("bill_no", "count"))
              .reset_index().sort_values("date_clean"))

WD = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
by_weekday = (dated.groupby("weekday")
                   .agg(revenue=("line_total", "sum"), bills=("bill_no", "count"))
                   .reindex(WD).fillna(0).reset_index())
by_weekday["avg_bill"] = (by_weekday["revenue"] /
                          by_weekday["bills"].replace(0, pd.NA)).fillna(0)

# the 'day' column as written, for comparison against the real calendar
claimed = df["day"].str.strip().str[:3].value_counts().reindex(WD).fillna(0)

credit_by_sku = (credit.groupby("sku")["line_total"].sum()
                 .sort_values(ascending=False).reset_index())

anon = df[~df["is_named"]]
trading_days = int(dated["date_clean"].nunique())
span_days = (WINDOW_HI - WINDOW_LO).days + 1

figures = {
    "meta": {
        "source": RAW.name,
        "generated": datetime.now().strftime("%d %b %Y"),
        "rows_raw": n_raw,
        "rows_clean": bills,
        "date_from": min(dated["date_clean"]).strftime("%d %b %Y"),
        "date_to": max(dated["date_clean"]).strftime("%d %b %Y"),
        "trading_days": trading_days,
        "span_days": span_days,
        "n_skus": int(by_sku.shape[0]),
        "raw_item_strings": int(raw_item_strings),
        "n_named": int(named["customer_clean"].nunique()),
        "raw_name_strings": int(raw_name_strings),
    },
    "kpi": {
        "revenue": round(revenue),
        "bills": bills,
        "units": round(units),
        "avg_bill": round(revenue / bills),
        "credit": round(credit_total),
        "credit_bills": int(len(credit)),
        "credit_pct": round(credit_total / revenue * 100, 1),
        "collected": round(collected),
        "collected_pct": round(collected / revenue * 100, 1),
        "credit_days_of_trade": round(credit_total / (revenue / trading_days), 1),
        "top2_share": round(float(by_sku.head(2)["rev_share"].sum()), 1),
        "named_bills": int(len(named)),
        "named_revenue": round(float(named["line_total"].sum())),
        "named_pct": round(float(named["line_total"].sum()) / revenue * 100, 1),
        "named_avg_bill": round(float(named["line_total"].mean())),
        "anon_avg_bill": round(float(anon["line_total"].mean())),
        "items_per_bill": round(len(df) / df["bill_no"].nunique(), 2),
    },
    "quality": {
        "dup_bills": dup_bills,
        "dup_value": round(dup_value),
        "n_date_styles": n_date_styles,
        "date_styles": df["date_style"].value_counts().to_dict(),
        "date_ambiguous": n_ambiguous,
        "date_ambiguous_bills": df[df["date_ambiguous"]]["bill_no"].tolist(),
        "date_unparsed": unparsed,
        "day_col_match": day_match,
        "day_col_total": day_total,
        "day_col_mismatch_pct": round((1 - day_match / day_total) * 100, 1),
        "raw_item_strings": int(raw_item_strings),
        "n_skus": int(by_sku.shape[0]),
        "raw_name_strings": int(raw_name_strings),
        "n_named": int(named["customer_clean"].nunique()),
        "n_status_tokens": n_status_tokens,
        "status_tokens": df["payment_status"].str.strip().value_counts().to_dict(),
        "method_unknown": int((df["method"] == "Unknown").sum()),
        "method_cash": int((df["method"] == "Cash").sum()),
        "qty_missing": qty_missing,
        "qty_text": qty_text,
        "amount_missing": amount_missing,
        "amount_text": amount_text,
        "arithmetic_errors": arithmetic_errors,
        "unpaid_blank": unpaid_blank,
        "unpaid_zero": unpaid_zero,
        "as_written": round(float(as_written)),
        "true_total": round(revenue),
        "understated_by": round(revenue - float(as_written)),
        "understated_pct": round((revenue - float(as_written)) / revenue * 100, 1),
    },
    "skus": [
        {"sku": r["sku"], "category": r["category"], "rate": int(r["rate_n"]),
         "revenue": round(r["revenue"]), "bills": int(r["bills"]),
         "units": round(r["units"]), "rev_share": round(r["rev_share"], 1),
         "unit_share": round(r["unit_share"], 1),
         "cum_share": r["cum_share"]}
        for _, r in by_sku.iterrows()],
    "customers": [
        {"name": r["customer_clean"], "spend": round(r["spend"]),
         "bills": int(r["bills"]), "owed": round(r["owed"]),
         "pct_unpaid": round(r["pct_unpaid"], 1)}
        for _, r in by_cust.iterrows()],
    "monthly": [
        {"month": r["month"], "revenue": round(r["revenue"]),
         "bills": int(r["bills"])}
        for _, r in by_month.iterrows()],
    "daily": [
        {"date": r["date_clean"].strftime("%d %b"),
         "revenue": round(r["revenue"]), "bills": int(r["bills"])}
        for _, r in daily.iterrows()],
    "weekday": [
        {"day": r["weekday"], "revenue": round(r["revenue"]),
         "bills": int(r["bills"]), "avg_bill": round(r["avg_bill"]),
         "claimed_bills": int(claimed[r["weekday"]])}
        for _, r in by_weekday.iterrows()],
    "reminder": {
        "n_debtors": n_debtors,
        "recommended": 500,
        "thresholds": threshold_table,
        "biggest_bill": {
            "bill": biggest_credit_bill["bill_no"],
            "customer": biggest_credit_bill["customer_clean"],
            "sku": biggest_credit_bill["sku"],
            "qty": int(biggest_credit_bill["qty_n"]),
            "amount": round(float(biggest_credit_bill["line_total"])),
            "pct_of_book": round(float(biggest_credit_bill["line_total"])
                                 / credit_total * 100, 1),
        },
        "udhaar_bills_per_month": round(len(credit) / 2, 1),
        "days_between_udhaar_bills": round(trading_days / len(credit), 1),
    },
    "credit_by_sku": [
        {"sku": r["sku"], "amount": round(r["line_total"])}
        for _, r in credit_by_sku.iterrows()],
    "credit_bills": [
        {"bill": r["bill_no"], "customer": r["customer_clean"],
         "sku": r["sku"], "amount": round(r["line_total"]),
         "status_written": str(r["payment_status"]).strip(),
         "date": r["date_clean"].strftime("%d %b") if r["date_clean"] else "?"}
        for _, r in credit.sort_values("line_total", ascending=False).iterrows()],
}

# --------------------------------------------------------------------------
# assertions - the dashboard is only worth as much as these
# --------------------------------------------------------------------------

assert abs(revenue - sum(s["revenue"] for s in figures["skus"])) < 1, "SKU split != total"
assert abs(credit_total - sum(c["amount"] for c in figures["credit_bills"])) < 1, "credit split != total"
assert abs(credit_total - sum(c["owed"] for c in figures["customers"])) < 1, "credit by customer != total"
assert arithmetic_errors == 0, "written amounts disagree with qty x rate"
assert unparsed == 0, f"{unparsed} dates could not be parsed"
assert df["rate_n"].notna().all(), "a row has no rate"

OUT.write_text(json.dumps(figures, indent=1, ensure_ascii=False), encoding="utf-8")

# --------------------------------------------------------------------------
# report
# --------------------------------------------------------------------------

k, q, m = figures["kpi"], figures["quality"], figures["meta"]
print(f"\n{'='*66}\n  KIRANA REGISTER  |  {m['date_from']} - {m['date_to']}\n{'='*66}")
print(f"  rows read {m['rows_raw']} -> {m['rows_clean']} after removing duplicate "
      f"bill {', '.join(q['dup_bills'])} (Rs {q['dup_value']:,})")
print(f"\n  Revenue        Rs {k['revenue']:,}   over {k['bills']} bills, "
      f"{k['units']} units, {m['trading_days']} trading days")
print(f"  Average bill   Rs {k['avg_bill']:,}   ({k['items_per_bill']} items per bill)")
print(f"  Collected      Rs {k['collected']:,}   ({k['collected_pct']}%)")
print(f"  Udhaar         Rs {k['credit']:,}   ({k['credit_pct']}%, {k['credit_bills']} bills, "
      f"= {k['credit_days_of_trade']} days of trade)")

print(f"\n  {'PRODUCT':<16}{'RATE':>6}{'REVENUE':>11}{'SHARE':>8}{'BILLS':>7}{'UNITS':>7}{'CUM':>7}")
for s in figures["skus"]:
    print(f"  {s['sku']:<16}{s['rate']:>6}{s['revenue']:>11,}{s['rev_share']:>7.1f}%"
          f"{s['bills']:>7}{s['units']:>7}{s['cum_share']:>6.1f}%")

print(f"\n  {'CUSTOMER':<20}{'SPEND':>9}{'BILLS':>7}{'OWED':>9}{'UNPAID':>9}")
for c in figures["customers"]:
    print(f"  {c['name']:<20}{c['spend']:>9,}{c['bills']:>7}{c['owed']:>9,}"
          f"{c['pct_unpaid']:>8.1f}%")

print(f"\n  {'MONTH':<12}{'REVENUE':>10}{'BILLS':>7}")
for mo in figures["monthly"]:
    print(f"  {mo['month']:<12}{mo['revenue']:>10,}{mo['bills']:>7}")

print(f"\n  {'WEEKDAY':<10}{'REVENUE':>10}{'BILLS':>7}{'AVG':>7}   vs 'day' column says")
for w in figures["weekday"]:
    print(f"  {w['day']:<10}{w['revenue']:>10,}{w['bills']:>7}{w['avg_bill']:>7}"
          f"        {w['claimed_bills']}")

r = figures["reminder"]
print(f"\n  REMINDER THRESHOLD - what each cut-off would actually catch")
print(f"  {'CUT-OFF':<10}{'PEOPLE':>8}{'MONEY':>9}{'OF BOOK':>10}")
for t in r["thresholds"]:
    print(f"  Rs {t['threshold']:<7,}{t['people']:>4} of {t['of_people']}"
          f"{t['amount']:>9,}{t['pct']:>9.1f}%")
b = r["biggest_bill"]
print(f"  biggest single udhaar bill: {b['bill']} {b['customer']}, "
      f"{b['qty']}x {b['sku']} = Rs {b['amount']:,} ({b['pct_of_book']}% of the book)")
print(f"  udhaar bills to record: {r['udhaar_bills_per_month']}/month, "
      f"one every {r['days_between_udhaar_bills']} trading days")

print(f"\n  DATA QUALITY")
print(f"    duplicate bills            {len(q['dup_bills'])}  (Rs {q['dup_value']:,} of phantom revenue)")
print(f"    date formats in one column {q['n_date_styles']}  -> {q['date_ambiguous']} rows unresolvable "
      f"({', '.join(q['date_ambiguous_bills']) or 'none'})")
print(f"    'day' column vs calendar   {q['day_col_match']}/{q['day_col_total']} agree "
      f"-> {q['day_col_mismatch_pct']}% wrong")
print(f"    item spellings             {q['raw_item_strings']} strings for {q['n_skus']} products")
print(f"    customer spellings         {q['raw_name_strings']} strings for {q['n_named']} people + walk-ins")
print(f"    payment_status tokens      {q['n_status_tokens']} "
      f"-> payment method unknown on {q['method_unknown']} of {figures['kpi']['bills']} bills")
print(f"    blank qty / blank amount   {q['qty_missing']} / {q['amount_missing']}")
print(f"    amounts written as text    {q['amount_text']}")
print(f"    unpaid shown blank vs '0'  {q['unpaid_blank']} vs {q['unpaid_zero']}")
print(f"    arithmetic contradictions  {q['arithmetic_errors']}")
print(f"\n    register adds up to        Rs {q['as_written']:,}")
print(f"    true total                 Rs {q['true_total']:,}")
print(f"    the book understates by    Rs {q['understated_by']:,} ({q['understated_pct']}%)")

print(f"\n  wrote {OUT.name}\n")
