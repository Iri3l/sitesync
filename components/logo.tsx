"use client"

interface LogoProps {
  size?: "sm" | "md" | "lg" | "xl"
  showIcon?: boolean
}

export function Logo({ size = "md", showIcon = true }: LogoProps) {
  const sizeClasses = {
    sm: "text-lg",
    md: "text-xl",
    lg: "text-3xl",
    xl: "text-5xl",
  }

  const iconSizes = {
    sm: "w-5 h-5",
    md: "w-6 h-6",
    lg: "w-10 h-10",
    xl: "w-14 h-14",
  }

  return (
    <div className="flex items-center gap-2">
      {showIcon && (
        <div className={`relative ${iconSizes[size]}`}>
          {/* Construction site icon - stylized building with sync arrows */}
          <svg
            viewBox="0 0 40 40"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="w-full h-full"
          >
            {/* Background circle with gradient */}
            <defs>
              <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#f97316" />
                <stop offset="50%" stopColor="#ea580c" />
                <stop offset="100%" stopColor="#c2410c" />
              </linearGradient>
              <linearGradient id="buildingGradient" x1="0%" y1="100%" x2="0%" y2="0%">
                <stop offset="0%" stopColor="#1e293b" />
                <stop offset="100%" stopColor="#334155" />
              </linearGradient>
            </defs>
            
            {/* Main circle background */}
            <circle cx="20" cy="20" r="19" fill="url(#logoGradient)" />
            
            {/* Building silhouette */}
            <path
              d="M12 28V16L20 10L28 16V28H12Z"
              fill="url(#buildingGradient)"
              stroke="white"
              strokeWidth="1.5"
            />
            
            {/* Windows */}
            <rect x="15" y="18" width="3" height="3" fill="#f97316" rx="0.5" />
            <rect x="22" y="18" width="3" height="3" fill="#f97316" rx="0.5" />
            <rect x="18" y="23" width="4" height="5" fill="#f97316" rx="0.5" />
            
            {/* Sync arrow (circular) */}
            <path
              d="M32 14C32 14 30 12 27 12"
              stroke="white"
              strokeWidth="2"
              strokeLinecap="round"
              fill="none"
            />
            <path
              d="M32 14L30 11M32 14L29 15"
              stroke="white"
              strokeWidth="1.5"
              strokeLinecap="round"
              fill="none"
            />
            
            <path
              d="M8 26C8 26 10 28 13 28"
              stroke="white"
              strokeWidth="2"
              strokeLinecap="round"
              fill="none"
            />
            <path
              d="M8 26L10 29M8 26L11 25"
              stroke="white"
              strokeWidth="1.5"
              strokeLinecap="round"
              fill="none"
            />
          </svg>
        </div>
      )}
      
      <span className={`font-bold tracking-tight ${sizeClasses[size]}`}>
        <span className="bg-gradient-to-r from-orange-500 via-orange-600 to-amber-600 bg-clip-text text-transparent">
          Site
        </span>
        <span className="text-slate-700 dark:text-slate-200">
          Sync
        </span>
      </span>
    </div>
  )
}

export function LogoMark({ size = "md" }: { size?: "sm" | "md" | "lg" | "xl" }) {
  const iconSizes = {
    sm: "w-8 h-8",
    md: "w-10 h-10",
    lg: "w-14 h-14",
    xl: "w-20 h-20",
  }

  return (
    <div className={`relative ${iconSizes[size]}`}>
      <svg
        viewBox="0 0 40 40"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full drop-shadow-lg"
      >
        <defs>
          <linearGradient id="logoMarkGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#f97316" />
            <stop offset="50%" stopColor="#ea580c" />
            <stop offset="100%" stopColor="#c2410c" />
          </linearGradient>
          <linearGradient id="buildingMarkGradient" x1="0%" y1="100%" x2="0%" y2="0%">
            <stop offset="0%" stopColor="#1e293b" />
            <stop offset="100%" stopColor="#334155" />
          </linearGradient>
        </defs>
        
        <circle cx="20" cy="20" r="19" fill="url(#logoMarkGradient)" />
        
        <path
          d="M12 28V16L20 10L28 16V28H12Z"
          fill="url(#buildingMarkGradient)"
          stroke="white"
          strokeWidth="1.5"
        />
        
        <rect x="15" y="18" width="3" height="3" fill="#f97316" rx="0.5" />
        <rect x="22" y="18" width="3" height="3" fill="#f97316" rx="0.5" />
        <rect x="18" y="23" width="4" height="5" fill="#f97316" rx="0.5" />
        
        <path
          d="M32 14C32 14 30 12 27 12"
          stroke="white"
          strokeWidth="2"
          strokeLinecap="round"
          fill="none"
        />
        <path
          d="M32 14L30 11M32 14L29 15"
          stroke="white"
          strokeWidth="1.5"
          strokeLinecap="round"
          fill="none"
        />
        
        <path
          d="M8 26C8 26 10 28 13 28"
          stroke="white"
          strokeWidth="2"
          strokeLinecap="round"
          fill="none"
        />
        <path
          d="M8 26L10 29M8 26L11 25"
          stroke="white"
          strokeWidth="1.5"
          strokeLinecap="round"
          fill="none"
        />
      </svg>
    </div>
  )
}


