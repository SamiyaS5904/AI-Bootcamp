import { useCountUp, useReveal } from "../hooks/index.js";

function Stat({ children, note }) {
  return (
    <div className="pk-proof__item">
      <div className="pk-proof__num">{children}</div>
      <p className="pk-proof__note">{note}</p>
    </div>
  );
}

function Counter({ to, from = 0 }) {
  const [value, ref] = useCountUp(to, { from });
  return <span ref={ref}>{value}</span>;
}

/** The numbers carry the design — no factory photography exists to lean on. */
export default function ProofStrip() {
  const ref = useReveal({ stagger: 110 });

  return (
    <section className="pk-proof" aria-label="Company at a glance">
      <div className="pk-proof__grid" ref={ref}>
        <Stat note="Established in Ludhiana. GST registered 2017.">
          <Counter to={2016} from={1990} />
        </Stat>
        <Stat note="People across knitting, stitching and finishing.">
          <Counter to={26} />–<Counter to={50} />
        </Stat>
        <Stat note="Our signature heavy hoodies and sweatshirts.">
          <Counter to={320} /> <small>GSM</small>
        </Stat>
        <Stat note="Private label ready. Your brand, your labels, in-house.">
          <Counter to={29} /> <small>styles ·</small> <Counter to={8} /> <small>fabrics</small>
        </Stat>
      </div>
    </section>
  );
}
