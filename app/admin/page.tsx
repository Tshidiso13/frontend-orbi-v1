"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import Link from "next/link";

import {
  ArrowRight,
  Bookmark,
  CalendarDays,
  CircleAlert,
  Clock3,
  Headphones,
  LoaderCircle,
  RefreshCw,
  Search,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  Users,
} from "lucide-react";

import {
  getAdminDashboard,
} from "@/lib/api";

import type {
  AdminDashboardResponse,
} from "@/lib/api";

import {
  showErrorToast,
} from "@/lib/toast";

export default function AdminDashboardPage() {
  const [
    dashboard,
    setDashboard,
  ] = useState<
    AdminDashboardResponse | null
  >(null);

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    refreshing,
    setRefreshing,
  ] = useState(false);

  const [
    error,
    setError,
  ] = useState<
    string | null
  >(null);

  const loadDashboard =
    useCallback(
      async (
        refresh = false
      ) => {
        try {
          if (refresh) {
            setRefreshing(
              true
            );
          } else {
            setLoading(
              true
            );
          }

          setError(
            null
          );

          const data =
            await getAdminDashboard();

          setDashboard(
            data
          );
        } catch (error) {
          const message =
            error instanceof Error
              ? error.message
              : "Unable to load the admin dashboard.";

          setError(
            message
          );

          showErrorToast(
            message
          );
        } finally {
          setLoading(
            false
          );

          setRefreshing(
            false
          );
        }
      },
      []
    );

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  const maxActivity =
    useMemo(() => {
      if (
        !dashboard
      ) {
        return 1;
      }

      const values =
        dashboard.searchActivity.map(
          (item) =>
            safeNumber(
              item.searches
            )
        );

      return Math.max(
        1,
        ...values
      );
    }, [dashboard]);

  if (loading) {
    return (
      <DashboardLoading />
    );
  }

  if (
    error &&
    !dashboard
  ) {
    return (
      <DashboardError
        message={
          error
        }
        retry={() =>
          loadDashboard()
        }
      />
    );
  }

  if (!dashboard) {
    return null;
  }

  const stats =
    dashboard.stats;

  return (
    <main
      className="
        min-h-screen
        bg-zinc-50

        dark:bg-zinc-950
      "
    >
      <div
        className="
          mx-auto
          w-full
          max-w-[1600px]
          px-5
          py-8

          sm:px-7
          lg:px-10
        "
      >
        {/* Header */}
        <div
          className="
            flex
            flex-col
            gap-5

            sm:flex-row
            sm:items-end
            sm:justify-between
          "
        >
          <div>
            <div
              className="
                mb-2
                flex
                items-center
                gap-2
              "
            >
              <ShieldCheck
                size={15}
                className="
                  text-zinc-400

                  dark:text-zinc-500
                "
              />

              <p
                className="
                  text-xs
                  font-semibold
                  uppercase
                  tracking-[0.14em]
                  text-zinc-400

                  dark:text-zinc-500
                "
              >
                Orbi control center
              </p>
            </div>

            <h1
              className="
                text-3xl
                font-semibold
                tracking-tight
                text-zinc-950

                dark:text-white
              "
            >
              Overview
            </h1>

            <p
              className="
                mt-2
                max-w-2xl
                text-sm
                leading-6
                text-zinc-500

                dark:text-zinc-400
              "
            >
              Monitor users,
              searches, providers
              and support activity
              across Orbi.
            </p>
          </div>

          <button
            type="button"
            onClick={() =>
              loadDashboard(
                true
              )
            }
            disabled={
              refreshing
            }
            className="
              inline-flex
              h-10
              items-center
              justify-center
              gap-2
              rounded-xl
              border
              border-zinc-200
              bg-white
              px-4
              text-sm
              font-medium
              text-zinc-700
              transition

              hover:bg-zinc-100

              disabled:cursor-not-allowed
              disabled:opacity-50

              dark:border-zinc-800
              dark:bg-zinc-900
              dark:text-zinc-300
              dark:hover:bg-zinc-800
              dark:hover:text-white
            "
          >
            {refreshing ? (
              <LoaderCircle
                size={16}
                className="animate-spin"
              />
            ) : (
              <RefreshCw
                size={16}
              />
            )}

            Refresh
          </button>
        </div>

        {/* Stats */}
        <div
          className="
            mt-8
            grid
            gap-4

            sm:grid-cols-2
            xl:grid-cols-4
          "
        >
          <StatCard
            title="Total users"
            value={
              stats.totalUsers
            }
            secondary={`+${safeNumber(
              stats.usersToday
            )} today`}
            icon={Users}
            href="/admin/users"
          />

          <StatCard
            title="Total searches"
            value={
              stats.totalSearches
            }
            secondary={`+${safeNumber(
              stats.searchesToday
            )} today`}
            icon={Search}
            href="/admin/searches"
          />

          <StatCard
            title="Saved providers"
            value={
              stats.totalSavedProviders
            }
            secondary="Across all users"
            icon={Bookmark}
            href="/admin/saved"
          />

          <StatCard
            title="Support tickets"
            value={
              stats.openSupportTickets
            }
            secondary="Open or in progress"
            icon={Headphones}
            href="/admin/support"
          />
        </div>

        {/* Main dashboard */}
        <div
          className="
            mt-6
            grid
            gap-6

            xl:grid-cols-[1.55fr_0.85fr]
          "
        >
          {/* Search activity */}
          <DashboardCard>
            <CardHeader
              title="Search activity"
              description="Orbi searches during the last 7 days."
              icon={
                TrendingUp
              }
            />

            <div
              className="
                mt-8
                h-[250px]
              "
            >
              {dashboard
                .searchActivity
                .length >
              0 ? (
                <div
                  className="
                    flex
                    h-full
                    items-end
                    gap-2

                    sm:gap-4
                  "
                >
                  {dashboard.searchActivity.map(
                    (
                      item,
                      index
                    ) => {
                      const searches =
                        safeNumber(
                          item.searches
                        );

                      const height =
                        Math.max(
                          searches >
                            0
                            ? 8
                            : 2,
                          (
                            searches /
                            maxActivity
                          ) *
                            100
                        );

                      return (
                        <div
                          key={`${item.date}-${index}`}
                          className="
                            flex
                            h-full
                            min-w-0
                            flex-1
                            flex-col
                            justify-end
                          "
                        >
                          <div
                            className="
                              mb-2
                              text-center
                              text-xs
                              font-semibold
                              text-zinc-700

                              dark:text-zinc-300
                            "
                          >
                            {
                              searches
                            }
                          </div>

                          <div
                            className="
                              flex
                              h-[190px]
                              items-end
                              justify-center
                              rounded-xl
                              bg-zinc-50
                              px-1.5

                              dark:bg-zinc-950
                            "
                          >
                            <div
                              title={`${searches} searches`}
                              className="
                                w-full
                                max-w-12
                                rounded-lg
                                bg-zinc-900
                                transition-all

                                dark:bg-zinc-200
                              "
                              style={{
                                height:
                                  `${height}%`,
                              }}
                            />
                          </div>

                          <p
                            className="
                              mt-2
                              truncate
                              text-center
                              text-[11px]
                              font-medium
                              text-zinc-400

                              dark:text-zinc-500
                            "
                          >
                            {formatChartDate(
                              item.date
                            )}
                          </p>
                        </div>
                      );
                    }
                  )}
                </div>
              ) : (
                <EmptyState
                  icon={
                    TrendingUp
                  }
                  title="No search activity yet"
                  description="Search activity will appear here as people use Orbi."
                />
              )}
            </div>
          </DashboardCard>

          {/* Popular services */}
          <DashboardCard>
            <CardHeader
              title="Popular services"
              description="Most searched service categories."
              icon={
                Sparkles
              }
            />

            <div
              className="
                mt-6
                space-y-3
              "
            >
              {dashboard
                .topServices
                .length >
              0 ? (
                dashboard.topServices.map(
                  (
                    item,
                    index
                  ) => {
                    const count =
                      safeNumber(
                        item.searches
                      );

                    const largest =
                      Math.max(
                        1,
                        ...dashboard.topServices.map(
                          (
                            service
                          ) =>
                            safeNumber(
                              service.searches
                            )
                        )
                      );

                    const percentage =
                      Math.max(
                        5,
                        (
                          count /
                          largest
                        ) *
                          100
                      );

                    return (
                      <div
                        key={`${item.service}-${index}`}
                        className="
                          rounded-xl
                          border
                          border-zinc-100
                          p-3

                          dark:border-zinc-800
                        "
                      >
                        <div
                          className="
                            flex
                            items-center
                            justify-between
                            gap-4
                          "
                        >
                          <div
                            className="
                              min-w-0
                            "
                          >
                            <p
                              className="
                                truncate
                                text-sm
                                font-semibold
                                text-zinc-900

                                dark:text-zinc-100
                              "
                            >
                              {formatService(
                                item.service
                              )}
                            </p>

                            <p
                              className="
                                mt-0.5
                                text-xs
                                text-zinc-400

                                dark:text-zinc-500
                              "
                            >
                              {formatNumber(
                                count
                              )}{" "}
                              {count ===
                              1
                                ? "search"
                                : "searches"}
                            </p>
                          </div>

                          <span
                            className="
                              flex
                              h-7
                              w-7
                              shrink-0
                              items-center
                              justify-center
                              rounded-lg
                              bg-zinc-100
                              text-xs
                              font-semibold
                              text-zinc-600

                              dark:bg-zinc-800
                              dark:text-zinc-300
                            "
                          >
                            {index +
                              1}
                          </span>
                        </div>

                        <div
                          className="
                            mt-3
                            h-1.5
                            overflow-hidden
                            rounded-full
                            bg-zinc-100

                            dark:bg-zinc-800
                          "
                        >
                          <div
                            className="
                              h-full
                              rounded-full
                              bg-zinc-900

                              dark:bg-zinc-200
                            "
                            style={{
                              width:
                                `${percentage}%`,
                            }}
                          />
                        </div>
                      </div>
                    );
                  }
                )
              ) : (
                <EmptyState
                  icon={
                    Search
                  }
                  title="No services yet"
                  description="Popular services will appear after users start searching."
                />
              )}
            </div>

            <Link
              href="/admin/searches"
              className="
                mt-5
                flex
                items-center
                justify-center
                gap-2
                rounded-xl
                border
                border-zinc-200
                py-2.5
                text-sm
                font-medium
                text-zinc-600
                transition

                hover:bg-zinc-50
                hover:text-zinc-950

                dark:border-zinc-800
                dark:text-zinc-400
                dark:hover:bg-zinc-800
                dark:hover:text-white
              "
            >
              View searches

              <ArrowRight
                size={15}
              />
            </Link>
          </DashboardCard>
        </div>

        {/* Recent data */}
        <div
          className="
            mt-6
            grid
            gap-6

            xl:grid-cols-2
          "
        >
          {/* Recent searches */}
          <DashboardCard>
            <CardHeader
              title="Recent searches"
              description="Latest searches performed on Orbi."
              icon={
                Search
              }
              action={
                <Link
                  href="/admin/searches"
                  className="
                    text-xs
                    font-semibold
                    text-zinc-500
                    transition

                    hover:text-zinc-950

                    dark:text-zinc-400
                    dark:hover:text-white
                  "
                >
                  View all
                </Link>
              }
            />

            <div
              className="
                mt-5
                divide-y
                divide-zinc-100

                dark:divide-zinc-800
              "
            >
              {dashboard
                .recentSearches
                .length >
              0 ? (
                dashboard.recentSearches.map(
                  (item) => (
                    <div
                      key={
                        item.id
                      }
                      className="
                        flex
                        gap-3
                        py-4
                        first:pt-0
                        last:pb-0
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
                          rounded-xl
                          bg-zinc-100
                          text-zinc-600

                          dark:bg-zinc-800
                          dark:text-zinc-300
                        "
                      >
                        <Search
                          size={16}
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
                            text-sm
                            font-semibold
                            text-zinc-900

                            dark:text-zinc-100
                          "
                        >
                          {safeText(
                            item.query,
                            "Search"
                          )}
                        </p>

                        <div
                          className="
                            mt-1
                            flex
                            flex-wrap
                            items-center
                            gap-x-3
                            gap-y-1
                          "
                        >
                          <span
                            className="
                              text-xs
                              text-zinc-500

                              dark:text-zinc-400
                            "
                          >
                            {formatService(
                              item.service
                            )}
                          </span>

                          {item.location && (
                            <span
                              className="
                                text-xs
                                text-zinc-400

                                dark:text-zinc-500
                              "
                            >
                              {
                                item.location
                              }
                            </span>
                          )}

                          <span
                            className="
                              text-xs
                              text-zinc-400

                              dark:text-zinc-500
                            "
                          >
                            {formatRelativeTime(
                              item.createdAt
                            )}
                          </span>
                        </div>

                        <div
                          className="
                            mt-2
                            flex
                            items-center
                            justify-between
                            gap-3
                          "
                        >
                          <p
                            className="
                              truncate
                              text-xs
                              text-zinc-400

                              dark:text-zinc-500
                            "
                          >
                            by{" "}
                            {safeText(
                              item.user
                                ?.name,
                              item.user
                                ?.email ??
                                "Unknown user"
                            )}
                          </p>

                          <span
                            className="
                              shrink-0
                              rounded-md
                              bg-zinc-100
                              px-2
                              py-1
                              text-[10px]
                              font-semibold
                              text-zinc-500

                              dark:bg-zinc-800
                              dark:text-zinc-400
                            "
                          >
                            {safeNumber(
                              item.resultCount
                            )}{" "}
                            results
                          </span>
                        </div>
                      </div>
                    </div>
                  )
                )
              ) : (
                <EmptyState
                  icon={
                    Search
                  }
                  title="No searches yet"
                  description="Recent user searches will appear here."
                />
              )}
            </div>
          </DashboardCard>

          {/* Recent users */}
          <DashboardCard>
            <CardHeader
              title="Recent users"
              description="Newest Orbi accounts."
              icon={
                Users
              }
              action={
                <Link
                  href="/admin/users"
                  className="
                    text-xs
                    font-semibold
                    text-zinc-500
                    transition

                    hover:text-zinc-950

                    dark:text-zinc-400
                    dark:hover:text-white
                  "
                >
                  View all
                </Link>
              }
            />

            <div
              className="
                mt-5
                divide-y
                divide-zinc-100

                dark:divide-zinc-800
              "
            >
              {dashboard
                .recentUsers
                .length >
              0 ? (
                dashboard.recentUsers.map(
                  (user) => (
                    <div
                      key={
                        user.id
                      }
                      className="
                        flex
                        items-center
                        gap-3
                        py-4
                        first:pt-0
                        last:pb-0
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
                          rounded-full
                          bg-zinc-900
                          text-xs
                          font-semibold
                          text-white

                          dark:bg-zinc-800
                        "
                      >
                        {getInitials(
                          user.name
                        )}
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
                            text-sm
                            font-semibold
                            text-zinc-900

                            dark:text-zinc-100
                          "
                        >
                          {safeText(
                            user.name,
                            "Orbi user"
                          )}
                        </p>

                        <p
                          className="
                            mt-0.5
                            truncate
                            text-xs
                            text-zinc-400

                            dark:text-zinc-500
                          "
                        >
                          {safeText(
                            user.email
                          )}
                        </p>
                      </div>

                      <div
                        className="
                          text-right
                        "
                      >
                        <RoleBadge
                          role={
                            user.role
                          }
                        />

                        <p
                          className="
                            mt-1.5
                            text-[10px]
                            text-zinc-400

                            dark:text-zinc-500
                          "
                        >
                          {formatRelativeTime(
                            user.createdAt
                          )}
                        </p>
                      </div>
                    </div>
                  )
                )
              ) : (
                <EmptyState
                  icon={
                    Users
                  }
                  title="No users yet"
                  description="New Orbi accounts will appear here."
                />
              )}
            </div>
          </DashboardCard>
        </div>

        {/* Quick access */}
        <div
          className="
            mt-6
            grid
            gap-4

            md:grid-cols-3
          "
        >
          <QuickAction
            href="/admin/users"
            title="Manage users"
            description="View accounts and manage user roles."
            icon={Users}
          />

          <QuickAction
            href="/admin/support"
            title="Support inbox"
            description="Review and resolve support requests."
            icon={
              Headphones
            }
          />

          <QuickAction
            href="/admin/system"
            title="System status"
            description="Check database, AI, email and provider services."
            icon={
              ShieldCheck
            }
          />
        </div>

        {/* Footer info */}
        <div
          className="
            mt-8
            flex
            flex-col
            gap-2
            border-t
            border-zinc-200
            pt-5
            text-xs
            text-zinc-400

            dark:border-zinc-800
            dark:text-zinc-500

            sm:flex-row
            sm:items-center
            sm:justify-between
          "
        >
          <div
            className="
              flex
              items-center
              gap-2
            "
          >
            <CalendarDays
              size={13}
            />

            Live Orbi
            administration data
          </div>

          <div
            className="
              flex
              items-center
              gap-2
            "
          >
            <Clock3
              size={13}
            />

            Last refreshed{" "}
            {new Date()
              .toLocaleTimeString(
                [],
                {
                  hour:
                    "2-digit",
                  minute:
                    "2-digit",
                }
              )}
          </div>
        </div>
      </div>
    </main>
  );
}

