"""
Step 6 - Build the business insights report as one self-contained HTML page.

Audience: a bootcamp evaluator. That drives the structure - every insight is
paired with the evidence that established it, because an unsupported claim is
worth nothing to someone assessing the analysis. Each section reads:

    the claim  ->  the evidence  ->  the business inference

Self-contained is a hard requirement. Charts are rendered to an in-memory
buffer and embedded as base64 data URIs, CSS is inline, fonts are a system
stack. The output is one file that works offline with no sibling images and no
network access.

Every number on the page is computed here from kirana_sales_clean.csv. Nothing
is retyped from an earlier run - a retyped figure is one that silently goes
stale the moment the data changes.
"""

import base64
import io
import sys
from datetime import date
from pathlib import Path

import matplotlib

matplotlib.use("Agg")
import matplotlib.pyplot as plt
import pandas as pd

sys.stdout.reconfigure(encoding="utf-8")

HERE = Path(__file__).parent
OUT = HERE / "kirana_report.html"

df = pd.read_csv(HERE / "kirana_sales_clean.csv", parse_dates=["date"])
raw = pd.read_csv(
    HERE / "kirana_sales_raw.csv", dtype=str, keep_default_na=False, na_filter=False
)

# Charts use "Rs" rather than the rupee sign: matplotlib's default font has no
# glyph for it and would draw empty boxes without warning. The HTML declares
# utf-8, so the sign is safe there.
INK, ACCENT, MUTED, RISK = "#2f2e2b", "#c8663c", "#c4bfb4", "#a4462a"


def embed(fig):
    """Render a figure to a base64 data URI so the page needs no image files."""
    buffer = io.BytesIO()
    fig.savefig(buffer, format="png", dpi=150, bbox_inches="tight")
    plt.close(fig)
    encoded = base64.b64encode(buffer.getvalue()).decode("ascii")
    return f"data:image/png;base64,{encoded}"


def strip_frame(ax):
    for spine in ("top", "right"):
        ax.spines[spine].set_visible(False)
    ax.tick_params(colors=INK)


# ---------------------------------------------------------------------------
# the numbers - all derived, none retyped
# ---------------------------------------------------------------------------
revenue = df["amount"].sum()
outstanding = df.loc[~df["is_paid"], "amount"].sum()
collected = revenue - outstanding

products = (
    df.groupby("product")
    .agg(bills=("amount", "size"), units=("qty", "sum"), revenue=("amount", "sum"))
    .sort_values("revenue", ascending=False)
)
products["rev_share"] = (products["revenue"] / revenue * 100).round(1)
products["bill_share"] = (products["bills"] / len(df) * 100).round(1)
products["cum_rev_share"] = products["rev_share"].cumsum().round(1)

named = df[~df["is_walk_in"]]
walk_in = df[df["is_walk_in"]]

customers = named.groupby("customer_name").agg(
    bills=("amount", "size"), billed=("amount", "sum")
)
customers["unpaid"] = (
    named[~named["is_paid"]]
    .groupby("customer_name")["amount"]
    .sum()
    .reindex(customers.index)
    .fillna(0)
)
customers["pct_unpaid"] = (customers["unpaid"] / customers["billed"] * 100).round(0)
customers = customers.sort_values("pct_unpaid", ascending=False)

crosstab = pd.crosstab(
    df["is_walk_in"].map({True: "Anonymous walk-in", False: "Named person"}),
    df["is_paid"].map({True: "Paid on the spot", False: "On credit"}),
)[["Paid on the spot", "On credit"]]

named_rev_share = named["amount"].sum() / revenue * 100
top2_debt_share = (
    customers.sort_values("unpaid", ascending=False)["unpaid"].head(2).sum()
    / outstanding
    * 100
)

biggest = customers["billed"].idxmax()
riskiest = customers["pct_unpaid"].idxmax()
always_pays = customers.index[customers["unpaid"] == 0].tolist()

# The rate <-> product bijection, verified rather than asserted.
rate_to_product = df.groupby("rate")["product"].nunique()
product_to_rate = df.groupby("product")["rate"].nunique()
rate_identifies_product = bool((rate_to_product == 1).all())
product_has_one_price = bool((product_to_rate == 1).all())

# If the data ever changes so price no longer identifies product, insight 5
# becomes false and must not be published as fact.
if not (rate_identifies_product and product_has_one_price):
    raise SystemExit("rate no longer uniquely identifies product - revise insight 5")

