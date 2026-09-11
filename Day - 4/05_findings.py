"""
Step 5 - What this data can answer, and what it cannot.

The second half is the part people skip, and it is the part that makes an
analysis trustworthy. A findings document that only lists what you found reads
as authoritative whether or not it deserves to. Saying plainly which questions
the data cannot support is what separates analysis from decoration.

Writes FINDINGS.md and two charts.
"""

import sys
from pathlib import Path

import matplotlib

matplotlib.use("Agg")  # no display needed; write straight to PNG
import matplotlib.pyplot as plt
import pandas as pd

sys.stdout.reconfigure(encoding="utf-8")

HERE = Path(__file__).parent
df = pd.read_csv(HERE / "kirana_sales_clean.csv", parse_dates=["date"])

# Charts use 'Rs' rather than the rupee sign: matplotlib's default font has no
# glyph for it and would silently draw empty boxes.
INK = "#3d3d3a"
ACCENT = "#c8663c"
MUTED = "#b8b3a7"

revenue = df["amount"].sum()
outstanding = df.loc[~df["is_paid"], "amount"].sum()


def rule(title):
    print(f"\n{'=' * 70}\n{title}\n{'=' * 70}")


def md_table(frame):
    """Render a DataFrame as a markdown table.

    pandas' own .to_markdown() needs the 'tabulate' package, which is not
    installed here - and this analysis is not worth adding a dependency for.
    Twelve lines beats a pip install.
    """
    index_name = frame.index.name or ""
    header = [index_name] + [str(c) for c in frame.columns]

    def cell(value):
        if isinstance(value, float):
            return f"{value:g}"
        return str(value)

    rows = [
        [cell(idx)] + [cell(v) for v in row]
        for idx, row in zip(frame.index, frame.to_numpy())
    ]
    out = ["| " + " | ".join(header) + " |",
           "| " + " | ".join("---" for _ in header) + " |"]
    out += ["| " + " | ".join(r) + " |" for r in rows]
    return "\n".join(out)


# ---------------------------------------------------------------------------
rule("Product mix - money and footfall disagree")

products = (
    df.groupby("product")
    .agg(bills=("amount", "size"), units=("qty", "sum"), revenue=("amount", "sum"))
    .sort_values("revenue", ascending=False)
)
products["rev_share"] = (products["revenue"] / revenue * 100).round(1)
products["bill_share"] = (products["bills"] / len(df) * 100).round(1)
print(products.to_string())

top_two = products.head(2)
print(
    f"\n{' and '.join(top_two.index)} are {top_two['rev_share'].sum():.0f}% of"
    f" revenue from {top_two['bill_share'].sum():.0f}% of bills."
    "\nMilk is the second most frequent purchase but only"
    f" {products.loc['Milk', 'rev_share']}% of revenue - a footfall driver, not"
    "\nan earner. That distinction is invisible if you rank products by one"
    "\nmetric alone, which is why the chart below plots both."
)

# ---------------------------------------------------------------------------
rule("Credit tracks identity, with no exceptions")

crosstab = pd.crosstab(
    df["is_walk_in"].map({True: "anonymous", False: "named person"}),
    df["is_paid"].map({True: "paid", False: "on credit"}),
)
print(crosstab.to_string())
print(
    "\nNot one anonymous sale went on credit. Half of all named-customer sales"
    "\ndid. The causation runs the way you would expect in a real shop: the"
    "\nshopkeeper writes a name down BECAUSE he is extending credit, not the"
    "\nother way round."
    "\n"
    "\nThe analytical consequence: customer_name and is_paid are not"
    "\nindependent variables. Any model using both is using one fact twice."
)

udhaar = (
    df[~df["is_paid"]]
    .groupby("customer_name")
    .agg(bills=("amount", "size"), owed=("amount", "sum"))
    .sort_values("owed", ascending=False)
)
print(f"\nthe udhaar book - {outstanding:,.0f} outstanding "
      f"({outstanding / revenue:.1%} of revenue):")
print(udhaar.to_string())

