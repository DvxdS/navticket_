import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { MotionPathPlugin } from 'gsap/MotionPathPlugin';

// Register GSAP plugin
gsap.registerPlugin(MotionPathPlugin);

interface City {
  name: string;
  x: number; // Percentage position
  y: number; // Percentage position
}

const ivorianCities: City[] = [
  { name: "Sassandra", x: 2, y: 88 },       // Extreme far left, bottom (Coast)
  { name: "San-Pédro", x: 5, y: 78 },       // Very far left, bottom (West coast)
  { name: "Man", x: 10, y: 25 },            // Far left, upper (West mountains)
  { name: "Abidjan", x: 15, y: 70 },        // Left, lower
  { name: "Daloa", x: 22, y: 50 },          // Left side, middle
  { name: "Bouaké", x: 85, y: 38 },         // Extreme far right, upper
  { name: "Yamoussoukro", x: 92, y: 55 },   // Extreme far right, middle (Capital)
  { name: "Korhogo", x: 95, y: 18 },        // Extreme far right, top (North)
];

// Define routes between cities (more horizontal routes)
const routes = [
  { from: "Sassandra", to: "San-Pédro" },
  { from: "San-Pédro", to: "Abidjan" },
  { from: "Abidjan", to: "Yamoussoukro" },
  { from: "Yamoussoukro", to: "Bouaké" },
  { from: "Bouaké", to: "Korhogo" },
  { from: "Man", to: "Daloa" },
  { from: "Daloa", to: "Yamoussoukro" },
  { from: "Yamoussoukro", to: "Korhogo" },
  { from: "Man", to: "San-Pédro" },
];