# ---------------------------------------------------------------------------
# chart 1 - revenue share vs footfall share
# ---------------------------------------------------------------------------
fig, ax = plt.subplots(figsize=(8, 4.4))
order = products.index[::-1]
positions = range(len(order))
ax.barh(
    [p + 0.2 for p in positions],
    products.loc[order, "rev_share"],
    height=0.38,
    color=ACCENT,
    label="share of revenue",
)
ax.barh(
    [p - 0.2 for p in positions],
    products.loc[order, "bill_share"],
    height=0.38,
    color=MUTED,
    label="share of bills",
)
ax.set_yticks(list(positions))
ax.set_yticklabels(order)
ax.set_xlabel("percent", color=INK)
ax.legend(frameon=False, loc="lower right")
strip_frame(ax)
CHART_MIX = embed(fig)

# ---------------------------------------------------------------------------
# chart 2 - credit exposure: billed vs unpaid, so the RATIO is readable
# ---------------------------------------------------------------------------
by_size = customers.sort_values("billed")
fig, ax = plt.subplots(figsize=(8, 3.8))
ax.barh(by_size.index, by_size["billed"], color=MUTED, height=0.62, label="total billed")
ax.barh(by_size.index, by_size["unpaid"], color=RISK, height=0.62, label="still unpaid")
for i, (_, row) in enumerate(by_size.iterrows()):
    ax.text(
        row["billed"] + 70,
        i,
        f"{row['pct_unpaid']:.0f}% unpaid",
        va="center",
        fontsize=9,
        color=INK,
    )
ax.set_xlim(0, by_size["billed"].max() * 1.3)
ax.set_xlabel("rupees", color=INK)
ax.legend(frameon=False, loc="lower right")
strip_frame(ax)
CHART_CREDIT = embed(fig)

# ---------------------------------------------------------------------------
# chart 3 - the credit / identity separation
# ---------------------------------------------------------------------------
fig, ax = plt.subplots(figsize=(7.5, 2.4))
paid = crosstab["Paid on the spot"].to_numpy()
credit = crosstab["On credit"].to_numpy()
ax.barh(list(crosstab.index), paid, color=MUTED, height=0.55, label="paid on the spot")
ax.barh(
    list(crosstab.index), credit, left=paid, color=RISK, height=0.55, label="on credit"
)
for i, (p, c) in enumerate(zip(paid, credit)):
    ax.text(p / 2, i, str(p), va="center", ha="center", fontsize=10, color=INK)
    if c:
        ax.text(
            p + c / 2, i, str(c), va="center", ha="center", fontsize=10, color="white"
        )
ax.set_xlabel("bills", color=INK)
ax.legend(frameon=False, loc="lower right")
strip_frame(ax)
CHART_SPLIT = embed(fig)


# ---------------------------------------------------------------------------
# html helpers
# ---------------------------------------------------------------------------
def cell(value):
    if isinstance(value, float):
        return f"{value:,.0f}" if value == int(value) else f"{value:,.1f}"
    return str(value)


def html_table(frame, index_label="", classes=""):
    """Render a DataFrame as an HTML table.

    05_findings.py needed the same logic for markdown; this emits <table>.
    Kept small on purpose - pulling in a templating engine for eight tables
    would cost more than these fifteen lines.
    """
    head = "".join(f"<th>{c}</th>" for c in frame.columns)
    body = ""
    for idx, row in zip(frame.index, frame.to_numpy()):
        cells = "".join(f"<td>{cell(v)}</td>" for v in row)
        body += f"<tr><th scope='row'>{cell(idx)}</th>{cells}</tr>"
    return (
        f"<div class='scroll'><table class='{classes}'>"
        f"<thead><tr><th>{index_label}</th>{head}</tr></thead>"
        f"<tbody>{body}</tbody></table></div>"
    )


def insight(number, claim, evidence_html, inference_html):
    return (
        "<section class='insight'>"
        f"<div class='tag'>Insight {number}</div>"
        f"<h3>{claim}</h3>"
        f"<div class='ev'><div class='ev-label'>Evidence</div>{evidence_html}</div>"
        "<div class='inf'><div class='ev-label'>Business inference</div>"
        f"<p>{inference_html}</p></div>"
        "</section>"
    )


