type ProductVisualProps = {
  name: string
  variant: 'prep' | 'perfume'
  concentration?: string
}

type Theme = {
  liquid: string
  liquidDeep: string
  accent: string
  code: string
  subtitle: string
}

const perfumeThemes: Record<string, Theme> = {
  'Citrus Atelier': {
    liquid: '#F3D57B',
    liquidDeep: '#C99B3B',
    accent: '#D4AF37',
    code: 'CA · 01',
    subtitle: 'EDT · 12%',
  },
  'Velvet Amber': {
    liquid: '#D48C46',
    liquidDeep: '#8F4716',
    accent: '#D4AF37',
    code: 'VA · 02',
    subtitle: 'EXTRAIT · 28%',
  },
  'Quiet Woods': {
    liquid: '#9AB89A',
    liquidDeep: '#4B6E53',
    accent: '#C5A059',
    code: 'QW · 03',
    subtitle: 'EDP · 18%',
  },
  'Marine Mineral': {
    liquid: '#9CC5C9',
    liquidDeep: '#487B82',
    accent: '#C5A059',
    code: 'MM · 04',
    subtitle: 'EDT · 14%',
  },
  'Botanical Veil': {
    liquid: '#C8D6B9',
    liquidDeep: '#6E8562',
    accent: '#D4AF37',
    code: 'BV · 05',
    subtitle: 'EDP · 20%',
  },
  'Spiced Resin': {
    liquid: '#C26D43',
    liquidDeep: '#6E2B14',
    accent: '#D4AF37',
    code: 'SR · 06',
    subtitle: 'EXTRAIT · 30%',
  },
}

const prepThemes: Record<string, Theme> = {
  'Ceramide & Squalane Lipid Balm': {
    liquid: '#F2E3C6',
    liquidDeep: '#C9AE7E',
    accent: '#C5A059',
    code: 'LIPID · 01',
    subtitle: 'BARRIER BALM',
  },
  'Oil-Balancing Niacinamide Gel Primer': {
    liquid: '#CBE0D6',
    liquidDeep: '#6B9985',
    accent: '#0B3B2C',
    code: 'SEBUM · 02',
    subtitle: 'NIACINAMIDE GEL',
  },
  'Hyaluronic & Peptide Smoothing Veil': {
    liquid: '#D4E4E8',
    liquidDeep: '#769CA6',
    accent: '#C5A059',
    code: 'MICRO · 03',
    subtitle: 'PEPTIDE VEIL',
  },
  'Panthenol & Cica Barrier Shield': {
    liquid: '#C9DEC9',
    liquidDeep: '#58825E',
    accent: '#0B3B2C',
    code: 'CICA · 04',
    subtitle: 'CALMING SHIELD',
  },
}

