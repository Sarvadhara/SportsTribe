"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Logo from "@/components/Logo";

const nav = [
  { href: "/", label: "Home" },
  { href: "/tournaments", label: "Tournaments Hub" },
  { href: "/players-teams", label: "Players & Teams" },
  { href: "/communities", label: "Communities" },
  { href: "/news", label: "Sports News" },
  { href: "/live", label: "Live Matches" },
  { href: "/store", label: "Store" },
];

export default function Header() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 backdrop-blur bg-[#1A063B]/60 border-b border-white/10">
      <div className="mx-auto max-w-7xl pl-0 pr-4 md:pl-0 md:pr-8 lg:pl-0 lg:pr-10 h-20 md:h-24 flex items-center justify-between py-3 md:py-4 flex-nowrap gap-4">
        <div className="flex-shrink-0 -ml-3 md:-ml-5 lg:-ml-7 mt-6 md:mt-7 lg:mt-7">
          <Logo size="lg" variant="header" showTagline={false} className="-ml-12 md:-ml-14 lg:-ml-16" />
        </div>
        <nav className="hidden md:flex flex-1 min-w-0 items-center justify-center gap-5 xl:gap-6 text-base whitespace-nowrap">
          {nav.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className="relative text-st-text/90 hover:text-st-white transition-colors whitespace-nowrap"
              >
                <span>{item.label}</span>
                <span
                  className={`absolute left-0 -bottom-1 h-[2px] w-full origin-left scale-x-0 bg-gradient-to-r from-[#FF6A3D] to-[#E94057] transition-transform ${active ? "scale-x-100" : "group-hover:scale-x-100"}`}
                />
              </Link>
            );
          })}
        </nav>
        <Link href="/communities" className="text-st-white px-5 py-2.5 rounded-full text-base font-semibold whitespace-nowrap shrink-0 lg:-mr-2 bg-gradient-to-r from-[#E94057] to-[#7A1FA2] hover:shadow-[0_0_20px_rgba(233,64,87,0.5)] transition-all duration-300 hover:scale-105">
          Join the Community
        </Link>
      </div>
    </header>
  );
}


