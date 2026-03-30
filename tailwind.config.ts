import type { Config } from "tailwindcss";
import tailwindAnimate from "tailwindcss-animate";

export default {
  content: ["./app/**/*.{ts,tsx}"],
  theme: {
    extend: {
      height: {
        cover: "52vh",
        "no-cover": "25vh",
      },
      fontFamily: {
        custom: ["Open Sans"],
      },
      colors: {
        customGrey: "#F1F1F1",
        ameciclo: "#008080",
        ideciclo: "#5050aa",
        amecicloTransparent: "rgba(0,128,128, .5)",
        idecicloTransparent: "rgba(80,80,170, .5)",
        gray100Transparent: "rgba(247, 250, 252, .85)",
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      gridTemplateColumns: {
        fill: "200px repeat(auto-fill, 1fr) 300px",
      },
      gridTemplateRows: {
        fill: "minmax(100px, auto)",
      },
    },
  },
  plugins: [tailwindAnimate],
} satisfies Config;
