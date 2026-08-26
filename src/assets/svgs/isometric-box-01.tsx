/**
 * Stand-in for vengenceui's bundled illustration of the same name — theirs is
 * compiled into their app and is not published with the component. A single
 * isometric cube, drawn in currentColor so it inherits the tile's palette.
 */
export default function IsometricBox01({
  className,
}: {
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 200 180"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden
    >
      <g stroke="currentColor" strokeLinejoin="round" strokeWidth="1.5">
        <path d="M100 30 170 70v70l-70 40-70-40V70z" opacity=".18" />
        <path d="M100 30 170 70l-70 40-70-40z" fill="currentColor" opacity=".10" />
        <path d="M100 110v70" opacity=".35" />
        <path d="M30 70v70l70 40" opacity=".35" />
        <path d="M170 70v70l-70 40" opacity=".35" />
        <path d="M100 30 170 70l-70 40-70-40z" opacity=".55" />
      </g>
      <circle cx="100" cy="70" r="4" fill="currentColor" opacity=".5" />
    </svg>
  );
}
