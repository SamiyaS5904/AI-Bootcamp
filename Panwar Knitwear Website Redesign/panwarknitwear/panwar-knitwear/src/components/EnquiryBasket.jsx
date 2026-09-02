import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { useEnquiry, scrollToEnquiry } from "../lib/enquiry.jsx";

/**
 * A quiet counter for the styles a buyer has picked, with one job: take them
 * to the enquiry form. Only appears once something is on the list.
 */
export default function EnquiryBasket({ onHome }) {
  const { count } = useEnquiry();
  const navigate = useNavigate();
  const [bumped, setBumped] = useState(false);

  useEffect(() => {
    if (!count) return;
    setBumped(true);
    const t = window.setTimeout(() => setBumped(false), 320);
    return () => window.clearTimeout(t);
  }, [count]);

  if (!count) return null;

  const go = () => {
    if (onHome) {
      scrollToEnquiry();
    } else {
      navigate("/", { state: { scrollTo: "enquiry" } });
    }
  };

  return (
    <button
      type="button"
      className="pk-basket"
      data-visible="true"
      onClick={go}
      style={bumped ? { transform: "scale(1.04)" } : undefined}
    >
      <span className="pk-basket__count">{count}</span>
      {count === 1 ? "style in your enquiry" : "styles in your enquiry"}
    </button>
  );
}
