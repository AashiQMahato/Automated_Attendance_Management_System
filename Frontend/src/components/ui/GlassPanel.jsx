// Static (non-animated) glass surface for chrome and overlays.
// tier: "panel" | "chrome" | "pop" — increasing blur and opacity.
const tiers = { panel: "glass-panel", chrome: "glass-chrome", pop: "glass-pop" };

const GlassPanel = ({ as: Tag = "div", tier = "panel", className = "", children, ...props }) => (
  <Tag className={`${tiers[tier] || tiers.panel} ${className}`} {...props}>
    {children}
  </Tag>
);

export default GlassPanel;