function StatCard({
  title,
  value,
  secondary,
  icon: Icon,
  href,
}: {
  title: string;
  value: number;
  secondary: string;
  icon:
    React.ComponentType<{
      size?: number;
      className?: string;
    }>;
  href: string;
}) {
  return (
    <Link
      href={href}
      className="
        group
        rounded-2xl
        border
        border-zinc-200
        bg-white
        p-5
        transition

        hover:border-zinc-300
        hover:shadow-sm

        dark:border-zinc-800
        dark:bg-zinc-900
        dark:hover:border-zinc-700
      "
    >
      <div
        className="
          flex
          items-start
          justify-between
          gap-4
        "
      >
        <div
          className="
            flex
            h-10
            w-10
            items-center
            justify-center
            rounded-xl
            bg-zinc-100
            text-zinc-700

            dark:bg-zinc-800
            dark:text-zinc-300
          "
        >
          <Icon
            size={18}
          />
        </div>

        <ArrowRight
          size={16}
          className="
            text-zinc-300
            transition-transform

            group-hover:translate-x-1
            group-hover:text-zinc-500

            dark:text-zinc-700
            dark:group-hover:text-zinc-400
          "
        />
      </div>

      <p
        className="
          mt-5
          text-3xl
          font-semibold
          tracking-tight
          text-zinc-950

          dark:text-white
        "
      >
        {formatNumber(
          safeNumber(value)
        )}
      </p>

      <p
        className="
          mt-1
          text-sm
          font-medium
          text-zinc-700

          dark:text-zinc-300
        "
      >
        {title}
      </p>

      <p
        className="
          mt-1
          text-xs
          text-zinc-400

          dark:text-zinc-500
        "
      >
        {secondary}
      </p>
    </Link>
  );
}

