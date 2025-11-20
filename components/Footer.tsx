"use client";
import Link from "next/link";
import Logo from "@/components/Logo";
import { usePathname } from "next/navigation";

export default function Footer() {
  const pathname = usePathname();
  const isAdminRoute = pathname?.startsWith("/admin");

  if (isAdminRoute) {
    return null;
  }

  const currentYear = new Date().getFullYear();

  const essentialLinks = [
    { href: "/tournaments", label: "Tournaments" },
    { href: "/players-teams", label: "Players & Teams" },
    { href: "/communities", label: "Communities" },
    { href: "/news", label: "News" },
  ];

  const supportLinks = [
    { href: "#", label: "Help Center" },
    { href: "#", label: "Contact Us" },
    { href: "#", label: "About Us" },
  ];

  const legalLinks = [
    { href: "#", label: "Terms of Service" },
    { href: "#", label: "Privacy Policy" },
  ];

  const socialLinks = [
    { 
      href: "#", 
      label: "Instagram", 
      icon: (
        <svg className="w-4.5 h-4.5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
        </svg>
      )
    },
    { 
      href: "#", 
      label: "Twitter/X", 
      icon: (
        <svg className="w-4.5 h-4.5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
        </svg>
      )
    },
    { 
      href: "#", 
      label: "Facebook", 
      icon: (
        <svg className="w-4.5 h-4.5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
        </svg>
      )
    },
    { 
      href: "#", 
      label: "YouTube", 
      icon: (
        <svg className="w-4.5 h-4.5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
        </svg>
      )
    },
  ];

  return (
    <footer className="mt-12 border-t border-white/10 bg-gradient-to-b from-[#1A063B]/80 to-[#0D0319]/90 backdrop-blur-sm">
      <div className="mx-auto max-w-7xl px-6 md:px-10 lg:px-16 py-8">
        {/* Main Footer Content */}
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-8 lg:gap-12 mb-6">
          {/* Brand Section */}
          <div className="flex-1 max-w-lg">
            <div className="mb-4">
              <Logo size="lg" variant="footer" showTagline={true} />
            </div>
            <p className="text-st-text/70 text-sm leading-relaxed mt-3">
              Join. Play. Compete. Connect with athletes and sports enthusiasts worldwide.
            </p>
          </div>

          {/* Links and Social Section */}
          <div className="flex flex-col sm:flex-row gap-8 lg:gap-12">
            {/* Explore Links */}
            <div className="min-w-[140px]">
              <h4 className="text-st-white font-semibold text-sm mb-3">Explore</h4>
              <ul className="space-y-2.5">
                {essentialLinks.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-st-text/70 hover:text-[#FF6A3D] text-sm transition-colors inline-block"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Support Links */}
            <div className="min-w-[140px]">
              <h4 className="text-st-white font-semibold text-sm mb-3">Support</h4>
              <ul className="space-y-2.5">
                {supportLinks.map((link, index) => (
                  <li key={`support-${index}-${link.label}`}>
                    <Link
                      href={link.href}
                      className="text-st-text/70 hover:text-[#FF6A3D] text-sm transition-colors inline-block"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Social Links */}
            <div className="min-w-[140px]">
              <h4 className="text-st-white font-semibold text-sm mb-3">Follow Us</h4>
              <div className="flex items-center gap-2.5">
                {socialLinks.map((social) => (
                  <Link
                    key={social.label}
                    href={social.href}
                    aria-label={social.label}
                    className="w-8 h-8 rounded-full bg-white/10 hover:bg-[#FF6A3D] border border-white/20 hover:border-[#FF6A3D] flex items-center justify-center text-st-text/70 hover:text-white transition-all duration-300 hover:scale-110"
                  >
                    {social.icon}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-white/10 pt-5">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 text-xs text-st-text/60">
            <span className="text-center sm:text-left">© {currentYear} SportsTribe. All rights reserved.</span>
            <div className="flex items-center justify-center sm:justify-end gap-4">
              {legalLinks.map((link, index) => (
                <Link
                  key={`legal-${index}-${link.label}`}
                  href={link.href}
                  className="hover:text-[#FF6A3D] transition-colors"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}


