export function PrismLogo({ size = 28 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="Maximus logo"
    >
      <defs>
        <linearGradient id="prism-fill" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#7c3aed" />
          <stop offset="100%" stopColor="#a855f7" />
        </linearGradient>
        <linearGradient id="prism-face" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#a855f7" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#6d28d9" stopOpacity="0.8" />
        </linearGradient>
      </defs>
      {/* Left face */}
      <polygon
        points="50,10 15,32 15,68 50,90"
        fill="url(#prism-fill)"
        opacity="0.85"
      />
      {/* Right face */}
      <polygon
        points="50,10 85,32 85,68 50,90"
        fill="url(#prism-face)"
        opacity="0.95"
      />
      {/* Top face */}
      <polygon
        points="50,10 15,32 50,54 85,32"
        fill="#c084fc"
        opacity="0.7"
      />
    </svg>
  )
}
