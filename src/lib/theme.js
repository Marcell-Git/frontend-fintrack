export const THEME_STORAGE_KEY = "fintrack-theme";
export const THEME_COLORS = { light: "#3629b7", dark: "#1e1671" };

// Dijalankan inline di <head> sebelum halaman tampil, supaya tidak ada kedipan
// mode terang saat pengguna memilih mode gelap. Tanpa pilihan tersimpan,
// ikut pengaturan sistem.
export const themeInitScript = `(function(){try{var t=localStorage.getItem(${JSON.stringify(
  THEME_STORAGE_KEY
)});var d=t?t==="dark":window.matchMedia("(prefers-color-scheme: dark)").matches;if(d){document.documentElement.classList.add("dark");var m=document.querySelector('meta[name="theme-color"]');if(m)m.setAttribute("content",${JSON.stringify(
  THEME_COLORS.dark
)});}}catch(e){}})();`;
