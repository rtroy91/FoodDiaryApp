import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { Home, MapPin, Trophy, LogOut } from "lucide-react";
import { logout } from "../api/auth";

const NAV_ITEMS = [
  { to: "/", label: "Home", icon: Home, end: true },
  { to: "/discover", label: "Discover", icon: MapPin, end: false },
  { to: "/most-visited", label: "Most Visited", icon: Trophy, end: false },
];

export function NavBar() {
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate("/login");
  }

  return (
    <div
      className="relative min-h-screen bg-[#F5F0E8]"
    >
      {/* ── STICKY PILL NAV ──────────────────────────────────────── */}
      <div className="sticky top-3 z-50 flex justify-center pointer-events-none">
        <div className="flex items-center gap-1 bg-foreground/90 backdrop-blur-md rounded-2xl px-2 py-2 shadow-xl border border-white/10">
          <span className="hidden sm:block px-3 text-xs font-semibold text-[#A5CF83] tracking-[0.12em] uppercase mr-1">
            Eaten&amp;Noted
          </span>


          <div className="hidden sm:block h-4 w-px bg-white/10 mr-1" />

     
          {NAV_ITEMS.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                [
                  "flex items-center gap-1.5 rounded-full px-3.5 py-2 text-xs font-semibold transition-all duration-200",
                  isActive
                    ? "bg-[#A5CF83] text-[#1C1107]"
                    : "text-white/50 hover:text-white/90",
                ].join(" ")
              }
            >
              <Icon size={13} />
              <span className="hidden sm:inline">{label}</span>
            </NavLink>
          ))}


          <div className="h-4 w-px bg-white/10 mx-1" />

          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 rounded-full px-3 py-2 text-xs font-semibold text-white/40 transition-all hover:text-[#E89951]"
            aria-label="Log out"
          >
            <LogOut size={13} />
            <span className="hidden sm:inline">Log out</span>
          </button>
        </div>
      </div>
      <main className="-mt-14">
        <Outlet />
      </main>
    </div>
  );
}
