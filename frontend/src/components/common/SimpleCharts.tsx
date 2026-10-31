import React, { useState } from 'react';

// Line chart matching image_6d1c2c37.png
export const PaymentLineChart: React.FC<{ timeRange?: string }> = ({ timeRange = 'Last 30 Days' }) => {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(4); // default selected last point

  const data = [
    { label: 'Oct 1', value: 3400, display: '$3,400.00' },
    { label: 'Oct 5', value: 5800, display: '$5,800.00' },
    { label: 'Oct 8', value: 4600, display: '$4,600.00' },
    { label: 'Oct 12', value: 6800, display: '$6,800.00' },
    { label: 'Oct 15', value: 6100, display: '$6,100.00' },
    { label: 'Oct 19', value: 7800, display: '$7,800.00' },
    { label: 'Oct 22', value: 9200, display: '$9,200.00' },
    { label: 'Oct 26', value: 8700, display: '$8,700.00' },
    { label: 'Oct 29', value: 11400, display: '$11,400.00' },
    { label: 'Oct 31', value: 14250, display: '$14,250.00' }
  ];

  const maxVal = 16000;
  const width = 680;
  const height = 210;
  const paddingLeft = 45;
  const paddingRight = 30;
  const paddingTop = 25;
  const paddingBottom = 35;

  const chartW = width - paddingLeft - paddingRight;
  const chartH = height - paddingTop - paddingBottom;

  const points = data.map((d, i) => {
    const x = paddingLeft + (i / (data.length - 1)) * chartW;
    const y = paddingTop + chartH - (d.value / maxVal) * chartH;
    return { x, y, ...d };
  });

  // Generate smooth SVG curve path
  const pathD = points.reduce((acc, curr, i, arr) => {
    if (i === 0) return `M ${curr.x} ${curr.y}`;
    const prev = arr[i - 1];
    const cp1x = prev.x + (curr.x - prev.x) / 2;
    const cp1y = prev.y;
    const cp2x = prev.x + (curr.x - prev.x) / 2;
    const cp2y = curr.y;
    return `${acc} C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${curr.x} ${curr.y}`;
  }, '');

  // Fill area path
  const areaD = `${pathD} L ${points[points.length - 1].x} ${paddingTop + chartH} L ${points[0].x} ${paddingTop + chartH} Z`;

  const yTicks = [
    { label: '15K', val: 15000 },
    { label: '10K', val: 10000 },
    { label: '5K', val: 5000 },
    { label: '0', val: 0 }
  ];

  return (
    <div className="w-full relative">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="w-full h-auto overflow-visible select-none"
      >
        <defs>
          <linearGradient id="blueGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#0070BA" stopOpacity="0.18" />
            <stop offset="100%" stopColor="#0070BA" stopOpacity="0.0" />
          </linearGradient>
        </defs>

        {/* Y Axis Grid lines */}
        {yTicks.map(t => {
          const y = paddingTop + chartH - (t.val / maxVal) * chartH;
          return (
            <g key={t.label}>
              <line
                x1={paddingLeft}
                y1={y}
                x2={width - paddingRight}
                y2={y}
                stroke="#E5EAF0"
                strokeWidth="1"
                strokeDasharray={t.val === 0 ? 'none' : '3 3'}
              />
              <text
                x={paddingLeft - 10}
                y={y + 4}
                textAnchor="end"
                className="text-[11px] fill-slate-400 font-medium"
              >
                {t.label}
              </text>
            </g>
          );
        })}

        {/* Gradient area */}
        <path d={areaD} fill="url(#blueGradient)" />

        {/* Blue line */}
        <path
          d={pathD}
          fill="none"
          stroke="#0070BA"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* X Axis labels */}
        {[0, 2, 4, 6, 9].map(idx => {
          const pt = points[idx];
          return (
            <text
              key={idx}
              x={pt.x}
              y={height - 10}
              textAnchor="middle"
              className="text-[11px] fill-slate-500 font-medium"
            >
              {pt.label}
            </text>
          );
        })}

        {/* Interactive Dots and Tooltip */}
        {points.map((pt, i) => {
          const isSelected = hoveredIdx === i || (hoveredIdx === null && i === points.length - 1);
          return (
            <g
              key={i}
              className="cursor-pointer"
              onMouseEnter={() => setHoveredIdx(i)}
            >
              {/* Invisible larger hover zone */}
              <circle cx={pt.x} cy={pt.y} r="14" fill="transparent" />

              {/* Visible dot */}
              <circle
                cx={pt.x}
                cy={pt.y}
                r={isSelected ? "6" : "4"}
                fill={isSelected ? "#0070BA" : "#0070BA"}
                stroke="#FFFFFF"
                strokeWidth={isSelected ? "2.5" : "1.5"}
                className="transition-all duration-150"
              />

              {isSelected && (
                <g>
                  {/* Tooltip badge matching screenshot ($14,250.00 dark pill) */}
                  <rect
                    x={pt.x - 44}
                    y={pt.y - 30}
                    width="88"
                    height="22"
                    rx="6"
                    fill="#142B4A"
                  />
                  <text
                    x={pt.x}
                    y={pt.y - 15}
                    textAnchor="middle"
                    fill="#FFFFFF"
                    className="text-[11px] font-bold"
                  >
                    {pt.display}
                  </text>
                </g>
              )}
            </g>
          );
        })}
      </svg>
    </div>
  );
};

