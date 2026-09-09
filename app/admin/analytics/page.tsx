"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import type {
  ComponentType,
} from "react";

import {
  Activity,
  BarChart3,
  Bookmark,
  CircleAlert,
  Clock3,
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

export default function AdminAnalyticsPage() {
  const [
    analytics,
    setAnalytics,
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

  const [
    lastUpdated,
    setLastUpdated,
  ] = useState<
    Date | null
  >(null);

  const loadAnalytics =
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

          setAnalytics(
            data
          );

          setLastUpdated(
            new Date()
          );
        } catch (error) {
          const message =
            error instanceof Error
              ? error.message
              : "Unable to load analytics.";

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
    loadAnalytics();
  }, [loadAnalytics]);

  const calculated =
    useMemo(() => {
      if (!analytics) {
        return {
          searchesPerUser:
            0,

          saveRate:
            0,

          averageDailySearches:
            0,

          todaySearchShare:
            0,

          sevenDayTotal:
            0,

          busiestDay:
            null as
              | {
                  date:
                    string;

                  searches:
                    number;
                }
              | null,

          topService:
            null as
              | {
                  service:
                    string;

                  searches:
                    number;
                }
              | null,
        };
      }

      const totalUsers =
        safeNumber(
          analytics.stats
            .totalUsers
        );

      const totalSearches =
        safeNumber(
          analytics.stats
            .totalSearches
        );

      const totalSaved =
        safeNumber(
          analytics.stats
            .totalSavedProviders
        );

      const searchesToday =
        safeNumber(
          analytics.stats
            .searchesToday
        );

      const sevenDayTotal =
        analytics.searchActivity.reduce(
          (
            total,
            item
          ) =>
            total +
            safeNumber(
              item.searches
            ),
          0
        );

      const busiestDay =
        analytics.searchActivity.reduce<
          | {
              date:
                string;

              searches:
                number;
            }
          | null
        >(
          (
            best,
            item
          ) => {
            const current = {
              date:
                item.date,

              searches:
                safeNumber(
                  item.searches
                ),
            };

            if (
              !best ||
              current.searches >
                best.searches
            ) {
              return current;
            }

            return best;
          },
          null
        );

      const topService =
        analytics.topServices.length >
        0
          ? analytics.topServices[0]
          : null;

      return {
        searchesPerUser:
          totalUsers > 0
            ? totalSearches /
              totalUsers
            : 0,

        saveRate:
          totalSearches > 0
            ? (
                totalSaved /
                totalSearches
              ) *
              100
            : 0,

        averageDailySearches:
          analytics.searchActivity
            .length >
          0
            ? sevenDayTotal /
              analytics
                .searchActivity
                .length
            : 0,

        todaySearchShare:
          sevenDayTotal > 0
            ? (
                searchesToday /
                sevenDayTotal
              ) *
              100
            : 0,

        sevenDayTotal,

        busiestDay,

        topService,
      };
    }, [analytics]);

  const maxSearchActivity =
    useMemo(() => {
      if (!analytics) {
        return 1;
      }

      return Math.max(
        1,
        ...analytics.searchActivity.map(
          (item) =>
            safeNumber(
              item.searches
            )
        )
      );
    }, [analytics]);

  const maxServiceSearches =
    useMemo(() => {
      if (!analytics) {
        return 1;
      }

      return Math.max(
        1,
        ...analytics.topServices.map(
          (item) =>
            safeNumber(
              item.searches
            )
        )
      );
    }, [analytics]);

  if (loading) {
    return (
      <AnalyticsLoading />
    );
  }

  if (
    error &&
    !analytics
  ) {
    return (
      <AnalyticsError
        message={
          error
        }
        retry={() =>
          loadAnalytics()
        }
      />
    );
  }

  if (!analytics) {
    return null;
  }

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

            lg:flex-row
            lg:items-end
            lg:justify-between
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
                Orbi insights
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
              Analytics
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
              Understand how
              people are using
              Orbi, which services
              are in demand and
              how search activity
              is changing.
            </p>
          </div>

          <button
            type="button"
            onClick={() =>
              loadAnalytics(
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

        {/* Main stats */}
        <div
          className="
            mt-8
            grid
            gap-4

            sm:grid-cols-2
            xl:grid-cols-4
          "
        >
          <MetricCard
            title="Total users"
            value={formatNumber(
              analytics.stats
                .totalUsers
            )}
            detail={`+${formatNumber(
              analytics.stats
                .usersToday
            )} today`}
            icon={Users}
          />

          <MetricCard
            title="Total searches"
            value={formatNumber(
              analytics.stats
                .totalSearches
            )}
            detail={`+${formatNumber(
              analytics.stats
                .searchesToday
            )} today`}
            icon={Search}
          />

          <MetricCard
            title="Saved providers"
            value={formatNumber(
              analytics.stats
                .totalSavedProviders
            )}
            detail="Across all accounts"
            icon={Bookmark}
          />

          <MetricCard
            title="Open support"
            value={formatNumber(
              analytics.stats
                .openSupportTickets
            )}
            detail="Needs attention"
            icon={CircleAlert}
          />
        </div>

        {/* Calculated metrics */}
        <div
          className="
            mt-4
            grid
            gap-4

            sm:grid-cols-2
            xl:grid-cols-4
          "
        >
          <InsightCard
            title="Searches per user"
            value={formatDecimal(
              calculated.searchesPerUser
            )}
            description="Average searches per registered account."
          />

          <InsightCard
            title="Provider save rate"
            value={`${formatDecimal(
              calculated.saveRate
            )}%`}
            description="Saved providers compared with total searches."
          />

          <InsightCard
            title="7-day average"
            value={formatDecimal(
              calculated.averageDailySearches
            )}
            description="Average searches per day during the current 7-day window."
          />

          <InsightCard
            title="7-day searches"
            value={formatNumber(
              calculated.sevenDayTotal
            )}
            description={`${formatDecimal(
              calculated.todaySearchShare
            )}% of this period occurred today.`}
          />
        </div>

        {/* Search activity */}
        <div
          className="
            mt-6
            grid
            gap-6

            xl:grid-cols-[1.45fr_0.75fr]
          "
        >
          <SectionCard>
            <SectionHeader
              icon={
                TrendingUp
              }
              title="7-day search activity"
              description="Daily search volume across Orbi."
            />

            {analytics
              .searchActivity
              .length >
            0 ? (
              <div
                className="
                  mt-8
                  overflow-x-auto
                "
              >
                <div
                  className="
                    flex
                    h-[310px]
                    min-w-[600px]
                    items-end
                    gap-3
                  "
                >
                  {analytics.searchActivity.map(
                    (
                      item,
                      index
                    ) => {
                      const searches =
                        safeNumber(
                          item.searches
                        );

                      const percentage =
                        maxSearchActivity >
                        0
                          ? (
                              searches /
                              maxSearchActivity
                            ) *
                            100
                          : 0;

                      return (
                        <div
                          key={`${item.date}-${index}`}
                          className="
                            flex
                            h-full
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
                              h-[240px]
                              items-end
                              rounded-xl
                              bg-zinc-50
                              p-2

                              dark:bg-zinc-950
                            "
                          >
                            <div
                              title={`${searches} searches`}
                              className="
                                w-full
                                rounded-lg
                                bg-zinc-950
                                transition-all
                                duration-500

                                dark:bg-white
                              "
                              style={{
                                height:
                                  `${Math.max(
                                    searches >
                                      0
                                      ? 6
                                      : 1,
                                    percentage
                                  )}%`,
                              }}
                            />
                          </div>

                          <div
                            className="
                              mt-3
                              text-center
                            "
                          >
                            <p
                              className="
                                text-xs
                                font-semibold
                                text-zinc-600

                                dark:text-zinc-300
                              "
                            >
                              {formatWeekday(
                                item.date
                              )}
                            </p>

                            <p
                              className="
                                mt-0.5
                                text-[10px]
                                text-zinc-400

                                dark:text-zinc-500
                              "
                            >
                              {formatShortDate(
                                item.date
                              )}
                            </p>
                          </div>
                        </div>
                      );
                    }
                  )}
                </div>
              </div>
            ) : (
              <EmptyAnalytics
                title="No search activity yet"
                description="Search activity will appear after users begin searching with Orbi."
              />
            )}
          </SectionCard>

          {/* Highlights */}
          <SectionCard>
            <SectionHeader
              icon={Activity}
              title="Highlights"
              description="Quick insights from current activity."
            />

            <div
              className="
                mt-6
                space-y-3
              "
            >
              <HighlightCard
                icon={
                  Search
                }
                label="Searches today"
                value={formatNumber(
                  analytics.stats
                    .searchesToday
                )}
              />

              <HighlightCard
                icon={
                  Users
                }
                label="New users today"
                value={formatNumber(
                  analytics.stats
                    .usersToday
                )}
              />

              <HighlightCard
                icon={
                  TrendingUp
                }
                label="Busiest day"
                value={
                  calculated.busiestDay
                    ? `${formatWeekday(
                        calculated
                          .busiestDay
                          .date
                      )} · ${formatNumber(
                        calculated
                          .busiestDay
                          .searches
                      )}`
                    : "No data"
                }
              />

              <HighlightCard
                icon={
                  Sparkles
                }
                label="Top service"
                value={
                  calculated.topService
                    ? `${formatService(
                        calculated
                          .topService
                          .service
                      )} · ${formatNumber(
                        calculated
                          .topService
                          .searches
                      )}`
                    : "No data"
                }
              />
            </div>
          </SectionCard>
        </div>

        {/* Top services */}
        <SectionCard
          className="mt-6"
        >
          <SectionHeader
            icon={BarChart3}
            title="Service demand"
            description="The services users are searching for most often."
          />

          {analytics
            .topServices
            .length >
          0 ? (
            <div
              className="
                mt-7
                space-y-5
              "
            >
              {analytics.topServices.map(
                (
                  service,
                  index
                ) => {
                  const searches =
                    safeNumber(
                      service.searches
                    );

                  const percentage =
                    maxServiceSearches >
                    0
                      ? (
                          searches /
                          maxServiceSearches
                        ) *
                        100
                      : 0;

                  const totalTopSearches =
                    analytics.topServices.reduce(
                      (
                        total,
                        current
                      ) =>
                        total +
                        safeNumber(
                          current.searches
                        ),
                      0
                    );

                  const share =
                    totalTopSearches >
                    0
                      ? (
                          searches /
                          totalTopSearches
                        ) *
                        100
                      : 0;

                  return (
                    <div
                      key={`${service.service}-${index}`}
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
                            flex
                            min-w-0
                            items-center
                            gap-3
                          "
                        >
                          <div
                            className="
                              flex
                              h-8
                              w-8
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
                          </div>

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

                                dark:text-white
                              "
                            >
                              {formatService(
                                service.service
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
                              {formatDecimal(
                                share
                              )}% of top
                              service
                              searches
                            </p>
                          </div>
                        </div>

                        <p
                          className="
                            shrink-0
                            text-sm
                            font-semibold
                            text-zinc-700

                            dark:text-zinc-300
                          "
                        >
                          {formatNumber(
                            searches
                          )}
                        </p>
                      </div>

                      <div
                        className="
                          mt-3
                          h-2
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
                            bg-zinc-950
                            transition-all
                            duration-500

                            dark:bg-white
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
              )}
            </div>
          ) : (
            <EmptyAnalytics
              title="No service data yet"
              description="Popular services will appear after Orbi receives searches."
            />
          )}
        </SectionCard>

        {/* Platform totals */}
        <div
          className="
            mt-6
            grid
            gap-6

            lg:grid-cols-2
          "
        >
          <SectionCard>
            <SectionHeader
              icon={Users}
              title="User activity"
              description="Account growth and search usage."
            />

            <div
              className="
                mt-6
                space-y-4
              "
            >
              <AnalyticsRow
                label="Registered users"
                value={formatNumber(
                  analytics.stats
                    .totalUsers
                )}
              />

              <AnalyticsRow
                label="New users today"
                value={formatNumber(
                  analytics.stats
                    .usersToday
                )}
              />

              <AnalyticsRow
                label="Searches per user"
                value={formatDecimal(
                  calculated.searchesPerUser
                )}
              />

              <AnalyticsRow
                label="Total searches"
                value={formatNumber(
                  analytics.stats
                    .totalSearches
                )}
              />
            </div>
          </SectionCard>

          <SectionCard>
            <SectionHeader
              icon={Bookmark}
              title="Provider engagement"
              description="How saved providers compare with search activity."
            />

            <div
              className="
                mt-6
                space-y-4
              "
            >
              <AnalyticsRow
                label="Saved providers"
                value={formatNumber(
                  analytics.stats
                    .totalSavedProviders
                )}
              />

              <AnalyticsRow
                label="Provider save rate"
                value={`${formatDecimal(
                  calculated.saveRate
                )}%`}
              />

              <AnalyticsRow
                label="Open support tickets"
                value={formatNumber(
                  analytics.stats
                    .openSupportTickets
                )}
              />

              <AnalyticsRow
                label="7-day searches"
                value={formatNumber(
                  calculated.sevenDayTotal
                )}
              />
            </div>
          </SectionCard>
        </div>

        {/* Footer */}
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
            <Activity
              size={13}
            />

            Analytics based
            on live Orbi data
          </div>

          {lastUpdated && (
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

              Updated{" "}
              {lastUpdated.toLocaleTimeString(
                [],
                {
                  hour:
                    "2-digit",

                  minute:
                    "2-digit",
                }
              )}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}

function MetricCard({
  title,
  value,
  detail,
  icon: Icon,
}: {
  title: string;
  value: string;
  detail: string;

  icon:
    ComponentType<{
      size?: number;
      className?: string;
    }>;
}) {
  return (
    <div
      className="
        rounded-2xl
        border
        border-zinc-200
        bg-white
        p-5

        dark:border-zinc-800
        dark:bg-zinc-900
      "
    >
      <div
        className="
          flex
          items-start
          justify-between
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
        {value}
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
        {detail}
      </p>
    </div>
  );
}

function InsightCard({
  title,
  value,
  description,
}: {
  title: string;
  value: string;
  description: string;
}) {
  return (
    <div
      className="
        rounded-2xl
        border
        border-zinc-200
        bg-white
        p-5

        dark:border-zinc-800
        dark:bg-zinc-900
      "
    >
      <p
        className="
          text-xs
          font-medium
          text-zinc-500

          dark:text-zinc-400
        "
      >
        {title}
      </p>

      <p
        className="
          mt-3
          text-2xl
          font-semibold
          tracking-tight
          text-zinc-950

          dark:text-white
        "
      >
        {value}
      </p>

      <p
        className="
          mt-2
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

function SectionCard({
  children,
  className = "",
}: {
  children:
    React.ReactNode;

  className?:
    string;
}) {
  return (
    <section
      className={`
        rounded-2xl
        border
        border-zinc-200
        bg-white
        p-5

        dark:border-zinc-800
        dark:bg-zinc-900

        sm:p-6

        ${className}
      `}
    >
      {children}
    </section>
  );
}

function SectionHeader({
  icon: Icon,
  title,
  description,
}: {
  icon:
    ComponentType<{
      size?: number;
      className?: string;
    }>;

  title:
    string;

  description:
    string;
}) {
  return (
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
  );
}

function HighlightCard({
  icon: Icon,
  label,
  value,
}: {
  icon:
    ComponentType<{
      size?: number;
      className?: string;
    }>;

  label:
    string;

  value:
    string;
}) {
  return (
    <div
      className="
        flex
        items-center
        gap-3
        rounded-xl
        border
        border-zinc-100
        p-4

        dark:border-zinc-800
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
          bg-zinc-100
          text-zinc-600

          dark:bg-zinc-800
          dark:text-zinc-300
        "
      >
        <Icon
          size={15}
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
            text-[11px]
            text-zinc-400

            dark:text-zinc-500
          "
        >
          {label}
        </p>

        <p
          className="
            mt-0.5
            truncate
            text-sm
            font-semibold
            text-zinc-900

            dark:text-white
          "
        >
          {value}
        </p>
      </div>
    </div>
  );
}

function AnalyticsRow({
  label,
  value,
}: {
  label:
    string;

  value:
    string;
}) {
  return (
    <div
      className="
        flex
        items-center
        justify-between
        gap-4
        border-b
        border-zinc-100
        pb-4

        last:border-b-0
        last:pb-0

        dark:border-zinc-800
      "
    >
      <p
        className="
          text-sm
          text-zinc-500

          dark:text-zinc-400
        "
      >
        {label}
      </p>

      <p
        className="
          text-sm
          font-semibold
          text-zinc-900

          dark:text-white
        "
      >
        {value}
      </p>
    </div>
  );
}

function EmptyAnalytics({
  title,
  description,
}: {
  title:
    string;

  description:
    string;
}) {
  return (
    <div
      className="
        flex
        min-h-[260px]
        flex-col
        items-center
        justify-center
        px-6
        text-center
      "
    >
      <div
        className="
          flex
          h-12
          w-12
          items-center
          justify-center
          rounded-xl
          bg-zinc-100
          text-zinc-500

          dark:bg-zinc-800
          dark:text-zinc-400
        "
      >
        <BarChart3
          size={20}
        />
      </div>

      <h3
        className="
          mt-4
          text-sm
          font-semibold
          text-zinc-950

          dark:text-white
        "
      >
        {title}
      </h3>

      <p
        className="
          mt-2
          max-w-sm
          text-xs
          leading-5
          text-zinc-500

          dark:text-zinc-400
        "
      >
        {description}
      </p>
    </div>
  );
}

function AnalyticsLoading() {
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
            w-32
            rounded
            bg-zinc-200

            dark:bg-zinc-800
          "
        />

        <div
          className="
            mt-3
            h-9
            w-44
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
            mt-4
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
                  h-36
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

            xl:grid-cols-[1.45fr_0.75fr]
          "
        >
          <div
            className="
              h-[430px]
              rounded-2xl
              bg-zinc-200

              dark:bg-zinc-900
            "
          />

          <div
            className="
              h-[430px]
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

function AnalyticsError({
  message,
  retry,
}: {
  message:
    string;

  retry:
    () => void;
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
          Analytics unavailable
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

function formatNumber(
  value: unknown
) {
  return new Intl.NumberFormat(
    "en-ZA"
  ).format(
    safeNumber(
      value
    )
  );
}

function formatDecimal(
  value: unknown
) {
  return safeNumber(
    value
  ).toFixed(1);
}

function parseDate(
  value: unknown
) {
  if (
    typeof value !==
    "string"
  ) {
    return null;
  }

  /*
   * Dashboard dates are
   * YYYY-MM-DD.
   */
  const date =
    new Date(
      `${value}T00:00:00`
    );

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return null;
  }

  return date;
}

function formatWeekday(
  value: unknown
) {
  const date =
    parseDate(
      value
    );

  if (!date) {
    return "—";
  }

  return date.toLocaleDateString(
    [],
    {
      weekday:
        "short",
    }
  );
}

function formatShortDate(
  value: unknown
) {
  const date =
    parseDate(
      value
    );

  if (!date) {
    return "—";
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

function formatService(
  value: unknown
) {
  if (
    typeof value !==
    "string" ||
    !value.trim()
  ) {
    return "Unknown service";
  }

  return value
    .trim()
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