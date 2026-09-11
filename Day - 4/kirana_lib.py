"""
Shared helpers for the kirana analysis.

Why this file exists: steps 3, 4 and 5 all need to turn 'Rs 420' into 420 and
'Chawal 5kg' into 'Rice'. Writing that logic three times guarantees the three
copies drift apart, and then two scripts disagree about the same number with no
obvious reason. One definition, imported everywhere.

Every mapping here is EXPLICIT on purpose. The temptation with messy categories
is to write something clever and general. Don't - with 36 item names and 10
real products, a hand-written dictionary is auditable, and a clever regex is
not. When someone asks in six months why Parle-G counts as a biscuit, you want
to point at a line, not explain an algorithm.
"""

import re

import numpy as np
import pandas as pd

# --- the shop's real catalogue ------------------------------------------------
# Keys are substrings matched against a lowercased item name, in this order.
# Hindi and English names for the same product both map to one label.
PRODUCT_PATTERNS = [
    ("aata", "Atta"),      # aata / atta - wheat flour, two spellings
    ("atta", "Atta"),
    ("chawal", "Rice"),    # chawal = rice
    ("rice", "Rice"),
    ("doodh", "Milk"),     # doodh = milk
    ("milk", "Milk"),
    ("cheeni", "Sugar"),   # cheeni = sugar
    ("sugar", "Sugar"),
    ("namak", "Salt"),     # namak = salt
    ("salt", "Salt"),
    ("chai", "Tea"),       # chai patti = tea leaves
    ("tea", "Tea"),
    ("tel", "Oil"),        # tel = oil
    ("oil", "Oil"),
    ("namkeen", "Namkeen"),  # savoury snack mix
    ("mixture", "Namkeen"),  # 'mixture' is a namkeen variety
    ("parle", "Biscuit"),    # Parle-G is a biscuit brand
    ("biscuit", "Biscuit"),
    ("daal", "Dal"),       # daal / dal - lentils
    ("dal", "Dal"),
]

# Pack size is a separate attribute that was welded onto the item name.
PACK_SIZE_RE = re.compile(r"(\d+\s*(?:kg|g|l|ml))\b", re.I)

# payment_status values that mean the money has NOT arrived.
# udhaar and khata are Hindi for buying on credit / the shop's account book.
UNPAID_STATUSES = {"udhaar", "khata", "credit", "pending"}

# customer values that mean 'nobody recorded a name', not an actual customer.
ANONYMOUS_CUSTOMERS = {"cash", "counter", "walk-in", ""}

# This ledger covers August-September 2026 only. That fact comes from the 20
# unambiguous text dates in the file ('20 Aug', '6 Sep', ...) and it is what
# lets us resolve the ambiguous slash-dates. See resolve_date().
LEDGER_YEAR = 2026
LEDGER_MONTHS = (8, 9)


def load_raw(path):
    """Load the CSV as pure text.

    dtype=str stops pandas guessing types; keep_default_na=False and
    na_filter=False stop it turning blanks into NaN. Together they mean we see
    the file exactly as it sits on disk, mess included.
    """
    return pd.read_csv(path, dtype=str, keep_default_na=False, na_filter=False)


def to_number(series):
    """Strip currency costumes and return a numeric Series.

    Handles 'Rs 420', '700/-', '₹264', ' 198 ', '4 pcs' - every one of
    which is a correct number with decoration around it. Blanks become NaN so
    they stay visibly missing rather than silently becoming zero.
    """
    cleaned = series.astype(str).str.replace(r"[^0-9.]", "", regex=True)
    return pd.to_numeric(cleaned.replace("", np.nan), errors="coerce")


def to_product(item):
    """Map a raw item name to one of the shop's 10 real products."""
    text = str(item).strip().lower()
    for pattern, product in PRODUCT_PATTERNS:
        if pattern in text:
            return product
    return f"UNMAPPED:{item}"


def to_pack_size(item):
    """Pull the pack size back out of the item name ('Aata 10kg' -> '10kg')."""
    match = PACK_SIZE_RE.search(str(item))
    return match.group(1).replace(" ", "").lower() if match else ""


def is_paid(status):
    """True if the money arrived. Collapses 9 spellings into a boolean."""
    return str(status).strip().lower() not in UNPAID_STATUSES


def to_payment_method(status):
    """Recover the payment method that leaked into the status column.

    'Cash' in payment_status is a METHOD, not a state. The other values say
    nothing about method, so they become 'unknown' rather than being guessed.
    """
    text = str(status).strip().lower()
    if text == "cash":
        return "cash"
    if text in UNPAID_STATUSES:
        return "credit"
    return "unknown"


def normalise_customer(value):
    """Collapse case and whitespace variants; return '' for anonymous rows."""
    text = " ".join(str(value).split())          # also fixes internal doubles
    if text.lower() in ANONYMOUS_CUSTOMERS:
        return ""
    return text.title()


def resolve_date(raw):
    """Parse one date string, returning (Timestamp | NaT, note).

    Four formats appear in this file and NO single parsing strategy handles
    them. In particular:

      - dayfirst=True silently mangles the 8 rows that are month-first
      - a single format= string fails on three of the four shapes

    So each row is resolved on its own terms. For slash and dash dates we try
    day-first and month-first, then keep whichever lands inside the ledger's
    August-September 2026 window. That domain constraint does the work a parser
    cannot: it resolves all but one row in the file.

    The note explains what happened, so nothing is silently guessed.
    """
    text = str(raw).strip()

    # 'd Mon' with no year at all - the year comes from the ledger window.
    for fmt in ("%d %b", "%d %B"):
        try:
            parsed = pd.to_datetime(text, format=fmt)
            return pd.Timestamp(LEDGER_YEAR, parsed.month, parsed.day), "year assumed"
        except ValueError:
            pass

    parts = re.split(r"[/-]", text)
    if len(parts) != 3:
        return pd.NaT, "unparseable"

    try:
        first, second, year_part = (int(p) for p in parts)
    except ValueError:
        return pd.NaT, "unparseable"

    year = year_part if year_part > 99 else 2000 + year_part

    candidates = {}
    for day, month, label in ((first, second, "day-first"), (second, first, "month-first")):
        if 1 <= month <= 12 and 1 <= day <= 31:
            try:
                candidates[label] = pd.Timestamp(year, month, day)
            except ValueError:
                pass

    # Keep only readings that land inside the ledger window.
    plausible = {
        label: ts
        for label, ts in candidates.items()
        if ts.year == LEDGER_YEAR and ts.month in LEDGER_MONTHS
    }

    if not plausible:
        return pd.NaT, "outside ledger window"

    if len(plausible) == 1:
        label, ts = next(iter(plausible.items()))
        return ts, label

    # Both readings are plausible. If they point at the same day (09/09/2026)
    # the ambiguity is harmless; otherwise it is real and must be flagged.
    distinct = set(plausible.values())
    if len(distinct) == 1:
        return distinct.pop(), "both readings agree"

    return min(distinct), "AMBIGUOUS"
