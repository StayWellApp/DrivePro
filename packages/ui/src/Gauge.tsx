import React from 'react';

interface GaugeProps {
  value: number; // 0 to 100
  label: string;
  sublabel?: string;
  size?: number;
  strokeWidth?: number;
}

export const Gauge: React.FC<GaugeProps> = ({
  value,
  label,
  sublabel,
  size = 200,
  strokeWidth = 15
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (value / 100) * circumference;

  const getColor = (val: number) => {
    if (val < 40) return '#EF4444'; // Red
    if (val < 75) return '#F59E0B'; // Amber
    return '#2DD4BF'; // Electric Teal
  };

  return (
    <div className="ui:flex ui:flex-col ui:items-center ui:justify-center" style={{ width: size }}>
      <div className="ui:relative" style={{ width: size, height: size }}>
        {/* Background Circle */}
        <svg width={size} height={size} className="ui:rotate-[-90deg]">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="transparent"
            stroke="rgba(255,255,255,0.05)"
            strokeWidth={strokeWidth}
          />
          {/* Progress Circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="transparent"
            stroke={getColor(value)}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            className="ui:transition-all ui:duration-1000 ui:ease-out"
          />
        </svg>
        {/* Center Content */}
        <div className="ui:absolute ui:inset-0 ui:flex ui:flex-col ui:items-center ui:justify-center">
          <span className="ui:text-4xl ui:font-black ui:text-white ui:tracking-tighter">
            {value}%
          </span>
          <span className="ui:text-[10px] ui:font-bold ui:uppercase ui:tracking-[0.2em] ui:text-slate-400">
            {label}
          </span>
        </div>
      </div>
      {sublabel && (
        <p className="ui:mt-4 ui:text-[10px] ui:font-medium ui:text-slate-500 ui:uppercase ui:tracking-widest ui:text-center">
          {sublabel}
        </p>
      )}
    </div>
  );
};
