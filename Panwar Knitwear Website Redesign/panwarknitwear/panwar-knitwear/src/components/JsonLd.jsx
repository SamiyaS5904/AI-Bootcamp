import { useEffect } from "react";

/**
 * Route-scoped structured data.
 *
 * Site-wide Organization schema lives statically in index.html so it needs no
 * JS. This is for schema that only applies to one route. Google runs JS when
 * indexing, so injection is fine here — unlike Open Graph, which link
 * unfurlers read without executing anything.
 */
export default function JsonLd({ data }) {
  useEffect(() => {
    const node = document.createElement("script");
    node.type = "application/ld+json";
    node.textContent = JSON.stringify(data);
    document.head.appendChild(node);
    return () => node.remove();
  }, [data]);

  return null;
}