function DashboardCard({
  children,
}: {
  children:
    React.ReactNode;
}) {
  return (
    <section
      className="
        rounded-2xl
        border
        border-zinc-200
        bg-white
        p-5

        dark:border-zinc-800
        dark:bg-zinc-900

        sm:p-6
      "
    >
      {children}
    </section>
  );
}

function CardHeader({
  title,
  description,
  icon: Icon,
  action,
}: {
  title: string;
  description: string;
  icon:
    React.ComponentType<{
      size?: number;
      className?: string;
    }>;
  action?:
    React.ReactNode;
}) {
  return (
    <div
      className="
        flex
        items-start
        justify-between
        gap-4
      "
    >
      <div
        className="
          flex
          items-start
          gap-3
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
            rounded-xl
            bg-zinc-100
            text-zinc-700

            dark:bg-zinc-800
            dark:text-zinc-300
          "
        >
          <Icon
            size={16}
          />
        </div>

        <div>
          <h2
            className="
              text-sm
              font-semibold
              text-zinc-950

              dark:text-white
            "
          >
            {title}
          </h2>

          <p
            className="
              mt-1
              text-xs
              leading-5
              text-zinc-400

              dark:text-zinc-500
            "
          >
            {description}
          </p>
        </div>
      </div>

      {action}
    </div>
  );
}

