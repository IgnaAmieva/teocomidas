"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCartStore } from "@/lib/cart-store";
import { useEffect, useState } from "react";

const HomeIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
    <path d="M11.47 3.841a.75.75 0 0 1 1.06 0l8.69 8.69a.75.75 0 1 0 1.06-1.061l-8.689-8.69a2.25 2.25 0 0 0-3.182 0l-8.69 8.69a.75.75 0 1 0 1.061 1.06l8.69-8.689Z" />
    <path d="m12 5.432 8.159 8.159c.03.03.06.058.091.086v6.198c0 1.035-.84 1.875-1.875 1.875H15a.75.75 0 0 1-.75-.75v-4.5a.75.75 0 0 0-.75-.75h-3a.75.75 0 0 0-.75.75V21a.75.75 0 0 1-.75.75H5.625a1.875 1.875 0 0 1-1.875-1.875v-6.198a.75.75 0 0 1 .091-.086L12 5.432Z" />
  </svg>
);

const MenuIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
    <path fillRule="evenodd" d="M5.25 2.25a3 3 0 0 0-3 3v4.318a3 3 0 0 0 .879 2.121l9.58 9.581c.92.92 2.39.92 3.31 0l4.318-4.318a2.25 2.25 0 0 0 0-3.182l-9.58-9.58a3 3 0 0 0-2.122-.88H5.25ZM6.375 7.5a1.125 1.125 0 1 0 0-2.25 1.125 1.125 0 0 0 0 2.25Z" clipRule="evenodd" />
  </svg>
);

const CartIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
    <path d="M2.25 2.25a.75.75 0 0 0 0 1.5h1.386c.17 0 .318.114.362.278l2.558 9.592a3.752 3.752 0 0 0-2.806 3.63c0 .414.336.75.75.75h15.75a.75.75 0 0 0 0-1.5H5.378A2.25 2.25 0 0 1 7.5 15h11.218a.75.75 0 0 0 .674-.421 60.358 60.358 0 0 0 2.96-7.228.75.75 0 0 0-.525-.965A60.864 60.864 0 0 0 5.68 4.509l-.232-.867A1.875 1.875 0 0 0 3.636 2.25H2.25ZM3.75 20.25a1.5 1.5 0 1 1 3 0 1.5 1.5 0 0 1-3 0ZM16.5 20.25a1.5 1.5 0 1 1 3 0 1.5 1.5 0 0 1-3 0Z" />
  </svg>
);

const ProfileIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
    <path fillRule="evenodd" d="M7.5 6a4.5 4.5 0 1 1 9 0 4.5 4.5 0 0 1-9 0ZM3.751 20.105a8.25 8.25 0 0 1 16.498 0 .75.75 0 0 1-.437.695A18.683 18.683 0 0 1 12 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 0 1-.437-.695Z" clipRule="evenodd" />
  </svg>
);

const tabs = [
  { label: "Inicio", href: "/", icon: <HomeIcon /> },
  { label: "Menú", href: "/menu", icon: <MenuIcon /> },
  { label: "Pedido", href: "/carrito", icon: <CartIcon />, hasBadge: true },
  { label: "Perfil", href: "/perfil", icon: <ProfileIcon /> },
];

export default function BottomNav() {
  const pathname = usePathname();
  const totalItems = useCartStore((s) => s.totalItems);

  // Hydration guard: only show badge after mount
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const count = mounted ? totalItems() : 0;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-zinc-200 bg-white pb-[env(safe-area-inset-bottom)]">
      <div className="mx-auto flex max-w-lg items-center justify-around">
        {tabs.map((tab) => {
          const isActive =
            tab.href === "/"
              ? pathname === "/"
              : pathname.startsWith(tab.href);

          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`relative flex flex-1 flex-col items-center gap-0.5 py-2 text-xs font-semibold transition-colors ${
                isActive ? "text-zinc-900" : "text-zinc-400"
              }`}
            >
              <span className="relative">
                {tab.icon}
                {tab.hasBadge && count > 0 && (
                  <span className="absolute -right-2 -top-1.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-zinc-900 px-1 text-[10px] font-bold text-white">
                    {count > 99 ? "99+" : count}
                  </span>
                )}
              </span>
              {tab.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
