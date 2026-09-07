/**
 * Purely decorative, ambient motion — two soft blurred blobs drifting slowly
 * behind a page's hero content. `aria-hidden` and `pointer-events-none`, and
 * their motion is switched off entirely under `prefers-reduced-motion`
 * (index.css). Colors reuse the same brand tokens as the rest of the page,
 * so this never introduces a color that isn't already part of the palette.
 */
export function BackgroundBlobs({ className = "" }: { className?: string }) {
  return (
    <div aria-hidden="true" className={`pointer-events-none absolute inset-0 -z-10 overflow-hidden ${className}`}>
      <div
        className="blob absolute -top-16 -left-16 h-64 w-64 rounded-full opacity-70 blur-3xl"
        style={{ backgroundColor: "var(--accent-soft)" }}
      />
      <div
        className="blob-alt absolute -top-10 right-0 h-72 w-72 rounded-full opacity-70 blur-3xl"
        style={{ backgroundColor: "var(--old-soft)" }}
      />
    </div>
  );
}