function QuickAction({
  href,
  title,
  description,
  icon: Icon,
}: {
  href: string;
  title: string;
  description: string;
  icon:
    React.ComponentType<{
      size?: number;
      className?: string;
    }>;
}) {
  return (
    <Link
      href={href}
      className="
        group
        flex
        items-center
        gap-4
        rounded-2xl
        border
        border-zinc-200
        bg-white
        p-4
        transition

        hover:border-zinc-300
        hover:shadow-sm

        dark:border-zinc-800
        dark:bg-zinc-900
        dark:hover:border-zinc-700
      "
    >
      <div
        className="
          flex
          h-11
          w-11
          shrink-0
          items-center
          justify-center
          rounded-xl
          bg-zinc-100
          text-zinc-700

          dark:bg-zinc-800
          dark:text-zinc-300
        "
      >
        <Icon
          size={18}
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
            text-sm
            font-semibold
            text-zinc-900

            dark:text-white
          "
        >
          {title}
        </p>

        <p
          className="
            mt-1
            text-xs
            leading-5
            text-zinc-400

            dark:text-zinc-500
          "
        >
          {description}
        </p>
      </div>

      <ArrowRight
        size={16}
        className="
          shrink-0
          text-zinc-300
          transition-transform

          group-hover:translate-x-1
          group-hover:text-zinc-500

          dark:text-zinc-700
          dark:group-hover:text-zinc-400
        "
      />
    </Link>
  );
}

