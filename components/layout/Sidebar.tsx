"use client";

import Profile from "@/components/profile";

import Image from "next/image";
import Link from "next/link";

import {
  usePathname,
  useRouter,
} from "next/navigation";

import {
  useEffect,
  useRef,
  useState,
} from "react";

import {
  Bookmark,
  ChevronUp,
  CircleHelp,
  Home,
  LogOut,
  Menu,
  Plus,
  Search,
  Settings,
  UserRound,
  X,
} from "lucide-react";

import {
  getSearchHistory,
  getStoredUser,
  logoutUser,
  searchBusinesses,
} from "@/lib/api";

import type {
  AuthUser,
  SearchHistoryItem,
} from "@/lib/api";

import {
  showErrorToast,
} from "@/lib/toast";

interface SidebarProps {
  collapsed: boolean;
  mobileOpen: boolean;
  onToggle: () => void;
  onMobileClose: () => void;
}

const navigation = [
  {
    name: "Search",
    href: "/search",
    icon: Search,
  },
  {
    name: "Saved",
    href: "/saved",
    icon: Bookmark,
  },
];

export default function Sidebar({
  collapsed,
  mobileOpen,
  onToggle,
  onMobileClose,
}: SidebarProps) {
  const pathname =
    usePathname();

  const router =
    useRouter();

  const [
    profileOpen,
    setProfileOpen,
  ] = useState(false);

  const [
    user,
    setUser,
  ] = useState<AuthUser | null>(
    null
  );

  const [
    accountMenuOpen,
    setAccountMenuOpen,
  ] = useState(false);

  const [
    recentSearches,
    setRecentSearches,
  ] = useState<
    SearchHistoryItem[]
  >([]);

  const [
    recentLoading,
    setRecentLoading,
  ] = useState(false);

  const [
    reopeningId,
    setReopeningId,
  ] = useState<
    string | null
  >(null);

  const accountMenuRef =
    useRef<HTMLDivElement>(
      null
    );

  /*
   * Sync logged-in user.
   */
  useEffect(() => {
    const syncUser = () => {
      setUser(
        getStoredUser()
      );
    };

    syncUser();

    window.addEventListener(
      "auth-updated",
      syncUser
    );

    window.addEventListener(
      "storage",
      syncUser
    );

    return () => {
      window.removeEventListener(
        "auth-updated",
        syncUser
      );

      window.removeEventListener(
        "storage",
        syncUser
      );
    };
  }, []);

  /*
   * Load latest real searches.
   */
  useEffect(() => {
    let cancelled =
      false;

    const loadRecentSearches =
      async () => {
        if (!user) {
          setRecentSearches(
            []
          );

          setRecentLoading(
            false
          );

          return;
        }

        try {
          setRecentLoading(
            true
          );

          const history =
            await getSearchHistory();

          if (cancelled) {
            return;
          }

          setRecentSearches(
            history.slice(0, 3)
          );
        } catch {
          if (!cancelled) {
            setRecentSearches(
              []
            );
          }
        } finally {
          if (!cancelled) {
            setRecentLoading(
              false
            );
          }
        }
      };

    loadRecentSearches();

    return () => {
      cancelled = true;
    };
  }, [
    user,
    pathname,
  ]);

  /*
   * Close account popup when
   * clicking outside.
   */
  useEffect(() => {
    const handleClickOutside =
      (
        event:
          MouseEvent
      ) => {
        if (
          accountMenuRef.current &&
          !accountMenuRef.current.contains(
            event.target as Node
          )
        ) {
          setAccountMenuOpen(
            false
          );
        }
      };

    document.addEventListener(
      "mousedown",
      handleClickOutside
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        handleClickOutside
      );
    };
  }, []);

  const getInitials = (
    value: unknown
  ) => {
    if (
      typeof value !==
      "string"
    ) {
      return "U";
    }

    const parts =
      value
        .trim()
        .split(/\s+/)
        .filter(Boolean);

    if (
      parts.length === 0
    ) {
      return "U";
    }

    if (
      parts.length === 1
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
  };

  const handleLogout =
    () => {
      logoutUser();

      setUser(null);

      setRecentSearches(
        []
      );

      setAccountMenuOpen(
        false
      );

      onMobileClose();

      router.push(
        "/login"
      );

      router.refresh();
    };

  const handleMenuNavigation =
    (
      href: string
    ) => {
      setAccountMenuOpen(
        false
      );

      onMobileClose();

      router.push(
        href
      );
    };

  /*
   * Re-run old search without
   * creating another history row.
   */
  const handleRecentSearch =
    async (
      item:
        SearchHistoryItem
    ) => {
      try {
        setReopeningId(
          item.id
        );

        const data =
          await searchBusinesses({
            query:
              item.query,

            latitude:
              item.latitude ??
              undefined,

            longitude:
              item.longitude ??
              undefined,

            recordHistory:
              false,
          });

        sessionStorage.setItem(
          "latestSearch",
          JSON.stringify(
            data
          )
        );

        onMobileClose();

        router.push(
          "/results"
        );
      } catch (error) {
        showErrorToast(
          error instanceof Error
            ? error.message
            : "Unable to reopen search."
        );
      } finally {
        setReopeningId(
          null
        );
      }
    };

  return (
    <>
      {/* Mobile backdrop */}
      {mobileOpen && (
        <button
          type="button"
          aria-label="Close sidebar"
          onClick={
            onMobileClose
          }
          className="
            fixed inset-0
            z-40
            bg-black/40
            backdrop-blur-[1px]
            md:hidden
          "
        />
      )}

      <aside
        className={`
          fixed left-0 top-0
          z-50
          flex h-dvh
          flex-col
          border-r
          border-zinc-200
          bg-white
          transition-all
          duration-300
          ease-in-out

          dark:border-zinc-800
          dark:bg-zinc-950

          ${
            mobileOpen
              ? "w-[280px] translate-x-0"
              : "w-[280px] -translate-x-full"
          }

          md:translate-x-0

          ${
            collapsed
              ? "md:w-[72px]"
              : "md:w-[260px]"
          }
        `}
      >
        {/* Header */}
        <div
          className={`
            flex h-16
            shrink-0
            items-center
            justify-between
            border-b
            border-zinc-100
            px-4

            dark:border-zinc-800

            ${
              collapsed
                ? "md:justify-center md:px-2"
                : "md:justify-between md:px-4"
            }
          `}
        >
          {/* Logo */}
          <Link
            href="/"
            onClick={
              onMobileClose
            }
            className={`
              flex
              items-center
              gap-2.5
              overflow-hidden

              ${
                collapsed
                  ? "md:hidden"
                  : "md:flex"
              }
            `}
          >
            <div
              className="
                flex h-10 w-10
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

            <div className="min-w-0">
              <p
                className="
                  whitespace-nowrap
                  text-base
                  font-semibold
                  text-zinc-950

                  dark:text-white
                "
              >
                Orbi
              </p>

              <p
                className="
                  whitespace-nowrap
                  text-[11px]
                  text-zinc-500

                  dark:text-zinc-400
                "
              >
                Service Assistant
              </p>
            </div>
          </Link>

          {/* Desktop collapse */}
          <button
            type="button"
            onClick={
              onToggle
            }
            aria-label={
              collapsed
                ? "Expand sidebar"
                : "Collapse sidebar"
            }
            title={
              collapsed
                ? "Expand sidebar"
                : "Collapse sidebar"
            }
            className="
              hidden h-10 w-10
              shrink-0
              items-center
              justify-center
              rounded-xl
              text-zinc-600
              transition

              hover:bg-zinc-100
              hover:text-zinc-950

              dark:text-zinc-400
              dark:hover:bg-zinc-900
              dark:hover:text-white

              md:flex
            "
          >
            <Menu
              size={21}
            />
          </button>

          {/* Mobile close */}
          <button
            type="button"
            onClick={
              onMobileClose
            }
            aria-label="Close sidebar"
            className="
              flex h-10 w-10
              items-center
              justify-center
              rounded-xl
              text-zinc-600
              transition

              hover:bg-zinc-100
              hover:text-zinc-950

              dark:text-zinc-400
              dark:hover:bg-zinc-900
              dark:hover:text-white

              md:hidden
            "
          >
            <X size={21} />
          </button>
        </div>

        {/* New Search */}
        <div className="p-3">
          <Link
            href="/"
            onClick={
              onMobileClose
            }
            title={
              collapsed
                ? "New search"
                : undefined
            }
            className={`
              flex h-11
              items-center
              rounded-xl
              bg-zinc-950
              text-sm
              font-medium
              text-white
              transition

              hover:bg-zinc-800

              dark:bg-white
              dark:text-zinc-950
              dark:hover:bg-zinc-200

              ${
                collapsed
                  ? "md:justify-center md:px-0"
                  : "md:justify-start md:gap-3 md:px-4"
              }

              justify-start
              gap-3
              px-4
            `}
          >
            <Plus
              size={19}
              className="shrink-0"
            />

            <span
              className={`
                whitespace-nowrap

                ${
                  collapsed
                    ? "md:hidden"
                    : "md:block"
                }
              `}
            >
              New search
            </span>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="px-3">
          <p
            className={`
              mb-2
              px-3
              text-[11px]
              font-semibold
              uppercase
              tracking-wider
              text-zinc-400

              dark:text-zinc-500

              ${
                collapsed
                  ? "md:hidden"
                  : ""
              }
            `}
          >
            Menu
          </p>

          <div className="space-y-1">
            {navigation.map(
              (item) => {
                const Icon =
                  item.icon;

                const isActive =
                  item.href === "/"
                    ? pathname ===
                      "/"
                    : pathname.startsWith(
                        item.href
                      );

                return (
                  <Link
                    key={
                      item.name
                    }
                    href={
                      item.href
                    }
                    onClick={
                      onMobileClose
                    }
                    title={
                      collapsed
                        ? item.name
                        : undefined
                    }
                    className={`
                      flex h-11
                      items-center
                      rounded-xl
                      text-sm
                      font-medium
                      transition

                      ${
                        collapsed
                          ? "md:justify-center md:px-0"
                          : "md:justify-start md:gap-3 md:px-3"
                      }

                      justify-start
                      gap-3
                      px-3

                      ${
                        isActive
                          ? `
                            bg-zinc-100
                            text-zinc-950

                            dark:bg-zinc-800
                            dark:text-white
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
                      size={19}
                      strokeWidth={
                        isActive
                          ? 2.2
                          : 1.8
                      }
                      className="shrink-0"
                    />

                    <span
                      className={`
                        whitespace-nowrap

                        ${
                          collapsed
                            ? "md:hidden"
                            : ""
                        }
                      `}
                    >
                      {item.name}
                    </span>
                  </Link>
                );
              }
            )}
          </div>
        </nav>

        {/* Recent Searches */}
        <div
          className={`
            mt-7
            flex-1
            overflow-y-auto
            px-3

            ${
              collapsed
                ? "md:hidden"
                : ""
            }
          `}
        >
          <div
            className="
              mb-2
              flex items-center
              justify-between
              px-3
            "
          >
            <p
              className="
                text-[11px]
                font-semibold
                uppercase
                tracking-wider
                text-zinc-400

                dark:text-zinc-500
              "
            >
              Recent
            </p>

            {recentSearches.length >
              0 && (
              <Link
                href="/search"
                onClick={
                  onMobileClose
                }
                className="
                  text-[11px]
                  font-medium
                  text-zinc-400
                  transition

                  hover:text-zinc-800

                  dark:text-zinc-500
                  dark:hover:text-zinc-200
                "
              >
                View all
              </Link>
            )}
          </div>

          {/* Loading */}
          {recentLoading ? (
            <div className="space-y-2 px-1">
              {[1, 2, 3].map(
                (item) => (
                  <div
                    key={
                      item
                    }
                    className="
                      h-10
                      animate-pulse
                      rounded-xl
                      bg-zinc-100

                      dark:bg-zinc-900
                    "
                  />
                )
              )}
            </div>
          ) : recentSearches.length >
            0 ? (
            <div className="space-y-1">
              {recentSearches.map(
                (item) => {
                  const reopening =
                    reopeningId ===
                    item.id;

                  return (
                    <button
                      key={
                        item.id
                      }
                      type="button"
                      onClick={() =>
                        handleRecentSearch(
                          item
                        )
                      }
                      disabled={
                        reopening
                      }
                      title={
                        item.query
                      }
                      className="
                        flex w-full
                        items-center
                        gap-2
                        rounded-xl
                        px-3
                        py-2.5
                        text-left
                        text-sm
                        text-zinc-600
                        transition

                        hover:bg-zinc-100
                        hover:text-zinc-950

                        dark:text-zinc-400
                        dark:hover:bg-zinc-900
                        dark:hover:text-white

                        disabled:opacity-60
                      "
                    >
                      <Search
                        size={14}
                        className="
                          shrink-0
                          text-zinc-400

                          dark:text-zinc-500
                        "
                      />

                      <span
                        className="
                          min-w-0
                          flex-1
                          truncate
                        "
                      >
                        {createRecentTitle(
                          item
                        )}
                      </span>

                      {reopening && (
                        <span
                          className="
                            h-3.5
                            w-3.5
                            shrink-0
                            animate-spin
                            rounded-full
                            border-2
                            border-zinc-300
                            border-t-zinc-700

                            dark:border-zinc-700
                            dark:border-t-zinc-200
                          "
                        />
                      )}
                    </button>
                  );
                }
              )}
            </div>
          ) : user ? (
            <p
              className="
                px-3 py-2
                text-xs
                leading-5
                text-zinc-400

                dark:text-zinc-500
              "
            >
              No recent searches
              yet.
            </p>
          ) : (
            <p
              className="
                px-3 py-2
                text-xs
                leading-5
                text-zinc-400

                dark:text-zinc-500
              "
            >
              Sign in to see your
              recent searches.
            </p>
          )}
        </div>

        {collapsed && (
          <div className="hidden flex-1 md:block" />
        )}

        {/* User account */}
        <div
          ref={
            accountMenuRef
          }
          className="
            relative
            border-t
            border-zinc-100
            p-3

            dark:border-zinc-800
          "
        >
          {user ? (
            <>
              {/* Account menu */}
              {accountMenuOpen && (
                <div
                  className={`
                    absolute
                    bottom-[72px]
                    z-[60]
                    overflow-hidden
                    rounded-2xl
                    border
                    border-zinc-200
                    bg-white
                    p-2
                    shadow-xl

                    dark:border-zinc-800
                    dark:bg-zinc-900
                    dark:shadow-black/40

                    ${
                      collapsed
                        ? "left-[62px] w-60 md:left-[62px]"
                        : "left-3 right-3"
                    }
                  `}
                >
                  {/* User info */}
                  <div
                    className="
                      border-b
                      border-zinc-100
                      px-3
                      pb-3
                      pt-2

                      dark:border-zinc-800
                    "
                  >
                    <div
                      className="
                        flex
                        items-center
                        gap-3
                      "
                    >
                      <UserAvatar
                        user={
                          user
                        }
                        initials={getInitials(
                          user.name
                        )}
                      />

                      <div className="min-w-0">
                        <p
                          className="
                            truncate
                            text-sm
                            font-semibold
                            text-zinc-900

                            dark:text-white
                          "
                        >
                          {user.name}
                        </p>

                        <p
                          className="
                            truncate
                            text-xs
                            text-zinc-500

                            dark:text-zinc-400
                          "
                        >
                          {user.email}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Profile */}
                  <button
                    type="button"
                    onClick={() => {
                      setAccountMenuOpen(
                        false
                      );

                      setProfileOpen(
                        true
                      );
                    }}
                    className="
                      mt-2
                      flex w-full
                      items-center
                      gap-3
                      rounded-xl
                      px-3
                      py-2.5
                      text-left
                      text-sm
                      text-zinc-700
                      transition

                      hover:bg-zinc-100
                      hover:text-zinc-950

                      dark:text-zinc-300
                      dark:hover:bg-zinc-800
                      dark:hover:text-white
                    "
                  >
                    <UserRound
                      size={18}
                    />

                    Profile
                  </button>

                  {/* Settings */}
                  <button
                    type="button"
                    onClick={() =>
                      handleMenuNavigation(
                        "/settings"
                      )
                    }
                    className="
                      flex w-full
                      items-center
                      gap-3
                      rounded-xl
                      px-3
                      py-2.5
                      text-left
                      text-sm
                      text-zinc-700
                      transition

                      hover:bg-zinc-100
                      hover:text-zinc-950

                      dark:text-zinc-300
                      dark:hover:bg-zinc-800
                      dark:hover:text-white
                    "
                  >
                    <Settings
                      size={18}
                    />

                    Settings
                  </button>

                  {/* Help */}
                  <button
                    type="button"
                    onClick={() =>
                      handleMenuNavigation(
                        "/help"
                      )
                    }
                    className="
                      flex w-full
                      items-center
                      gap-3
                      rounded-xl
                      px-3
                      py-2.5
                      text-left
                      text-sm
                      text-zinc-700
                      transition

                      hover:bg-zinc-100
                      hover:text-zinc-950

                      dark:text-zinc-300
                      dark:hover:bg-zinc-800
                      dark:hover:text-white
                    "
                  >
                    <CircleHelp
                      size={18}
                    />

                    Help
                  </button>

                  <div
                    className="
                      my-2
                      border-t
                      border-zinc-100

                      dark:border-zinc-800
                    "
                  />

                  {/* Logout */}
                  <button
                    type="button"
                    onClick={
                      handleLogout
                    }
                    className="
                      flex w-full
                      items-center
                      gap-3
                      rounded-xl
                      px-3
                      py-2.5
                      text-left
                      text-sm
                      text-red-600
                      transition

                      hover:bg-red-50

                      dark:text-red-400
                      dark:hover:bg-red-950/30
                    "
                  >
                    <LogOut
                      size={18}
                    />

                    Log out
                  </button>
                </div>
              )}

              {/* Account button */}
              <button
                type="button"
                onClick={() =>
                  setAccountMenuOpen(
                    (
                      current
                    ) =>
                      !current
                  )
                }
                title={
                  collapsed
                    ? user.name
                    : undefined
                }
                className={`
                  flex w-full
                  items-center
                  rounded-xl
                  transition

                  hover:bg-zinc-100
                  dark:hover:bg-zinc-900

                  ${
                    collapsed
                      ? "md:justify-center md:p-1.5"
                      : "md:justify-start md:gap-3 md:p-2"
                  }

                  justify-start
                  gap-3
                  p-2
                `}
              >
                <UserAvatar
                  user={
                    user
                  }
                  initials={getInitials(
                    user.name
                  )}
                />

                {/* Name */}
                <div
                  className={`
                    min-w-0
                    flex-1
                    text-left

                    ${
                      collapsed
                        ? "md:hidden"
                        : ""
                    }
                  `}
                >
                  <p
                    className="
                      truncate
                      text-sm
                      font-semibold
                      text-zinc-900

                      dark:text-white
                    "
                  >
                    {user.name}
                  </p>

                  <p
                    className="
                      truncate
                      text-xs
                      text-zinc-500

                      dark:text-zinc-400
                    "
                  >
                    {user.email}
                  </p>
                </div>

                <ChevronUp
                  size={16}
                  className={`
                    shrink-0
                    text-zinc-400
                    transition

                    dark:text-zinc-500

                    ${
                      accountMenuOpen
                        ? "rotate-180"
                        : ""
                    }

                    ${
                      collapsed
                        ? "md:hidden"
                        : ""
                    }
                  `}
                />
              </button>
            </>
          ) : (
            /* Not logged in */
            <div
              className={`
                flex gap-2

                ${
                  collapsed
                    ? "md:flex-col"
                    : ""
                }
              `}
            >
              <Link
                href="/login"
                onClick={
                  onMobileClose
                }
                title={
                  collapsed
                    ? "Sign in"
                    : undefined
                }
                className={`
                  flex h-10
                  items-center
                  justify-center
                  rounded-xl
                  border
                  border-zinc-200
                  text-sm
                  font-medium
                  text-zinc-700
                  transition

                  hover:bg-zinc-100

                  dark:border-zinc-800
                  dark:text-zinc-300
                  dark:hover:bg-zinc-900
                  dark:hover:text-white

                  ${
                    collapsed
                      ? "md:w-10 md:px-0"
                      : "flex-1 px-3"
                  }
                `}
              >
                {collapsed ? (
                  <UserRound
                    size={18}
                    className="hidden md:block"
                  />
                ) : null}

                <span
                  className={
                    collapsed
                      ? "md:hidden"
                      : ""
                  }
                >
                  Sign in
                </span>
              </Link>

              <Link
                href="/register"
                onClick={
                  onMobileClose
                }
                className={`
                  flex h-10
                  items-center
                  justify-center
                  rounded-xl
                  bg-zinc-950
                  px-3
                  text-sm
                  font-medium
                  text-white
                  transition

                  hover:bg-zinc-800

                  dark:bg-white
                  dark:text-zinc-950
                  dark:hover:bg-zinc-200

                  ${
                    collapsed
                      ? "md:hidden"
                      : "flex-1"
                  }
                `}
              >
                Sign up
              </Link>
            </div>
          )}
        </div>
      </aside>

      <Profile
        open={
          profileOpen
        }
        onClose={() =>
          setProfileOpen(
            false
          )
        }
      />
    </>
  );
}

