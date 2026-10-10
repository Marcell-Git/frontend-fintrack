// "Button / Primary" dari Figma: tinggi 44px, radius 15px, teks 16px medium.
// State disabled mengikuti "Button / Primary / Dissable" (bg #F2F1F9).
const VARIANTS = {
  primary: "bg-primary text-white disabled:bg-primary-4 disabled:text-white",
  secondary: "bg-primary-4 text-primary disabled:opacity-60",
};

export default function Button({
  variant = "primary",
  loading = false,
  loadingText = "Memproses...",
  disabled,
  className = "",
  children,
  ...props
}) {
  return (
    <button
      disabled={disabled || loading}
      className={`flex h-11 w-full items-center justify-center gap-2 rounded-field text-base font-medium transition-all duration-200 active:scale-[0.98] disabled:cursor-not-allowed disabled:active:scale-100 ${
        VARIANTS[variant]
      } ${loading ? "disabled:bg-primary disabled:opacity-80" : ""} ${className}`}
      {...props}
    >
      {loading ? (
        <>
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
          <span>{loadingText}</span>
        </>
      ) : (
        children
      )}
    </button>
  );
}
