import {
  BarChart3,
  Bell,
  CalendarDays,
  ChevronDown,
  FlaskConical,
  LayoutDashboard,
  LogOut,
  Menu,
  Pill,
  Receipt,
  Search,
  Settings,
  Stethoscope,
  UsersRound,
  X,
} from "lucide-react";
import { NavLink, useLocation, Outlet } from "react-router-dom";
import { type ComponentType, useEffect, useRef, useState } from "react";

import { ClinexaBrand } from "@/components/brand/clinexa-brand";
import { useAuth } from "@/auth/auth-context";

interface NavigationItem {
  label: string;
  path: string;
  icon: ComponentType<{
    className?: string;
  }>;
  permission?: string;
}

const navigation: NavigationItem[] = [
  {
    label: "Dashboard",
    path: "/",
    icon: LayoutDashboard,
  },
  {
    label: "Patients",
    path: "/patients",
    icon: UsersRound,
    permission: "PATIENT_READ",
  },
  {
    label: "Appointments",
    path: "/appointments",
    icon: CalendarDays,
    permission: "APPOINTMENT_READ",
  },
  {
    label: "Doctors",
    path: "/doctors",
    icon: Stethoscope,
    permission: "DOCTOR_READ",
  },
  {
    label: "Laboratory",
    path: "/laboratory",
    icon: FlaskConical,
    permission: "LAB_READ",
  },
  {
    label: "Pharmacy",
    path: "/pharmacy",
    icon: Pill,
    permission: "PHARMACY_READ",
  },
  {
    label: "Billing",
    path: "/billing",
    icon: Receipt,
    permission: "BILLING_READ",
  },
  {
    label: "Reports",
    path: "/reports",
    icon: BarChart3,
    permission: "REPORT_READ",
  },
];

const secondaryNavigation: NavigationItem[] = [
  {
    label: "Settings",
    path: "/settings",
    icon: Settings,
    permission: "SETTINGS_READ",
  },
];

const mobileNavigation: NavigationItem[] = [
  {
    label: "Home",
    path: "/",
    icon: LayoutDashboard,
  },
  {
    label: "Patients",
    path: "/patients",
    icon: UsersRound,
    permission: "PATIENT_READ",
  },
  {
    label: "Appointments",
    path: "/appointments",
    icon: CalendarDays,
    permission: "APPOINTMENT_READ",
  },
  {
    label: "Doctors",
    path: "/doctors",
    icon: Stethoscope,
    permission: "DOCTOR_READ",
  },
];

function getPageTitle(pathname: string): string {
  if (pathname === "/") {
    return "Dashboard";
  }

  const item = [...navigation, ...secondaryNavigation].find(
    (entry) => pathname === entry.path || pathname.startsWith(`${entry.path}/`),
  );

  return item?.label ?? "Clinexa";
}

