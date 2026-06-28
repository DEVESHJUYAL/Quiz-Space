export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["DM Sans", "sans-serif"],
        display: ["Fraunces", "serif"],
        mono: ["JetBrains Mono", "monospace"],
      },
      colors: {
        cream: {
          50:  "#FDFBF7",
          100: "#FAF7F0",
          200: "#F4EFE4",
          300: "#EBE3D0",
        },
        stone: {
          850: "#1C1917",
        },
        indigo: {
          400: "#818CF8",
          500: "#6366F1",
          600: "#4F46E5",
          700: "#4338CA",
        },
        amber: {
          400: "#FBBF24",
          500: "#F59E0B",
        },
        rose: {
          400: "#FB7185",
          500: "#F43F5E",
        }
      },
      boxShadow: {
        "soft":    "0 2px 12px rgba(0,0,0,0.06), 0 1px 3px rgba(0,0,0,0.04)",
        "lifted":  "0 8px 30px rgba(0,0,0,0.10), 0 2px 8px rgba(0,0,0,0.06)",
        "card-3d": "0 20px 60px rgba(0,0,0,0.12), 0 4px 16px rgba(0,0,0,0.08)",
        "inset-cream": "inset 0 1px 0 rgba(255,255,255,0.8)",
      },
      animation: {
        "float":      "float 7s ease-in-out infinite",
        "float2":     "float2 10s ease-in-out infinite",
        "slide-up":   "slideUp 0.5s ease forwards",
        "fade-in":    "fadeIn 0.4s ease forwards",
      },
      keyframes: {
        float:    { "0%,100%": { transform:"translateY(0)" }, "50%": { transform:"translateY(-18px)" } },
        float2:   { "0%,100%": { transform:"translateY(0) rotate(0deg)" }, "50%": { transform:"translateY(-12px) rotate(3deg)" } },
        slideUp:  { from: { opacity:"0", transform:"translateY(16px)" }, to: { opacity:"1", transform:"translateY(0)" } },
        fadeIn:   { from: { opacity:"0" }, to: { opacity:"1" } },
      },
    },
  },
  plugins: [],
}