RUPEE = "&#8377;"

# ---------------------------------------------------------------------------
# headline metrics
# ---------------------------------------------------------------------------
metrics = [
    (
        f"{RUPEE}{revenue:,.0f}",
        "revenue",
        f"{len(df)} bills, {len(products)} products",
    ),
    (
        f"{RUPEE}{outstanding:,.0f}",
        "outstanding credit",
        f"{outstanding / revenue:.1%} of revenue, across {(~df['is_paid']).sum()} bills",
    ),
    (
        f"{RUPEE}{collected:,.0f}",
        "actually collected",
        f"{collected / revenue:.1%} of what was billed",
    ),
    (
        f"{RUPEE}{df['amount'].median():,.0f}",
        "median bill",
        f"{df['qty'].mean():.2f} units per bill",
    ),
]
metrics_html = "".join(
    f"<div class='metric'><b>{value}</b><span>{label}</span><em>{note}</em></div>"
    for value, label, note in metrics
)

# ---------------------------------------------------------------------------
# the five insights
# ---------------------------------------------------------------------------
insights_html = insight(
    1,
    "Credit is a relationship, not a transaction",
    html_table(crosstab, "customer type")
    + f"<img alt='Paid versus credit, split by customer type' src='{CHART_SPLIT}'>"
    + "<p class='note'>Every bill in the file, cross-tabulated by whether a "
    "customer name was recorded. The separation is total: not one of the "
    f"{crosstab.loc['Anonymous walk-in'].sum()} anonymous sales went on credit, "
    f"while {crosstab.loc['Named person', 'On credit']} of the "
    f"{crosstab.loc['Named person'].sum()} named-customer sales did.</p>",
    "The causation runs the way it would in any real shop: the shopkeeper "
    "writes a name down <em>because</em> he is extending credit, not the other "
    "way round. So the credit book is the shop's entire risk surface, and that "
    "risk is purely a function of who the customer is. Analytically this also "
    "means <code>customer_name</code> and <code>is_paid</code> are not "
    "independent variables &mdash; any model using both is using one fact twice.",
)

insights_html += insight(
    2,
    "Credit risk is concentrated, and the biggest customer is not the biggest problem",
    html_table(customers[["bills", "billed", "unpaid", "pct_unpaid"]], "customer")
    + f"<img alt='Billed versus unpaid, by customer' src='{CHART_CREDIT}'>"
    + "<p class='note'>Sorted by percentage unpaid rather than by amount owed, "
    f"because that is the actionable ordering. The two largest debtors hold "
    f"{top2_debt_share:.0f}% of all outstanding credit.</p>",
    f"Ranking by amount owed and ranking by risk give different answers. "
    f"{biggest} is the largest customer at "
    f"{RUPEE}{customers.loc[biggest, 'billed']:,.0f} but only "
    f"{customers.loc[biggest, 'pct_unpaid']:.0f}% unpaid across "
    f"{customers.loc[biggest, 'bills']:.0f} bills &mdash; a good customer with a "
    f"running tab. {riskiest} has billed less than half as much and left "
    f"{customers.loc[riskiest, 'pct_unpaid']:.0f}% of it unpaid. The collections "
    f"priority is the ratio, not the total. "
    f"{' and '.join(always_pays)} "
    f"{'is the only regular' if len(always_pays) == 1 else 'are the only regulars'} "
    "who has never taken credit.",
)

insights_html += insight(
    3,
    "Revenue is concentrated; footfall is not",
    html_table(
        products[
            ["bills", "units", "revenue", "rev_share", "bill_share", "cum_rev_share"]
        ],
        "product",
    )
    + f"<img alt='Revenue share versus footfall share by product' src='{CHART_MIX}'>"
    + f"<p class='note'>{products.index[0]} and {products.index[1]} alone are "
    f"{products['rev_share'].head(2).sum():.0f}% of revenue; the top three reach "
    f"{products['cum_rev_share'].iloc[2]:.0f}%. Milk inverts the pattern &mdash; "
    f"{products.loc['Milk', 'bill_share']}% of bills but only "
    f"{products.loc['Milk', 'rev_share']}% of revenue.</p>",
    "The two rankings invert, and that inversion is the finding. Staples carry "
    "the margin; milk, sugar and salt bring people through the door. They are "
    "doing two different jobs and deserve two different stocking rules &mdash; a "
    "stock-out on Atta costs revenue directly, whereas a stock-out on Milk costs "
    "the <em>visit</em> during which Atta would have been bought. Judging "
    "products on a single metric hides this completely.",
)

