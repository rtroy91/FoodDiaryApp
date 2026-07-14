import { Suspense, useState } from "react";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { LogOut } from "lucide-react";
import { isAdmin, logout } from "../api/auth";

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
  const pathname = location.pathname;
  const navItems = isAdmin() ? [...NAV_ITEMS, { to: "/admin/users", label: "Users", end: false }] : NAV_ITEMS;

  const isHomeRoute = pathname === "/";
  const isEntriesRoute = pathname.startsWith("/entries");
  const isFoodMapRoute = pathname === "/food-map";
  const isTopPlacesRoute = pathname === "/top-places";
  const hasDarkHeaderBg = isHomeRoute || isEntriesRoute || isFoodMapRoute || isTopPlacesRoute;
  const usesContainedPageScroll = isHomeRoute || isEntriesRoute || isFoodMapRoute || isTopPlacesRoute;

  const shellClassName = [
    "relative flex h-dvh flex-col overflow-hidden",
    hasDarkHeaderBg ? "bg-[#1C1107]" : "bg-[#F5F0E8]",
  ].join(" ");

  const headerClassName = [
    "sticky top-0 z-50 -mb-16 transition-[background-color,border-color,box-shadow,backdrop-filter] duration-300",
    isScrolled
      ? "border-b border-stone-800/40 bg-stone-950/80 shadow-[0_14px_36px_rgba(28,17,7,0.16)] backdrop-blur-md"
      : "border-b border-transparent bg-transparent",
  ].join(" ");

  function handleLogout() {
    logout();
    navigate("/login");
  }

  function handleShellScroll(event) {
    const nextIsScrolled = event.currentTarget.scrollTop > 25;
    setIsScrolled((currentIsScrolled) => (currentIsScrolled === nextIsScrolled ? currentIsScrolled : nextIsScrolled));
  }

  return (
    <div className={shellClassName}>
      <a
        href="#main-content"
        className="sr-only focus-visible:not-sr-only focus-visible:fixed focus-visible:left-4 focus-visible:top-4 focus-visible:z-60 focus-visible:rounded-full focus-visible:bg-white focus-visible:px-4 focus-visible:py-2 focus-visible:text-sm focus-visible:font-semibold focus-visible:text-stone-950 focus-visible:shadow-lg"
      >
        Skip to main content
      </a>

      <header className={headerClassName}>
        <nav className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
          <div className="flex min-w-0 items-center gap-4 sm:gap-8">
            <NavLink
              to="/"
              className="flex shrink-0 items-center gap-2 font-['Fraunces'] text-xl font-light text-white no-underline"
              aria-label="DiarEat home"
            >
              <img src="/favicon.svg" alt="" className="h-8 w-8 shrink-0" aria-hidden="true" />
              <span className="hidden min-[420px]:inline">DiarEat</span>
            </NavLink>

            <div className="flex min-w-0 items-center gap-1 sm:gap-2">
              {navItems.map(({ to, label, end }) => (
                <NavLink
                  key={to}
                  to={to}
                  end={end}
                  className={({ isActive }) => {
                    const isHomeActive = to === "/" && isEntriesRoute;

                    return [
                      "whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-medium no-underline transition-colors duration-200 sm:px-4 sm:text-sm",
                      isActive || isHomeActive ? "bg-[#E04B39] text-stone-50" : "text-stone-50 hover:text-stone-200",
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
            className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-stone-700/50 px-3 py-1 text-sm font-medium text-stone-400 transition-colors hover:border-red-400/40 hover:text-red-400"
            aria-label="Log out"
          >
            <LogOut size={14} />
            <span className="hidden sm:inline">Log out</span>
          </button>
        </nav>
      </header>

      <main
        id="main-content"
        className={[
          "min-h-0 flex-1 overflow-x-hidden",
          usesContainedPageScroll ? "overflow-hidden" : "overflow-y-auto",
        ].join(" ")}
        onScroll={handleShellScroll}
      >
        <Suspense fallback={<OutletLoadingShell />}>
          <Outlet />
        </Suspense>
      </main>
    </div>
  );
}
