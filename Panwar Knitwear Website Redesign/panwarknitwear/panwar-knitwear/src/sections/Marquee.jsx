const FABRICS = [
  "SPUN FLEECE",
  "DRY FIT",
  "HONEYCOMB LYCRA",
  "100% COTTON",
  "COTTON LYCRA",
  "NS BONDED",
  "RUSSIAN FLEECE",
  "SHERPA",
];

function Run({ hidden }) {
  return (
    <div className="pk-marquee__run" aria-hidden={hidden || undefined}>
      {FABRICS.map((fabric) => (
        <span key={fabric}>
          {fabric}
          <span aria-hidden="true"> ·</span>
        </span>
      ))}
    </div>
  );
}

/** A slow band between two sections that also does real work: the range. */
export default function Marquee() {
  return (
    <div className="pk-marquee" aria-label="Fabrics we work with">
      <div className="pk-marquee__track">
        <Run />
        <Run hidden />
      </div>
    </div>
  );
}
