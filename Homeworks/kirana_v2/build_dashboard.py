"""
Renders dashboard.template.html into the finished dashboard, filling every
{{placeholder}} from figures.json.

The point of the split: no number is ever typed into the HTML by hand. If a
figure changes in the data, it changes on the page. A placeholder with no value
behind it is a hard error, so the page can never ship with a blank in it.

Run:  python analysis.py && python build_dashboard.py
"""

import html
import json
import re
import sys
from pathlib import Path

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")

HERE = Path(__file__).resolve().parent
FIGURES = HERE / "figures.json"
TEMPLATE = HERE / "dashboard.template.html"
OUT = HERE / "kirana_sales_dashboard.html"

D = json.loads(FIGURES.read_text(encoding="utf-8"))
sku = {s["sku"]: s for s in D["skus"]}
cust = D["customers"]
credit_by_sku = {c["sku"]: c["amount"] for c in D["credit_by_sku"]}
weekday = {w["day"]: w for w in D["weekday"]}
month = {m["month"]: m for m in D["monthly"]}


def money(n):
    return f"{round(n):,}"


# --------------------------------------------------------------------------
# derived values the prose needs - all computed, none typed
# --------------------------------------------------------------------------

ranked = D["skus"]                                   # already revenue-sorted
debtors = [c for c in cust if c["owed"] > 0]
top_debtor = debtors[0]                              # sorted by owed desc
worst_ratio = max(debtors[1:], key=lambda c: c["pct_unpaid"])
top_spender = max(cust, key=lambda c: c["spend"])
clean_payer = max((c for c in cust if c["owed"] == 0),
                  key=lambda c: c["spend"], default=None)
assert clean_payer, "expected at least one named customer who always paid"

best_day = max(D["weekday"], key=lambda w: w["revenue"])
worst_day = min(D["weekday"], key=lambda w: w["revenue"])
rec = next(t for t in D["reminder"]["thresholds"]
           if t["threshold"] == D["reminder"]["recommended"])

atta, rice, milk = ranked[0], ranked[1], sku["Milk 1L"]
credit_top2 = credit_by_sku.get(atta["sku"], 0) + credit_by_sku.get(rice["sku"], 0)

extra = {
    "credit_top2": credit_top2,
    "credit_top2_pct": round(credit_top2 / D["kpi"]["credit"] * 100, 1),

    "atta_rev": atta["revenue"], "atta_share": atta["rev_share"],
    "atta_bills": atta["bills"], "atta_units": atta["units"],
    "rice_rev": rice["revenue"], "rice_share": rice["rev_share"],
    "milk_rev": milk["revenue"], "milk_share": milk["rev_share"],
    "milk_bills": milk["bills"], "milk_units": milk["units"],
    "milk_unit_share": milk["unit_share"],

    "top3_cum": ranked[2]["cum_share"],
    "bottom4_share": round(sum(s["rev_share"] for s in ranked[-4:]), 1),
    "bottom5_share": round(sum(s["rev_share"] for s in ranked[-5:]), 1),
    "salt_bisc_units": sum(s["units"] for s in ranked[-2:]),
    "salt_bisc_rev": sum(s["revenue"] for s in ranked[-2:]),

    "top_debtor_name": top_debtor["name"].split()[0] + " " + top_debtor["name"].split()[-1],
    "top_debtor_owed": top_debtor["owed"],
    "top_debtor_pct": top_debtor["pct_unpaid"],
    "anil_name": worst_ratio["name"],
    "anil_pct": worst_ratio["pct_unpaid"],
    "top_spender": top_spender["name"],
    "top_spender_spend": top_spender["spend"],
    "top_spender_bills": top_spender["bills"],
    "clean_payer_name": clean_payer["name"],
    "gurpreet_bills": clean_payer["bills"],
    "gurpreet_spend": clean_payer["spend"],

    "best_day": best_day["day"], "best_day_rev": best_day["revenue"],
    "worst_day": worst_day["day"], "worst_day_rev": worst_day["revenue"],
    "sun_claimed": weekday["Sun"]["claimed_bills"],
    "sun_actual": weekday["Sun"]["bills"],

    "aug_rev": month["Aug 2026"]["revenue"],
    "sep_rev": month["Sep 2026"]["revenue"],

    "under500_bills": sum(1 for b in D["credit_bills"] if b["amount"] < 500),
    "anon_bills": D["kpi"]["bills"] - D["kpi"]["named_bills"],
    "rec_people": rec["people"], "rec_pct": rec["pct"],
}

