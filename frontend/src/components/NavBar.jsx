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

  async function handleLogout() {
    await logout();
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
        <nav className="mx-auto grid w-full max-w-6xl grid-cols-[auto_1fr_auto] items-center gap-x-3 gap-y-2 px-4 py-3 sm:flex sm:justify-between sm:gap-6 sm:px-6 sm:py-4">
          <div className="contents sm:flex sm:min-w-0 sm:items-center sm:gap-8">
            <NavLink
              to="/"
              className="flex shrink-0 items-center gap-2 font-['Fraunces'] text-xl font-light text-white no-underline"
              aria-label="DiarEat home"
            >
              <img src="/favicon.svg" alt="" width="32" height="32" className="h-8 w-8 shrink-0" aria-hidden="true" />
              <span className="hidden min-[420px]:inline">DiarEat</span>
            </NavLink>

            <div className="order-3 col-span-3 -mx-1 flex min-w-0 items-center gap-1 overflow-x-auto px-1 pb-1 sm:order-none sm:col-span-1 sm:mx-0 sm:gap-2 sm:overflow-visible sm:px-0 sm:pb-0">
              {navItems.map(({ to, label, end }) => (
                <NavLink
                  key={to}
                  to={to}
                  end={end}
                  className={({ isActive }) => {
                    const isHomeActive = to === "/" && isEntriesRoute;

                    return [
                      "shrink-0 whitespace-nowrap rounded-full px-3 py-2 text-xs font-medium no-underline transition-colors duration-200 sm:px-4 sm:text-sm",
                      isActive || isHomeActive ? "bg-[#B83224] text-white" : "text-stone-50 hover:text-stone-200",
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
            className="inline-flex min-h-11 min-w-11 shrink-0 items-center justify-center gap-1.5 justify-self-end rounded-lg border border-stone-700/50 px-3 py-2 text-sm font-medium text-stone-300 transition-colors hover:border-red-400/40 hover:text-red-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F0E76F]"
            aria-label="Log out"
          >
            <LogOut size={16} aria-hidden="true" />
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
