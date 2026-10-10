"use client";

import { useState, useMemo, useRef } from "react";
import { pack, hierarchy } from "d3-hierarchy";
import AppShell from "@/components/ui/AppShell";
import { formatRupiah, capitalize } from "@/lib/format";

const CHART_W = 500;
const CHART_H = 550;
const MONTH_LABELS = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];
const BAR_AREA_H = 140;

export default function StatistikClient({ transactions, categories, year }) {
  const [filterCat, setFilterCat] = useState(null);
  const [hovered, setHovered] = useState(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });
  const [chartWidth, setChartWidth] = useState(300);
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date();
    return now.getFullYear() === year ? now.getMonth() : 11;
  });
  const chartRef = useRef(null);

  const monthlyTotals = useMemo(() => {
    const totals = Array(12).fill(0);
    transactions.forEach((t) => {
      const month = Number(t.tanggal.slice(5, 7)) - 1;
      if (month >= 0 && month < 12) totals[month] += Number(t.jumlah);
    });
    return totals;
  }, [transactions]);

  const maxMonthly = Math.max(...monthlyTotals, 1);

  const { totalYear, topCategory, bubbles, ranking } = useMemo(() => {
    const catTotals = {};
    transactions.forEach((t) => {
      const cat = t.kategori;
      catTotals[cat] = (catTotals[cat] || 0) + Number(t.jumlah);
    });

    const total = transactions.reduce((s, t) => s + Number(t.jumlah), 0);

    let topId = null;
    let topAmt = 0;
    Object.entries(catTotals).forEach(([cat, amt]) => {
      if (amt > topAmt) { topAmt = amt; topId = cat; }
    });
    const topCat = categories.find((c) => c.name === topId);

    const children = categories
      .map((cat) => ({
        id: cat.name,
        label: capitalize(cat.name),
        value: catTotals[cat.name] || 0,
        color: cat.color,
        emoji: cat.emoji,
      }))
      .filter((d) => d.value > 0);

    const sortedRanking = [...children].sort((a, b) => b.value - a.value);

    if (children.length === 0) {
      return { totalYear: total, topCategory: topCat, bubbles: [], ranking: [] };
    }

    const root = hierarchy({ id: "root", children })
      .sum((d) => d.value)
      .sort((a, b) => b.value - a.value);

    const packLayout = pack().size([CHART_W, CHART_H]).padding(10);
    packLayout(root);

    const leaves = root.leaves().map((d) => ({
      x: d.x,
      y: d.y,
      r: d.r,
      id: d.data.id,
      label: d.data.label,
      emoji: d.data.emoji,
      value: d.data.value,
      color: d.data.color,
    }));

    return { totalYear: total, topCategory: topCat, bubbles: leaves, ranking: sortedRanking };
  }, [transactions, categories]);

  const handleBubbleHover = (e, b) => {
    if (chartRef.current) {
      const rect = chartRef.current.getBoundingClientRect();
      setChartWidth(rect.width || 300);
      setTooltipPos({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      });
    }
    setHovered(b);
  };

  const visibleBubbles = filterCat
    ? bubbles.filter((b) => b.id === filterCat)
    : bubbles;

  const chipClass = (active) =>
    `flex h-8 flex-none items-center gap-1.5 rounded-full px-3 text-xs font-medium whitespace-nowrap transition-colors ${
      active ? "bg-primary text-white" : "bg-primary-4 text-primary-2"
    }`;

  return (
    <AppShell title={`Statistik ${year}`}>
      {/* Kartu grafik bulanan — "Chart" di Figma Transaction report */}
      <section className="rounded-sheet bg-card p-4 shadow-soft">
        <p className="text-xs leading-4 font-semibold text-ink">
          Pengeluaran {new Date(year, selectedMonth).toLocaleDateString("id-ID", { month: "long" })}
        </p>
        <p className="mt-1 flex items-baseline gap-1.5">
          <span className="text-[32px] leading-7 font-medium text-primary">
            {formatRupiah(monthlyTotals[selectedMonth])}
          </span>
          <span className="text-xs leading-4 font-semibold text-subtle">IDR</span>
        </p>

        <div className="relative mt-6" style={{ height: BAR_AREA_H }}>
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              className="absolute inset-x-0 border-t border-dashed border-line"
              style={{ top: `${(i / 3) * 100}%` }}
            />
          ))}
          <div className="relative flex h-full items-end justify-between">
            {monthlyTotals.map((amount, i) => {
              const isSelected = i === selectedMonth;
              const height = amount > 0 ? Math.max((amount / maxMonthly) * BAR_AREA_H, 8) : 4;
              return (
                <button
                  key={i}
                  type="button"
                  onClick={() => setSelectedMonth(i)}
                  className="flex h-full w-full items-end justify-center"
                  aria-label={`${MONTH_LABELS[i]}: Rp${formatRupiah(amount)}`}
                  aria-pressed={isSelected}
                >
                  <span
                    className={`block w-2 rounded-full transition-all duration-300 ${
                      amount === 0 ? "bg-line" : isSelected ? "bg-primary" : "bg-primary-3"
                    }`}
                    style={{ height }}
                  />
                </button>
              );
            })}
          </div>
        </div>
        <div className="mt-3 flex justify-between">
          {MONTH_LABELS.map((label, i) => (
            <button
              key={label}
              type="button"
              onClick={() => setSelectedMonth(i)}
              className={`w-full text-center text-[11px] leading-4 font-semibold ${
                i === selectedMonth ? "text-primary" : "text-placeholder"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </section>

      {/* Ringkasan tahunan */}
      <section className="mt-6 grid grid-cols-2 gap-4">
        <div className="rounded-field bg-card p-4 shadow-card">
          <p className="text-xs leading-4 font-semibold text-subtle">Total tahun ini</p>
          <p className="mt-2 truncate text-base leading-6 font-semibold text-ink">Rp{formatRupiah(totalYear)}</p>
        </div>
        <div className="rounded-field bg-card p-4 shadow-card">
          <p className="text-xs leading-4 font-semibold text-subtle">Rata-rata / bulan</p>
          <p className="mt-2 truncate text-base leading-6 font-semibold text-ink">
            Rp{formatRupiah(Math.round(totalYear / 12))}
          </p>
        </div>
        <div className="col-span-2 flex items-center gap-4 rounded-field bg-card p-4 shadow-card">
          <span
            className="flex h-10 w-10 flex-none items-center justify-center rounded-[10px] text-lg leading-none"
            style={{ backgroundColor: topCategory ? `${topCategory.color}26` : undefined }}
          >
            {topCategory?.emoji || "—"}
          </span>
          <div className="min-w-0">
            <p className="text-xs leading-4 font-semibold text-subtle">Kategori terbanyak</p>
            <p className="truncate text-base leading-6 font-semibold text-primary">
              {topCategory ? capitalize(topCategory.name) : "-"}
            </p>
          </div>
        </div>
      </section>

      {/* Distribusi per kategori */}
      <section className="mt-8">
        <h2 className="mb-4 text-base leading-6 font-semibold text-ink">Distribusi per kategori</h2>

        {bubbles.length === 0 ? (
          <div className="rounded-sheet bg-primary-4 py-14 text-center">
            <p className="text-sm font-medium text-subtle">Belum ada transaksi tahun ini</p>
          </div>
        ) : (
          <>
            <div className="no-scrollbar -mx-6 mb-4 flex gap-2 overflow-x-auto px-6">
              <button onClick={() => setFilterCat(null)} className={chipClass(filterCat === null)}>
                Semua
              </button>
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setFilterCat(filterCat === cat.name ? null : cat.name)}
                  className={chipClass(filterCat === cat.name)}
                >
                  <span className="h-2 w-2 rounded-full" style={{ backgroundColor: cat.color }} />
                  <span className="capitalize">{cat.name}</span>
                </button>
              ))}
            </div>

            <div className="rounded-sheet bg-card p-3 shadow-soft">
              <div className="relative w-full" ref={chartRef}>
                <svg
                  viewBox={`0 0 ${CHART_W} ${CHART_H}`}
                  preserveAspectRatio="xMidYMid meet"
                  className="h-auto max-h-[60vh] w-full"
                >
                  {visibleBubbles.map((b) => (
                    <g key={b.id}>
                      <circle
                        cx={b.x}
                        cy={b.y}
                        r={Math.max(b.r - 1, 0)}
                        fill={b.color}
                        fillOpacity={hovered?.id === b.id ? 0.85 : 0.6}
                        stroke={b.color}
                        strokeWidth={hovered?.id === b.id ? 2 : 1}
                        strokeOpacity={0.8}
                        className="cursor-pointer transition-all duration-200"
                        onMouseEnter={(e) => handleBubbleHover(e, b)}
                        onMouseMove={(e) => handleBubbleHover(e, b)}
                        onMouseLeave={() => setHovered(null)}
                        onClick={() => setFilterCat(filterCat === b.id ? null : b.id)}
                      />
                      {b.r > 22 && (
                        <>
                          {b.emoji && (
                            <text
                              x={b.x}
                              y={b.y - (b.r > 40 ? 8 : 4)}
                              textAnchor="middle"
                              fontSize={b.r > 50 ? 16 : b.r > 30 ? 13 : 11}
                              className="pointer-events-none select-none"
                            >
                              {b.emoji}
                            </text>
                          )}
                          <text
                            x={b.x}
                            y={b.y + (b.r > 40 ? 4 : 8)}
                            textAnchor="middle"
                            fill="white"
                            fontSize={b.r > 50 ? 13 : b.r > 30 ? 11 : 9}
                            fontWeight={600}
                            className="pointer-events-none select-none"
                          >
                            {b.label}
                          </text>
                        </>
                      )}
                      {b.r > 35 && (
                        <text
                          x={b.x}
                          y={b.y + (b.r > 40 ? 14 : 12)}
                          textAnchor="middle"
                          fill="rgba(255,255,255,0.85)"
                          fontSize={b.r > 50 ? 11 : 9}
                          fontWeight={500}
                          className="pointer-events-none select-none"
                        >
                          Rp{formatRupiah(b.value)}
                        </text>
                      )}
                    </g>
                  ))}
                </svg>

                {hovered && (
                  <div
                    className="pointer-events-none absolute z-20 rounded-field bg-card px-3 py-2.5 shadow-soft ring-1 ring-line"
                    style={{
                      left: Math.min(tooltipPos.x + 16, chartWidth - 150),
                      top: Math.max(tooltipPos.y - 70, 0) + 10,
                    }}
                  >
                    <p className="text-xs font-semibold text-subtle">{hovered.label}</p>
                    <p className="mt-0.5 text-sm font-semibold text-primary">Rp{formatRupiah(hovered.value)}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Peringkat kategori — lebih mudah dibaca di ponsel */}
            <ul className="mt-4">
              {ranking.map((cat) => {
                const percentage = totalYear > 0 ? (cat.value / totalYear) * 100 : 0;
                return (
                  <li key={cat.id} className="flex items-center gap-4 border-b border-line py-3">
                    <span
                      className="flex h-10 w-10 flex-none items-center justify-center rounded-[10px] text-lg leading-none"
                      style={{ backgroundColor: `${cat.color}26` }}
                    >
                      {cat.emoji}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-baseline justify-between gap-2">
                        <p className="truncate text-base leading-6 font-medium text-ink">{cat.label}</p>
                        <p className="flex-none text-sm font-semibold text-ink">Rp{formatRupiah(cat.value)}</p>
                      </div>
                      <div className="mt-1.5 flex items-center gap-2">
                        <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-primary-4">
                          <div className="h-full rounded-full" style={{ width: `${percentage}%`, backgroundColor: cat.color }} />
                        </div>
                        <span className="w-10 text-right text-xs font-semibold text-subtle">{Math.round(percentage)}%</span>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          </>
        )}
      </section>
    </AppShell>
  );
}