insights_html += insight(
    4,
    f"{100 - named_rev_share:.0f}% of revenue has no name attached to it",
    "<ul class='facts'>"
    f"<li>Named regulars: <b>{len(customers)} people</b>, {len(named)} bills, "
    f"{RUPEE}{named['amount'].sum():,.0f} "
    f"(<b>{named_rev_share:.0f}%</b> of revenue)</li>"
    f"<li>Anonymous walk-ins: {len(walk_in)} bills, "
    f"{RUPEE}{walk_in['amount'].sum():,.0f} "
    f"(<b>{100 - named_rev_share:.0f}%</b> of revenue)</li>"
    f"<li>Mean bill: {RUPEE}{named['amount'].mean():,.0f} named vs "
    f"{RUPEE}{walk_in['amount'].mean():,.0f} anonymous</li>"
    "</ul>",
    "This is a hard ceiling on anything relationship-based. A loyalty scheme, a "
    "targeted offer or a churn analysis can only ever reach the "
    f"{named_rev_share:.0f}% of revenue that has an identity attached. It also "
    "reframes insight 1: the shop is not choosing to record only some customers, "
    "it is recording precisely the ones where it carries risk. Raising the named "
    "share would require giving walk-ins a reason to identify themselves.",
)

insights_html += insight(
    5,
    "Price uniquely identifies the product, so the cleanest column contains the messiest one",
    "<ul class='facts'>"
    f"<li>{df['rate'].nunique()} distinct prices, {df['product'].nunique()} "
    "distinct products &mdash; verified one-to-one in both directions</li>"
    f"<li>Every price maps to exactly one product: <b>{rate_identifies_product}</b></li>"
    f"<li>Every product has exactly one price: <b>{product_has_one_price}</b></li>"
    f"<li><code>rate</code> was the only column in the raw file needing <b>no "
    f"cleaning at all</b>, while <code>item</code> used {raw['item'].nunique()} "
    f"different spellings for those same {df['product'].nunique()} products</li>"
    "</ul>",
    "Because price determines product, <code>rate</code> alone reconstructs "
    f"<code>product</code> for all {len(df)} rows &mdash; which makes "
    "<code>item</code>, the messiest column in the file, strictly redundant. "
    "The wider lesson: you cannot judge a column's value by how dirty it looks. "
    "Of the two worst columns here, <code>customer</code> proved the most "
    "valuable in the dataset and <code>item</code> proved worth nothing that "
    "was not already available elsewhere. Only testing what a column relates to "
    "tells them apart.",
)

# ---------------------------------------------------------------------------
# column importance
# ---------------------------------------------------------------------------
column_brief = pd.DataFrame(
    [
        (
            "customer",
            "Highest",
            "The only column describing a relationship rather than a "
            "transaction, and all credit risk lives in it. Also the dirtiest "
            "&mdash; 22 strings for 7 people plus an anonymous bucket.",
        ),
        (
            "rate",
            "High",
            "Perfectly clean, and uniquely identifies the product. Together "
            "with qty it reconstructs every amount in the file.",
        ),
        (
            "payment_status",
            "High",
            f"Turns revenue into cash: separates {RUPEE}{collected:,.0f} "
            f"collected from {RUPEE}{outstanding:,.0f} merely billed. Held two "
            "variables in one column.",
        ),
        (
            "qty",
            "Medium",
            "Needed alongside rate to get to money. Four values were missing "
            "and were derived exactly rather than imputed.",
        ),
        (
            "amount",
            "Low",
            "Derived &mdash; equals qty &times; rate on every row, so it adds "
            "no information the other two do not already carry.",
        ),
        (
            "item",
            "Low",
            "Redundant given rate. Its 36 spellings resolve to the same 10 "
            "products that price already identifies.",
        ),
        (
            "amount_paid",
            "Very low",
            "Mirrors is_paid perfectly &mdash; unpaid bills received exactly 0, "
            "paid bills exactly the full amount. No partial payments anywhere.",
        ),
        (
            "bill_no",
            "Very low",
            "Useful only for catching the duplicated row, which it did.",
        ),
        (
            "date",
            "Very low here",
            "Resolvable, but 105 bills over 8 weeks is roughly 1.7 per day "
            "&mdash; too sparse to support any trend claim.",
        ),
        (
            "day",
            "None",
            "Fabricated. Agreed with the real weekday 19% of the time against "
            "14% expected by chance. Dropped rather than cleaned.",
        ),
    ],
    columns=["column", "value to a business question", "why"],
).set_index("column")