function RoleBadge({
  role,
}: {
  role: unknown;
}) {
  const value =
    typeof role ===
    "string"
      ? role
          .trim()
          .toUpperCase()
      : "USER";

  if (
    value ===
    "ADMIN"
  ) {
    return (
      <span
        className="
          inline-flex
          rounded-full
          bg-purple-50
          px-2
          py-1
          text-[10px]
          font-semibold
          text-purple-700

          dark:bg-purple-950/40
          dark:text-purple-300
        "
      >
        Admin
      </span>
    );
  }

  if (
    value ===
    "BUSINESS"
  ) {
    return (
      <span
        className="
          inline-flex
          rounded-full
          bg-blue-50
          px-2
          py-1
          text-[10px]
          font-semibold
          text-blue-700

          dark:bg-blue-950/40
          dark:text-blue-300
        "
      >
        Business
      </span>
    );
  }

  return (
    <span
      className="
        inline-flex
        rounded-full
        bg-zinc-100
        px-2
        py-1
        text-[10px]
        font-semibold
        text-zinc-600

        dark:bg-zinc-800
        dark:text-zinc-300
      "
    >
      User
    </span>
  );
}

function EmptyState({
  icon: Icon,
  title,
  description,
}: {
  icon:
    React.ComponentType<{
      size?: number;
      className?: string;
    }>;
  title: string;
  description: string;
}) {
  return (
    <div
      className="
        flex
        min-h-[160px]
        flex-col
        items-center
        justify-center
        px-5
        text-center
      "
    >
      <div
        className="
          flex
          h-11
          w-11
          items-center
          justify-center
          rounded-xl
          bg-zinc-100
          text-zinc-500

          dark:bg-zinc-800
          dark:text-zinc-400
        "
      >
        <Icon
          size={18}
        />
      </div>

      <p
        className="
          mt-3
          text-sm
          font-semibold
          text-zinc-900

          dark:text-white
        "
      >
        {title}
      </p>

      <p
        className="
          mt-1
          max-w-xs
          text-xs
          leading-5
          text-zinc-400

          dark:text-zinc-500
        "
      >
        {description}
      </p>
    </div>
  );
}