D["quality"]["dup_bills_str"] = ", ".join(D["quality"]["dup_bills"])
D["quality"]["date_ambiguous_str"] = ", ".join(D["quality"]["date_ambiguous_bills"])


# --------------------------------------------------------------------------
# table bodies
# --------------------------------------------------------------------------

def td(v, cls=""):
    c = f' class="{cls}"' if cls else ""
    return f"<td{c}>{v}</td>"


sku_rows = "\n".join(
    "<tr>" + td(html.escape(s["sku"])) + td(s["rate"]) + td("₹" + money(s["revenue"]))
    + td(f"{s['rev_share']}%") + td(s["bills"]) + td(s["units"])
    + (td("₹" + money(credit_by_sku[s["sku"]]), "owed") if s["sku"] in credit_by_sku
       else td("—", "unk"))
    + "</tr>"
    for s in ranked)

cust_rows = "\n".join(
    "<tr>" + td(html.escape(c["name"])) + td(c["bills"]) + td("₹" + money(c["spend"]))
    + (td("₹" + money(c["owed"]), "owed") if c["owed"] else td("nothing", "good"))
    + (td(f"{c['pct_unpaid']}%", "owed") if c["owed"] else td("—", "unk"))
    + "</tr>"
    for c in cust)

credit_rows = "\n".join(
    "<tr>" + td(b["bill"]) + td(b["date"]) + td(html.escape(b["customer"]))
    + td(html.escape(b["sku"])) + td("<i>" + html.escape(b["status_written"]) + "</i>", "unk")
    + td("₹" + money(b["amount"]), "owed") + "</tr>"
    for b in D["credit_bills"])

rows = []
for t in D["reminder"]["thresholds"]:
    pick = t["threshold"] == D["reminder"]["recommended"]
    dead = t["people"] == 0
    rows.append(
        ('<tr class="pick">' if pick else "<tr>")
        + td(f"₹{money(t['threshold'])}" + (" ← recommended" if pick else ""))
        + td(f"{t['people']} of {t['of_people']}", "owed" if dead else "")
        + td("nothing" if dead else "₹" + money(t["amount"]), "unk" if dead else "")
        + td("—" if dead else f"{t['pct']}%", "unk" if dead else "")
        + "</tr>")
threshold_rows = "\n".join(rows)


# --------------------------------------------------------------------------
# render
# --------------------------------------------------------------------------

tpl = TEMPLATE.read_text(encoding="utf-8")
tpl = tpl.replace("{{__DATA__}}", json.dumps(D, ensure_ascii=False, separators=(",", ":")))
tpl = tpl.replace("{{__SKU_ROWS__}}", sku_rows)
tpl = tpl.replace("{{__CUST_ROWS__}}", cust_rows)
tpl = tpl.replace("{{__CREDIT_ROWS__}}", credit_rows)
tpl = tpl.replace("{{__THRESHOLD_ROWS__}}", threshold_rows)

missing = []


def resolve(match):
    expr = match.group(1)
    path, _, fmt = expr.partition("|")
    path = path.strip()

    if path in extra:
        val = extra[path]
    else:
        val = D
        for part in path.split("."):
            if isinstance(val, dict) and part in val:
                val = val[part]
            else:
                missing.append(path)
                return match.group(0)

    if fmt.strip() == "rs":
        return money(val)
    return str(val)


out = re.sub(r"\{\{([^{}]+)\}\}", resolve, tpl)

leftover = re.findall(r"\{\{[^{}]+\}\}", out)
if missing or leftover:
    print("UNRESOLVED PLACEHOLDERS:", sorted(set(missing + leftover)))
    sys.exit(1)

OUT.write_text(out, encoding="utf-8")
kb = len(out.encode("utf-8")) / 1024
print(f"wrote {OUT.name}  ({kb:.0f} KB, {out.count(chr(10))+1} lines)")
print(f"  revenue ₹{money(D['kpi']['revenue'])} · udhaar ₹{money(D['kpi']['credit'])} "
      f"· {len(D['skus'])} products · {len(cust)} named customers")
