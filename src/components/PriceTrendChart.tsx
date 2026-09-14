import React, { useState } from 'react';
import { TrendingUp, TrendingDown, Minus, Info } from 'lucide-react';
import { MonthlyTrendPoint, formatSGD, formatCompactSGD } from '../utils/calculations';

interface PriceTrendChartProps {
  trendPoints: MonthlyTrendPoint[];
  town: string;
  flatType: string;
}

export const PriceTrendChart: React.FC<PriceTrendChartProps> = ({
  trendPoints,
  town,
  flatType,
}) => {
  const [activePointIndex, setActivePointIndex] = useState<number | null>(null);

  if (trendPoints.length === 0) {
    return (
      <div className="bg-slate-50 border border-dashed border-slate-300 rounded-xl p-6 text-center text-slate-500">
        <p className="text-sm">No transaction trend data available for this filter combination.</p>
      </div>
    );
  }

  // Calculate min & max for scaling
  const prices = trendPoints.map((p) => p.medianPrice);
  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);
  const priceRange = maxPrice - minPrice || 1;

  // Add 10% vertical padding so lines don't hit edge
  const paddedMin = Math.max(0, Math.floor((minPrice - priceRange * 0.15) / 10000) * 10000);
  const paddedMax = Math.ceil((maxPrice + priceRange * 0.15) / 10000) * 10000;
  const totalScale = paddedMax - paddedMin || 1;

  // SVG dimensions
  const svgWidth = 600;
  const svgHeight = 220;
  const padLeft = 60;
  const padRight = 30;
  const padTop = 25;
  const padBottom = 40;
  const plotWidth = svgWidth - padLeft - padRight;
  const plotHeight = svgHeight - padTop - padBottom;

  const points = trendPoints.map((pt, index) => {
    const x =
      trendPoints.length === 1
        ? padLeft + plotWidth / 2
        : padLeft + (index / (trendPoints.length - 1)) * plotWidth;
    const y = padTop + plotHeight - ((pt.medianPrice - paddedMin) / totalScale) * plotHeight;
    return { ...pt, x, y };
  });

  const pathD = points.reduce((acc, pt, idx) => {
    return `${acc} ${idx === 0 ? 'M' : 'L'} ${pt.x} ${pt.y}`;
  }, '');

  const areaD = `${pathD} L ${points[points.length - 1].x} ${padTop + plotHeight} L ${points[0].x} ${padTop + plotHeight} Z`;

  // Compute trend movement
  const firstPrice = trendPoints[0].medianPrice;
  const lastPrice = trendPoints[trendPoints.length - 1].medianPrice;
  const changePercent =
    firstPrice > 0 ? Number((((lastPrice - firstPrice) / firstPrice) * 100).toFixed(1)) : 0;

  const isRising = changePercent > 1.5;
  const isFalling = changePercent < -1.5;

  const activePoint =
    activePointIndex !== null ? points[activePointIndex] : points[points.length - 1];

  return (
    <div id="price-trend-chart-card" className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-6 shadow-xs">
      {/* Header & Trend Summary */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base sm:text-lg font-bold text-slate-900">
              Price Trend Over Time
            </h3>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700">
              {town === 'ALL' ? 'All Towns' : town} • {flatType === 'ALL' ? 'All Flat Types' : flatType}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Monthly median transaction price across recent 2024 records
          </p>
        </div>

        {/* Trend Indicator Pill */}
        <div className="flex items-center gap-2">
          {isRising && (
            <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
              <TrendingUp className="w-3.5 h-3.5" />
              Rising (+{changePercent}%)
            </span>
          )}
          {isFalling && (
            <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200">
              <TrendingDown className="w-3.5 h-3.5" />
              Easing ({changePercent}%)
            </span>
          )}
          {!isRising && !isFalling && (
            <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200">
              <Minus className="w-3.5 h-3.5" />
              Stable ({changePercent >= 0 ? '+' : ''}{changePercent}%)
            </span>
          )}
        </div>
      </div>

      {/* Active Point Callout */}
      <div className="bg-slate-50 border border-slate-200/80 rounded-xl px-4 py-2.5 mb-3 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-xs text-slate-600">
          <Info className="w-4 h-4 text-slate-400 shrink-0" />
          <span>
            Month: <strong className="text-slate-900">{activePoint.formattedMonth}</strong>
          </span>
          <span className="text-slate-300">•</span>
          <span>
            Median Price:{' '}
            <strong className="text-slate-900 text-sm font-bold text-slate-900">
              {formatSGD(activePoint.medianPrice)}
            </strong>
          </span>
          <span className="text-slate-300">•</span>
          <span>
            Transactions: <strong className="text-slate-900">{activePoint.count}</strong>
          </span>
        </div>
        <span className="text-[11px] text-slate-400 hidden sm:inline">Tap points to inspect</span>
      </div>

      {/* Chart SVG */}
      <div className="w-full overflow-x-auto">
        <svg
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          className="w-full h-44 sm:h-52 select-none overflow-visible"
          role="img"
          aria-label="HDB Price Trend Chart"
        >
          <defs>
            <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#0f172a" stopOpacity="0.16" />
              <stop offset="100%" stopColor="#0f172a" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Horizontal grid lines */}
          {[0, 0.25, 0.5, 0.75, 1].map((ratio) => {
            const yVal = padTop + plotHeight * ratio;
            const priceVal = paddedMax - totalScale * ratio;
            return (
              <g key={ratio}>
                <line
                  x1={padLeft}
                  y1={yVal}
                  x2={svgWidth - padRight}
                  y2={yVal}
                  stroke="#e2e8f0"
                  strokeDasharray="4 4"
                  strokeWidth="1"
                />
                <text
                  x={padLeft - 10}
                  y={yVal + 4}
                  textAnchor="end"
                  className="text-[11px] fill-slate-400 font-medium"
                >
                  {formatCompactSGD(priceVal)}
                </text>
              </g>
            );
          })}

          {/* Area under curve */}
          <path d={areaD} fill="url(#chartGradient)" />

          {/* Trend line */}
          <path
            d={pathD}
            fill="none"
            stroke="#0f172a"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Month markers and interactive points */}
          {points.map((pt, idx) => {
            const isSelected =
              activePointIndex === idx ||
              (activePointIndex === null && idx === points.length - 1);
            return (
              <g
                key={pt.month}
                className="cursor-pointer group"
                onClick={() => setActivePointIndex(idx)}
                onMouseEnter={() => setActivePointIndex(idx)}
              >
                {/* Hit target */}
                <circle cx={pt.x} cy={pt.y} r="18" fill="transparent" />

                {/* Vertical helper line for active */}
                {isSelected && (
                  <line
                    x1={pt.x}
                    y1={padTop}
                    x2={pt.x}
                    y2={padTop + plotHeight}
                    stroke="#cbd5e1"
                    strokeWidth="1"
                    strokeDasharray="2 2"
                  />
                )}

                {/* Point circle */}
                <circle
                  cx={pt.x}
                  cy={pt.y}
                  r={isSelected ? 6 : 4}
                  fill={isSelected ? '#0f172a' : '#ffffff'}
                  stroke="#0f172a"
                  strokeWidth={isSelected ? 3 : 2}
                  className="transition-all"
                />

                {/* Month label on X-axis */}
                <text
                  x={pt.x}
                  y={svgHeight - 12}
                  textAnchor="middle"
                  className={`text-[11px] font-semibold transition-colors ${
                    isSelected ? 'fill-slate-900 font-bold' : 'fill-slate-500'
                  }`}
                >
                  {pt.formattedMonth.split(' ')[0]}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* Arm's length readable conclusion line */}
      <div className="mt-3 pt-3 border-t border-slate-100 text-xs sm:text-sm text-slate-700 font-medium">
        Trend takeaway:{' '}
        <span className="font-semibold text-slate-900">
          {isRising &&
            `Resale prices in this selection have trended upward (+${changePercent}%), rising from ${formatSGD(firstPrice)} to ${formatSGD(lastPrice)}.`}
          {isFalling &&
            `Resale prices have eased (${changePercent}%), adjusting from ${formatSGD(firstPrice)} to ${formatSGD(lastPrice)}.`}
          {!isRising &&
            !isFalling &&
            `Resale prices have held steady within a stable range of ${formatSGD(minPrice)} - ${formatSGD(maxPrice)}.`}
        </span>
      </div>
    </div>
  );
};
