type GruplaceLogoProps = {
  size?: number
}

export function GruplaceLogo({ size = 32 }: GruplaceLogoProps) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        fontFamily: '"Space Grotesk", "Inter", sans-serif',
        fontWeight: 700,
        fontSize: '1.25rem',
        color: '#0B0E14',
      }}
    >
      <svg
        width={size}
        height={size}
        viewBox="0 0 32 32"
        fill="none"
        aria-hidden="true"
      >
        <circle cx="16" cy="6" r="3.2" fill="#0B0E14" />
        <circle cx="6" cy="24" r="3.2" fill="#3654FF" />
        <circle cx="26" cy="24" r="3.2" fill="#8B5CF6" />

        <path
          d="M16 9 L7 21.5 M16 9 L25 21.5 M8.5 24 H23.5"
          stroke="#0B0E14"
          strokeWidth="1.4"
          strokeOpacity=".35"
        />
      </svg>

      <span>
        Gru<span style={{ color: '#3654FF' }}>place</span>
      </span>
    </div>
  )
}
