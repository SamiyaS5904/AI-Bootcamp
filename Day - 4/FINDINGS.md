# Kirana sales ledger - findings

Source: `kirana_sales_raw.csv` (106 rows) -> `kirana_sales_clean.csv` (105 rows, 23 columns).

## Headline numbers

- **Revenue:** Rs 45,540 across 105 bills, 02 Aug to 28 Sep 2026
- **Outstanding credit:** Rs 4,680 (10.3% of revenue) owed by 6 customers
- **Median bill:** Rs 264; mean 2.39 units per bill
- **Grain:** one row = one bill = one product, always

## What the data says

### Credit is a relationship, not a transaction

| is_walk_in | on credit | paid |
| --- | --- | --- |
| anonymous | 0 | 77 |
| named person | 14 | 14 |

Not one anonymous sale went on credit; half of all named-customer sales did. The shopkeeper records a name *because* he is extending credit. `customer_name` and `is_paid` therefore encode the same underlying fact and are not independent variables.

### Revenue and footfall point at different products

| product | bills | units | revenue | rev_share | bill_share |
| --- | --- | --- | --- | --- | --- |
| Atta | 24 | 47 | 19740 | 43.3 | 22.9 |
| Rice | 12 | 33 | 12870 | 28.3 | 11.4 |
| Milk | 22 | 59 | 3894 | 8.6 | 21 |
| Oil | 7 | 23 | 3220 | 7.1 | 6.7 |
| Tea | 7 | 13 | 1755 | 3.9 | 6.7 |
| Namkeen | 9 | 23 | 1265 | 2.8 | 8.6 |
| Dal | 3 | 10 | 1200 | 2.6 | 2.9 |
| Sugar | 11 | 21 | 1008 | 2.2 | 10.5 |
| Biscuit | 5 | 10 | 300 | 0.7 | 4.8 |
| Salt | 5 | 12 | 288 | 0.6 | 4.8 |

Atta and Rice make 72% of the money. Milk is second on frequency but only 8.6% of revenue - it brings people in, staples pay the rent.

### The udhaar book

| customer_name | bills | owed |
| --- | --- | --- |
| Sukhwinder Kaur | 1 | 1680 |
| Manpreet Kaur | 2 | 1200 |
| Harish Chand | 5 | 738 |
| Anil Sethi | 4 | 726 |
| Baljit Singh | 1 | 240 |
| Neha Gupta | 1 | 96 |

## What this data cannot answer

**What do customers buy together?**

Every bill has exactly one product. There are no baskets in this file, so market-basket and affinity analysis are impossible - not difficult, impossible. No amount of cleaning creates data that was never recorded.

**How does demand respond to price?**

Each product has exactly one price for the whole period, so price never varies. With no variation there is nothing to correlate against; elasticity is unanswerable by construction.

**Which day of the week is busiest?**

The 'day' column was fabricated - it matched the real weekday 19% of the time against 14% expected by chance - so it was dropped. Weekday can be recomputed from the resolved dates, but with 105 bills over two months that is roughly 1.7 bills per day: far too thin to support a claim about weekly rhythm.

**When exactly did bills 5036 and 5096 happen?**

Both dates are ambiguous between two valid readings that fall inside the ledger window. The file cannot say which is right; both rows carry date_ambiguous = True and the earlier reading was taken as an arbitrary tie-break.

**Do these patterns say anything about a real kirana shop?**

No, and this is the most important limit. Prices never move to the rupee across two months, amount equals qty x rate on all 93 checkable rows with zero arithmetic slips, and every unpaid bill received exactly zero rather than a part-payment. Real hand-kept ledgers do none of those things. This is a generated teaching dataset: the cleaning technique transfers to real work completely, the business conclusions do not transfer at all.

## Cleaning decisions

Each was licensed by a test in `03_relationships.py`, not by habit:

| decision | justification |
| --- | --- |
| Dropped duplicated bill 5016 | Identical across all 10 columns; a real two-item bill would differ on `item` |
| Stripped `Rs` / rupee sign / `/-` / ` pcs` / padding | Values were correct, only the types were wrong |
| Derived 4 quantities and 8 amounts | `amount = qty x rate` held on 93/93 checkable rows, so these rebuild exactly - mean-imputing would invent money |
| 36 item names -> 10 products | Variation is linguistic (Chawal=Rice, Doodh=Milk, Parle-G=Biscuit), which no string function collapses |
| `payment_status` -> `is_paid` + `payment_method` | One column held two variables; `Cash` is a method, not a state |
| 22 customer strings -> 7 regulars + anonymous flag | Case variants, invisible whitespace, and four spellings of 'no name recorded' |
| Dates resolved per row against the Aug-Sep window | Four formats coexist; `dayfirst=True` would silently mangle the 8 month-first rows |
| Dropped `day` | Agreed with the real weekday 19% of the time vs 14% by chance - fabricated, not dirty |

Every original column is retained with a `_raw` suffix, so any cleaned value can be traced back to the text it came from.

## Reproducing

```
python 01_meet.py           # what is one row?
python 02_columns.py        # what is in each column?
python 03_relationships.py  # do the columns agree? (the gate)
python 04_clean.py          # apply the decisions -> clean CSV
python 05_findings.py       # findings, limits, charts
```

Shared parsing and mapping logic lives in `kirana_lib.py`.