regulars = df.loc[~df["is_walk_in"], "customer_name"].nunique()
print(
    f"\nNote that {len(udhaar)} of the {regulars} regulars owe money."
    f" {', '.join(sorted(set(df.loc[~df['is_walk_in'], 'customer_name']) - set(udhaar.index)))}"
    " is the"
    "\nonly named customer who always pays on the spot."
)

# ---------------------------------------------------------------------------
rule("Basket size and prices")

print(f"bills:              {len(df)}")
print(f"items per bill:     {len(df) / df['bill_no'].nunique():.2f} (always exactly one)")
print(f"mean units per bill: {df['qty'].mean():.2f}")
print(f"median bill value:   {df['amount'].median():,.0f}")
print(f"mean bill value:     {df['amount'].mean():,.0f}")
print("\nprices, and how many times each moved in two months:")
price_check = df.groupby("product")["rate"].agg(["nunique", "min", "max"])
price_check.columns = ["distinct_prices", "min", "max"]
print(price_check.to_string())

# ---------------------------------------------------------------------------
rule("Charts")

fig, ax = plt.subplots(figsize=(8, 4.5))
order = products.index[::-1]
y = range(len(order))
ax.barh([i + 0.2 for i in y], products.loc[order, "rev_share"], height=0.38,
        color=ACCENT, label="share of revenue")
ax.barh([i - 0.2 for i in y], products.loc[order, "bill_share"], height=0.38,
        color=MUTED, label="share of bills")
ax.set_yticks(list(y))
ax.set_yticklabels(order, color=INK)
ax.set_xlabel("percent", color=INK)
ax.set_title("Revenue share vs footfall share, by product", color=INK, loc="left")
ax.legend(frameon=False)
for spine in ("top", "right"):
    ax.spines[spine].set_visible(False)
fig.tight_layout()
fig.savefig(HERE / "product_mix.png", dpi=150)
plt.close(fig)
print("  wrote product_mix.png")

fig, ax = plt.subplots(figsize=(7, 3.6))
ax.barh(udhaar.index[::-1], udhaar["owed"][::-1], color=ACCENT, height=0.6)
ax.set_xlabel("rupees outstanding", color=INK)
ax.set_title(f"The udhaar book - Rs {outstanding:,.0f} owed by "
             f"{len(udhaar)} customers", color=INK, loc="left")
for spine in ("top", "right"):
    ax.spines[spine].set_visible(False)
fig.tight_layout()
fig.savefig(HERE / "udhaar_book.png", dpi=150)
plt.close(fig)
print("  wrote udhaar_book.png")

# ---------------------------------------------------------------------------
rule("What this data CANNOT answer")

limits = [
    (
        "What do customers buy together?",
        "Every bill has exactly one product. There are no baskets in this file, "
        "so market-basket and affinity analysis are impossible - not difficult, "
        "impossible. No amount of cleaning creates data that was never recorded.",
    ),
    (
        "How does demand respond to price?",
        "Each product has exactly one price for the whole period, so price never "
        "varies. With no variation there is nothing to correlate against; "
        "elasticity is unanswerable by construction.",
    ),
    (
        "Which day of the week is busiest?",
        "The 'day' column was fabricated - it matched the real weekday 19% of "
        "the time against 14% expected by chance - so it was dropped. Weekday "
        "can be recomputed from the resolved dates, but with 105 bills over two "
        "months that is roughly 1.7 bills per day: far too thin to support a "
        "claim about weekly rhythm.",
    ),
    (
        "When exactly did bills 5036 and 5096 happen?",
        "Both dates are ambiguous between two valid readings that fall inside the "
        "ledger window. The file cannot say which is right; both rows carry "
        "date_ambiguous = True and the earlier reading was taken as an arbitrary "
        "tie-break.",
    ),
    (
        "Do these patterns say anything about a real kirana shop?",
        "No, and this is the most important limit. Prices never move to the "
        "rupee across two months, amount equals qty x rate on all 93 checkable "
        "rows with zero arithmetic slips, and every unpaid bill received exactly "
        "zero rather than a part-payment. Real hand-kept ledgers do none of "
        "those things. This is a generated teaching dataset: the cleaning "
        "technique transfers to real work completely, the business conclusions "
        "do not transfer at all.",
    ),
]
for question, answer in limits:
    print(f"\n  {question}\n      {answer}")

