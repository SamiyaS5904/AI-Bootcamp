"""
Step 2 - Interrogate every column.

Step 1 told us what a row is. This script asks what each COLUMN is, by
printing its raw values rather than a summary of them.

The single idea running through this script:

    Cardinality lies until you normalise.

nunique() counts distinct STRINGS, not distinct THINGS. "Aata" and "aata 10kg"
are two strings and one product. "Anil Sethi" and "Anil Sethi " (trailing
space) are two strings and one person. Until you fix that, every groupby you
write silently splits the thing you meant to count.

This script does not fix anything. It lays out the evidence so the groupings
can be decided deliberately - because those decisions need domain knowledge
that no string function has.
"""

import sys
from pathlib import Path

import pandas as pd

sys.stdout.reconfigure(encoding="utf-8")

RAW = Path(__file__).parent / "kirana_sales_raw.csv"
df = pd.read_csv(RAW, dtype=str, keep_default_na=False, na_filter=False)

NUMERIC_COLS = ["qty", "rate", "amount", "amount_paid"]


def rule(title):
    print(f"\n{'=' * 70}\n{title}\n{'=' * 70}")


def show(value):
    """Make invisible characters visible. This matters more than it sounds."""
    if value == "":
        return "<blank>"
    return f"[{value}]" if value != value.strip() else value


# ---------------------------------------------------------------------------
rule("customer - 22 strings, how many actual entities?")
vc = df["customer"].value_counts()
print(pd.DataFrame({"rows": vc}).rename(index=lambda v: show(v)).to_string())
print(
    "\nThree separate problems tangled together here:"
    "\n"
    "\n  1. Case. 'Anil Sethi', 'ANIL SETHI' and 'anil sethi' are one person."
    "\n  2. Whitespace. 'Anil Sethi ' and ' Anil Sethi' are the same person"
    "\n     again - and you cannot see the difference in any viewer. Note the"
    "\n     square brackets above: those mark values with stray spaces."
    "\n  3. A different KIND of value. 'Cash', 'Counter', 'Walk-in' and blank"
    "\n     are not customers at all - they are four ways of writing"
    "\n     'nobody recorded a name'."
)
anon = {"cash", "counter", "walk-in", ""}
norm = df["customer"].str.strip().str.lower()
print(
    f"\n  anonymous rows: {norm.isin(anon).sum()}"
    f"\n  named rows:     {(~norm.isin(anon)).sum()}"
    f"\n  real people:    {norm[~norm.isin(anon)].nunique()}"
)
n_people = norm[~norm.isin(anon)].nunique()
print(
    f"\nSo {df['customer'].nunique()} apparent customers are {n_people} real"
    "\nregulars plus one anonymous bucket. Without that collapse, a 'top"
    "\ncustomers' table would rank 'Cash' first."
)

# ---------------------------------------------------------------------------
rule("item - 36 strings, how many actual products?")
print(df["item"].value_counts().to_string())
print(
    "\nHere lowercasing gets you almost nothing, because the variation is not"
    "\ntypographic - it is linguistic and structural:"
    "\n"
    "\n  Hindi and English names for one product:"
    "\n      Chawal = Rice      Doodh = Milk       Cheeni = Sugar"
    "\n      Namak  = Salt      Chai Patti = Tea   Tel    = Refined Oil"
    "\n      Aata / Atta = the same flour, spelled two ways"
    "\n"
    "\n  Pack size welded onto the name:"
    "\n      'Milk 1L', 'Aata 10kg', 'Namkeen 200g', 'Tea 250g'"
    "\n      Size is a separate attribute that has been jammed into the label."
    "\n"
    "\n  Brand standing in for category:"
    "\n      'Parle-G' is a biscuit."
    "\n"
    "\nNo amount of .str.lower() or .str.strip() collapses Chawal into Rice."
    "\nThis needs a human who knows the language and the shop. That is the"
    "\npoint: domain knowledge does work that string functions cannot."
)

