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
  if (!user) return null;

  const initials = user.email
    ? user.email.substring(0, 2).toUpperCase()
    : "US";

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <button className="ui:flex ui:items-center ui:gap-3 ui:outline-none ui:cursor-pointer ui:group">
          <div className="ui:w-10 ui:h-10 ui:rounded-full ui:bg-teal-500/20 ui:flex ui:items-center ui:justify-center ui:text-teal-400 ui:font-bold ui:border ui:border-teal-500/20 ui:group-hover:border-teal-500/40 ui:transition-all">
            {user.image ? (
              <img src={user.image} alt={user.name || "User"} className="ui:w-full ui:h-full ui:rounded-full ui:object-cover" />
            ) : (
              initials
            )}
          </div>
          <div className="ui:hidden md:ui:block ui:text-left">
            <p className="ui:text-sm ui:font-bold ui:text-slate-900 dark:ui:text-white ui:truncate ui:max-w-[150px]">
              {user.name || user.email || "User"}
            </p>
            <p className="ui:text-[10px] ui:font-black ui:uppercase ui:tracking-widest ui:text-slate-500 dark:ui:text-slate-400">
              {user.role?.replace("_", " ") || "Member"}
            </p>
          </div>
        </button>
      </DropdownMenu.Trigger>

      <DropdownMenu.Portal>
        <DropdownMenu.Content
          className="ui:min-w-[220px] ui:bg-white dark:ui:bg-slate-900 ui:rounded-xl ui:p-2 ui:shadow-2xl ui:border ui:border-slate-100 dark:ui:border-slate-800 ui:z-[100] ui:animate-in ui:fade-in ui:zoom-in ui:duration-200"
          sideOffset={8}
          align="end"
        >
          <div className="ui:px-3 ui:py-2 ui:mb-2 ui:border-b ui:border-slate-100 dark:ui:border-slate-800">
            <p className="ui:text-xs ui:font-bold ui:text-slate-400 ui:uppercase ui:tracking-widest ui:mb-1">Signed in as</p>
            <p className="ui:text-sm ui:font-medium ui:text-slate-900 dark:ui:text-white ui:truncate">{user.email}</p>
          </div>

          <DropdownMenu.Item className="ui:outline-none">
            <button
              onClick={() => signOut({ callbackUrl: "/login" })}
              className="ui:w-full ui:flex ui:items-center ui:gap-3 ui:px-3 ui:py-2 ui:text-sm ui:font-semibold ui:text-red-500 hover:ui:bg-red-50 dark:hover:ui:bg-red-900/20 ui:rounded-lg ui:transition-colors ui:cursor-pointer"
            >
              <span className="material-symbols-outlined ui:text-lg">logout</span>
              Sign Out
            </button>
          </DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
};
