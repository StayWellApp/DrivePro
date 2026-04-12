"use client";

import React from "react";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { signOut } from "next-auth/react";

interface UserAccountNavProps {
  user?: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
    role?: string | null;
  } | null;
}

export const UserAccountNav: React.FC<UserAccountNavProps> = ({ user }) => {
  // If no user, show a simple sign in/out placeholder to avoid "missing navigation"
  if (!user) {
    return (
      <button
        onClick={() => signOut({ callbackUrl: "/login" })}
        className="ui:flex ui:items-center ui:gap-2 ui:px-4 ui:py-2 ui:rounded-xl ui:bg-slate-800 ui:text-slate-400 ui:text-xs ui:font-bold ui:uppercase"
      >
        <span className="material-symbols-outlined ui:text-sm">logout</span>
        Session Invalid - Sign Out
      </button>
    );
  }

  const initials = user.email
    ? user.email.substring(0, 2).toUpperCase()
    : "US";

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <button className="ui:flex ui:items-center ui:gap-3 ui:outline-none ui:cursor-pointer ui:group ui:w-full ui:text-left">
          <div className="ui:w-10 ui:h-10 ui:rounded-full ui:bg-teal-500/20 ui:flex ui:items-center ui:justify-center ui:text-teal-400 ui:font-bold ui:border ui:border-teal-500/20 ui:group-hover:border-teal-500/40 ui:transition-all ui:flex-shrink-0">
            {user.image ? (
              <img src={user.image} alt={user.name || "User"} className="ui:w-full ui:h-full ui:rounded-full ui:object-cover" />
            ) : (
              initials
            )}
          </div>
          <div className="ui:hidden md:ui:block ui:overflow-hidden ui:flex-1">
            <p className="ui:text-sm ui:font-bold ui:text-white group-hover:ui:text-teal-400 ui:truncate ui:transition-colors">
              {user.name || user.email || "User"}
            </p>
            <p className="ui:text-[10px] ui:font-black ui:uppercase ui:tracking-widest ui:text-slate-400">
              {user.role?.replace("_", " ") || "Member"}
            </p>
          </div>
          <span className="material-symbols-outlined ui:text-slate-400 ui:text-sm group-hover:ui:text-teal-400 ui:transition-colors">unfold_more</span>
        </button>
      </DropdownMenu.Trigger>

      <DropdownMenu.Portal>
        <DropdownMenu.Content
          className="ui:min-w-[240px] ui:bg-slate-900 ui:text-white ui:rounded-2xl ui:p-2 ui:shadow-2xl ui:border ui:border-slate-800 ui:z-[100] ui:animate-in ui:fade-in ui:zoom-in ui:duration-200"
          sideOffset={12}
          align="end"
        >
          <div className="ui:px-4 ui:py-3 ui:mb-2 ui:border-b ui:border-white/5">
            <p className="ui:text-[10px] ui:font-black ui:text-slate-500 ui:uppercase ui:tracking-[0.2em] ui:mb-1">Authenticated Account</p>
            <p className="ui:text-sm ui:font-bold ui:text-white ui:truncate">{user.email}</p>
          </div>

          <DropdownMenu.Item className="ui:outline-none" asChild>
            <button
              onClick={() => signOut({ callbackUrl: "/login" })}
              className="ui:w-full ui:flex ui:items-center ui:gap-3 ui:px-4 ui:py-3 ui:text-sm ui:font-bold ui:text-red-400 hover:ui:bg-red-500/10 ui:rounded-xl ui:transition-all ui:cursor-pointer"
            >
              <span className="material-symbols-outlined ui:text-lg">logout</span>
              Sign Out Securely
            </button>
          </DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
};