# ---------------------------------------------------------------------------
rule("payment_status - 9 strings, but how many QUESTIONS are being answered?")
print(df["payment_status"].value_counts().to_string())
print(
    "\nLook carefully and these 9 values answer two different questions at once:"
    "\n"
    "\n  'Did the money arrive?'   Paid / paid / Done  vs  Pending / Credit /"
    "\n                            Udhaar / udhaar / Khata"
    "\n                            (udhaar and khata are Hindi for buying on"
    "\n                             credit - the shop's account book)"
    "\n"
    "\n  'How did it arrive?'      Cash"
    "\n"
    "\n'Cash' is a payment METHOD that has leaked into a status column. It is"
    "\nnot a third payment state. Two variables are stored in one column, which"
    "\nis why this needs splitting rather than just relabelling."
    "\n"
    "\nThis is the check worth internalising: before you group by a categorical,"
    "\nask whether it is actually ONE variable."
)

# ---------------------------------------------------------------------------
rule("rate - the one column that needs nothing")
print(df["rate"].value_counts().sort_index(key=lambda s: s.astype(int)).to_string())
print(
    "\nTen values, every one a clean integer, no blanks, no currency symbols."
    "\nWorth noticing WHY that is remarkable: this is a price list, so the"
    "\nshopkeeper is copying from a fixed set rather than writing free text."
    "\nColumns fed by a fixed vocabulary are usually the clean ones."
)

# ---------------------------------------------------------------------------
rule("qty / amount / amount_paid - numbers wearing costumes")
for col in NUMERIC_COLS:
    series = df[col]
    blanks = (series == "").sum()
    non_blank = series[series != ""]
    contaminated = non_blank[~non_blank.str.strip().str.fullmatch(r"\d+(\.\d+)?")]
    padded = non_blank[non_blank != non_blank.str.strip()]
    print(f"\n--- {col} ---")
    print(f"  blank:            {blanks}")
    print(f"  not a plain number: {len(contaminated)}")
    print(f"  padded with spaces: {len(padded)}")
    if len(contaminated):
        print(f"  offending values:   {sorted(set(contaminated))}")

print(
    "\nEvery one of these is a correct number in a costume:"
    "\n  'Rs 420', '₹1950'   currency symbol as a prefix"
    "\n  '700/-', '48/-'     the Indian shorthand for rupees, as a suffix"
    "\n  ' 264 '             padded with spaces, looks identical to '264'"
    "\n  '4 pcs'             unit welded onto the count"
    "\n"
    "\nThe VALUES are all fine. Only the TYPES are wrong. That is a much"
    "\nhappier situation than wrong values, and it is why the fix is a regex"
    "\nstrip rather than a judgement call."
    "\n"
    "\nThe padded ones deserve special respect. ' 264 ' and '264' look the same"
    "\nin every spreadsheet and every print-out, but they are different keys to"
    "\na groupby and different values to a join. Invisible bugs are the"
    "\nexpensive kind."
)

# ---------------------------------------------------------------------------
rule("date and day - saved for step 3")
print(f"date: {df['date'].nunique()} distinct values across {len(df)} rows")
print(df["day"].value_counts().to_string())
print(
    "\nThese two cannot be judged in isolation, which is why they wait for"
    "\nstep 3. 'day' looks like the cleanest column in the file - 7 tidy"
    "\nvalues, no blanks, no typos. Its problem is not its format. Its problem"
    "\nis whether it is TRUE, and the only way to know is to check it against"
    "\nanother column."
    "\n"
    "\nOne hint that something is off: Sun is a third of all rows. A shop can"
    "\ngenuinely be busiest on Sunday, so that is suspicious rather than"
    "\ndamning. Step 3 settles it."
)

rule("Next")
print(
    "Step 3 stops looking at columns one at a time and starts testing them"
    "\nagainst each other. That is what decides whether we can derive the"
    "\nmissing values or have to guess them."
)
