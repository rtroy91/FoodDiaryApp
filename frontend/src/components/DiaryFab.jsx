import { useState } from "react";
import { Archive, Home, Menu, Plus, X } from "lucide-react";
import { Link } from "react-router-dom";

export function DiaryFab({ onLogEntry }) {
  const [isOpen, setIsOpen] = useState(false);

  function handleLogEntry() {
    setIsOpen(false);
    onLogEntry();
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-4">
      <div
        className={`flex flex-col items-end transition-[transform,opacity] duration-200 motion-reduce:transition-none ${
          isOpen ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-2 opacity-0"
        }`}
      >
        <button
          type="button"
          onClick={handleLogEntry}
          className="mb-3 flex min-w-40 items-center justify-between gap-3 rounded-xl border border-[#F4C7BE] bg-[#FFF4EF] px-3.5 py-2.5 text-sm font-bold text-[#9A2D22] shadow-[0_12px_30px_rgba(184,50,36,0.18)] transition-transform hover:-translate-y-0.5 hover:bg-[#FFE9DF] hover:text-[#7F241B] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E04B39]/35"
        >
          <span>Log Food</span>
          <span className="rounded-lg bg-[#DE4E3A] p-1.5 text-white shadow-sm">
            <Plus size={15} />
          </span>
        </button>

        <Link
          to="/entries"
          onClick={() => setIsOpen(false)}
          className="mb-2 flex min-w-40 items-center justify-between gap-3 rounded-lg border border-slate-100 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 shadow-md no-underline transition-transform hover:-translate-y-0.5 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E04B39]/35"
        >
          <span>All Entries</span>
          <span className="rounded-md bg-slate-50 p-1.5 text-slate-700">
            <Archive size={14} />
          </span>
        </Link>

        <Link
          to="/"
          onClick={() => setIsOpen(false)}
          className="flex min-w-40 items-center justify-between gap-3 rounded-lg border border-slate-100 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 shadow-md no-underline transition-transform hover:-translate-y-0.5 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E04B39]/35"
        >
          <span>Dashboard</span>
          <span className="rounded-md bg-slate-50 p-1.5 text-slate-700">
            <Home size={14} />
          </span>
        </Link>
      </div>

      <button
        type="button"
        onClick={() => setIsOpen((current) => !current)}
        aria-expanded={isOpen}
        aria-label={isOpen ? "Close quick actions" : "Open quick actions"}
        className="group flex h-12 w-12 items-center justify-center rounded-full bg-[#DE4E3A] text-white shadow-lg transition-[transform,background-color,box-shadow] duration-150 motion-reduce:transition-none hover:scale-105 hover:bg-[#c94331] hover:shadow-xl active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E04B39]/35"
      >
        {isOpen ? <X size={20} /> : <Menu size={20} />}
      </button>
    </div>
  );
}
