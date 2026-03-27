"use client";

import { useEffect, useState } from "react";

interface ScoreGaugeProps {
  score: number;
  size?: "lg" | "sm";
}

function getScoreColor(score: number): string {
  if (score >= 80) return "#10b981"; // emerald
  if (score >= 60) return "#3b82f6"; // blue
  if (score >= 40) return "#f59e0b"; // amber
  return "#ef4444"; // red
}

function getScoreLabel(score: number): string {
  if (score >= 80) return "우수";
  if (score >= 60) return "보통";
  if (score >= 40) return "주의";
  return "위험";
}

export function ScoreGauge({ score, size = "lg" }: ScoreGaugeProps) {
  const [animated, setAnimated] = useState(0);
  const color = getScoreColor(score);
  const label = getScoreLabel(score);

  // SVG 원형 게이지 설정
  const radius = size === "lg" ? 80 : 48;
  const strokeWidth = size === "lg" ? 10 : 7;
  const circumference = 2 * Math.PI * radius;
  const svgSize = (radius + strokeWidth) * 2;

  useEffect(() => {
    const timer = setTimeout(() => setAnimated(score), 300);
    return () => clearTimeout(timer);
  }, [score]);

  const dashOffset = circumference - (animated / 100) * circumference;

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative">
        <svg
          width={svgSize}
          height={svgSize}
          className="-rotate-90"
          style={{ filter: `drop-shadow(0 0 12px ${color}60)` }}
        >
          {/* 배경 트랙 */}
          <circle
            cx={svgSize / 2}
            cy={svgSize / 2}
            r={radius}
            fill="none"
            stroke="#1e293b"
            strokeWidth={strokeWidth}
          />
          {/* 진행 바 */}
          <circle
            cx={svgSize / 2}
            cy={svgSize / 2}
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={dashOffset}
            style={{
              transition: "stroke-dashoffset 1.4s cubic-bezier(0.34, 1.56, 0.64, 1)",
            }}
          />
        </svg>

        {/* 가운데 점수 텍스트 */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span
            className={`font-display font-bold leading-none ${
              size === "lg" ? "text-5xl" : "text-2xl"
            }`}
            style={{ color }}
          >
            {animated}
          </span>
          {size === "lg" && (
            <span className="text-xs text-slate-500 mt-1 font-mono">/ 100</span>
          )}
        </div>
      </div>

      <div
        className={`font-semibold ${size === "lg" ? "text-base" : "text-xs"}`}
        style={{ color }}
      >
        {label}
      </div>
    </div>
  );
}

interface CategoryBarProps {
  label: string;
  score: number;
  grade: string;
}

export function CategoryBar({ label, score, grade }: CategoryBarProps) {
  const [width, setWidth] = useState(0);
  const color = getScoreColor(score);

  useEffect(() => {
    const timer = setTimeout(() => setWidth(score), 500);
    return () => clearTimeout(timer);
  }, [score]);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-sm text-slate-300">{label}</span>
        <div className="flex items-center gap-2">
          <span
            className="text-xs font-mono font-bold"
            style={{ color }}
          >
            {score}점
          </span>
          <span
            className="text-xs font-mono font-bold w-5 text-center"
            style={{ color }}
          >
            {grade}
          </span>
        </div>
      </div>
      <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-1000 ease-out"
          style={{
            width: `${width}%`,
            background: `linear-gradient(90deg, ${color}80, ${color})`,
            boxShadow: `0 0 8px ${color}60`,
          }}
        />
      </div>
    </div>
  );
}
