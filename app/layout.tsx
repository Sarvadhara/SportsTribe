import type { Metadata } from "next";
import { Poppins, Bebas_Neue } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { AdminDataProvider } from "@/contexts/AdminDataContext";

const poppins = Poppins({
  weight: ["300", "400", "500", "600", "700", "800"],
  subsets: ["latin"],
  variable: "--font-poppins",
  display: "swap",
});

const bebasNeue = Bebas_Neue({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-bebas-neue",
  display: "swap",
});

export const metadata: Metadata = {
  title: "SportsTribe – Join. Play. Compete. Connect.",
  description: "A next-gen sports community platform for tournaments, players, teams, news, and live events.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${poppins.variable} ${bebasNeue.variable} antialiased bg-gradient-to-b from-[#1A063B] to-[#2C0C5B] text-[#E0E0E0] min-h-dvh`}> 
        <div className="relative min-h-dvh flex flex-col overflow-hidden">
          {/* Background gradient base */}
          <div className="fixed inset-0 bg-gradient-to-b from-[#1A063B] via-[#2C0C5B] to-[#1A063B]" />
          
          {/* Neon glow effects */}
          <div className="pointer-events-none fixed inset-0 [background:radial-gradient(60rem_60rem_at_50%_-10%,rgba(233,64,87,0.15),transparent),radial-gradient(40rem_30rem_at_10%_10%,rgba(255,147,79,0.12),transparent),radial-gradient(50rem_40rem_at_90%_70%,rgba(122,31,162,0.18),transparent)]" />
          
          {/* Sports silhouette arts */}
          <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
            {/* Basketball player silhouette - top left */}
            <svg className="sports-bg-art absolute top-10 left-5 w-72 h-[400px] md:w-96 md:h-[600px]" viewBox="0 0 300 500" fill="none" xmlns="http://www.w3.org/2000/svg">
              {/* Head */}
              <circle cx="150" cy="80" r="35" fill="currentColor" className="text-white/15"/>
              {/* Body */}
              <path d="M140 120 L160 120 L165 280 L155 380 L145 380 L135 280 Z" fill="currentColor" className="text-white/15"/>
              {/* Arms */}
              <path d="M130 160 L90 180 L80 200 L100 220 L120 200" fill="currentColor" className="text-white/15"/>
              <path d="M170 160 L210 180 L220 200 L200 220 L180 200" fill="currentColor" className="text-white/15"/>
              {/* Legs */}
              <path d="M145 380 L135 480 L155 480 L165 380" fill="currentColor" className="text-white/15"/>
              <path d="M155 380 L165 480 L185 480 L175 380" fill="currentColor" className="text-white/15"/>
              {/* Basketball */}
              <circle cx="90" cy="190" r="25" fill="currentColor" className="text-white/12"/>
              <path d="M90 170 Q75 185 75 190 Q75 195 90 190 Q105 195 105 190 Q105 185 90 170" stroke="currentColor" className="text-white/10" strokeWidth="2" fill="none"/>
            </svg>
            
            {/* Tennis player silhouette - top right */}
            <svg className="sports-bg-art absolute top-5 right-5 w-72 h-[400px] md:w-96 md:h-[600px]" viewBox="0 0 300 500" fill="none" xmlns="http://www.w3.org/2000/svg">
              {/* Head */}
              <circle cx="150" cy="70" r="35" fill="currentColor" className="text-white/15"/>
              {/* Body */}
              <path d="M140 110 L160 110 L165 270 L155 370 L145 370 L135 270 Z" fill="currentColor" className="text-white/15"/>
              {/* Arms */}
              <path d="M130 150 L100 130 L85 150 L95 180 L120 160" fill="currentColor" className="text-white/15"/>
              <path d="M170 150 L200 130 L215 150 L205 180 L180 160" fill="currentColor" className="text-white/15"/>
              {/* Legs */}
              <path d="M145 370 L140 470 L160 470 L165 370" fill="currentColor" className="text-white/15"/>
              <path d="M155 370 L160 470 L180 470 L175 370" fill="currentColor" className="text-white/15"/>
              {/* Tennis racket */}
              <ellipse cx="85" cy="140" rx="30" ry="8" fill="currentColor" className="text-white/12"/>
              <path d="M85 148 L85 160" stroke="currentColor" className="text-white/10" strokeWidth="3"/>
            </svg>
            
            {/* Football player silhouette - bottom left */}
            <svg className="sports-bg-art absolute bottom-10 left-10 w-80 h-[400px] md:w-[450px] md:h-[600px]" viewBox="0 0 350 500" fill="none" xmlns="http://www.w3.org/2000/svg">
              {/* Head */}
              <circle cx="175" cy="90" r="40" fill="currentColor" className="text-white/15"/>
              {/* Body */}
              <path d="M165 130 L185 130 L195 290 L180 400 L170 400 L155 290 Z" fill="currentColor" className="text-white/15"/>
              {/* Arms */}
              <path d="M155 170 L120 190 L110 230 L125 260 L155 240" fill="currentColor" className="text-white/15"/>
              <path d="M195 170 L230 190 L240 230 L225 260 L195 240" fill="currentColor" className="text-white/15"/>
              {/* Legs */}
              <path d="M170 400 L165 500 L185 500 L190 400" fill="currentColor" className="text-white/15"/>
              <path d="M180 400 L195 500 L215 500 L200 400" fill="currentColor" className="text-white/15"/>
              {/* Football */}
              <ellipse cx="120" cy="200" rx="18" ry="28" fill="currentColor" className="text-white/12"/>
              <path d="M120 172 Q115 180 115 190 Q115 200 120 200 Q125 200 125 190 Q125 180 120 172" stroke="currentColor" className="text-white/10" strokeWidth="2" fill="none"/>
            </svg>
            
            {/* Cricket player silhouette - bottom right */}
            <svg className="sports-bg-art absolute bottom-5 right-10 w-72 h-[400px] md:w-96 md:h-[600px]" viewBox="0 0 300 500" fill="none" xmlns="http://www.w3.org/2000/svg">
              {/* Head */}
              <circle cx="150" cy="85" r="35" fill="currentColor" className="text-white/15"/>
              {/* Body */}
              <path d="M140 125 L160 125 L165 285 L155 385 L145 385 L135 285 Z" fill="currentColor" className="text-white/15"/>
              {/* Arms */}
              <path d="M130 165 L95 175 L85 195 L100 220 L125 200" fill="currentColor" className="text-white/15"/>
              <path d="M170 165 L205 175 L215 195 L200 220 L175 200" fill="currentColor" className="text-white/15"/>
              {/* Legs */}
              <path d="M145 385 L140 485 L160 485 L165 385" fill="currentColor" className="text-white/15"/>
              <path d="M155 385 L160 485 L180 485 L175 385" fill="currentColor" className="text-white/15"/>
              {/* Cricket bat */}
              <rect x="85" y="170" width="8" height="50" rx="2" fill="currentColor" className="text-white/12"/>
              <path d="M89 170 L75 160 Q75 155 85 160 L89 170" fill="currentColor" className="text-white/12"/>
            </svg>
          </div>
          
          {/* Neon stroke effects */}
          <div className="fixed inset-0 pointer-events-none z-0">
            <svg className="neon-stroke absolute top-1/4 left-1/4 w-96 h-96" viewBox="0 0 400 400" fill="none">
              <path d="M0 100 Q100 50 200 100 T400 100" stroke="url(#neonGradient1)" strokeWidth="2" fill="none" opacity="0.4"/>
              <defs>
                <linearGradient id="neonGradient1" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#FF6A3D" stopOpacity="0.6"/>
                  <stop offset="50%" stopColor="#E94057" stopOpacity="0.8"/>
                  <stop offset="100%" stopColor="#7A1FA2" stopOpacity="0.6"/>
                </linearGradient>
              </defs>
            </svg>
            <svg className="neon-stroke absolute top-1/2 right-1/4 w-96 h-96" viewBox="0 0 400 400" fill="none">
              <path d="M400 200 Q300 250 200 200 T0 200" stroke="url(#neonGradient2)" strokeWidth="2" fill="none" opacity="0.4"/>
              <defs>
                <linearGradient id="neonGradient2" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#7A1FA2" stopOpacity="0.6"/>
                  <stop offset="50%" stopColor="#E94057" stopOpacity="0.8"/>
                  <stop offset="100%" stopColor="#FF934F" stopOpacity="0.6"/>
                </linearGradient>
              </defs>
            </svg>
          </div>
          
          <AdminDataProvider>
            <Header />
            <main className="flex-1 relative z-10">{children}</main>
            <Footer />
          </AdminDataProvider>
        </div>
      </body>
    </html>
  );
}
