/* A section's opening: the numbered mono label, then the title.
   `className` is for the section's own spacing on the label. */
export default function SectionHeading({ label, title, className = "" }) {
  return (
    <>
      <p className={`label ${className}`.trim()}>{label}</p>
      <h2 className="section-title">{title}</h2>
    </>
  );
}