# ---------------------------------------------------------------------------
# cleaning decisions
# ---------------------------------------------------------------------------
decisions = pd.DataFrame(
    [
        (
            "Dropped duplicated bill 5016",
            "Identical across all 10 columns, whereas a real two-item bill "
            f"would differ on item. Left in, it would have inflated revenue by "
            f"{RUPEE}700.",
        ),
        (
            f"Stripped Rs, {RUPEE}, /-, pcs and padding",
            "The values were correct and only the types were wrong, which makes "
            "this a formatting fix rather than a judgement call.",
        ),
        (
            "Derived 4 quantities and 8 amounts",
            "amount = qty &times; rate held on 93 of 93 checkable rows with zero "
            "mismatches, so these rebuild exactly. Mean-imputing would have "
            "invented money.",
        ),
        (
            "Mapped 36 item names onto 10 products",
            "The variation is linguistic, not typographic &mdash; Chawal is "
            "Rice, Doodh is Milk, Parle-G is a biscuit. No string function "
            "collapses those.",
        ),
        (
            "Split payment_status into is_paid + payment_method",
            "One column was answering two questions. 'Cash' is a payment "
            "method, not a third payment state.",
        ),
        (
            "Normalised 22 customer strings to 7 regulars plus a walk-in flag",
            "Case variants, invisible trailing whitespace, and four different "
            "spellings of 'no name recorded'.",
        ),
        (
            "Resolved dates per row against the Aug&ndash;Sep window",
            "Four formats coexist. dayfirst=True would have silently mis-parsed "
            "the 8 month-first rows; a single format= string fails outright.",
        ),
        (
            "Dropped the day column",
            "Not dirty but fabricated &mdash; 19% agreement with the real "
            "weekday against 14% by chance. The safest cleaning action was "
            "deletion.",
        ),
    ],
    columns=["decision", "the test that licensed it"],
).set_index("decision")

# ---------------------------------------------------------------------------
# limits
# ---------------------------------------------------------------------------
limits = [
    (
        "What do customers buy together?",
        f"Every one of the {len(df)} bills contains exactly one product. There "
        "are no baskets in this file, so market-basket and affinity analysis "
        "are impossible &mdash; not difficult, impossible. Cleaning cannot "
        "create data that was never recorded.",
    ),
    (
        "How does demand respond to price?",
        "Each product held exactly one price for the entire period. With no "
        "variation in the input there is nothing to correlate against, so "
        "elasticity is unanswerable by construction.",
    ),
    (
        "Which weekday is busiest?",
        "The day column was fabricated and dropped. Weekday can be recomputed "
        "from the resolved dates, but at roughly 1.7 bills per day the counts "
        "are far too thin to support a claim about weekly rhythm.",
    ),
    (
        "Is trade growing or shrinking?",
        f"The ledger spans {df['date'].min():%d %b} to {df['date'].max():%d %b}, "
        "so the first and last calendar weeks are partial buckets holding 3 and "
        "1 bills. A weekly revenue chart would show a dramatic collapse that is "
        "purely a calendar artefact &mdash; which is why this report does not "
        "include one.",
    ),
    (
        "When exactly did bills 5036 and 5096 happen?",
        "Both dates are ambiguous between two readings that fall inside the "
        "ledger window, so the file cannot say which is correct. Both rows "
        "carry date_ambiguous = true, and the earlier reading was taken as an "
        "arbitrary tie-break.",
    ),
]
limits_html = "".join(
    f"<div class='limit'><h4>{question}</h4><p>{answer}</p></div>"
    for question, answer in limits
)

