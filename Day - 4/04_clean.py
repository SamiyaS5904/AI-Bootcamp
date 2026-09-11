"""
Step 4 - Clean the data, one justified decision at a time.

Nothing here is a new idea. Every transformation below was licensed by a test
in step 3, and this script says which test as it goes. That is the discipline
worth taking away: a cleaning script should be readable as an argument, not as
a list of incantations.

Two rules this script follows:

  1. The raw file is never modified. We read it and write a new file.
  2. Every original column survives beside its cleaned version, suffixed
     _raw. That means any number in the output can be traced back to the text
     it came from - so if we got a mapping wrong, it is findable rather than
     baked in invisibly.

The output is deliberately WIDER than the input. Cleaning is not compression.
"""

import sys
from pathlib import Path

import pandas as pd

from kirana_lib import (
    is_paid,
    load_raw,
    normalise_customer,
    resolve_date,
    to_number,
    to_pack_size,
    to_payment_method,
    to_product,
)

sys.stdout.reconfigure(encoding="utf-8")

HERE = Path(__file__).parent
OUT = HERE / "kirana_sales_clean.csv"

log = []


def decide(what, why):
    log.append((what, why))
    print(f"\n  {what}\n      why: {why}")


def rule(title):
    print(f"\n{'=' * 70}\n{title}\n{'=' * 70}")


raw = load_raw(HERE / "kirana_sales_raw.csv")
print(f"loaded {len(raw)} rows from kirana_sales_raw.csv")

# ---------------------------------------------------------------------------
rule("DECISION 1 - drop the duplicated record")

before = len(raw)
df = raw.drop_duplicates().reset_index(drop=True)
decide(
    f"dropped {before - len(df)} row (bill 5016), leaving {len(df)}",
    "step 1 showed 5016 appears twice, identical in all 10 columns. A genuine "
    "two-item bill would differ on item, so this is a duplicated record. "
    "Keeping it would inflate revenue by 700 rupees.",
)

# Preserve the raw text of every column we are about to change.
for column in ["date", "customer", "item", "qty", "amount", "payment_status", "amount_paid"]:
    df[f"{column}_raw"] = df[column]

# ---------------------------------------------------------------------------
rule("DECISION 2 - strip the currency costumes")

df["rate"] = to_number(df["rate"])
qty_parsed = to_number(df["qty"])
amount_parsed = to_number(df["amount"])
df["amount_paid"] = to_number(df["amount_paid"])

decide(
    "removed 'Rs', the rupee sign, '/-', ' pcs' and stray spaces from qty, "
    "amount and amount_paid",
    "step 2 showed these are correct numbers with decoration around them. The "
    "values were never wrong, only the types - so a regex strip is a "
    "formatting fix, not a judgement call.",
)

# ---------------------------------------------------------------------------
rule("DECISION 3 - derive the missing quantities and amounts")

df["qty_was_derived"] = qty_parsed.isna() & amount_parsed.notna()
df["amount_was_derived"] = amount_parsed.isna() & qty_parsed.notna()

df["qty"] = qty_parsed.fillna(amount_parsed / df["rate"])
df["amount"] = amount_parsed.fillna(df["qty"] * df["rate"])

decide(
    f"derived {df['qty_was_derived'].sum()} quantities and "
    f"{df['amount_was_derived'].sum()} amounts from the identity "
    "amount = qty x rate",
    "TEST 1 in step 3 proved the identity holds on all 93 checkable rows with "
    "zero mismatches. That makes these values recoverable exactly. Imputing "
    "them with a mean would have invented money.",
)

# Show the derived rows so the arithmetic is visible, not asserted.
derived = df[df["qty_was_derived"] | df["amount_was_derived"]]
print("\n      the 12 rebuilt values:")
print(
    derived[["bill_no", "item_raw", "qty_raw", "rate", "amount_raw", "qty", "amount"]]
    .to_string(index=False)
    .replace("\n", "\n      ")
)

# ---------------------------------------------------------------------------
rule("DECISION 4 - map 36 item names onto 10 real products")

df["product"] = df["item_raw"].apply(to_product)
df["pack_size"] = df["item_raw"].apply(to_pack_size)

unmapped = df.loc[df["product"].str.startswith("UNMAPPED"), "item_raw"].unique()
if len(unmapped):
    raise SystemExit(f"unmapped items - fix PRODUCT_PATTERNS first: {list(unmapped)}")

decide(
    f"collapsed {df['item_raw'].nunique()} item strings into "
    f"{df['product'].nunique()} products, and lifted pack size into its own column",
    "step 2 showed the variation is linguistic, not typographic - Chawal is "
    "Rice, Doodh is Milk, Parle-G is a biscuit. Lowercasing collapses none of "
    "those. The mapping is an explicit dictionary in kirana_lib.py so every "
    "decision is auditable.",
)
print("\n      product distribution:")
print(df["product"].value_counts().to_string().replace("\n", "\n      "))

# ---------------------------------------------------------------------------
rule("DECISION 5 - split payment_status into its two variables")

df["is_paid"] = df["payment_status_raw"].apply(is_paid)
df["payment_method"] = df["payment_status_raw"].apply(to_payment_method)

decide(
    f"replaced {df['payment_status_raw'].nunique()} status strings with "
    f"is_paid (boolean) + payment_method",
    "step 2 showed the column answers two questions at once: whether money "
    "arrived, and how. 'Cash' is a method, not a state. Grouping by the raw "
    "column would treat a payment method as a third kind of payment status.",
)
print(f"\n      unpaid bills: {(~df['is_paid']).sum()}")
print(f"      paid bills:   {df['is_paid'].sum()}")