export default function AnimatedMap() {
  const svgRef = useRef<SVGSVGElement>(null);

  // Get city coordinates by name
  const getCityCoords = (cityName: string) => {
    return ivorianCities.find(city => city.name === cityName);
  };

  // Generate SVG path for the complete route loop (wider horizontal path)
  const generateRoutePath = (): string => {
    const citySequence = [
      "Sassandra",      // Far left coast (start)
      "San-Pédro",      // Left coast
      "Man",            // West mountains
      "Daloa",          // Center-left
      "Yamoussoukro",   // Center (capital)
      "Bouaké",         // Center-right
      "Korhogo",        // Far right north
      "Bouaké",         // Back through center
      "Yamoussoukro",   // Back to capital
      "Abidjan",        // Southeast coast
      "Sassandra"       // Complete the loop back to start
    ];

    const pathPoints = citySequence
      .map(name => getCityCoords(name))
      .filter((city): city is City => city !== undefined);

    if (pathPoints.length === 0) return '';

    // Create smooth curved path
    let path = `M ${pathPoints[0].x} ${pathPoints[0].y}`;
    
    for (let i = 1; i < pathPoints.length; i++) {
      const prev = pathPoints[i - 1];
      const curr = pathPoints[i];
      
      // Calculate control points for smooth curves
      const dx = curr.x - prev.x;
      const dy = curr.y - prev.y;
      
      const cp1x = prev.x + dx * 0.3;
      const cp1y = prev.y + dy * 0.3;
      const cp2x = prev.x + dx * 0.7;
      const cp2y = prev.y + dy * 0.7;
      
      path += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${curr.x} ${curr.y}`;
    }
    
    return path;
  };

  useEffect(() => {
    if (!svgRef.current) return;

    const svg = svgRef.current;
    const mainRoute = svg.querySelector('.main-route');
    const bus = svg.querySelector('#traveling-bus');
    const routeLines = svg.querySelectorAll('.route-line');

    if (!mainRoute || !bus) return;

    // Create animation timeline
    const tl = gsap.timeline({ repeat: -1 });

    // 1. Animate route lines appearing (staggered)
    tl.fromTo(
      routeLines,
      {
        strokeDashoffset: 100,
        strokeDasharray: '100 100',
      },
      {
        strokeDashoffset: 0,
        duration: 1.5,
        stagger: 0.2,
        ease: 'power2.inOut',
      }
    );

    // 2. Animate main route path drawing
    tl.fromTo(
      mainRoute,
      {
        strokeDashoffset: 1000,
        strokeDasharray: '1000 1000',
      },
      {
        strokeDashoffset: 0,
        duration: 3,
        ease: 'power1.inOut',
      },
      '-=1' // Start slightly before route lines finish
    );

    // 3. Animate bus traveling along the path
    tl.to(
      bus,
      {
        duration: 20,
        ease: 'none',
        motionPath: {
          path: '#route-path',
          align: '#route-path',
          autoRotate: true,
          alignOrigin: [0.5, 0.5],
        },
      },
      '-=0.5' // Start just before route finishes drawing
    );

    // 4. Add pulsing effect to cities as bus passes
    gsap.to('.city-dot', {
      scale: 1.3,
      opacity: 0.8,
      duration: 0.5,
      stagger: {
        each: 2.5,
        repeat: -1,
      },
      yoyo: true,
      ease: 'power1.inOut',
    });

    return () => {
      tl.kill();
    };
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <svg
        ref={svgRef}
        viewBox="0 0 100 100"
        preserveAspectRatio="xMidYMid meet"
        className="w-full h-full"
        style={{ opacity: 1 }}
      >
        {/* Define the route path */}
        <defs>
          <path
            id="route-path"
            d={generateRoutePath()}
            fill="none"
          />
        </defs>

        {/* Background route lines (individual segments) */}
        {routes.map((route, index) => {
          const from = getCityCoords(route.from);
          const to = getCityCoords(route.to);
          
          if (!from || !to) return null;

          return (
            <line
              key={index}
              className="route-line"
              x1={from.x}
              y1={from.y}
              x2={to.x}
              y2={to.y}
              stroke="#FF9013"
              strokeWidth="0.5"
              strokeOpacity="0.35"
              strokeDasharray="1.5 1.5"
            />
          );
        })}

        {/* Main traveling route path (for bus animation) */}
        <use
          href="#route-path"
          stroke="#FF9013"
          strokeWidth="0.6"
          strokeOpacity="0.4"
          fill="none"
          strokeDasharray="2 2"
          className="main-route"
        />

        {/* Cities */}
        {ivorianCities.map((city, index) => (
          <g key={index} className="city-marker">
            {/* City dot outer glow */}
            <circle
              cx={city.x}
              cy={city.y}
              r="1.2"
              fill="#FF9013"
              fillOpacity="0.2"
              className="city-dot-glow"
            />
            
            {/* City dot */}
            <circle
              cx={city.x}
              cy={city.y}
              r="0.9"
              fill="#FF9013"
              fillOpacity="0.6"
              className="city-dot"
            />
            
            {/* City dot inner glow */}
            <circle
              cx={city.x}
              cy={city.y}
              r="0.5"
              fill="#FFFFFF"
              fillOpacity="0.8"
            />

            {/* City name label */}
            <text
              x={city.x}
              y={city.y - 2.5}
              fontSize="3"
              fill="#374151"
              fillOpacity="0.5"
              textAnchor="middle"
              fontWeight="600"
              className="city-label"
            >
              {city.name}
            </text>
          </g>
        ))}

        {/* Bus container (animated) - Pure SVG Bus */}
        <g id="traveling-bus" className="bus-container">
          {/* Outer glow */}
          <circle
            cx={ivorianCities[0].x}
            cy={ivorianCities[0].y}
            r="3.5"
            fill="#73C8D2"
            fillOpacity="0.2"
            className="bus-glow-outer"
          />
          
          {/* Main glow */}
          <circle
            cx={ivorianCities[0].x}
            cy={ivorianCities[0].y}
            r="2.5"
            fill="#73C8D2"
            fillOpacity="0.4"
            className="bus-glow"
          />
          
          {/* Simple SVG Bus Icon */}
          <g transform={`translate(${ivorianCities[0].x}, ${ivorianCities[0].y})`}>
            {/* Bus body - main rectangle */}
            <rect
              x="-2"
              y="-1.5"
              width="4"
              height="3"
              rx="0.5"
              fill="#FF9013"
              stroke="#FFFFFF"
              strokeWidth="0.2"
            />
            
            {/* Windows */}
            <rect
              x="-1.5"
              y="-1"
              width="1"
              height="0.8"
              rx="0.2"
              fill="#FFFFFF"
              fillOpacity="0.7"
            />
            <rect
              x="0.5"
              y="-1"
              width="1"
              height="0.8"
              rx="0.2"
              fill="#FFFFFF"
              fillOpacity="0.7"
            />
            
            {/* Front detail */}
            <rect
              x="1.8"
              y="-0.5"
              width="0.3"
              height="1"
              fill="#FFB84D"
            />
            
            {/* Wheels */}
            <circle
              cx="-1"
              cy="1.5"
              r="0.5"
              fill="#1F2937"
              stroke="#FFFFFF"
              strokeWidth="0.15"
            />
            <circle
              cx="1"
              cy="1.5"
              r="0.5"
              fill="#1F2937"
              stroke="#FFFFFF"
              strokeWidth="0.15"
            />
            
            {/* Wheel centers */}
            <circle cx="-1" cy="1.5" r="0.2" fill="#6B7280" />
            <circle cx="1" cy="1.5" r="0.2" fill="#6B7280" />
          </g>
        </g>
      </svg>
    </div>
  );
}