export function ProductVisual({
  name,
  variant,
  concentration = '',
}: ProductVisualProps) {
  const gradId = `grad-${name.replace(/[^a-zA-Z0-9]/g, '')}`

  if (variant === 'prep') {
    const theme = prepThemes[name] ?? {
      liquid: '#E5DEC9',
      liquidDeep: '#B5A47D',
      accent: '#C5A059',
      code: 'PREP · 01',
      subtitle: 'LAYERING BASE',
    }

    return (
      <div className="product-visual product-visual-prep" aria-hidden="true">
        <svg viewBox="0 0 120 140" className="product-svg">
          <defs>
            <linearGradient id={gradId} x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor={theme.liquid} />
              <stop offset="100%" stopColor={theme.liquidDeep} />
            </linearGradient>
          </defs>
          {/* Ambient gold halo */}
          <circle cx="60" cy="78" r="46" fill="rgba(197, 160, 89, 0.10)" />
          {/* Rubber dropper bulb */}
          <rect x="52" y="14" width="16" height="18" rx="8" fill="#0B3B2C" />
          {/* Gold ribbed collar */}
          <rect
            x="45"
            y="29"
            width="30"
            height="11"
            rx="2"
            fill="#D4AF37"
            stroke="#0B3B2C"
            strokeWidth="1.2"
          />
          {/* Apothecary bottle body */}
          <path
            d="M47 40 L36 52 L36 116 Q36 122 42 122 L78 122 Q84 122 84 116 L84 52 L73 40 Z"
            fill="#FBF9F5"
            stroke="#0B3B2C"
            strokeWidth="1.5"
          />
          {/* Serum fill */}
          <path
            d="M38 66 L82 66 L82 115 Q82 120 77 120 L43 120 Q38 120 38 115 Z"
            fill={`url(#${gradId})`}
            opacity="0.85"
          />
          {/* Glass pipette stem */}
          <line
            x1="60"
            y1="40"
            x2="60"
            y2="106"
            stroke="#0B3B2C"
            strokeWidth="1.4"
            strokeOpacity="0.45"
          />
          {/* Front label */}
          <rect
            x="42"
            y="68"
            width="36"
            height="36"
            rx="2"
            fill="#FBF9F5"
            stroke="#C5A059"
            strokeWidth="1"
          />
          <text
            x="60"
            y="83"
            textAnchor="middle"
            fontSize="6.5"
            fontWeight="700"
            fill="#0B3B2C"
            letterSpacing="0.8"
          >
            DIAMANDIS
          </text>
          <text
            x="60"
            y="94"
            textAnchor="middle"
            fontSize="5.5"
            fontWeight="600"
            fill="#C5A059"
            letterSpacing="0.6"
          >
            {theme.code}
          </text>
        </svg>
      </div>
    )
  }

  const theme = perfumeThemes[name] ?? {
    liquid: '#E6C67C',
    liquidDeep: '#B38832',
    accent: '#D4AF37',
    code: 'DM · 00',
    subtitle: 'PARFUM',
  }

  const isExtrait = concentration.toLowerCase().includes('extrait')
  const isEdt = concentration.toLowerCase().includes('toilette')

  return (
    <div className="product-visual" aria-hidden="true">
      <svg viewBox="0 0 140 150" className="product-svg">
        <defs>
          <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={theme.liquid} />
            <stop offset="100%" stopColor={theme.liquidDeep} />
          </linearGradient>
        </defs>

        {/* Subtle golden aura */}
        <circle cx="70" cy="84" r="52" fill="rgba(197, 160, 89, 0.11)" />

        {/* Cap / Stopper based on concentration */}
        {isExtrait ? (
          <>
            {/* Faceted diamond stopper for Extrait */}
            <polygon
              points="70,12 88,24 80,37 60,37 52,24"
              fill="#D4AF37"
              stroke="#0B3B2C"
              strokeWidth="1.3"
            />
            <rect
              x="59"
              y="37"
              width="22"
              height="8"
              fill="#0B3B2C"
              stroke="#C5A059"
              strokeWidth="1"
            />
          </>
        ) : isEdt ? (
          <>
            {/* Tall cylindrical gold atomizer cap for EDT */}
            <rect
              x="58"
              y="14"
              width="24"
              height="24"
              rx="2"
              fill="#D4AF37"
              stroke="#0B3B2C"
              strokeWidth="1.3"
            />
            <rect x="62" y="38" width="16" height="6" fill="#0B3B2C" />
          </>
        ) : (
          <>
            {/* Architectural emerald & gold cap for EDP */}
            <rect
              x="54"
              y="16"
              width="32"
              height="20"
              rx="2"
              fill="#0B3B2C"
              stroke="#D4AF37"
              strokeWidth="1.3"
            />
            <rect x="61" y="36" width="18" height="8" fill="#D4AF37" />
          </>
        )}

        {/* Outer glass flacon */}
        {isEdt ? (
          <rect
            x="42"
            y="44"
            width="56"
            height="88"
            rx="10"
            fill="#FBF9F5"
            stroke="#0B3B2C"
            strokeWidth="1.6"
          />
        ) : (
          <polygon
            points="44,44 96,44 104,54 104,128 96,132 44,132 36,128 36,54"
            fill="#FBF9F5"
            stroke="#0B3B2C"
            strokeWidth="1.6"
          />
        )}

        {/* Perfume liquid inside glass */}
        <rect
          x={isEdt ? '45' : '40'}
          y={isExtrait ? '58' : '64'}
          width={isEdt ? '50' : '60'}
          height={isExtrait ? '70' : '64'}
          rx="4"
          fill={`url(#${gradId})`}
          opacity="0.88"
        />

        {/* Dip tube */}
        <line
          x1="70"
          y1="44"
          x2="70"
          y2="126"
          stroke="#0B3B2C"
          strokeWidth="1.1"
          strokeOpacity="0.35"
        />

        {/* Editorial plaque label */}
        <rect
          x="47"
          y="70"
          width="46"
          height="42"
          rx="2"
          fill="#0B3B2C"
          stroke="#D4AF37"
          strokeWidth="1.2"
        />
        <text
          x="70"
          y="85"
          textAnchor="middle"
          fontSize="6.5"
          fontWeight="700"
          fill="#D4AF37"
          letterSpacing="1"
        >
          DIAMANDIS
        </text>
        <text
          x="70"
          y="96"
          textAnchor="middle"
          fontSize="7.5"
          fontWeight="600"
          fill="#FBF9F5"
          letterSpacing="0.8"
        >
          {theme.code}
        </text>
        <text
          x="70"
          y="106"
          textAnchor="middle"
          fontSize="5"
          fill="#C5A059"
          letterSpacing="0.6"
        >
          {theme.subtitle}
        </text>
      </svg>
    </div>
  )
}