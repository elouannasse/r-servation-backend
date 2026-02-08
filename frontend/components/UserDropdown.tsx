"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { User, Settings, LogOut, ChevronDown } from "lucide-react";

interface UserDropdownProps {
  user: { name?: string; email?: string; role?: string } | null;
  onLogout: () => void;
  dark?: boolean;
}

export default function UserDropdown({
  user,
  onLogout,
  dark = false,
}: UserDropdownProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Fermer le dropdown en cliquant en dehors
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Initiales de l'utilisateur
  const initials = user?.name
    ? user.name
        .split(" ")
        .map((w) => w[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "?";

  return (
    <div ref={ref} className="relative">
      {/* Trigger */}
      <button
        onClick={() => setOpen(!open)}
        className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
          dark ? "hover:bg-gray-700" : "hover:bg-gray-100"
        }`}
      >
        {/* Avatar avec initiales */}
        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-semibold text-sm shadow-md">
          {initials}
        </div>
        <div className="hidden sm:block text-left">
          <p
            className={`text-sm font-medium leading-tight ${dark ? "text-gray-100" : "text-gray-800"}`}
          >
            {user?.name || "Utilisateur"}
          </p>
          <p
            className={`text-xs leading-tight ${dark ? "text-gray-400" : "text-gray-500"}`}
          >
            {user?.role === "admin" ? "Administrateur" : "Participant"}
          </p>
        </div>
        <ChevronDown
          className={`w-4 h-4 transition-transform ${dark ? "text-gray-400" : "text-gray-500"} ${open ? "rotate-180" : ""}`}
        />
      </button>

      {/* Dropdown menu */}
      {open && (
        <div
          className={`absolute ${dark ? "bottom-full mb-2 left-0" : "right-0 mt-2"} w-56 bg-white border border-gray-200 rounded-xl shadow-xl z-50 py-1`}
        >
          {/* Infos utilisateur */}
          <div className="px-4 py-3 border-b border-gray-100">
            <p className="text-sm font-semibold text-gray-900">{user?.name}</p>
            <p className="text-xs text-gray-500 truncate">{user?.email}</p>
          </div>

          {/* Menu items */}
          <div className="py-1">
            <button
              onClick={() => {
                setOpen(false);
                router.push("/profile");
              }}
              className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <User className="w-4 h-4 text-gray-400" />
              Mon profil
            </button>
            <button
              onClick={() => {
                setOpen(false);
                router.push("/profile/edit");
              }}
              className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <Settings className="w-4 h-4 text-gray-400" />
              Éditer profil
            </button>
          </div>

          {/* Déconnexion */}
          <div className="border-t border-gray-100 py-1">
            <button
              onClick={() => {
                setOpen(false);
                onLogout();
              }}
              className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Déconnexion
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
