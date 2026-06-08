"use client";

import { useState, useMemo, useRef } from "react";
import { pack, hierarchy } from "d3-hierarchy";
import { FaArrowLeft, FaChartPie } from "react-icons/fa";
import Link from "next/link";

const CATEGORIES = [
  { id: "makanan", label: "Makanan", color: "#FF3B30" },
  { id: "ngopi", label: "Ngopi", color: "#A2845E" },
  { id: "kebutuhan", label: "Kebutuhan", color: "#34C759" },
  { id: "transportasi", label: "Transportasi", color: "#5856D6" },
  { id: "langganan", label: "Langganan", color: "#007AFF" },
  { id: "belanja", label: "Belanja", color: "#FF9500" },
  { id: "hiburan", label: "Hiburan", color: "#AF52DE" },
  { id: "lainnya", label: "Lainnya", color: "#8E8E93" },
];

const CHART_W = 500;
const CHART_H = 550;

const formatRupiah = (v) => new Intl.NumberFormat("id-ID").format(v || 0);

export default function StatistikClient({ transactions, year }) {
  const [filterCat, setFilterCat] = useState(null);
  const [hovered, setHovered] = useState(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });
  const chartRef = useRef(null);

  const { totalYear, topCategory, bubbles } = useMemo(() => {
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
    const topCat = CATEGORIES.find((c) => c.id === topId);

    const rawData = {
      id: "root",
      children: CATEGORIES.map((cat) => ({
        id: cat.id,
        label: cat.label,
        value: catTotals[cat.id] || 0,
        color: cat.color,
      })).filter((d) => d.value > 0),
    };

    if (rawData.children.length === 0) {
      return { totalYear: total, topCategory: topCat, bubbles: [] };
    }

    const root = hierarchy(rawData)
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
      value: d.data.value,
      color: d.data.color,
    }));

    return { totalYear: total, topCategory: topCat, bubbles: leaves };
  }, [transactions]);

  const handleBubbleHover = (e, b) => {
    if (chartRef.current) {
      const rect = chartRef.current.getBoundingClientRect();
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

  return (
    <div className="min-h-screen text-[#1a1a2e] font-sans relative">
      <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
        <div className="absolute top-[-15%] left-[-10%] w-[800px] h-[800px] bg-purple-400/25 rounded-full blur-[150px] animate-blob"></div>
        <div className="absolute top-[15%] right-[-15%] w-[700px] h-[700px] bg-pink-400/25 rounded-full blur-[150px] animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-[-15%] left-[15%] w-[750px] h-[750px] bg-blue-400/25 rounded-full blur-[150px] animate-blob animation-delay-4000"></div>
      </div>

      <div className="container mx-auto px-4 py-4 sm:py-6 max-w-6xl relative z-10">
        <div className="flex items-center gap-3 mb-6">
          <Link
            href="/"
            className="glass-heavy p-2.5 sm:p-3 rounded-xl hover:bg-black/5 transition-all active:scale-90"
          >
            <FaArrowLeft size={16} className="text-purple-500" />
          </Link>
          <div>
            <h1 className="text-lg sm:text-2xl font-bold leading-tight">Statistik</h1>
            <p className="text-xs sm:text-sm text-white/50">Tahun {year}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-6">
          <div className="glass-heavy rounded-2xl p-4 sm:p-6">
            <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">Total Tahun Ini</p>
            <p className="text-xl sm:text-2xl font-bold mt-2">Rp{formatRupiah(totalYear)}</p>
          </div>
          <div className="glass-heavy rounded-2xl p-4 sm:p-6">
            <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">Rata-rata / Bulan</p>
            <p className="text-xl sm:text-2xl font-bold mt-2">Rp{formatRupiah(Math.round(totalYear / 12))}</p>
          </div>
          <div className="glass-heavy rounded-2xl p-4 sm:p-6">
            <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">Kategori Terbanyak</p>
            <p className="text-xl sm:text-2xl font-bold mt-2 text-purple-600">
              {topCategory ? topCategory.label : "-"}
            </p>
          </div>
        </div>

        <div className="glass-heavy rounded-[2rem] p-3 sm:p-6 md:p-8 shadow-xl shadow-black/5">
          <div className="flex items-center justify-between mb-4 sm:mb-6">
            <h2 className="text-base sm:text-lg font-bold">Distribusi per Kategori</h2>
            <FaChartPie className="text-purple-500 text-base sm:text-lg" />
          </div>

          {bubbles.length === 0 ? (
            <div className="py-16 sm:py-20 text-center">
              <p className="text-gray-400 font-medium italic">Belum ada transaksi tahun ini</p>
            </div>
          ) : (
            <>
              <div className="relative w-full" ref={chartRef}>
                <svg
                  viewBox={`0 0 ${CHART_W} ${CHART_H}`}
                  preserveAspectRatio="xMidYMid meet"
                  className="w-full h-auto max-h-[65vh] sm:max-h-[70vh]"
                >
                  {visibleBubbles.map((b, i) => (
                    <g key={b.id}>
                      <circle
                        cx={b.x}
                        cy={b.y}
                        r={Math.max(b.r - 1, 0)}
                        fill={b.color}
                        fillOpacity={hovered?.id === b.id ? 0.85 : 0.55}
                        stroke={b.color}
                        strokeWidth={hovered?.id === b.id ? 2 : 1}
                        strokeOpacity={0.8}
                        className="transition-all duration-200 cursor-pointer"
                        onMouseEnter={(e) => handleBubbleHover(e, b)}
                        onMouseMove={(e) => handleBubbleHover(e, b)}
                        onMouseLeave={() => setHovered(null)}
                        onClick={() => setFilterCat(filterCat === b.id ? null : b.id)}
                      />
                      {b.r > 22 && (
                        <text
                          x={b.x}
                          y={b.y - (b.r > 40 ? 4 : 0)}
                          textAnchor="middle"
                          fill="white"
                          fontSize={b.r > 50 ? 13 : b.r > 30 ? 11 : 9}
                          fontWeight={700}
                          className="pointer-events-none select-none"
                        >
                          {b.label}
                        </text>
                      )}
                      {b.r > 35 && (
                        <text
                          x={b.x}
                          y={b.y + (b.r > 40 ? 14 : 12)}
                          textAnchor="middle"
                          fill="rgba(255,255,255,0.8)"
                          fontSize={b.r > 50 ? 11 : 9}
                          fontWeight={600}
                          className="pointer-events-none select-none"
                        >
                          Rp{formatRupiah(b.value)}
                        </text>
                      )}
                    </g>
                  ))}
                </svg>

                {hovered && chartRef.current && (
                  <div
                    className="absolute glass-heavy rounded-xl px-3 py-2.5 shadow-xl border border-black/10 pointer-events-none z-20"
                    style={{
                      left: Math.min(tooltipPos.x + 16, (chartRef.current?.offsetWidth || 300) - 150),
                      top: Math.max(tooltipPos.y - 70, 0) + 10,
                    }}
                  >
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">{hovered.label}</p>
                    <p className="text-sm font-bold text-purple-600 mt-0.5">
                      Rp{formatRupiah(hovered.value)}
                    </p>
                  </div>
                )}
              </div>

              <div className="flex flex-nowrap sm:flex-wrap gap-1.5 sm:gap-2 mt-4 sm:mt-6 overflow-x-auto sm:overflow-visible pb-1 sm:pb-0 -mx-4 sm:mx-0 px-4 sm:px-0">
                <button
                  onClick={() => setFilterCat(null)}
                  className={`flex-none glass rounded-lg px-2.5 py-1.5 sm:px-3 sm:py-1.5 text-xs transition-all whitespace-nowrap ${
                    filterCat === null ? "ring-1 ring-gray-300 bg-black/5" : "hover:bg-black/5"
                  }`}
                >
                  Semua
                </button>
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setFilterCat(filterCat === cat.id ? null : cat.id)}
                    className={`flex-none flex items-center gap-1.5 glass rounded-lg px-2.5 py-1.5 sm:px-3 sm:py-1.5 text-xs transition-all whitespace-nowrap ${
                      filterCat === cat.id ? "ring-1 ring-gray-300 bg-black/5" : "hover:bg-black/5"
                    }`}
                  >
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: cat.color }} />
                    <span className="text-gray-600">{cat.label}</span>
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
