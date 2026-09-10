import { useEffect } from "react";
import { Route, Routes, useLocation } from "react-router-dom";

import Header from "./components/Header.jsx";
import Footer from "./components/Footer.jsx";
import FloatingActions from "./components/FloatingActions.jsx";
import EnquiryBasket from "./components/EnquiryBasket.jsx";
import Home from "./pages/Home.jsx";
import Catalogue from "./pages/Catalogue.jsx";
import NotFound from "./components/NotFound.jsx";
import { EnquiryProvider } from "./lib/enquiry.jsx";
import { applyRouteMeta } from "./lib/meta.js";

function Chrome() {
  const { pathname, hash, state } = useLocation();

  useEffect(() => {
    applyRouteMeta(pathname);
  }, [pathname]);

  // A fresh page starts at the top — unless we were sent to a specific section.
  useEffect(() => {
    if (hash || state?.scrollTo) return;
    window.scrollTo({ top: 0, behavior: "auto" });
  }, [pathname, hash, state]);

  return (
    <>
      <a className="pk-skip" href="#main">
        Skip to content
      </a>
      <div className="pk-grain" aria-hidden="true" />
      <p className="pk-edge-label" aria-hidden="true">
        PANWAR KNITWEAR · LUDHIANA · EST. 2016
      </p>

      <Header />

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/catalogue" element={<Catalogue />} />
        <Route path="*" element={<NotFound />} />
      </Routes>

      <Footer />
      <FloatingActions />
      <EnquiryBasket onHome={pathname === "/"} />
    </>
  );
}

export default function App() {
  return (
    <EnquiryProvider>
      <Chrome />
    </EnquiryProvider>
  );
}
