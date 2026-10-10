/* eslint-disable @next/next/no-img-element */

// Ilustrasi "Sign in" (gembok) & "Sign up" (ponsel) dari Figma.
// Posisi tiap layer = koordinat Figma dikurangi origin grup (81, 212).
const DOTS = [
  { src: "dot-1", left: 72, top: 0, size: 10 },
  { src: "dot-2", left: 188, top: 22, size: 25 },
  { src: "dot-3", left: 178, top: 131, size: 10 },
  { src: "dot-4", left: 42, top: 126, size: 20 },
  { src: "dot-5", left: 0, top: 65, size: 10 },
];

const LAYERS = {
  signin: [
    { src: "/illustrations/signin/circle.svg", left: 35, top: 15, width: 150, height: 150 },
    { src: "/illustrations/signin/lock-shackle.svg", left: 90.86, top: 53.04, width: 38.3, height: 31.47 },
    { src: "/illustrations/signin/lock-body.svg", left: 85.01, top: 79.91, width: 50, height: 46.09 },
    { src: "/illustrations/signin/lock-face.svg", left: 87.26, top: 82.19, width: 45.46, height: 41.54 },
    { src: "/illustrations/signin/lock-face-2.svg", left: 87.26, top: 82.19, width: 45.46, height: 41.56 },
    { src: "/illustrations/signin/lock-keyhole.svg", left: 103.16, top: 94.04, width: 13.66, height: 18.9 },
  ],
  signup: [
    { src: "/illustrations/signup/circle.svg", left: 35, top: 15, width: 150, height: 150 },
    { src: "/illustrations/signup/phone.svg", left: 70.01, top: 33.02, width: 80, height: 122.31 },
    { src: "/illustrations/signup/person.svg", left: 94.49, top: 76.49, width: 31, height: 28 },
    { src: "/illustrations/signup/person-2.svg", left: 94.49, top: 76.49, width: 31, height: 28 },
  ],
};

export default function AuthIllustration({ variant = "signin" }) {
  return (
    <div className="relative mx-auto h-[165px] w-[213px]" aria-hidden="true">
      {LAYERS[variant].map(({ src, left, top, width, height }) => (
        <img key={src} src={src} alt="" width={width} height={height} className="absolute block max-w-none" style={{ left, top, width, height }} />
      ))}
      {DOTS.map(({ src, left, top, size }) => (
        <img
          key={src}
          src={`/illustrations/signin/${src}.svg`}
          alt=""
          width={size}
          height={size}
          className="absolute block max-w-none"
          style={{ left, top, width: size, height: size }}
        />
      ))}
    </div>
  );
}