function DashboardLoading() {
  return (
    <main
      className="
        min-h-screen
        bg-zinc-50
        px-5
        py-8

        dark:bg-zinc-950

        sm:px-7
        lg:px-10
      "
    >
      <div
        className="
          mx-auto
          max-w-[1600px]
          animate-pulse
        "
      >
        <div
          className="
            h-4
            w-36
            rounded
            bg-zinc-200

            dark:bg-zinc-800
          "
        />

        <div
          className="
            mt-3
            h-9
            w-48
            rounded-lg
            bg-zinc-200

            dark:bg-zinc-800
          "
        />

        <div
          className="
            mt-8
            grid
            gap-4

            sm:grid-cols-2
            xl:grid-cols-4
          "
        >
          {Array.from({
            length: 4,
          }).map(
            (_, index) => (
              <div
                key={index}
                className="
                  h-44
                  rounded-2xl
                  bg-zinc-200

                  dark:bg-zinc-900
                "
              />
            )
          )}
        </div>

        <div
          className="
            mt-6
            grid
            gap-6

            xl:grid-cols-[1.55fr_0.85fr]
          "
        >
          <div
            className="
              h-[370px]
              rounded-2xl
              bg-zinc-200

              dark:bg-zinc-900
            "
          />

          <div
            className="
              h-[370px]
              rounded-2xl
              bg-zinc-200

              dark:bg-zinc-900
            "
          />
        </div>

        <div
          className="
            mt-6
            grid
            gap-6

            xl:grid-cols-2
          "
        >
          <div
            className="
              h-[350px]
              rounded-2xl
              bg-zinc-200

              dark:bg-zinc-900
            "
          />

          <div
            className="
              h-[350px]
              rounded-2xl
              bg-zinc-200

              dark:bg-zinc-900
            "
          />
        </div>
      </div>
    </main>
  );
}