// Admin dispute trends bar chart (Mon - Sun, Pending vs Resolved)
export const DisputeTrendsBarChart: React.FC = () => {
  const days = [
    { day: 'Mon', pending: 8, resolved: 18 },
    { day: 'Tue', pending: 12, resolved: 24 },
    { day: 'Wed', pending: 6, resolved: 32 },
    { day: 'Thu', pending: 15, resolved: 28 },
    { day: 'Fri', pending: 9, resolved: 36 },
    { day: 'Sat', pending: 4, resolved: 14 },
    { day: 'Sun', pending: 5, resolved: 12 }
  ];

  const maxVal = 40;
  const width = 450;
  const height = 180;
  const pLeft = 30;
  const pBottom = 25;
  const pTop = 15;
  const chartW = width - pLeft - 15;
  const chartH = height - pTop - pBottom;
  const colWidth = chartW / days.length;

  return (
    <div className="w-full">
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto select-none">
        {/* Horizontal grid lines */}
        {[0, 20, 40].map(v => {
          const y = pTop + chartH - (v / maxVal) * chartH;
          return (
            <g key={v}>
              <line x1={pLeft} y1={y} x2={width} y2={y} stroke="#F1F5F9" strokeWidth="1" />
              <text x={pLeft - 6} y={y + 3} textAnchor="end" className="text-[10px] fill-slate-400 font-medium">
                {v}
              </text>
            </g>
          );
        })}

        {/* Bars */}
        {days.map((d, i) => {
          const xCenter = pLeft + i * colWidth + colWidth / 2;
          const barW = 8;
          const hResolved = (d.resolved / maxVal) * chartH;
          const hPending = (d.pending / maxVal) * chartH;

          return (
            <g key={d.day}>
              {/* Resolved bar (Teal/Emerald) */}
              <rect
                x={xCenter - barW - 1.5}
                y={pTop + chartH - hResolved}
                width={barW}
                height={hResolved}
                rx="3"
                fill="#10B981"
              />
              {/* Pending bar (Blue) */}
              <rect
                x={xCenter + 1.5}
                y={pTop + chartH - hPending}
                width={barW}
                height={hPending}
                rx="3"
                fill="#0070BA"
              />
              {/* X label */}
              <text
                x={xCenter}
                y={height - 6}
                textAnchor="middle"
                className="text-[10px] fill-slate-500 font-medium"
              >
                {d.day}
              </text>
            </g>
          );
        })}
      </svg>
      <div className="flex items-center justify-center gap-5 mt-2 text-xs text-slate-500">
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-[#10B981]"></span>
          <span>Resolved</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-[#0070BA]"></span>
          <span>Pending</span>
        </div>
      </div>
    </div>
  );
};

// Donut chart for Dispute Reasons breakdown
export const DisputeReasonsDonutChart: React.FC = () => {
  const categories = [
    { label: 'Product Not Received', count: 48, color: '#0070BA' },
    { label: 'Not as Described', count: 26, color: '#38BDF8' },
    { label: 'Unauthorised Transaction', count: 14, color: '#F59E0B' },
    { label: 'Duplicate Charge', count: 8, color: '#8B5CF6' },
    { label: 'Refund Not Received', count: 4, color: '#EC4899' }
  ];

  const total = categories.reduce((sum, c) => sum + c.count, 0);
  let accumulatedAngle = 0;

  const slices = categories.map(c => {
    const angle = (c.count / total) * 360;
    const startAngle = accumulatedAngle;
    accumulatedAngle += angle;
    return { ...c, startAngle, angle };
  });

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
      <div className="relative w-36 h-36 shrink-0">
        <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
          {slices.map((slice, i) => {
            const r = 38;
            const cx = 50;
            const cy = 50;
            const circumference = 2 * Math.PI * r;
            const strokeDasharray = `${(slice.angle / 360) * circumference} ${circumference}`;
            const strokeDashoffset = -((slice.startAngle / 360) * circumference);

            return (
              <circle
                key={i}
                cx={cx}
                cy={cy}
                r={r}
                fill="none"
                stroke={slice.color}
                strokeWidth="15"
                strokeDasharray={strokeDasharray}
                strokeDashoffset={strokeDashoffset}
              />
            );
          })}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <span className="text-xl font-bold text-[#172B4D]">{total}</span>
          <span className="text-[10px] text-slate-400 font-medium uppercase">Claims</span>
        </div>
      </div>

      <div className="space-y-1.5 w-full text-xs">
        {categories.map((c, i) => (
          <div key={i} className="flex items-center justify-between py-0.5">
            <div className="flex items-center gap-2 truncate">
              <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: c.color }} />
              <span className="text-slate-600 truncate">{c.label}</span>
            </div>
            <span className="font-semibold text-slate-800 ml-2">{c.count}%</span>
          </div>
        ))}
      </div>
    </div>
  );
};
