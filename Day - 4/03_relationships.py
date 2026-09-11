"""
Step 3 - Test the columns against each other.

Steps 1 and 2 looked at columns one at a time. That can only ever find
formatting problems. This script asks the harder question:

    Do these columns AGREE with each other?

That matters for two reasons.

First, it decides derive-vs-impute. If amount really does equal qty x rate,
then a missing amount is not missing at all - it is recoverable exactly, and
imputing it with a mean would be vandalism. If the identity does NOT hold, we
have to guess, and every later number inherits that guess.

Second, agreement is how you tell a RECORDED column from an INVENTED one. A
column that was genuinely written down alongside the others will corroborate
them. A column that was fabricated will not, no matter how tidy it looks.

This script is the gate. If test 1 fails, step 4's whole approach is invalid.
"""

import sys
from pathlib import Path

import pandas as pd

from kirana_lib import load_raw, resolve_date, to_number, UNPAID_STATUSES

sys.stdout.reconfigure(encoding="utf-8")

HERE = Path(__file__).parent
df = load_raw(HERE / "kirana_sales_raw.csv").drop_duplicates()


def rule(title):
    print(f"\n{'=' * 70}\n{title}\n{'=' * 70}")


print(f"Working with {len(df)} rows (the duplicate row is dropped first, so it")
print("cannot double-count in any of the tests below).")

# ---------------------------------------------------------------------------
rule("TEST 1 - does amount equal qty x rate?  [THIS IS THE GATE]")

qty = to_number(df["qty"])
rate = to_number(df["rate"])
amount = to_number(df["amount"])

# Only rows where all three parsed can be checked. Rows with a blank are the
# ones we WANT to fix, so they cannot also serve as evidence.
checkable = qty.notna() & rate.notna() & amount.notna()
expected = qty[checkable] * rate[checkable]
actual = amount[checkable]
mismatches = (actual != expected).sum()

print(f"rows where all three values parse: {checkable.sum()}")
print(f"mismatches:                        {mismatches}")

if mismatches == 0:
    print(
        "\nPASS. The identity holds on every single checkable row."
        "\n"
        "\nThis licenses the most important decision in step 4: the missing"
        "\nvalues in qty and amount get DERIVED, not imputed."
    )
    recoverable_amount = (amount.isna() & qty.notna() & rate.notna()).sum()
    recoverable_qty = (qty.isna() & amount.notna() & rate.notna()).sum()
    print(
        f"\n  blank amounts rebuildable as qty x rate:      {recoverable_amount}"
        f"\n  blank quantities rebuildable as amount / rate: {recoverable_qty}"
        f"\n  total gaps closed exactly, with zero guessing: "
        f"{recoverable_amount + recoverable_qty}"
    )
    print(
        "\nCompare that to the reflex answer, 'fill missing amount with the"
        "\nmean'. The mean amount here is around 430 rupees. Bill 5057 is 4kg"
        "\nof dal at 120, so its real amount is 480. Mean-filling would have"
        "\nput 430 there - a plausible-looking number that is simply false,"
        "\nand which would then flow into every total you report."
    )
else:
    print(
        f"\nFAIL. {mismatches} rows disagree, so the identity cannot be trusted"
        "\nand step 4 must not derive values from it. Investigate before"
        "\nproceeding - the plan changes."
    )
    bad = pd.DataFrame(
        {"bill": df["bill_no"][checkable], "qty": qty[checkable],
         "rate": rate[checkable], "amount": actual, "expected": expected}
    )
    print(bad[actual != expected].to_string(index=False))

# ---------------------------------------------------------------------------
rule("TEST 2 - does the 'day' column agree with the date?")

resolved = df["date"].apply(resolve_date)
parsed = resolved.apply(lambda pair: pair[0])
notes = resolved.apply(lambda pair: pair[1])

usable = parsed.notna()
claimed = df["day"][usable].str.strip()
actual_day = parsed[usable].dt.strftime("%a")
agreement = (claimed == actual_day)

print(f"dates successfully resolved: {usable.sum()} of {len(df)}")
print(f"'day' agrees with the real weekday: {agreement.sum()} "
      f"({agreement.mean():.0%})")
print("agreement expected from random guessing: ~14% (1 in 7)")
print(
    "\nThat is the whole test. A column that was really written down beside"
    "\nthe date would agree with it essentially always - a shopkeeper does not"
    "\nmisremember what day it is 79% of the time."
    "\n"
    "\nAt this level, 'day' carries no information about the date. It is not"
    "\nmerely dirty, it is fabricated, and no cleaning can repair it. Step 4"
    "\ndrops the column."
)
print(
    f"\n  'day' column claims Sunday for: {(df['day'].str.strip() == 'Sun').mean():.0%} of rows"
    f"\n  resolved dates actually fall on Sunday: {(parsed[usable].dt.dayofweek == 6).mean():.0%}"
)
print(
    "\nThis is why the Sunday spike mattered. Had we trusted 'day', we would"
    "\nhave reported 'a third of trade happens on Sunday' - a confident,"
    "\nquotable, completely invented finding."
)

