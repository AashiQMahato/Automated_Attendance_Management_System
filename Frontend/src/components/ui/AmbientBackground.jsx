// Soft, fixed color fields behind the whole UI. Colors follow the nearest
// [data-role] (or the brand on public pages), so glass picks up a hint of the
// workspace identity. Purely decorative.
const AmbientBackground = () => <div className="ambient" aria-hidden="true" />;

export default AmbientBackground;
