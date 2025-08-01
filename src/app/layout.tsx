import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "@styles/globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Sensor Anomaly Detection",
  description: "Sensor Anomaly Detection",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} antialiased`}>
        <div className="min-h-screen bg-gray-100">
          <header className="bg-blue-600 text-white p-4">
            <h1 className="text-xl font-bold">Sensor Anomaly Monitor</h1>
          </header>
          <main className="p-4">{children}</main>
          <footer className="bg-gray-800 text-white p-4 text-center">
            <p>&copy; 2025 Sensor Anomaly Monitor</p>
          </footer>
        </div>
      </body>
    </html>
  );
}
