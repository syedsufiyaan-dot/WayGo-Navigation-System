import React from 'react';

interface TransitBackgroundProps {
  variant?: 'login' | 'app';
}

export const TransitBackground: React.FC<TransitBackgroundProps> = ({
  variant = 'app',
}) => {
  return (
    <div
      className={`waygo-transit-bg waygo-transit-bg--${variant}`}
      aria-hidden="true"
    >
      {/* Animated glowing atmosphere */}
      <div className="waygo-aurora waygo-aurora--blue" />
      <div className="waygo-aurora waygo-aurora--purple" />
      <div className="waygo-aurora waygo-aurora--cyan" />

      {/* 3D perspective floor */}
      <div className="waygo-perspective-scene">
        <div className="waygo-perspective-grid" />

        <div className="waygo-orbit waygo-orbit--one" />
        <div className="waygo-orbit waygo-orbit--two" />
        <div className="waygo-orbit waygo-orbit--three" />
      </div>

      {/* Chennai-inspired animated transit network */}
      <svg
        className="waygo-route-network"
        viewBox="0 0 1600 900"
        preserveAspectRatio="xMidYMid slice"
      >
        <defs>
          <linearGradient id="waygoBlueRoute" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#2563eb" />
            <stop offset="50%" stopColor="#38bdf8" />
            <stop offset="100%" stopColor="#2563eb" />
          </linearGradient>

          <linearGradient
            id="waygoPurpleRoute"
            x1="0%"
            y1="0%"
            x2="100%"
            y2="0%"
          >
            <stop offset="0%" stopColor="#7c3aed" />
            <stop offset="50%" stopColor="#c084fc" />
            <stop offset="100%" stopColor="#7c3aed" />
          </linearGradient>

          <linearGradient id="waygoGreenRoute" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#059669" />
            <stop offset="50%" stopColor="#2dd4bf" />
            <stop offset="100%" stopColor="#059669" />
          </linearGradient>

          <filter id="waygoRouteGlow">
            <feGaussianBlur stdDeviation="7" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        <path
          id="waygo-route-blue"
          className="waygo-route-line waygo-route-line--blue"
          d="M-100 675 C180 490, 360 810, 650 610 S1120 440, 1700 655"
          stroke="url(#waygoBlueRoute)"
          filter="url(#waygoRouteGlow)"
        />

        <path
          id="waygo-route-purple"
          className="waygo-route-line waygo-route-line--purple"
          d="M-100 770 C230 610, 450 850, 760 670 S1240 540, 1700 760"
          stroke="url(#waygoPurpleRoute)"
          filter="url(#waygoRouteGlow)"
        />

        <path
          id="waygo-route-green"
          className="waygo-route-line waygo-route-line--green"
          d="M-100 560 C190 750, 430 430, 735 570 S1200 780, 1700 510"
          stroke="url(#waygoGreenRoute)"
          filter="url(#waygoRouteGlow)"
        />

        {/* Moving vehicle lights */}
        <circle className="waygo-moving-light waygo-moving-light--blue" r="7">
          <animateMotion dur="11s" repeatCount="indefinite">
            <mpath href="#waygo-route-blue" />
          </animateMotion>
        </circle>

        <circle className="waygo-moving-light waygo-moving-light--purple" r="7">
          <animateMotion dur="15s" repeatCount="indefinite">
            <mpath href="#waygo-route-purple" />
          </animateMotion>
        </circle>

        <circle className="waygo-moving-light waygo-moving-light--green" r="7">
          <animateMotion dur="13s" repeatCount="indefinite">
            <mpath href="#waygo-route-green" />
          </animateMotion>
        </circle>

        {/* Station points */}
        {[
          [150, 610],
          [330, 675],
          [520, 645],
          [710, 585],
          [900, 560],
          [1090, 545],
          [1280, 565],
          [1460, 625],
        ].map(([cx, cy], index) => (
          <g key={`${cx}-${cy}`}>
            <circle
              className="waygo-station-pulse"
              cx={cx}
              cy={cy}
              r="13"
              style={{ animationDelay: `${index * 0.25}s` }}
            />
            <circle
              className="waygo-station-core"
              cx={cx}
              cy={cy}
              r="4"
            />
          </g>
        ))}
      </svg>

      {/* Floating light particles */}
      <div className="waygo-particles">
        {Array.from({ length: 18 }).map((_, index) => (
          <span
            key={index}
            className="waygo-particle"
            style={
              {
                '--particle-index': index,
              } as React.CSSProperties
            }
          />
        ))}
      </div>

      {/* Readability overlay */}
      <div className="waygo-background-overlay" />
    </div>
  );
};