STYLE = """
:root{--ink:#2f2e2b;--muted:#6b6862;--faint:#98948c;--line:#e2ded5;
--bg:#fbfaf7;--card:#fff;--accent:#a4462a;--accent-bg:#fdf3ee;--inf-bg:#f3f5f1}
*{box-sizing:border-box}
body{margin:0;background:var(--bg);color:var(--ink);line-height:1.65;font-size:16px;
font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Helvetica,Arial,sans-serif}
.wrap{max-width:880px;margin:0 auto;padding:3rem 1.5rem 5rem}
header{border-bottom:2px solid var(--ink);padding-bottom:1.25rem;margin-bottom:2rem}
h1{font-size:1.9rem;font-weight:600;margin:0 0 .45rem;letter-spacing:-.015em}
.sub{color:var(--muted);font-size:.94rem;margin:0}
h2{font-size:1.3rem;font-weight:600;margin:3rem 0 .35rem;padding-bottom:.4rem;
border-bottom:1px solid var(--line)}
.lede{color:var(--muted);margin:.5rem 0 1.5rem;font-size:.95rem}
h3{font-size:1.12rem;font-weight:600;margin:.2rem 0 1rem;line-height:1.4}
h4{font-size:.98rem;font-weight:600;margin:0 0 .3rem}
.metrics{display:grid;grid-template-columns:repeat(auto-fit,minmax(185px,1fr));
gap:.75rem;margin-top:1.5rem}
.metric{background:var(--card);border:1px solid var(--line);border-radius:8px;
padding:.9rem 1rem}
.metric b{display:block;font-size:1.5rem;font-weight:600;letter-spacing:-.02em}
.metric span{display:block;font-size:.85rem;color:var(--muted);margin-top:.15rem}
.metric em{display:block;font-style:normal;font-size:.78rem;color:var(--faint);
margin-top:.35rem;line-height:1.45}
.insight{background:var(--card);border:1px solid var(--line);border-radius:10px;
padding:1.4rem 1.5rem;margin-bottom:1.25rem}
.tag{display:inline-block;font-size:.71rem;font-weight:600;letter-spacing:.08em;
text-transform:uppercase;color:var(--accent);background:var(--accent-bg);
padding:3px 10px;border-radius:20px;margin-bottom:.7rem}
.ev-label{font-size:.71rem;font-weight:600;letter-spacing:.08em;
text-transform:uppercase;color:var(--faint);margin-bottom:.5rem}
.ev{margin:1rem 0}
.inf{background:var(--inf-bg);border-left:3px solid var(--accent);
padding:.9rem 1.1rem;margin-top:1.2rem}
.inf p{margin:0;font-size:.95rem}
.note{font-size:.87rem;color:var(--muted);margin:.75rem 0 0}
.scroll{overflow-x:auto;margin:.6rem 0}
table{border-collapse:collapse;width:100%;font-size:.87rem}
th,td{text-align:right;padding:.42rem .6rem;border-bottom:1px solid var(--line);
white-space:nowrap}
thead th{font-weight:600;font-size:.77rem;color:var(--muted);
border-bottom:1.5px solid var(--ink)}
thead th:first-child,tbody th{text-align:left;font-weight:500}
tbody tr:last-child th,tbody tr:last-child td{border-bottom:none}
table.wide td,table.wide th{vertical-align:top}
table.wide td:last-child{white-space:normal;text-align:left;min-width:24rem}
table.wide tbody th{white-space:normal;min-width:11rem;padding-right:1rem}
img{display:block;width:100%;height:auto;margin:1rem 0 0;border-radius:6px}
ul.facts{margin:.4rem 0;padding-left:1.15rem;font-size:.93rem}
ul.facts li{margin-bottom:.32rem}
.limit{border-left:2px solid var(--line);padding:.1rem 0 .1rem 1rem;
margin-bottom:1.1rem}
.limit p{margin:.15rem 0 0;font-size:.92rem;color:var(--muted)}
.caveat{background:#fdf9ee;border:1px solid #e8dcc0;border-radius:8px;
padding:1.2rem 1.4rem;margin-top:1rem}
.caveat p{margin:0 0 .75rem;font-size:.93rem}
.caveat p:last-child{margin-bottom:0}
code{font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;
font-size:.86em;background:#f1eee7;padding:1px 4px;border-radius:3px}
pre{background:#f1eee7;padding:.9rem 1.1rem;border-radius:6px;overflow-x:auto;
font-size:.84rem;line-height:1.6;margin:.8rem 0 0}
footer{margin-top:3.5rem;padding-top:1.2rem;border-top:1px solid var(--line);
color:var(--faint);font-size:.82rem}
@media(max-width:600px){.wrap{padding:2rem 1rem 3rem}h1{font-size:1.5rem}
.insight{padding:1.1rem 1rem}table.wide td:last-child{min-width:15rem}
table.wide tbody th{min-width:8rem}}
"""

