/**
 * Stand-in for vengenceui's bundled illustration of the same name — theirs is
 * compiled into their app and is not published with the component. A small
 * stack of isometric cubes, drawn in currentColor.
 */
export default function IsometricBoxes02({
  className,
}: {
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 220 180"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden
    >
      <g stroke="currentColor" strokeLinejoin="round" strokeWidth="1.5">
        {[
          { x: 0, y: 0, o: ".5" },
          { x: 56, y: 28, o: ".35" },
          { x: -56, y: 28, o: ".35" },
        ].map((box) => (
          <g key={`${box.x}-${box.y}`} transform={`translate(${box.x} ${box.y})`}>
            <path
              d="M110 40 156 66v52l-46 26-46-26V66z"
              opacity={box.o}
            />
            <path
              d="M110 40 156 66l-46 26-46-26z"
              fill="currentColor"
              opacity=".12"
            />
            <path d="M110 92v52" opacity=".3" />
          </g>
        ))}
      </g>
    </svg>
  );
}
