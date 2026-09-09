"use client";

import {
  useEffect,
  useState,
} from "react";

import Image from "next/image";
import Link from "next/link";

import {
  usePathname,
  useRouter,
} from "next/navigation";

import type {
  ReactNode,
} from "react";

import {
  ArrowLeft,
  BarChart3,
  Bookmark,
  LayoutDashboard,
  LoaderCircle,
  LogOut,
  Menu,
  MessageSquareText,
  Search,
  Settings,
  ShieldCheck,
  Users,
  X,
} from "lucide-react";

import {
  getAccessToken,
  getAdminMe,
  getCurrentUser,
  getStoredUser,
  logoutUser,
  setStoredUser,
} from "@/lib/api";

import type {
  AuthUser,
} from "@/lib/api";

import {
  showErrorToast,
} from "@/lib/toast";

type AdminState =
  | "checking"
  | "authorized"
  | "denied";

const navigation = [
  {
    name: "Overview",
    href: "/admin",
    icon: LayoutDashboard,
  },
  {
    name: "Users",
    href: "/admin/users",
    icon: Users,
  },
  {
    name: "Searches",
    href: "/admin/searches",
    icon: Search,
  },
  {
    name: "Saved providers",
    href: "/admin/saved",
    icon: Bookmark,
  },
  {
    name: "Support",
    href: "/admin/support",
    icon: MessageSquareText,
  },
  {
    name: "Analytics",
    href: "/admin/analytics",
    icon: BarChart3,
  },
  {
    name: "System",
    href: "/admin/system",
    icon: Settings,
  },
];

