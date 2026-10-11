"use client";

// Ditampilkan saat backend/database sedang bermasalah — sesi user tetap aman, cukup coba lagi.
export default function Error({ reset }) {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-4 bg-header px-6 text-center text-white">
      <p className="text-lg font-semibold">Server lagi sibuk nih</p>
      <p className="text-sm text-white/80">Data belum bisa dimuat. Tunggu sebentar lalu coba lagi ya.</p>
      <button
        onClick={() => reset()}
        className="rounded-full bg-white px-6 py-2 text-sm font-semibold text-primary"
      >
        Coba lagi
      </button>
    </div>
  );
}
