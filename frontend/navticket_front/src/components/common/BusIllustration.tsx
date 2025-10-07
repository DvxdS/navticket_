export default function BusIllustration({ className = "" }: { className?: string }) {
    return (
      <svg
        viewBox="0 0 500 400"
        className={className}
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Background glow effect */}
        <defs>
          <linearGradient id="busGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#73C8D2" />
            <stop offset="100%" stopColor="#0046FF" />
          </linearGradient>
          <linearGradient id="windowGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#0046FF" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#0046FF" stopOpacity="0.1" />
          </linearGradient>
          <filter id="shadow">
            <feDropShadow dx="0" dy="10" stdDeviation="15" floodOpacity="0.2"/>
          </filter>
        </defs>
  
        {/* Shadow under bus */}
        <ellipse cx="250" cy="340" rx="180" ry="20" fill="#000" opacity="0.1"/>
  
        {/* Main Bus Body - 3D effect with gradient */}
        <rect 
          x="100" 
          y="150" 
          width="300" 
          height="150" 
          fill="url(#busGradient)" 
          rx="25"
          filter="url(#shadow)"
        />
  
        {/* Bus Top/Roof - Lighter for 3D effect */}
        <path 
          d="M 100 150 L 150 100 L 350 100 L 400 150 Z" 
          fill="#73C8D2"
          opacity="0.9"
        />
  
        {/* Front highlight - Creates 3D depth */}
        <rect 
          x="100" 
          y="150" 
          width="300" 
          height="40" 
          fill="#fff" 
          opacity="0.15"
          rx="25"
        />
  
        {/* Windows - 3 large windows */}
        <rect x="120" y="170" width="70" height="60" fill="url(#windowGradient)" rx="8"/>
        <rect x="215" y="170" width="70" height="60" fill="url(#windowGradient)" rx="8"/>
        <rect x="310" y="170" width="70" height="60" fill="url(#windowGradient)" rx="8"/>
  
        {/* Window frames */}
        <rect x="120" y="170" width="70" height="60" fill="none" stroke="#0046FF" strokeWidth="3" rx="8" opacity="0.3"/>
        <rect x="215" y="170" width="70" height="60" fill="none" stroke="#0046FF" strokeWidth="3" rx="8" opacity="0.3"/>
        <rect x="310" y="170" width="70" height="60" fill="none" stroke="#0046FF" strokeWidth="3" rx="8" opacity="0.3"/>
  
        {/* Orange stripe - Brand accent */}
        <rect x="100" y="245" width="300" height="20" fill="#FF9013" opacity="0.8" rx="5"/>
  
        {/* Headlights */}
        <circle cx="120" cy="280" r="8" fill="#FFE066"/>
        <circle cx="380" cy="280" r="8" fill="#FFE066"/>
  
        {/* Front bumper detail */}
        <rect x="100" y="285" width="300" height="15" fill="#0046FF" opacity="0.2" rx="25"/>
  
        {/* Wheels - 3D effect with gradients */}
        <defs>
          <radialGradient id="wheelGradient">
            <stop offset="40%" stopColor="#1a1a1a" />
            <stop offset="100%" stopColor="#000" />
          </radialGradient>
        </defs>
  
        {/* Back Wheel */}
        <circle cx="150" cy="310" r="35" fill="url(#wheelGradient)"/>
        <circle cx="150" cy="310" r="20" fill="#2a2a2a"/>
        <circle cx="150" cy="310" r="8" fill="#4a4a4a"/>
  
        {/* Front Wheel */}
        <circle cx="350" cy="310" r="35" fill="url(#wheelGradient)"/>
        <circle cx="350" cy="310" r="20" fill="#2a2a2a"/>
        <circle cx="350" cy="310" r="8" fill="#4a4a4a"/>
  
        {/* Wheel highlights for 3D effect */}
        <circle cx="145" cy="305" r="10" fill="#fff" opacity="0.3"/>
        <circle cx="345" cy="305" r="10" fill="#fff" opacity="0.3"/>
  
        {/* Side mirror */}
        <rect x="90" y="190" width="15" height="8" fill="#0046FF" rx="2"/>
        <circle cx="85" cy="194" r="6" fill="#0046FF" opacity="0.5"/>
  
        {/* Door lines */}
        <line x1="200" y1="240" x2="200" y2="285" stroke="#0046FF" strokeWidth="2" opacity="0.2"/>
        <line x1="300" y1="240" x2="300" y2="285" stroke="#0046FF" strokeWidth="2" opacity="0.2"/>
  
        {/* Decorative elements - Optional dots/patterns */}
        <circle cx="250" cy="260" r="4" fill="#FF9013" opacity="0.6"/>
      </svg>
    );
  }