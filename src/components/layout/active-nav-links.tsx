"use client";

import { usePathname } from "next/navigation";

import { type NavItem } from "@/config/site";

import { NavLinks } from "./nav-links";

export function ActiveNavLinks({ items }: { items: NavItem[] }) {
  return <NavLinks items={items} pathname={usePathname()} />;
}
