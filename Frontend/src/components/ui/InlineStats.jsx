
const tones = { default: "text-ink", success: "text-success", warning: "text-warning", danger: "text-danger", info: "text-brand" };

// Compact row of metrics divided by hairlines; for summaries inside a card.
// items: [{ label, value, tone? }]
const InlineStats = ({ items, className = "" }) => (
  <dl
    className={`grid divide-x divide-line rounded-lg border border-line ${className}`}
    style={{ gridTemplateColumns: `repeat(${items.length}, minmax(0, 1fr))` }}
  >
    {items.map((item) => (
      <div key={item.label} className="min-w-0 px-3 py-2.5 sm:px-4">
        <dt className="truncate text-xs text-ink-3">{item.label}</dt>
        <dd className={`mt-0.5 text-lg font-semibold tracking-[-0.02em] tabular-nums ${tones[item.tone || "default"]}`}>{item.value}</dd>
      </div>
    ))}
  </dl>
);

export default InlineStats;
