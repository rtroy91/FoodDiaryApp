import { Suspense, useState } from "react";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { LogOut } from "lucide-react";
import { logout } from "../api/auth";

const NAV_ITEMS = [
  { to: "/", label: "Home", end: true },
  { to: "/food-map", label: "Food Map", end: false },
  { to: "/top-places", label: "Top Places", end: false },
];

function OutletLoadingShell() {
  return <div className="h-full bg-[#F5F0E8]" />;
}

export function NavBar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isScrolled, setIsScrolled] = useState(false);

  const isHomeRoute = location.pathname === "/";
  const isEntriesRoute = location.pathname.startsWith("/entries");
  const isFoodMapRoute = location.pathname === "/food-map";
  const hasDarkHeaderBg = isHomeRoute || isEntriesRoute || isFoodMapRoute;
  const usesFixedDarkHeader = isHomeRoute || isEntriesRoute;

  const shellClassName = [
    "relative h-dvh",
    hasDarkHeaderBg ? "bg-[#1C1107]" : "bg-[#F5F0E8]",
    isFoodMapRoute
      ? "overflow-y-auto lg:overflow-hidden"
      : usesFixedDarkHeader
        ? "overflow-hidden"
        : "overflow-y-auto",
  ].join(" ");

  const headerClassName = [
    "sticky top-0 z-50 -mb-16 transition-all duration-300",
    isScrolled
      ? "border-b border-stone-800/40 bg-stone-950/80 shadow-[0_14px_36px_rgba(28,17,7,0.16)] backdrop-blur-md"
      : "border-b border-transparent bg-transparent",
  ].join(" ");

  function handleLogout() {
    logout();
    navigate("/login");
  }

  function handleShellScroll(event) {
    setIsScrolled(event.currentTarget.scrollTop > 25);
  }

  return (
    <div className={shellClassName} onScroll={handleShellScroll}>
      <header className={headerClassName}>
        <nav className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
          <div className="flex min-w-0 items-center gap-4 sm:gap-8">
            <NavLink
              to="/"
              className="hidden shrink-0 font-['Fraunces'] text-xl font-light text-white no-underline min-[420px]:block"
            >
              DiarEat
            </NavLink>

            <div className="flex min-w-0 items-center gap-1 sm:gap-2">
              {NAV_ITEMS.map(({ to, label, end }) => (
                <NavLink
                  key={to}
                  to={to}
                  end={end}
                  className={({ isActive }) => {
                    const isHomeActive =
                      to === "/" && location.pathname.startsWith("/entries");

                    return [
                      "whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-medium no-underline transition-colors duration-200 sm:px-4 sm:text-sm",
                      isActive || isHomeActive
                        ? "bg-[#A3E635] text-stone-900"
                        : "text-stone-300 hover:text-white",
                    ].join(" ");
                  }}
                >
                  {label}
                </NavLink>
              ))}
            </div>
          </div>

          <button
            type="button"
            onClick={handleLogout}
            className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-stone-700/50 px-3 py-1 text-sm font-medium text-stone-400 transition-all hover:border-red-400/40 hover:text-red-400"
            aria-label="Log out"
          >
            <LogOut size={14} />
            <span className="hidden sm:inline">Log out</span>
          </button>
        </nav>
      </header>

      <main className="min-h-full">
        <Suspense fallback={<OutletLoadingShell />}>
          <Outlet />
        </Suspense>
      </main>
    </div>
  );
}
