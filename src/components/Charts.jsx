import React, { useEffect, useRef, useState } from 'react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend,
} from 'recharts';

/* ─────────────────────────────────────────────
   useDrawAnimation
   After the SVG mounts, finds every <path> inside
   the chart wrapper that belongs to an Area stroke
   and applies stroke-dasharray = stroke-dashoffset = totalLength,
   then transitions dashoffset → 0 over `duration` ms.
   Fill paths get an opacity fade-in instead.

   NOTE: Do NOT set strokeDasharray on <Area> props — it lands as
   an SVG attribute which overrides style.strokeDasharray and breaks
   the draw-on animation. Instead, pass a `dashedStrokes` set here
   and we restore the dashed pattern after transitionend.
───────────────────────────────────────────────── */
function useDrawAnimation(wrapperRef, duration = 1400, deps = [], dashedColors = new Set()) {
  useEffect(() => {
    const el = wrapperRef.current;
    if (!el) return;

    // Small delay so Recharts finishes its own render
    const timer = setTimeout(() => {
      // Recharts renders two <path> per Area: one for fill, one for stroke.
      // Stroke paths have stroke !== 'none' and fill === 'none' (or missing).
      const allPaths = el.querySelectorAll('path');
      const listeners = [];

      allPaths.forEach((path) => {
        const fill   = path.getAttribute('fill')   || '';
        const stroke = path.getAttribute('stroke') || '';
        const isStroke = stroke !== 'none' && stroke !== '' && (fill === 'none' || fill === '');
        const isFill   = fill !== 'none' && fill !== '' && fill.startsWith('url(');

        if (isStroke) {
          // ── Draw-on via stroke-dashoffset ──
          const len = path.getTotalLength();
          const isDashed = dashedColors.has(stroke);

          // Remove any SVG-attribute dasharray so our style wins
          path.removeAttribute('stroke-dasharray');

          path.style.transition      = 'none';
          path.style.strokeDasharray  = `${len}`;
          path.style.strokeDashoffset = `${len}`;
          path.style.opacity          = '1';

          // Force reflow so the initial state is painted before transition starts
          void path.getBoundingClientRect();

          path.style.transition       = `stroke-dashoffset ${duration}ms ease-in-out`;
          path.style.strokeDashoffset = '0';

          // After draw completes, restore dashed pattern if needed
          if (isDashed) {
            const onEnd = () => {
              path.style.transition      = 'none';
              path.style.strokeDasharray  = '5 4';
              path.removeEventListener('transitionend', onEnd);
            };
            path.addEventListener('transitionend', onEnd);
            listeners.push({ path, onEnd });
          }
        }

        if (isFill) {
          // ── Gradient fill: fade in separately, slightly delayed ──
          path.style.opacity    = '0';
          void path.getBoundingClientRect();
          path.style.transition = `opacity ${duration * 0.8}ms ease-in-out ${duration * 0.15}ms`;
          path.style.opacity    = '1';
        }
      });

      // Cleanup stale listeners if the effect re-runs mid-animation
      return () => {
        listeners.forEach(({ path, onEnd }) =>
          path.removeEventListener('transitionend', onEnd)
        );
      };
    }, 80);

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}

/* ─────────────────────────────────────────────
   Custom Tooltip
───────────────────────────────────────────────── */
function ChartTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: '#1a2035', border: '1px solid rgba(255,255,255,0.1)',
      borderRadius: 10, padding: '10px 14px', fontSize: 12,
    }}>
      <div style={{ color: '#7b82a0', marginBottom: 6, fontWeight: 500 }}>{label}</div>
      {payload.map((p) => (
        <div key={p.dataKey} style={{ color: p.color, marginBottom: 2 }}>
          {p.name}: <span style={{ color: '#e8eaf2', fontFamily: 'var(--font-mono)' }}>
            ₹{Number(p.value).toLocaleString('en-IN')}
          </span>
        </div>
      ))}
    </div>
  );
}

/* ─────────────────────────────────────────────
   AnimatedAreaChart  (exported)
   Props:
     data       – array of { label, balance, income, expenses }
     activeTab  – '6m' | '3m' | '1m'  (triggers re-animation on change)
───────────────────────────────────────────────── */
export default function AnimatedAreaChart({ data, activeTab }) {
  const wrapperRef = useRef(null);

  // Colors that should appear dashed AFTER the draw animation completes
  const dashedColors = new Set(['#2dd4a0', '#f06a6a']);

  // Re-run draw animation whenever the tab (dataset) changes
  useDrawAnimation(wrapperRef, 1400, [activeTab], dashedColors);

  const axisStyle = { fill: '#7b82a0', fontSize: 11, fontFamily: 'var(--font-sans)' };
  const gridStyle = { stroke: 'rgba(255,255,255,0.04)', strokeDasharray: '3 3' };

  return (
    <div ref={wrapperRef} style={{ width: '100%', height: '100%' }}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <defs>
            {/* Balance gradient */}
            <linearGradient id="gradBalance" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%"   stopColor="#4f8fff" stopOpacity={0.22} />
              <stop offset="100%" stopColor="#4f8fff" stopOpacity={0} />
            </linearGradient>
            {/* Income gradient */}
            <linearGradient id="gradIncome" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%"   stopColor="#2dd4a0" stopOpacity={0.15} />
              <stop offset="100%" stopColor="#2dd4a0" stopOpacity={0} />
            </linearGradient>
            {/* Expenses gradient */}
            <linearGradient id="gradExpenses" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%"   stopColor="#f06a6a" stopOpacity={0.15} />
              <stop offset="100%" stopColor="#f06a6a" stopOpacity={0} />
            </linearGradient>
          </defs>

          <CartesianGrid vertical={false} stroke={gridStyle.stroke} strokeDasharray={gridStyle.strokeDasharray} />

          <XAxis
            dataKey="label"
            tick={axisStyle}
            axisLine={false}
            tickLine={false}
            dy={6}
          />
          <YAxis
            tick={axisStyle}
            axisLine={false}
            tickLine={false}
            width={52}
            tickFormatter={v => '₹' + (v >= 1000 ? (v / 1000).toFixed(0) + 'k' : v)}
          />

          <Tooltip content={<ChartTooltip />} cursor={{ stroke: 'rgba(255,255,255,0.08)', strokeWidth: 1 }} />

          {/* Render order matters: fill areas under stroke lines */}
          <Area
            type="monotone"
            dataKey="balance"
            name="Balance"
            stroke="#4f8fff"
            strokeWidth={2}
            fill="url(#gradBalance)"
            dot={false}
            activeDot={{ r: 4, fill: '#4f8fff', strokeWidth: 0 }}
            isAnimationActive={false}
          />
          <Area
            type="monotone"
            dataKey="income"
            name="Income"
            stroke="#2dd4a0"
            strokeWidth={2}
            fill="url(#gradIncome)"
            dot={false}
            activeDot={{ r: 4, fill: '#2dd4a0', strokeWidth: 0 }}
            isAnimationActive={false}
          />
          <Area
            type="monotone"
            dataKey="expenses"
            name="Expenses"
            stroke="#f06a6a"
            strokeWidth={2}
            fill="url(#gradExpenses)"
            dot={false}
            activeDot={{ r: 4, fill: '#f06a6a', strokeWidth: 0 }}
            isAnimationActive={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
