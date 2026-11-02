import { Golos_Text, JetBrains_Mono, Unbounded } from "next/font/google";
import "./globals.css";

const display = Unbounded({
  variable: "--font-display",
  subsets: ["cyrillic", "latin"],
});

const text = Golos_Text({
  variable: "--font-text",
  subsets: ["cyrillic", "latin"],
});

const mono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["cyrillic", "latin"],
});

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="ru"
      className={`${display.variable} ${text.variable} ${mono.variable}`}
    >
      <body>{children}</body>
    </html>
  );
}