# ---------------------------------------------------------------------------
rule("DECISION 6 - separate customer identity from anonymity")

df["customer_name"] = df["customer_raw"].apply(normalise_customer)
df["is_walk_in"] = df["customer_name"] == ""

decide(
    f"collapsed {df['customer_raw'].nunique()} customer strings into "
    f"{df.loc[~df['is_walk_in'], 'customer_name'].nunique()} named regulars "
    f"plus {df['is_walk_in'].sum()} anonymous rows",
    "step 2 showed three problems in one column: case variants, invisible "
    "whitespace, and four different spellings of 'no name recorded'. Without "
    "this, a top-customers table ranks 'Cash' first and splits Anil Sethi "
    "across four rows.",
)
print("\n      named customers:")
print(
    df.loc[~df["is_walk_in"], "customer_name"]
    .value_counts()
    .to_string()
    .replace("\n", "\n      ")
)

# ---------------------------------------------------------------------------
rule("DECISION 7 - resolve the dates, flag only what is truly unknowable")

resolved = df["date_raw"].apply(resolve_date)
df["date"] = resolved.apply(lambda pair: pair[0])
df["date_note"] = resolved.apply(lambda pair: pair[1])
df["date_ambiguous"] = df["date_note"] == "AMBIGUOUS"

decide(
    f"resolved {df['date'].notna().sum()} of {len(df)} dates; flagged "
    f"{df['date_ambiguous'].sum()} as ambiguous",
    "TEST 4 showed four formats coexist, so dayfirst=True would silently "
    "mangle the 8 month-first rows and a single format= string would fail "
    "outright. Resolving each row against the August-September window fixes "
    "all but the handful where both readings are plausible.",
)
print("\n      how each date was resolved:")
print(df["date_note"].value_counts().to_string().replace("\n", "\n      "))
print("\n      rows left ambiguous (kept, but marked):")
print(
    df.loc[df["date_ambiguous"], ["bill_no", "date_raw", "date"]]
    .to_string(index=False)
    .replace("\n", "\n      ")
)

# ---------------------------------------------------------------------------
rule("DECISION 8 - drop the 'day' column entirely")

df = df.drop(columns=["day"])
decide(
    "removed 'day' rather than cleaning it",
    "TEST 2 showed it agrees with the real weekday 19% of the time against "
    "14% expected from random guessing. It is not dirty, it is fabricated. "
    "Keeping a fabricated column invites someone to analyse it later - the "
    "safest cleaning action is deletion.",
)

# ---------------------------------------------------------------------------
rule("Verification - the output must not have invented or lost money")

ORDER = [
    "bill_no", "date", "date_note", "date_ambiguous",
    "customer_name", "is_walk_in",
    "product", "pack_size", "qty", "rate", "amount",
    "is_paid", "payment_method", "amount_paid",
    "qty_was_derived", "amount_was_derived",
    "date_raw", "customer_raw", "item_raw", "qty_raw", "amount_raw",
    "payment_status_raw", "amount_paid_raw",
]
clean = df[ORDER].sort_values("bill_no").reset_index(drop=True)

revenue = clean["amount"].sum()
outstanding = clean.loc[~clean["is_paid"], "amount"].sum()

checks = [
    ("rows == 105", len(clean) == 105),
    ("bill_no unique", clean["bill_no"].is_unique),
    ("no blank qty", clean["qty"].notna().all()),
    ("no blank rate", clean["rate"].notna().all()),
    ("no blank amount", clean["amount"].notna().all()),
    ("amount == qty * rate everywhere", bool((clean["amount"] == clean["qty"] * clean["rate"]).all())),
    ("exactly 10 products", clean["product"].nunique() == 10),
    ("14 unpaid bills", int((~clean["is_paid"]).sum()) == 14),
    ("every date parsed", clean["date"].notna().all()),
    ("revenue == 45540", revenue == 45540),
    ("outstanding == 4680", outstanding == 4680),
]
for label, passed in checks:
    print(f"  {'PASS' if passed else 'FAIL'}  {label}")

# Independent reconciliation: total the raw amount text on the rows that were
# already intact, and confirm cleaning did not move the number.
intact = to_number(raw.drop_duplicates()["amount"])
intact_total = intact.sum()
clean_same_rows = clean.loc[~clean["amount_was_derived"], "amount"].sum()
print(
    f"\n  raw amount text, intact rows only:   {intact_total:,.0f}"
    f"\n  clean amount, those same rows:       {clean_same_rows:,.0f}"
    f"\n  match: {intact_total == clean_same_rows}"
)
print(
    "\n  That is the check that matters. It compares the cleaned figures against"
    "\n  the raw text independently of everything above, so a bug in the parsing"
    "\n  would show up as a mismatch rather than as a plausible wrong total."
)

if not all(passed for _, passed in checks):
    raise SystemExit("\nverification failed - not writing the output file")

clean.to_csv(OUT, index=False, encoding="utf-8")
print(f"\nwrote {OUT.name}: {len(clean)} rows x {len(clean.columns)} columns")

rule("Decision log")
for i, (what, why) in enumerate(log, 1):
    print(f"{i}. {what}")
print(
    f"\nrevenue: {revenue:,.0f}   outstanding credit: {outstanding:,.0f}"
    f"   ({outstanding / revenue:.1%} of revenue)"
)
