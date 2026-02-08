"use client";

import { Search, X, RotateCcw, Calendar } from "lucide-react";
import { useState, useEffect, useCallback } from "react";

export default function EventFilters({ onFilterChange, events }: any) {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [location, setLocation] = useState("all");
  const [dateStart, setDateStart] = useState("");
  const [dateEnd, setDateEnd] = useState("");
  const [sortBy, setSortBy] = useState("date");

  const locations = [...new Set(events.map((e: any) => e.location))];

  const applyFilters = useCallback(() => {
    let filtered = [...events];

    if (search) {
      filtered = filtered.filter(
        (e: any) =>
          e.title.toLowerCase().includes(search.toLowerCase()) ||
          e.description.toLowerCase().includes(search.toLowerCase()),
      );
    }

    if (status !== "all") {
      filtered = filtered.filter((e: any) => e.status === status);
    }

    if (location !== "all") {
      filtered = filtered.filter((e: any) => e.location === location);
    }

    if (dateStart) {
      filtered = filtered.filter(
        (e: any) => new Date(e.date) >= new Date(dateStart),
      );
    }

    if (dateEnd) {
      filtered = filtered.filter(
        (e: any) => new Date(e.date) <= new Date(dateEnd),
      );
    }

    filtered.sort((a: any, b: any) => {
      if (sortBy === "date")
        return new Date(a.date).getTime() - new Date(b.date).getTime();
      if (sortBy === "capacity") return b.capacity - a.capacity;
      if (sortBy === "title") return a.title.localeCompare(b.title);
      return 0;
    });

    onFilterChange(filtered);
  }, [events, search, status, location, dateStart, dateEnd, sortBy, onFilterChange]);

  useEffect(() => {
    const timer = setTimeout(() => {
      applyFilters();
    }, 300);
    return () => clearTimeout(timer);
  }, [applyFilters]);

  const resetFilters = () => {
    setSearch("");
    setStatus("all");
    setLocation("all");
    setDateStart("");
    setDateEnd("");
    setSortBy("date");
  };

  const activeFiltersCount = [
    search,
    status !== "all",
    location !== "all",
    dateStart,
    dateEnd,
  ].filter(Boolean).length;

  return (
    <div className="bg-white rounded-xl shadow-md p-6 mb-6 border border-gray-100">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-4">
        <div className="relative lg:col-span-2">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher un événement..."
            className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
          />
        </div>

        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
        >
          <option value="all">Tous les statuts</option>
          <option value="PUBLISHED">Published</option>
          <option value="DRAFT">Draft</option>
          <option value="CANCELED">Cancelled</option>
        </select>

        <div className="relative">
          <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="date"
            value={dateStart}
            onChange={(e) => setDateStart(e.target.value)}
            placeholder="Date début"
            className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
          />
        </div>

        <div className="relative">
          <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="date"
            value={dateEnd}
            onChange={(e) => setDateEnd(e.target.value)}
            placeholder="Date fin"
            className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
          />
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2 flex-wrap">
          {search && (
            <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
              Recherche: {search}
              <button
                onClick={() => setSearch("")}
                className="hover:bg-blue-200 rounded-full p-0.5 transition"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
          {status !== "all" && (
            <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
              Statut: {status}
              <button
                onClick={() => setStatus("all")}
                className="hover:bg-green-200 rounded-full p-0.5 transition"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
          {location !== "all" && (
            <span className="inline-flex items-center gap-1 px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm font-medium">
              Lieu: {location}
              <button
                onClick={() => setLocation("all")}
                className="hover:bg-purple-200 rounded-full p-0.5 transition"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
          {(dateStart || dateEnd) && (
            <span className="inline-flex items-center gap-1 px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-sm font-medium">
              Dates: {dateStart || "..."} - {dateEnd || "..."}
              <button
                onClick={() => {
                  setDateStart("");
                  setDateEnd("");
                }}
                className="hover:bg-orange-200 rounded-full p-0.5 transition"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
        </div>

        {activeFiltersCount > 0 && (
          <button
            onClick={resetFilters}
            className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition font-medium"
          >
            <RotateCcw className="w-4 h-4" />
            Réinitialiser
          </button>
        )}
      </div>
    </div>
  );
}
