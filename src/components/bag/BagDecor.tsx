/** Enfeites de fundo — puramente decorativo, sem interação. */
export function BagDecor() {
  return (
    <div className="bag-decor" aria-hidden>
      <div className="bag-orb-track bag-orb-track-1">
        <div className="bag-orb bag-orb-1" />
      </div>
      <div className="bag-orb-track bag-orb-track-2">
        <div className="bag-orb bag-orb-2" />
      </div>
      <div className="bag-orb-track bag-orb-track-3">
        <div className="bag-orb bag-orb-3" />
      </div>

      <div className="bag-sprinkles" />

      <svg
        className="bag-deco-cupcake"
        viewBox="0 0 120 140"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M60 18c-14 0-24 10-26 22-8 2-14 10-14 19 0 11 9 20 20 20h40c11 0 20-9 20-20 0-9-6-17-14-19-2-12-12-22-26-22Z"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinejoin="round"
        />
        <path d="M34 79h52" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
        <path
          d="M42 55c4-8 10-12 18-12s14 4 18 12"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <circle cx="48" cy="42" r="3" fill="currentColor" opacity="0.5" />
        <circle cx="72" cy="38" r="2.5" fill="currentColor" opacity="0.4" />
        <circle cx="60" cy="30" r="2" fill="currentColor" opacity="0.35" />
      </svg>

      <svg
        className="bag-deco-sparkle"
        viewBox="0 0 24 24"
        fill="currentColor"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path d="M12 0l2.2 7.2L21 9l-6.8 1.8L12 18l-2.2-7.2L3 9l6.8-1.8L12 0Z" />
      </svg>
    </div>
  );
}
