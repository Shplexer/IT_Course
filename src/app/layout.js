import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import HeaderWrapper from "./header/page";
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "ВентЧасти",
  description: "Онлайн-магазин вентиляционного оборудования в Санкт-Петербурге",
};

export default function RootLayout({ children }) {
  return (
    <html lang="ru">
      <head>
				<link rel="preconnect" href="https://fonts.googleapis.com"></link>
				<link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin = "true"></link>
				<link href="https://fonts.googleapis.com/css2?family=Roboto:ital,wght@0,100;0,300;0,400;0,500;0,700;0,900;1,100;1,300;1,400;1,500;1,700;1,900&display=swap" rel="stylesheet"></link>
			</head>
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        <HeaderWrapper />
        {children}
      </body>
    </html>
  );
}