function DashboardError({
  message,
  retry,
}: {
  message: string;
  retry: () => void;
}) {
  return (
    <main
      className="
        flex
        min-h-[calc(100vh-64px)]
        items-center
        justify-center
        bg-zinc-50
        px-5

        dark:bg-zinc-950
      "
    >
      <div
        className="
          w-full
          max-w-md
          rounded-2xl
          border
          border-zinc-200
          bg-white
          p-8
          text-center

          dark:border-zinc-800
          dark:bg-zinc-900
        "
      >
        <div
          className="
            mx-auto
            flex
            h-12
            w-12
            items-center
            justify-center
            rounded-xl
            bg-red-50
            text-red-600

            dark:bg-red-950/30
            dark:text-red-400
          "
        >
          <CircleAlert
            size={21}
          />
        </div>

        <h1
          className="
            mt-4
            text-lg
            font-semibold
            text-zinc-950

            dark:text-white
          "
        >
          Dashboard unavailable
        </h1>

        <p
          className="
            mt-2
            text-sm
            leading-6
            text-zinc-500

            dark:text-zinc-400
          "
        >
          {message}
        </p>

        <button
          type="button"
          onClick={
            retry
          }
          className="
            mt-6
            inline-flex
            h-11
            items-center
            justify-center
            gap-2
            rounded-xl
            bg-zinc-950
            px-5
            text-sm
            font-semibold
            text-white

            dark:bg-white
            dark:text-zinc-950
          "
        >
          <RefreshCw
            size={16}
          />

          Try again
        </button>
      </div>
    </main>
  );
}

function safeNumber(
  value: unknown
) {
  const number =
    Number(value);

  return Number.isFinite(
    number
  )
    ? number
    : 0;
}

function safeText(
  value: unknown,
  fallback = ""
) {
  if (
    typeof value !==
    "string"
  ) {
    return fallback;
  }

  const text =
    value.trim();

  return (
    text ||
    fallback
  );
}

function formatNumber(
  value: number
) {
  return new Intl.NumberFormat(
    "en-ZA"
  ).format(value);
}

function formatService(
  value: unknown
) {
  const text =
    safeText(
      value,
      "Unknown service"
    );

  return text
    .replace(
      /[_-]+/g,
      " "
    )
    .split(/\s+/)
    .filter(Boolean)
    .map(
      (word) =>
        word
          .charAt(0)
          .toUpperCase() +
        word
          .slice(1)
          .toLowerCase()
    )
    .join(" ");
}

function formatChartDate(
  value: string
) {
  const date =
    new Date(
      `${value}T00:00:00`
    );

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return value;
  }

  return date.toLocaleDateString(
    [],
    {
      weekday:
        "short",
    }
  );
}

function formatRelativeTime(
  value: unknown
) {
  if (
    typeof value !==
    "string"
  ) {
    return "";
  }

  const date =
    new Date(value);

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return "";
  }

  const difference =
    Date.now() -
    date.getTime();

  const minute =
    60 * 1000;

  const hour =
    60 * minute;

  const day =
    24 * hour;

  if (
    difference <
    minute
  ) {
    return "Just now";
  }

  if (
    difference <
    hour
  ) {
    const minutes =
      Math.floor(
        difference /
          minute
      );

    return `${minutes}m ago`;
  }

  if (
    difference <
    day
  ) {
    const hours =
      Math.floor(
        difference /
          hour
      );

    return `${hours}h ago`;
  }

  const days =
    Math.floor(
      difference /
        day
    );

  if (days < 7) {
    return `${days}d ago`;
  }

  return date.toLocaleDateString(
    [],
    {
      day:
        "numeric",
      month:
        "short",
    }
  );
}

function getInitials(
  value: unknown
) {
  const name =
    safeText(
      value,
      "User"
    );

  const parts =
    name
      .split(/\s+/)
      .filter(Boolean);

  if (
    parts.length ===
    0
  ) {
    return "U";
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