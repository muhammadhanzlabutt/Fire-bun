import "./globals.css";
import Navbar from "@/components/Navbar";

export const metadata = {
  title: "Fire Bun | Premium Diner & POS Suite",
  description: "Experience luxury dining and seamless POS billing. Experience Fire Bun.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="h-full antialiased dark">
      <body className="min-h-full flex flex-col bg-luxury-black text-gray-100 selection:bg-luxury-gold selection:text-luxury-black font-sans">
        <Navbar />
        <main className="flex-1 flex flex-col w-full">
          {children}
        </main>
      </body>
    </html>
  );
}