# ---------------------------------------------------------------------------
lines = [
    "# Kirana sales ledger - findings",
    "",
    f"Source: `kirana_sales_raw.csv` (106 rows) -> `kirana_sales_clean.csv` "
    f"({len(df)} rows, {len(df.columns)} columns).",
    "",
    "## Headline numbers",
    "",
    f"- **Revenue:** Rs {revenue:,.0f} across {len(df)} bills, "
    f"{df['date'].min():%d %b} to {df['date'].max():%d %b %Y}",
    f"- **Outstanding credit:** Rs {outstanding:,.0f} ({outstanding / revenue:.1%} "
    f"of revenue) owed by {len(udhaar)} customers",
    f"- **Median bill:** Rs {df['amount'].median():,.0f}; "
    f"mean {df['qty'].mean():.2f} units per bill",
    "- **Grain:** one row = one bill = one product, always",
    "",
    "## What the data says",
    "",
    "### Credit is a relationship, not a transaction",
    "",
    md_table(crosstab),
    "",
    "Not one anonymous sale went on credit; half of all named-customer sales "
    "did. The shopkeeper records a name *because* he is extending credit. "
    "`customer_name` and `is_paid` therefore encode the same underlying fact "
    "and are not independent variables.",
    "",
    "### Revenue and footfall point at different products",
    "",
    md_table(products[["bills", "units", "revenue", "rev_share", "bill_share"]]),
    "",
    f"{' and '.join(top_two.index)} make {top_two['rev_share'].sum():.0f}% of the "
    f"money. Milk is second on frequency but only "
    f"{products.loc['Milk', 'rev_share']}% of revenue - it brings people in, "
    "staples pay the rent.",
    "",
    "### The udhaar book",
    "",
    md_table(udhaar),
    "",
    "## What this data cannot answer",
    "",
]
for question, answer in limits:
    lines += [f"**{question}**", "", answer, ""]

lines += [
    "## Cleaning decisions",
    "",
    "Each was licensed by a test in `03_relationships.py`, not by habit:",
    "",
    "| decision | justification |",
    "| --- | --- |",
    "| Dropped duplicated bill 5016 | Identical across all 10 columns; a real "
    "two-item bill would differ on `item` |",
    "| Stripped `Rs` / rupee sign / `/-` / ` pcs` / padding | Values were "
    "correct, only the types were wrong |",
    "| Derived 4 quantities and 8 amounts | `amount = qty x rate` held on 93/93 "
    "checkable rows, so these rebuild exactly - mean-imputing would invent money |",
    "| 36 item names -> 10 products | Variation is linguistic (Chawal=Rice, "
    "Doodh=Milk, Parle-G=Biscuit), which no string function collapses |",
    "| `payment_status` -> `is_paid` + `payment_method` | One column held two "
    "variables; `Cash` is a method, not a state |",
    "| 22 customer strings -> 7 regulars + anonymous flag | Case variants, "
    "invisible whitespace, and four spellings of 'no name recorded' |",
    "| Dates resolved per row against the Aug-Sep window | Four formats "
    "coexist; `dayfirst=True` would silently mangle the 8 month-first rows |",
    "| Dropped `day` | Agreed with the real weekday 19% of the time vs 14% by "
    "chance - fabricated, not dirty |",
    "",
    "Every original column is retained with a `_raw` suffix, so any cleaned "
    "value can be traced back to the text it came from.",
    "",
    "## Reproducing",
    "",
    "```",
    "python 01_meet.py           # what is one row?",
    "python 02_columns.py        # what is in each column?",
    "python 03_relationships.py  # do the columns agree? (the gate)",
    "python 04_clean.py          # apply the decisions -> clean CSV",
    "python 05_findings.py       # findings, limits, charts",
    "```",
    "",
    "Shared parsing and mapping logic lives in `kirana_lib.py`.",
    "",
]

(HERE / "FINDINGS.md").write_text("\n".join(lines), encoding="utf-8")
print("\nwrote FINDINGS.md")
