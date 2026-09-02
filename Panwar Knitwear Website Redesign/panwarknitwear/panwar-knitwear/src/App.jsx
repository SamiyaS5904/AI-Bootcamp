import { useEffect } from "react";
import { Route, Routes, useLocation } from "react-router-dom";

import Header from "./components/Header.jsx";
import Footer from "./components/Footer.jsx";
import FloatingActions from "./components/FloatingActions.jsx";
import EnquiryBasket from "./components/EnquiryBasket.jsx";
import Home from "./pages/Home.jsx";
import Catalogue from "./pages/Catalogue.jsx";
import { EnquiryProvider } from "./lib/enquiry.jsx";

const TITLES = {
  "/": "Panwar Knitwear — knitwear manufacturer in Ludhiana, since 2016",
  "/catalogue": "Product catalogue — 29 styles — Panwar Knitwear",
};

function Chrome() {
  const { pathname, hash, state } = useLocation();

  useEffect(() => {
    document.title = TITLES[pathname] ?? TITLES["/"];
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
        <Route path="*" element={<Home />} />
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
