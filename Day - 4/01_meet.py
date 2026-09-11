"""
Step 1 - Meet the data.

The goal of this script is NOT to fix anything. It is to answer one question
before we touch a single value:

    What does one row of this file actually represent?

Everything we decide later - how to fill blanks, what to group by, which
columns to trust - depends on the answer. Getting this wrong early means
every number afterwards is confidently wrong.

Two habits worth copying from this script:

  1. Load with dtype=str and keep_default_na=False.
     By default pandas guesses types and turns blanks into NaN. That guessing
     HIDES the mess: "Rs 420" quietly becomes the string it always was while
     "420" becomes an int, and you can no longer see which is which. Loading
     everything as text means we see the file exactly as it sits on disk.

  2. Look before you summarise.
     106 rows is small enough to read with your eyes. A .describe() would
     average away the very problems we are hunting for.
"""

import sys
from pathlib import Path

import pandas as pd

# This machine's console is cp1252, which cannot print the rupee sign and
# crashes with UnicodeEncodeError. Forcing utf-8 here means every later script
# can print raw values safely without setting an environment variable.
sys.stdout.reconfigure(encoding="utf-8")

RAW = Path(__file__).parent / "kirana_sales_raw.csv"

pd.set_option("display.max_rows", 200)
pd.set_option("display.width", 200)


def rule(title):
    print(f"\n{'=' * 70}\n{title}\n{'=' * 70}")


# ---------------------------------------------------------------------------
# Load as pure text so nothing is silently coerced or hidden.
# ---------------------------------------------------------------------------
df = pd.read_csv(RAW, dtype=str, keep_default_na=False, na_filter=False)

rule("1. Shape - how much data is there?")
print(f"rows:    {len(df)}")
print(f"columns: {df.shape[1]}")
print(f"\ncolumn names: {list(df.columns)}")
print(
    "\nSmall enough to read by hand. That is a luxury - it means every claim"
    "\nwe make can be checked against the raw file, so we never have to trust"
    "\na summary statistic we cannot verify."
)

rule("2. What is one row? - the grain")
# A row could be a bill, a line on a bill, a customer, or a daily total.
# The test: if bills == rows, then each bill has exactly one line.
n_rows = len(df)
n_bills = df["bill_no"].nunique()
print(f"rows:           {n_rows}")
print(f"unique bill_no: {n_bills}")
print(f"lines per bill: {n_rows / n_bills:.2f}")

if n_bills < n_rows:
    print(
        f"\nFewer unique bills than rows, so {n_rows - n_bills} bill number(s) repeat."
        "\nThat is either a genuine multi-item bill or a duplicated row - and those"
        "\nare very different problems. Section 3 tells them apart."
    )

rule("3. The repeated bill number - real basket, or duplicate?")
dupes = df[df["bill_no"].duplicated(keep=False)].sort_values("bill_no")
if dupes.empty:
    print("No repeated bill numbers.")
else:
    print(dupes.to_string(index=False))
    print(
        "\nA genuine two-item bill would share bill_no, date and customer but"
        "\ndiffer on item. These rows are identical in EVERY column, so this is"
        "\na duplicated record, not a basket."
    )
    # Where in the file does it sit? A duplicate next to its twin is usually a
    # copy-paste; one far away is usually a bad append or a double export.
    positions = df.index[df["bill_no"].isin(dupes["bill_no"])].tolist()
    print(f"\nfile positions (0-based): {positions}")
    print(
        "The copy is nowhere near the original, so scrolling would never reveal"
        "\nit. Counting unique values is what caught it."
    )
    print(
        f"\nSo the true grain is: one row = one bill = one product,"
        f"\nacross {n_bills} real bills."
    )
    print(
        "\nConsequence, and it is a big one: with one product per bill there are"
        "\nno baskets. Any question of the form 'what do people buy together?'"
        "\nis unanswerable from this file no matter how well we clean it."
    )

rule("4. First and last rows - see it with your own eyes")
print("--- first 8 ---")
print(df.head(8).to_string(index=False))
print("\n--- last 8 ---")
print(df.tail(8).to_string(index=False))

rule("5. Where are the holes?")
# Because we loaded with na_filter=False, a missing value is the empty string.
blank = (df == "").sum()
report = pd.DataFrame(
    {
        "blank": blank,
        "blank_%": (blank / len(df) * 100).round(1),
        "distinct_values": df.nunique(),
    }
)
print(report.to_string())
print(
    "\nRead the distinct_values column with suspicion, not relief:"
    "\n  - day has 7 values, which looks clean. Step 3 shows it is noise."
    "\n  - customer has 22, which looks like 22 customers. It is not - and note"
    "\n    that 22 counts the blank as a value, so it is 21 written names plus"
    "\n    'no name at all'. Watch for that off-by-one whenever you read nunique."
    "\n  - rate has 10, which is genuinely 10 fixed prices."
    "\nA tidy-looking column is not the same as a trustworthy one."
)

rule("6. Blanks are not one problem")
print(
    "Three columns have blanks and each needs a DIFFERENT fix. Same appearance,"
    "\nthree different meanings:"
    "\n"
    f"\n  amount ({blank['amount']}) and qty ({blank['qty']})"
    "\n      Recoverable. amount = qty x rate holds across this file, so the"
    "\n      missing value can be rebuilt exactly from the other two. We prove"
    "\n      that in step 3 before relying on it."
    "\n"
    f"\n  amount_paid ({blank['amount_paid']})"
    "\n      Not missing at all. It means nothing was received - the bill is on"
    "\n      credit. Note some rows write this as a literal 0 instead, so the"
    "\n      same fact is encoded two ways."
    "\n"
    f"\n  customer ({blank['customer']})"
    "\n      Also not missing. It means a walk-in nobody recorded a name for."
    "\n"
    "\nThis is why 'fill missing values with the mean' is the wrong reflex."
    "\nMean-filling amount would invent money. Mean-filling amount_paid would"
    "\ninvent a payment that never happened."
)

rule("Next")
print(
    "We know what a row is and where the holes are. Step 2 interrogates each"
    "\ncolumn's actual values, where we find out that 21 customers are really 7"
    "\nthings and 36 item names are really 10 products."
)
