import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SafarGo — путешествия начинаются здесь",
  description: "Ищите туры, сравнивайте предложения агентств и планируйте путешествия из Таджикистана.",
  openGraph: { title: "SafarGo", description: "Туры и путешествия из Таджикистана", locale: "ru_RU", type: "website" },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ru">
      <body>{children}</body>
    </html>
  );
}