export function AppShell() {
  const location = useLocation();

  const [mobileOpen, setMobileOpen] = useState(false);

  const pageTitle = getPageTitle(location.pathname);

  const { user, logout, hasPermission } = useAuth();

  const [sidebarUserMenuOpen, setSidebarUserMenuOpen] = useState(false);

  const [headerUserMenuOpen, setHeaderUserMenuOpen] = useState(false);

  const sidebarUserMenuRef = useRef<HTMLDivElement>(null);
  const headerUserMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      const target = event.target as Node;

      if (
        sidebarUserMenuRef.current &&
        !sidebarUserMenuRef.current.contains(target)
      ) {
        setSidebarUserMenuOpen(false);
      }

      if (
        headerUserMenuRef.current &&
        !headerUserMenuRef.current.contains(target)
      ) {
        setHeaderUserMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, []);

  const userName = user
    ? `${user.firstName}${user.lastName ? ` ${user.lastName}` : ""}`
    : "Clinexa User";

  const userInitials = user
    ? `${user.firstName?.[0] ?? ""}${user.lastName?.[0] ?? ""}`.toUpperCase()
    : "CU";

  const visibleNavigation = navigation.filter(
    (item) => !item.permission || hasPermission(item.permission),
  );

  const visibleSecondaryNavigation = secondaryNavigation.filter(
    (item) => !item.permission || hasPermission(item.permission),
  );

  const visibleMobileNavigation = mobileNavigation.filter(
    (item) => !item.permission || hasPermission(item.permission),
  );

  return (
    <div
      className="
        min-h-svh
        bg-[#f6faf9]
        text-slate-900
      "
    >
      {/* ==========================================================
          BACKGROUND DECORATION
      =========================================================== */}

      <div
        className="
          pointer-events-none
          fixed
          inset-0
          overflow-hidden
        "
        aria-hidden="true"
      >
        <div
          className="
            absolute
            -right-40
            -top-40
            size-[520px]
            rounded-full
            bg-teal-100/20
            blur-3xl
          "
        />

        <div
          className="
            absolute
            -bottom-48
            right-[18%]
            size-[430px]
            rounded-full
            bg-cyan-100/20
            blur-3xl
          "
        />

        <div
          className="
            absolute
            left-[18%]
            top-[35%]
            size-[300px]
            rounded-full
            bg-emerald-100/10
            blur-3xl
          "
        />
      </div>

      {/* ==========================================================
          MOBILE OVERLAY
      =========================================================== */}

      {mobileOpen && (
        <button
          type="button"
          aria-label="Close navigation"
          onClick={() => setMobileOpen(false)}
          className="
            fixed
            inset-0
            z-40
            bg-slate-950/30
            backdrop-blur-[2px]
            lg:hidden
          "
        />
      )}

      {/* ==========================================================
          SIDEBAR
      =========================================================== */}

      <aside
        className={`
          fixed
          inset-y-0
          left-0
          z-50
          flex
          w-[260px]
          flex-col

          bg-white

          shadow-[2px_0_14px_rgba(15,23,42,0.035)]

          transition-transform
          duration-300

          lg:translate-x-0

          ${mobileOpen ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        {/* ========================================================
            SIDEBAR LOGO
        ========================================================= */}

        <div
          className="
            flex
            h-20
            shrink-0
            items-center
            justify-between
            px-6
          "
        >
          <NavLink
            to="/"
            onClick={() => setMobileOpen(false)}
            className="flex items-center"
          >
            <ClinexaBrand className="h-11 w-auto" />
          </NavLink>

          <button
            type="button"
            onClick={() => setMobileOpen(false)}
            className="
              flex
              size-9
              items-center
              justify-center
              rounded-lg
              text-slate-400
              transition-colors
              hover:bg-slate-100
              hover:text-slate-700
              lg:hidden
            "
            aria-label="Close menu"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* ========================================================
            SIDEBAR NAVIGATION
        ========================================================= */}

        <nav
          className="
            flex-1
            overflow-y-auto
            px-4
            py-6
          "
        >
          <p
            className="
              mb-3
              px-3
              text-[10px]
              font-semibold
              uppercase
              tracking-[0.14em]
              text-slate-400
            "
          >
            Workspace
          </p>

          <div className="space-y-1">
            {visibleNavigation.map((item) => (
              <SidebarLink
                key={item.path}
                item={item}
                onNavigate={() => setMobileOpen(false)}
              />
            ))}
          </div>

          {/* Spacing instead of separator */}

          {visibleSecondaryNavigation.length > 0 && (
            <>
              <div className="my-7" />

              <p
                className="
                  mb-3
                  px-3
                  text-[10px]
                  font-semibold
                  uppercase
                  tracking-[0.14em]
                  text-slate-400
                "
              >
                Administration
              </p>

              <div className="space-y-1">
                {visibleSecondaryNavigation.map((item) => (
                  <SidebarLink
                    key={item.path}
                    item={item}
                    onNavigate={() => setMobileOpen(false)}
                  />
                ))}
              </div>
            </>
          )}
        </nav>

        {/* ========================================================
            SIDEBAR USER
        ========================================================= */}

        <div className="shrink-0 p-4">
          <div ref={sidebarUserMenuRef} className="relative">
            <button
              type="button"
              onClick={() => setSidebarUserMenuOpen((open) => !open)}
              className="
        flex
        w-full
        items-center
        gap-3
        rounded-xl
        bg-slate-50
        p-3
        text-left
        transition-colors
        hover:bg-slate-100
      "
            >
              <div
                className="
          flex
          size-9
          shrink-0
          items-center
          justify-center
          rounded-full
          bg-gradient-to-br
          from-teal-500
          to-teal-700
          text-xs
          font-semibold
          text-white
        "
              >
                {userInitials}
              </div>

              <div className="min-w-0 flex-1">
                <p
                  className="
            truncate
            text-sm
            font-semibold
            text-slate-800
          "
                >
                  {userName}
                </p>

                <p
                  className="
            truncate
            text-xs
            text-slate-500
          "
                >
                  {user?.role || user?.roles?.[0] || "User"}
                </p>
              </div>

              <ChevronDown
                className={`
          size-4
          text-slate-400
          transition-transform
          ${sidebarUserMenuOpen ? "rotate-180" : ""}
        `}
              />
            </button>

            {sidebarUserMenuOpen && (
              <div
                className="
          absolute
          bottom-full
          left-0
          right-0
          mb-2
          overflow-hidden
          rounded-xl
          bg-white
          p-1.5
          shadow-[0_10px_30px_rgba(15,23,42,0.12)]
          ring-1
          ring-slate-200/60
        "
              >
                <div
                  className="
            px-3
            py-2
          "
                >
                  <p
                    className="
              truncate
              text-xs
              font-medium
              text-slate-800
            "
                  >
                    {user?.email}
                  </p>
                </div>

                <div className="my-1 h-px bg-slate-100" />

                <button
                  type="button"
                  onClick={logout}
                  className="
            flex
            w-full
            items-center
            gap-3
            rounded-lg
            px-3
            py-2.5
            text-sm
            font-medium
            text-slate-600
            transition-colors
            hover:bg-red-50
            hover:text-red-600
          "
                >
                  <LogOut className="size-4" />

                  <span>Sign out</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* ==========================================================
          MAIN APPLICATION
      =========================================================== */}

      <div
        className="
          relative
          min-h-svh
          lg:pl-[260px]
        "
      >
        {/* ========================================================
            HEADER
        ========================================================= */}

        <header
          className="
            sticky
            top-0
            z-30
            flex
            h-16
            items-center

            bg-white/90

            shadow-[0_2px_14px_rgba(15,23,42,0.045)]

            px-4

            backdrop-blur-xl

            sm:px-6
            lg:px-8
          "
        >
          {/* Mobile menu */}

          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            className="
              mr-3
              flex
              size-9
              items-center
              justify-center
              rounded-lg
              text-slate-500
              transition-colors
              hover:bg-slate-100
              hover:text-slate-800
              lg:hidden
            "
            aria-label="Open navigation"
          >
            <Menu className="size-5" />
          </button>

          {/* Page title */}

          <div
            className="
              min-w-0
              flex-1
            "
          >
            <h1
              className="
                truncate
                text-base
                font-semibold
                text-slate-900
                sm:text-lg
              "
            >
              {pageTitle}
            </h1>
          </div>

          {/* ======================================================
              HEADER ACTIONS
          ======================================================= */}

          <div
            className="
              flex
              items-center
              gap-2
              sm:gap-3
            "
          >
            {/* Search */}

            <button
              type="button"
              className="
                hidden
                h-9
                items-center
                gap-2
                rounded-lg

                border
                border-slate-200/80

                bg-white

                px-3

                text-sm
                text-slate-400

                transition-colors

                hover:border-slate-300
                hover:text-slate-600

                md:flex
                lg:w-56
              "
            >
              <Search className="size-4" />

              <span>Search...</span>

              <span
                className="
                  ml-auto
                  rounded
                  bg-slate-100
                  px-1.5
                  py-0.5
                  text-[10px]
                  font-medium
                  text-slate-400
                "
              >
                /
              </span>
            </button>

            {/* Mobile search */}

            <button
              type="button"
              className="
                flex
                size-9
                items-center
                justify-center
                rounded-lg
                text-slate-500
                transition-colors
                hover:bg-slate-100
                hover:text-slate-800
                md:hidden
              "
              aria-label="Search"
            >
              <Search className="size-5" />
            </button>

            {/* Notifications */}

            <button
              type="button"
              className="
                relative
                flex
                size-9
                items-center
                justify-center
                rounded-lg
                text-slate-500
                transition-colors
                hover:bg-slate-100
                hover:text-slate-800
              "
              aria-label="Notifications"
            >
              <Bell className="size-[18px]" />

              <span
                className="
                  absolute
                  right-2
                  top-1.5
                  size-1.5
                  rounded-full
                  bg-teal-500
                  ring-2
                  ring-white
                "
              />
            </button>

            {/* User */}

            <div ref={headerUserMenuRef} className="relative">
              <button
                type="button"
                onClick={() => setHeaderUserMenuOpen((open) => !open)}
                className="
                  flex
                  items-center
                  gap-2
                  rounded-lg
                  p-1
                  transition-colors
                  hover:bg-slate-50
                "
                aria-expanded={headerUserMenuOpen}
                aria-haspopup="menu"
              >
                <div
                  className="
                    flex
                    size-8
                    items-center
                    justify-center
                    rounded-full
                    bg-gradient-to-br
                    from-teal-500
                    to-teal-700
                    text-[11px]
                    font-semibold
                    text-white
                  "
                >
                  {userInitials}
                </div>

                <div
                  className="
                    hidden
                    max-w-[150px]
                    text-left
                    xl:block
                  "
                >
                  <p
                    className="
                      truncate
                      text-xs
                      font-semibold
                      text-slate-800
                    "
                  >
                    {userName}
                  </p>

                  <p
                    className="
                      text-[10px]
                      text-slate-400
                    "
                  >
                    {user?.role || user?.roles?.[0] || "User"}
                  </p>
                </div>

                <ChevronDown
                  className={`
                    hidden
                    size-4
                    text-slate-400
                    transition-transform
                    xl:block
                    ${headerUserMenuOpen ? "rotate-180" : ""}
                  `}
                />
              </button>

              {headerUserMenuOpen && (
                <div
                  className="
                    absolute
                    right-0
                    top-full
                    z-50
                    mt-2
                    w-64
                    overflow-hidden
                    rounded-xl
                    bg-white
                    p-1.5
                    shadow-[0_12px_32px_rgba(15,23,42,0.12)]
                    ring-1
                    ring-slate-200/60
                  "
                  role="menu"
                >
                  <div className="px-3 py-2.5">
                    <p
                      className="
                        truncate
                        text-sm
                        font-semibold
                        text-slate-800
                      "
                    >
                      {userName}
                    </p>

                    <p
                      className="
                        mt-0.5
                        truncate
                        text-xs
                        text-slate-400
                      "
                    >
                      {user?.email ?? ""}
                    </p>
                  </div>

                  <div className="my-1 h-px bg-slate-100" />

                  <button
                    type="button"
                    onClick={logout}
                    className="
                      flex
                      w-full
                      items-center
                      gap-3
                      rounded-lg
                      px-3
                      py-2.5
                      text-sm
                      font-medium
                      text-slate-600
                      transition-colors
                      hover:bg-red-50
                      hover:text-red-600
                    "
                    role="menuitem"
                  >
                    <LogOut className="size-4" />
                    <span>Sign out</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* ========================================================
            PAGE CONTENT
        ========================================================= */}

        <main
          className="
            relative
            min-h-[calc(100vh-4rem)]
          "
        >
          <div
            className="
              mx-auto
              w-full
              max-w-[1600px]

              px-4
              pb-24
              pt-6

              sm:px-6

              lg:px-8
              lg:pb-8

              xl:py-8
            "
          >
            <Outlet />
          </div>
        </main>

        {/* ========================================================
            MOBILE BOTTOM NAVIGATION
        ========================================================= */}

        <nav
          className="
            fixed
            inset-x-0
            bottom-0
            z-40

            bg-white/95

            pb-[env(safe-area-inset-bottom)]

            shadow-[0_-4px_18px_rgba(15,23,42,0.045)]

            backdrop-blur-xl

            lg:hidden
          "
        >
          <div
            className="
              mx-auto
              grid
              h-16
              max-w-lg
              grid-cols-5
            "
          >
            {visibleMobileNavigation.map((item) => (
              <MobileNavLink
                key={item.path}
                item={item}
                onNavigate={() => setMobileOpen(false)}
              />
            ))}

            {/* More */}

            <button
              type="button"
              onClick={() => setMobileOpen(true)}
              className="
                flex
                flex-col
                items-center
                justify-center
                gap-1
                text-slate-400
                transition-colors
                hover:text-slate-700
              "
            >
              <span
                className="
                  flex
                  size-7
                  items-center
                  justify-center
                  rounded-lg
                "
              >
                <Menu className="size-5" />
              </span>

              <span
                className="
                  text-[10px]
                  font-medium
                "
              >
                More
              </span>
            </button>
          </div>
        </nav>
      </div>
    </div>
  );
}

/* ================================================================
   DESKTOP SIDEBAR LINK
================================================================ */

interface SidebarLinkProps {
  item: NavigationItem;
  onNavigate: () => void;
}

function SidebarLink({ item, onNavigate }: SidebarLinkProps) {
  const Icon = item.icon;

  return (
    <NavLink
      to={item.path}
      end={item.path === "/"}
      onClick={onNavigate}
      className={({ isActive }) =>
        `
          group
          flex
          items-center
          gap-3

          rounded-xl

          px-3
          py-2.5

          text-sm
          font-medium

          transition-all
          duration-150

          ${
            isActive
              ? "bg-teal-50 text-teal-700"
              : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
          }
        `
      }
    >
      {({ isActive }) => (
        <>
          <span
            className={`
              flex
              size-8
              shrink-0
              items-center
              justify-center

              rounded-lg

              transition-colors

              ${
                isActive
                  ? "bg-teal-100 text-teal-700"
                  : "text-slate-400 group-hover:text-slate-600"
              }
            `}
          >
            <Icon className="size-[18px]" />
          </span>

          <span className="truncate">{item.label}</span>

          {isActive && (
            <span
              className="
                ml-auto
                size-1.5
                rounded-full
                bg-teal-500
              "
            />
          )}
        </>
      )}
    </NavLink>
  );
}

/* ================================================================
   MOBILE BOTTOM NAV LINK
================================================================ */

interface MobileNavLinkProps {
  item: NavigationItem;
  onNavigate: () => void;
}

function MobileNavLink({ item, onNavigate }: MobileNavLinkProps) {
  const Icon = item.icon;

  return (
    <NavLink
      to={item.path}
      end={item.path === "/"}
      onClick={onNavigate}
      className={({ isActive }) =>
        `
          flex
          flex-col
          items-center
          justify-center
          gap-1

          transition-colors

          ${isActive ? "text-teal-700" : "text-slate-400 hover:text-slate-700"}
        `
      }
    >
      {({ isActive }) => (
        <>
          <span
            className={`
              flex
              size-7
              items-center
              justify-center

              rounded-lg

              transition-colors

              ${isActive ? "bg-teal-50" : ""}
            `}
          >
            <Icon className="size-5" />
          </span>

          <span
            className="
              text-[10px]
              font-medium
            "
          >
            {item.label}
          </span>
        </>
      )}
    </NavLink>
  );
}