export default function AdminLayout({
  children,
}: {
  children: ReactNode;
}) {
  const router =
    useRouter();

  const pathname =
    usePathname();

  const [
    adminState,
    setAdminState,
  ] = useState<AdminState>(
    "checking"
  );

  const [
    user,
    setUser,
  ] = useState<
    AuthUser | null
  >(null);

  const [
    mobileOpen,
    setMobileOpen,
  ] = useState(false);

  const [
    loggingOut,
    setLoggingOut,
  ] = useState(false);

  /*
   * Important:
   *
   * Backend /admin/me is now the
   * source of truth.
   *
   * We DO NOT reject access based
   * on the cached localStorage role.
   */
  useEffect(() => {
    let active =
      true;

    const verifyAdmin =
      async () => {
        try {
          setAdminState(
            "checking"
          );

          const token =
            getAccessToken();

          if (!token) {
            if (!active) {
              return;
            }

            setAdminState(
              "denied"
            );

            router.replace(
              "/login"
            );

            return;
          }

          /*
           * Verify the actual JWT
           * against the backend.
           */
          const admin =
            await getAdminMe();

          if (!active) {
            return;
          }

          if (
            !admin.admin ||
            admin.user?.role !==
              "ADMIN"
          ) {
            setAdminState(
              "denied"
            );

            router.replace(
              "/"
            );

            return;
          }

          /*
           * Use local user data only
           * for display.
           *
           * It is NOT used to decide
           * admin authorization.
           */
          const stored =
            getStoredUser();

          if (
            stored &&
            stored.id ===
              admin.user.id
          ) {
            const updatedUser: AuthUser =
              {
                ...stored,
                email:
                  admin.user.email,
                role: "ADMIN",
              };

            setStoredUser(
              updatedUser
            );

            setUser(
              updatedUser
            );
          } else {
            /*
             * If localStorage is
             * missing or stale,
             * retrieve the current
             * account from backend.
             */
            try {
              const currentUser =
                await getCurrentUser();

              if (!active) {
                return;
              }

              const updatedUser: AuthUser =
                {
                  ...currentUser,
                  role: "ADMIN",
                };

              setStoredUser(
                updatedUser
              );

              setUser(
                updatedUser
              );
            } catch {
              /*
               * Admin verification
               * already succeeded,
               * so lack of profile
               * data should not block
               * the dashboard.
               */
              setUser({
                id:
                  admin.user.id,

                name:
                  "Administrator",

                email:
                  admin.user.email,

                role:
                  "ADMIN",
              });
            }
          }

          if (!active) {
            return;
          }

          setAdminState(
            "authorized"
          );
        } catch (error) {
          if (!active) {
            return;
          }

          console.error(
            "Admin verification failed:",
            error
          );

          setAdminState(
            "denied"
          );

          showErrorToast(
            error instanceof Error
              ? error.message
              : "Unable to verify administrator access."
          );

          /*
           * If the token has expired
           * or admin access fails,
           * send the user back to
           * login instead of leaving
           * the spinner forever.
           */
          router.replace(
            "/login"
          );
        }
      };

    verifyAdmin();

    return () => {
      active =
        false;
    };
  }, [router]);

  /*
   * Close sidebar when route changes.
   */
  useEffect(() => {
    setMobileOpen(
      false
    );
  }, [pathname]);

  /*
   * Lock page scrolling while
   * mobile navigation is open.
   */
  useEffect(() => {
    if (!mobileOpen) {
      return;
    }

    const previous =
      document.body.style
        .overflow;

    document.body.style.overflow =
      "hidden";

    return () => {
      document.body.style.overflow =
        previous;
    };
  }, [mobileOpen]);

  const handleLogout =
    () => {
      if (loggingOut) {
        return;
      }

      try {
        setLoggingOut(
          true
        );

        logoutUser();

        /*
         * Hard navigation guarantees
         * all protected admin state
         * is cleared.
         */
        window.location.replace(
          "/login"
        );
      } catch {
        setLoggingOut(
          false
        );
      }
    };

  if (
    adminState ===
    "checking"
  ) {
    return (
      <AdminLoading />
    );
  }

  if (
    adminState ===
    "denied"
  ) {
    return (
      <AdminRedirecting />
    );
  }

  return (
    <div
      className="
        min-h-screen
        bg-zinc-50
        text-zinc-950

        dark:bg-zinc-950
        dark:text-white
      "
    >
      {/* Mobile backdrop */}

      {mobileOpen && (
        <button
          type="button"
          aria-label="Close admin navigation"
          onClick={() =>
            setMobileOpen(
              false
            )
          }
          className="
            fixed
            inset-0
            z-40
            bg-black/50
            backdrop-blur-[2px]

            lg:hidden
          "
        />
      )}

      {/* SIDEBAR */}

      <aside
        className={`
          fixed
          inset-y-0
          left-0
          z-50
          flex
          w-[280px]
          flex-col
          border-r
          border-zinc-200
          bg-white
          transition-transform
          duration-300

          dark:border-zinc-800
          dark:bg-zinc-950

          lg:translate-x-0

          ${
            mobileOpen
              ? "translate-x-0"
              : "-translate-x-full"
          }
        `}
      >
        {/* Logo */}

        <div
          className="
            flex
            h-20
            items-center
            justify-between
            border-b
            border-zinc-100
            px-5

            dark:border-zinc-800
          "
        >
          <Link
            href="/admin"
            className="
              flex
              items-center
              gap-3
            "
          >
            <div
              className="
                flex
                h-10
                w-10
                shrink-0
                items-center
                justify-center
                overflow-hidden
                rounded-xl
              "
            >
              <Image
                src="/orbi-logo.png"
                alt="Orbi logo"
                width={40}
                height={40}
                priority
                className="
                  h-full
                  w-full
                  object-contain
                "
              />
            </div>

            <div>
              <div
                className="
                  flex
                  items-center
                  gap-2
                "
              >
                <span
                  className="
                    text-lg
                    font-semibold
                    tracking-tight
                    text-zinc-950

                    dark:text-white
                  "
                >
                  Orbi
                </span>

                <span
                  className="
                    rounded-md
                    bg-zinc-950
                    px-1.5
                    py-0.5
                    text-[9px]
                    font-bold
                    uppercase
                    tracking-wider
                    text-white

                    dark:bg-white
                    dark:text-zinc-950
                  "
                >
                  Admin
                </span>
              </div>

              <p
                className="
                  text-[11px]
                  text-zinc-500

                  dark:text-zinc-400
                "
              >
                Control center
              </p>
            </div>
          </Link>

          <button
            type="button"
            onClick={() =>
              setMobileOpen(
                false
              )
            }
            aria-label="Close menu"
            className="
              flex
              h-9
              w-9
              items-center
              justify-center
              rounded-lg
              text-zinc-400
              transition

              hover:bg-zinc-100
              hover:text-zinc-950

              dark:text-zinc-500
              dark:hover:bg-zinc-900
              dark:hover:text-white

              lg:hidden
            "
          >
            <X
              size={18}
            />
          </button>
        </div>

        {/* Admin account */}

        <div
          className="
            px-4
            pt-5
          "
        >
          <div
            className="
              flex
              items-center
              gap-3
              rounded-xl
              border
              border-zinc-200
              bg-zinc-50
              px-3
              py-3

              dark:border-zinc-800
              dark:bg-zinc-900
            "
          >
            <div
              className="
                flex
                h-9
                w-9
                shrink-0
                items-center
                justify-center
                rounded-lg
                bg-zinc-950
                text-white

                dark:bg-white
                dark:text-zinc-950
              "
            >
              <ShieldCheck
                size={17}
              />
            </div>

            <div
              className="
                min-w-0
                flex-1
              "
            >
              <p
                className="
                  truncate
                  text-xs
                  font-semibold
                  text-zinc-900

                  dark:text-white
                "
              >
                {safeName(
                  user?.name
                )}
              </p>

              <p
                className="
                  truncate
                  text-[11px]
                  text-zinc-500

                  dark:text-zinc-400
                "
              >
                {
                  user?.email
                }
              </p>
            </div>
          </div>
        </div>

        {/* NAVIGATION */}

        <nav
          className="
            flex-1
            overflow-y-auto
            px-3
            py-5
          "
        >
          <p
            className="
              mb-2
              px-3
              text-[10px]
              font-semibold
              uppercase
              tracking-[0.15em]
              text-zinc-400

              dark:text-zinc-500
            "
          >
            Management
          </p>

          <div
            className="
              space-y-1
            "
          >
            {navigation.map(
              (item) => {
                const Icon =
                  item.icon;

                const active =
                  isActiveRoute(
                    pathname,
                    item.href
                  );

                return (
                  <Link
                    key={
                      item.href
                    }
                    href={
                      item.href
                    }
                    className={`
                      flex
                      h-11
                      items-center
                      gap-3
                      rounded-xl
                      px-3
                      text-sm
                      font-medium
                      transition

                      ${
                        active
                          ? `
                            bg-zinc-950
                            text-white

                            dark:bg-white
                            dark:text-zinc-950
                          `
                          : `
                            text-zinc-600

                            hover:bg-zinc-100
                            hover:text-zinc-950

                            dark:text-zinc-400
                            dark:hover:bg-zinc-900
                            dark:hover:text-white
                          `
                      }
                    `}
                  >
                    <Icon
                      size={18}
                      strokeWidth={
                        active
                          ? 2.2
                          : 1.8
                      }
                    />

                    <span
                      className="
                        min-w-0
                        flex-1
                        truncate
                      "
                    >
                      {
                        item.name
                      }
                    </span>
                  </Link>
                );
              }
            )}
          </div>
        </nav>

        {/* Bottom */}

        <div
          className="
            border-t
            border-zinc-100
            p-3

            dark:border-zinc-800
          "
        >
          <Link
            href="/"
            className="
              flex
              h-11
              items-center
              gap-3
              rounded-xl
              px-3
              text-sm
              font-medium
              text-zinc-600
              transition

              hover:bg-zinc-100
              hover:text-zinc-950

              dark:text-zinc-400
              dark:hover:bg-zinc-900
              dark:hover:text-white
            "
          >
            <ArrowLeft
              size={18}
            />

            Back to Orbi
          </Link>

          <button
            type="button"
            onClick={
              handleLogout
            }
            disabled={
              loggingOut
            }
            className="
              mt-1
              flex
              h-11
              w-full
              items-center
              gap-3
              rounded-xl
              px-3
              text-sm
              font-medium
              text-red-600
              transition

              hover:bg-red-50

              disabled:cursor-not-allowed
              disabled:opacity-50

              dark:text-red-400
              dark:hover:bg-red-950/30
            "
          >
            {loggingOut ? (
              <LoaderCircle
                size={18}
                className="animate-spin"
              />
            ) : (
              <LogOut
                size={18}
              />
            )}

            Sign out
          </button>
        </div>
      </aside>

      {/* MAIN APPLICATION */}

      <div
        className="
          min-h-screen

          lg:pl-[280px]
        "
      >
        {/* Mobile Header */}

        <header
          className="
            fixed
            left-0
            right-0
            top-0
            z-30
            flex
            h-16
            items-center
            justify-between
            border-b
            border-zinc-200
            bg-white/95
            px-4
            backdrop-blur

            dark:border-zinc-800
            dark:bg-zinc-950/95

            lg:hidden
          "
        >
          <button
            type="button"
            onClick={() =>
              setMobileOpen(
                true
              )
            }
            aria-label="Open admin navigation"
            className="
              flex
              h-10
              w-10
              items-center
              justify-center
              rounded-xl
              text-zinc-600
              transition

              hover:bg-zinc-100

              dark:text-zinc-300
              dark:hover:bg-zinc-900
            "
          >
            <Menu
              size={20}
            />
          </button>

          <Link
            href="/admin"
            className="
              flex
              items-center
              gap-2
            "
          >
            <Image
              src="/orbi-logo.png"
              alt="Orbi"
              width={30}
              height={30}
              className="
                h-8
                w-8
                object-contain
              "
            />

            <span
              className="
                text-sm
                font-semibold
                text-zinc-950

                dark:text-white
              "
            >
              Orbi Admin
            </span>
          </Link>

          <div
            className="
              flex
              h-9
              w-9
              items-center
              justify-center
              rounded-full
              bg-zinc-950
              text-xs
              font-semibold
              text-white

              dark:bg-white
              dark:text-zinc-950
            "
          >
            {getInitials(
              user?.name
            )}
          </div>
        </header>

        <div
          className="
            min-h-screen
            pt-16

            lg:pt-0
          "
        >
          {children}
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   LOADING
========================================================= */

function AdminLoading() {
  return (
    <main
      className="
        flex
        min-h-screen
        items-center
        justify-center
        bg-white

        dark:bg-zinc-950
      "
    >
      <div
        className="
          flex
          flex-col
          items-center
          gap-4
        "
      >
        <div
          className="
            flex
            h-12
            w-12
            items-center
            justify-center
            rounded-2xl
            bg-zinc-100

            dark:bg-zinc-900
          "
        >
          <LoaderCircle
            size={22}
            className="
              animate-spin
              text-zinc-700

              dark:text-zinc-300
            "
          />
        </div>

        <div
          className="
            text-center
          "
        >
          <p
            className="
              text-sm
              font-semibold
              text-zinc-900

              dark:text-white
            "
          >
            Opening Orbi Admin
          </p>

          <p
            className="
              mt-1
              text-xs
              text-zinc-500

              dark:text-zinc-400
            "
          >
            Verifying
            administrator
            access...
          </p>
        </div>
      </div>
    </main>
  );
}

function AdminRedirecting() {
  return (
    <main
      className="
        flex
        min-h-screen
        items-center
        justify-center
        bg-white

        dark:bg-zinc-950
      "
    >
      <div
        className="
          flex
          items-center
          gap-3
          text-sm
          text-zinc-500

          dark:text-zinc-400
        "
      >
        <LoaderCircle
          size={18}
          className="animate-spin"
        />

        Redirecting...
      </div>
    </main>
  );
}

/* =========================================================
   HELPERS
========================================================= */

function isActiveRoute(
  pathname: string,
  href: string
) {
  if (
    href ===
    "/admin"
  ) {
    return (
      pathname ===
      "/admin"
    );
  }

  return (
    pathname ===
      href ||
    pathname.startsWith(
      `${href}/`
    )
  );
}

function safeName(
  value: unknown
) {
  if (
    typeof value !==
    "string"
  ) {
    return "Administrator";
  }

  const name =
    value.trim();

  return (
    name ||
    "Administrator"
  );
}

function getInitials(
  value: unknown
) {
  const name =
    safeName(
      value
    );

  const parts =
    name
      .split(/\s+/)
      .filter(Boolean);

  if (
    parts.length ===
    0
  ) {
    return "A";
  }

  if (
    parts.length ===
    1
  ) {
    return parts[0]
      .slice(0, 2)
      .toUpperCase();
  }

  return `${parts[0][0]}${
    parts[
      parts.length - 1
    ][0]
  }`.toUpperCase();
}