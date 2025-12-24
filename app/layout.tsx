import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Media Converter Suite",
  description: "Convert images, PDFs, and text with ease",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <div className="flex flex-col min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-indigo-950">
          <header className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white shadow-2xl">
            <div className="container mx-auto px-4 py-8">
              <div className="flex items-center gap-3">
                <div className="text-4xl">🎨</div>
                <div>
                  <h1 className="text-4xl font-extrabold tracking-tight">
                    Media Converter Suite
                  </h1>
                  <p className="text-indigo-100 mt-2 text-lg font-medium">
                    Convert images, PDFs, and text with ease
                  </p>
                </div>
              </div>
            </div>
          </header>

          <main className="flex-grow">{children}</main>

          <footer className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-slate-300 mt-auto border-t border-slate-700/50">
            <div className="container mx-auto px-4 py-8">
              <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                <p className="text-sm font-medium">
                  © {new Date().getFullYear()} Media Converter Suite. All rights
                  reserved.
                </p>
                <div className="flex items-center gap-2">
                  <span className="text-sm">Developed by</span>
                  <a
                    href="https://gunasekaran-portfolio.vercel.app/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-indigo-400 hover:text-indigo-300 transition-all duration-300 font-semibold hover:underline underline-offset-4"
                  >
                    Gunasekaran ✨
                  </a>
                </div>
              </div>
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}