/*
 * User avatar helper.
 */
function UserAvatar({
  user,
  initials,
}: {
  user: AuthUser;
  initials: string;
}) {
  return (
    <div
      className="
        flex h-10 w-10
        shrink-0
        items-center
        justify-center
        overflow-hidden
        rounded-full
        bg-zinc-900
        text-sm
        font-semibold
        text-white

        dark:bg-zinc-700
      "
    >
      {user.image ? (
        <img
          src={
            user.image
          }
          alt={
            typeof user.name ===
            "string"
              ? user.name
              : "User"
          }
          className="
            h-full
            w-full
            object-cover
          "
        />
      ) : (
        initials
      )}
    </div>
  );
}

/*
 * Convert backend history into
 * a short sidebar title.
 */
function createRecentTitle(
  item:
    SearchHistoryItem
) {
  const service =
    formatServiceName(
      item.service
    );

  if (
    item.location
  ) {
    return `${service} in ${item.location}`;
  }

  if (
    item.latitude !==
      null &&
    item.longitude !==
      null
  ) {
    return `${service} near me`;
  }

  return service;
}

function formatServiceName(
  value: string
) {
  if (
    !value ||
    typeof value !==
      "string"
  ) {
    return "Service";
  }

  return value
    .split(" ")
    .map(
      (word) =>
        word
          .charAt(0)
          .toUpperCase() +
        word.slice(1)
    )
    .join(" ");
}