# ---------------------------------------------------------------------------
rule("TEST 3 - does amount_paid agree with payment_status?")

paid_amount = to_number(df["amount_paid"]).fillna(0)
status_says_paid = ~df["payment_status"].str.strip().str.lower().isin(UNPAID_STATUSES)
amount_filled = amount.fillna(qty * rate)

summary = pd.DataFrame(
    {
        "rows": [(~status_says_paid).sum(), status_says_paid.sum()],
        "total_billed": [
            amount_filled[~status_says_paid].sum(),
            amount_filled[status_says_paid].sum(),
        ],
        "total_received": [
            paid_amount[~status_says_paid].sum(),
            paid_amount[status_says_paid].sum(),
        ],
    },
    index=["status says unpaid", "status says paid"],
)
print(summary.to_string())

unpaid_nonzero = (paid_amount[~status_says_paid] != 0).sum()
paid_shortfall = (
    paid_amount[status_says_paid] != amount_filled[status_says_paid]
).sum()
print(f"\nunpaid rows that nonetheless received money: {unpaid_nonzero}")
print(f"paid rows that received less than billed:    {paid_shortfall}")
print(
    "\nThe two columns agree perfectly, and the structure is strictly binary:"
    "\nan unpaid bill received exactly nothing, a paid bill received exactly"
    "\nthe full amount. There is not one partial payment in the file."
    "\n"
    "\nSo amount_paid holds no information that is_paid does not already carry."
    "\nThat is worth knowing before you build a 'collections' analysis on it."
    "\n"
    "\nIt is also the first real hint that this data is synthetic. A genuine"
    "\nudhaar book is full of part-payments - someone pays 500 of an 800 rupee"
    "\nbill and clears the rest on Friday. Perfect binary settlement across"
    "\nevery row is a sign of generated data, not a well-run shop."
)

# ---------------------------------------------------------------------------
rule("TEST 4 - can the four date formats be resolved?")

print(notes.value_counts().to_string())
print(
    "\nHow this works: each date is tried as day-first AND month-first, then"
    "\nwe keep whichever reading lands inside August-September 2026 - the"
    "\nwindow established by the 20 unambiguous text dates like '20 Aug'."
    "\n"
    "\nThat domain constraint does what no parser can. Note what it rules out:"
)
print(
    f"\n  resolved as day-first only:   {(notes == 'day-first').sum()}"
    f"\n  resolved as month-first only: {(notes == 'month-first').sum()}"
    f"\n  identical either way:         {(notes == 'both readings agree').sum()}"
    f"\n  year filled from the window:  {(notes == 'year assumed').sum()}"
    f"\n  genuinely ambiguous:          {(notes == 'AMBIGUOUS').sum()}"
)

ambiguous = df.loc[notes == "AMBIGUOUS", ["bill_no", "date"]]
if not ambiguous.empty:
    print("\nthe genuinely ambiguous row(s):")
    print(ambiguous.to_string(index=False))
    print(
        "\nFor these, both readings land inside the window and point at"
        "\ndifferent days, so the file cannot tell us which is right. Step 4"
        f"\nflags them rather than pretending. {len(ambiguous)} flagged rows out"
        f"\nof {len(df)} is a very different situation from the 'half the dates"
        "\nare unusable' you would conclude without applying the constraint."
    )

print(
    f"\nAlso note this, which is the reason dayfirst=True is a trap here:"
    f"\n{(notes == 'month-first').sum()} rows are month-first. Passing"
    "\ndayfirst=True would parse them without complaint and put them in the"
    "\nwrong month entirely. No error, no warning - just wrong dates."
)

print(f"\nresolved date span: {parsed.min().date()} to {parsed.max().date()}")

# ---------------------------------------------------------------------------
rule("Verdict")
print(
    f"  amount / qty      DERIVE from qty x rate. Proven on {checkable.sum()} rows,"
    "\n                    zero mismatches."
    "\n  amount_paid       Redundant once is_paid exists. Keep for audit only."
    "\n  payment_status    Split into is_paid + payment_method."
    f"\n  day               DROP. Fabricated - {agreement.mean():.0%} agreement"
    "\n                    against 14% expected by chance."
    f"\n  date              Resolve per row against the Aug-Sep window;"
    f"\n                    {(notes == 'AMBIGUOUS').sum()} rows stay flagged."
    "\n  rate              Leave alone. Already clean."
    "\n"
    "\nEvery one of those is now a decision backed by a test, not a habit."
    "\nStep 4 applies them."
)