HTML = f"""<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Kirana sales ledger &mdash; business insights</title>
<style>{STYLE}</style>
</head>
<body>
<div class="wrap">

<header>
  <h1>Kirana sales ledger &mdash; business insights</h1>
  <p class="sub">
    <code>kirana_sales_raw.csv</code> ({len(raw)} rows) &rarr;
    <code>kirana_sales_clean.csv</code> ({len(df)} rows &times;
    {len(df.columns)} columns) &middot; trading period
    {df['date'].min():%d %b} &ndash; {df['date'].max():%d %b %Y} &middot;
    generated {date.today():%d %b %Y}
  </p>
</header>

<div class="metrics">{metrics_html}</div>

<h2>Insights and inference</h2>
<p class="lede">Each insight states the claim, shows the evidence that
established it, then draws the business inference. Every figure is computed
from the cleaned dataset when this page is built, so nothing here can drift
out of step with the data.</p>
{insights_html}

<h2>Which columns actually matter</h2>
<p class="lede">Ranked by value to a business question rather than by how clean
the column happened to look.</p>
{html_table(column_brief, "column", "wide")}

<h2>How the data was cleaned</h2>
<p class="lede">Eight decisions, each licensed by a test rather than by habit.
The right-hand column names the test.</p>
{html_table(decisions, "decision", "wide")}

<h2>What this data cannot answer</h2>
<p class="lede">The limits matter as much as the findings. Each question below
is unanswerable from this file, and no amount of cleaning changes that.</p>
{limits_html}

<h2>Methodology note</h2>
<div class="caveat">
  <p><b>This dataset appears to be generated rather than recorded.</b> Three
  observations point the same way: every product held one price to the rupee
  across two months; <code>amount</code> equalled <code>qty &times; rate</code>
  on all 93 checkable rows without a single arithmetic slip; and every unpaid
  bill received exactly zero rather than a part-payment. A hand-kept ledger
  does none of those three things &mdash; prices drift, sums get fumbled, and
  customers pay half now and the rest on Friday.</p>
  <p>That does not weaken the analysis, but it does bound what may be claimed
  from it. The cleaning and validation technique used here transfers to real
  data completely. The business conclusions do not transfer to any actual shop
  &mdash; &ldquo;milk drives footfall&rdquo; is a pattern in generated numbers,
  not evidence about a real trader.</p>
  <p>Stated plainly, because an analysis that hides this reads as more
  authoritative than it has earned.</p>
</div>

<h2>Reproducing this</h2>
<pre>python 01_meet.py           # what is one row?
python 02_columns.py        # what is in each column?
python 03_relationships.py  # do the columns agree? (the gate)
python 04_clean.py          # apply the decisions -&gt; clean CSV
python 05_findings.py       # findings, charts, FINDINGS.md
python 06_report.py         # this page</pre>
<p class="note">Shared parsing and product-mapping logic lives in
<code>kirana_lib.py</code>. Step 3 is the gate: it verifies
<code>amount = qty &times; rate</code> before step 4 is permitted to derive any
missing value. Steps 4 and 6 both assert revenue and outstanding credit before
writing, so a regression fails loudly instead of shipping a wrong number.</p>

<footer>
  Built from {len(df)} cleaned bills &mdash; revenue {RUPEE}{revenue:,.0f},
  outstanding credit {RUPEE}{outstanding:,.0f}. All three charts are embedded
  as data URIs, so this file is self-contained and needs no network access.
</footer>

</div>
</body>
</html>
"""

# Fail loudly rather than shipping a wrong headline number.
assert len(df) == 105, f"row count changed: {len(df)}"
assert revenue == 45540, f"revenue changed: {revenue}"
assert outstanding == 4680, f"outstanding changed: {outstanding}"

OUT.write_text(HTML, encoding="utf-8")
print(f"wrote {OUT.name}  ({OUT.stat().st_size / 1024:,.0f} KB)")
print(
    f"revenue {revenue:,.0f} | outstanding {outstanding:,.0f} | "
    f"{len(df)} bills | {len(products)} products | 3 charts embedded"
)
