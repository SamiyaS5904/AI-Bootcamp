import { useEffect } from "react";
import { useLocation } from "react-router-dom";

import Hero from "../sections/Hero.jsx";
import ProofStrip from "../sections/ProofStrip.jsx";
import Categories from "../sections/Categories.jsx";
import Brands from "../sections/Brands.jsx";
import Showcase from "../sections/Showcase.jsx";
import Fabrics from "../sections/Fabrics.jsx";
import Marquee from "../sections/Marquee.jsx";
import Manufacturing from "../sections/Manufacturing.jsx";
import PrivateLabel from "../sections/PrivateLabel.jsx";
import WhyUs from "../sections/WhyUs.jsx";
import About from "../sections/About.jsx";
import EnquiryForm from "../sections/EnquiryForm.jsx";
import { scrollToEnquiry } from "../lib/enquiry.jsx";

export default function Home() {
  const location = useLocation();

  // Arriving from the catalogue with styles picked, or via a #hash link.
  useEffect(() => {
    const target = location.state?.scrollTo || location.hash.replace("#", "");
    if (!target) return;

    const run = () => {
      if (target === "enquiry") {
        scrollToEnquiry();
        return;
      }
      document.getElementById(target)?.scrollIntoView({ behavior: "smooth" });
    };

    const id = window.setTimeout(run, 80);
    return () => window.clearTimeout(id);
  }, [location]);

  return (
    <main id="main">
      <Hero />
      <ProofStrip />
      <Categories />
      <Brands />
      <Showcase />
      <Fabrics />
      <Marquee />
      <Manufacturing />
      <PrivateLabel />
      <WhyUs />
      <About />
      <EnquiryForm />
    </main>
  );
}
