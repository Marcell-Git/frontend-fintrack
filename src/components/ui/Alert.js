import { IoCheckmarkCircle, IoAlertCircle } from "react-icons/io5";

const TONES = {
  success: { className: "bg-success/15 text-success-ink", Icon: IoCheckmarkCircle },
  error: { className: "bg-danger/10 text-danger", Icon: IoAlertCircle },
};

export default function Alert({ tone = "error", children, className = "" }) {
  if (!children) return null;
  const { className: toneClass, Icon } = TONES[tone];
  return (
    <div role="alert" className={`flex items-start gap-2 rounded-field px-4 py-3 text-sm font-medium ${toneClass} ${className}`}>
      <Icon size={18} className="mt-0.5 flex-none" />
      <p>{children}</p>
    </div>
  );
}
