"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  ChevronLeft,
  ChevronRight,
  CircleAlert,
  Clock3,
  LoaderCircle,
  MapPin,
  RefreshCw,
  Search,
  ShieldCheck,
  UserRound,
  Wrench,
} from "lucide-react";

import {
  getAdminSearches,
} from "@/lib/api";

import type {
  AdminSearchHistoryItem,
  AdminPagination,
} from "@/lib/api";

import {
  showErrorToast,
} from "@/lib/toast";

export default function AdminSearchesPage() {
  const [
    searches,
    setSearches,
  ] = useState<
    AdminSearchHistoryItem[]
  >([]);

  const [
    pagination,
    setPagination,
  ] = useState<AdminPagination>({
    page: 1,
    limit: 30,
    total: 0,
    pages: 1,
  });

  const [
    page,
    setPage,
  ] = useState(1);

  const [
    filter,
    setFilter,
  ] = useState("");

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

  const loadSearches =
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
            await getAdminSearches(
              page,
              30
            );

          setSearches(
            Array.isArray(
              data.searches
            )
              ? data.searches
              : []
          );

          setPagination(
            data.pagination
          );
        } catch (error) {
          const message =
            error instanceof Error
              ? error.message
              : "Unable to load searches.";

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
      [page]
    );

  useEffect(() => {
    loadSearches();
  }, [loadSearches]);

  /*
   * This filters the currently
   * loaded page.
   *
   * Later we can add server-side
   * admin search filtering.
   */
  const filteredSearches =
    useMemo(() => {
      const value =
        filter
          .trim()
          .toLowerCase();

      if (!value) {
        return searches;
      }

      return searches.filter(
        (item) => {
          const fields = [
            item.query,
            item.service,
            item.problem,
            item.location,
            item.urgency,
            item.user?.name,
            item.user?.email,
          ];

          return fields.some(
            (field) =>
              typeof field ===
                "string" &&
              field
                .toLowerCase()
                .includes(value)
          );
        }
      );
    }, [
      searches,
      filter,
    ]);

  const stats =
    useMemo(() => {
      const totalResults =
        searches.reduce(
          (
            total,
            item
          ) =>
            total +
            safeNumber(
              item.resultCount
            ),
          0
        );

      const emergencies =
        searches.filter(
          (item) =>
            normalizeUrgency(
              item.urgency
            ) ===
            "emergency"
        ).length;

      const withLocation =
        searches.filter(
          (item) =>
            Boolean(
              safeText(
                item.location
              )
            )
        ).length;

      return {
        totalResults,
        emergencies,
        withLocation,
      };
    }, [searches]);

  const previousPage =
    () => {
      if (
        page > 1
      ) {
        setPage(
          (current) =>
            current - 1
        );
      }
    };

  const nextPage =
    () => {
      if (
        page <
        pagination.pages
      ) {
        setPage(
          (current) =>
            current + 1
        );
      }
    };

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
                Search management
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
              Searches
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
              Review what users are
              asking Orbi for and how
              each request was
              interpreted.
            </p>
          </div>

          <button
            type="button"
            onClick={() =>
              loadSearches(
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
          <SummaryCard
            title="Total searches"
            value={
              pagination.total
            }
            description="Stored in Orbi"
          />

          <SummaryCard
            title="Results returned"
            value={
              stats.totalResults
            }
            description="On this page"
          />

          <SummaryCard
            title="With location"
            value={
              stats.withLocation
            }
            description="On this page"
          />

          <SummaryCard
            title="Emergencies"
            value={
              stats.emergencies
            }
            description="On this page"
          />
        </div>

        {/* Search filter */}
        <div
          className="
            mt-6
            rounded-2xl
            border
            border-zinc-200
            bg-white
            p-4

            dark:border-zinc-800
            dark:bg-zinc-900
          "
        >
          <div
            className="
              flex
              flex-col
              gap-3

              sm:flex-row
              sm:items-center
              sm:justify-between
            "
          >
            <div
              className="
                relative
                w-full

                sm:max-w-lg
              "
            >
              <Search
                size={17}
                className="
                  absolute
                  left-4
                  top-1/2
                  -translate-y-1/2
                  text-zinc-400

                  dark:text-zinc-500
                "
              />

              <input
                type="search"
                value={
                  filter
                }
                onChange={(
                  event
                ) =>
                  setFilter(
                    event.target.value
                  )
                }
                placeholder="Filter current page by query, service, location or user..."
                className="
                  h-11
                  w-full
                  rounded-xl
                  border
                  border-zinc-200
                  bg-white
                  pl-11
                  pr-4
                  text-sm
                  text-zinc-950
                  outline-none
                  transition

                  placeholder:text-zinc-400

                  focus:border-zinc-400
                  focus:ring-2
                  focus:ring-zinc-100

                  dark:border-zinc-700
                  dark:bg-zinc-950
                  dark:text-white
                  dark:placeholder:text-zinc-500
                  dark:focus:border-zinc-600
                  dark:focus:ring-zinc-800
                "
              />
            </div>

            <p
              className="
                text-xs
                text-zinc-400

                dark:text-zinc-500
              "
            >
              Showing{" "}
              {filteredSearches.length}{" "}
              of{" "}
              {searches.length} on
              this page
            </p>
          </div>
        </div>

        {/* Search records */}
        <div
          className="
            mt-5
            overflow-hidden
            rounded-2xl
            border
            border-zinc-200
            bg-white

            dark:border-zinc-800
            dark:bg-zinc-900
          "
        >
          {loading ? (
            <SearchesLoading />
          ) : error ? (
            <SearchesError
              message={
                error
              }
              retry={() =>
                loadSearches()
              }
            />
          ) : filteredSearches.length ===
            0 ? (
            <EmptySearches
              filtering={
                Boolean(
                  filter.trim()
                )
              }
            />
          ) : (
            <>
              {/* Desktop table */}
              <div
                className="
                  hidden
                  overflow-x-auto

                  xl:block
                "
              >
                <table
                  className="
                    w-full
                    min-w-[1200px]
                    border-collapse
                  "
                >
                  <thead>
                    <tr
                      className="
                        border-b
                        border-zinc-100
                        bg-zinc-50/80

                        dark:border-zinc-800
                        dark:bg-zinc-950/50
                      "
                    >
                      <TableHeader>
                        Search
                      </TableHeader>

                      <TableHeader>
                        Service
                      </TableHeader>

                      <TableHeader>
                        Location
                      </TableHeader>

                      <TableHeader>
                        Urgency
                      </TableHeader>

                      <TableHeader>
                        Results
                      </TableHeader>

                      <TableHeader>
                        User
                      </TableHeader>

                      <TableHeader>
                        Date
                      </TableHeader>
                    </tr>
                  </thead>

                  <tbody
                    className="
                      divide-y
                      divide-zinc-100

                      dark:divide-zinc-800
                    "
                  >
                    {filteredSearches.map(
                      (item) => (
                        <tr
                          key={
                            item.id
                          }
                          className="
                            align-top
                            transition

                            hover:bg-zinc-50

                            dark:hover:bg-zinc-800/40
                          "
                        >
                          <td
                            className="
                              max-w-[330px]
                              px-5
                              py-4
                            "
                          >
                            <SearchQuery
                              item={
                                item
                              }
                            />
                          </td>

                          <td
                            className="
                              px-5
                              py-4
                            "
                          >
                            <ServiceBadge
                              service={
                                item.service
                              }
                            />
                          </td>

                          <td
                            className="
                              max-w-[220px]
                              px-5
                              py-4
                            "
                          >
                            <LocationValue
                              value={
                                item.location
                              }
                            />
                          </td>

                          <td
                            className="
                              px-5
                              py-4
                            "
                          >
                            <UrgencyBadge
                              urgency={
                                item.urgency
                              }
                            />
                          </td>

                          <td
                            className="
                              px-5
                              py-4
                              text-sm
                              font-medium
                              text-zinc-700

                              dark:text-zinc-300
                            "
                          >
                            {safeNumber(
                              item.resultCount
                            )}
                          </td>

                          <td
                            className="
                              max-w-[220px]
                              px-5
                              py-4
                            "
                          >
                            <SearchUser
                              item={
                                item
                              }
                            />
                          </td>

                          <td
                            className="
                              whitespace-nowrap
                              px-5
                              py-4
                            "
                          >
                            <DateValue
                              value={
                                item.createdAt
                              }
                            />
                          </td>
                        </tr>
                      )
                    )}
                  </tbody>
                </table>
              </div>

              {/* Mobile/tablet cards */}
              <div
                className="
                  divide-y
                  divide-zinc-100

                  dark:divide-zinc-800

                  xl:hidden
                "
              >
                {filteredSearches.map(
                  (item) => (
                    <SearchCard
                      key={
                        item.id
                      }
                      item={
                        item
                      }
                    />
                  )
                )}
              </div>
            </>
          )}
        </div>

        {/* Pagination */}
        {!loading &&
          searches.length >
            0 && (
          <div
            className="
              mt-5
              flex
              flex-col
              gap-3

              sm:flex-row
              sm:items-center
              sm:justify-between
            "
          >
            <p
              className="
                text-xs
                text-zinc-400

                dark:text-zinc-500
              "
            >
              Page{" "}
              {pagination.page}{" "}
              of{" "}
              {Math.max(
                pagination.pages,
                1
              )}{" "}
              ·{" "}
              {formatNumber(
                pagination.total
              )}{" "}
              searches
            </p>

            <div
              className="
                flex
                items-center
                gap-2
              "
            >
              <button
                type="button"
                onClick={
                  previousPage
                }
                disabled={
                  page <= 1
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
                  text-zinc-600
                  transition

                  hover:bg-zinc-100

                  disabled:cursor-not-allowed
                  disabled:opacity-40

                  dark:border-zinc-800
                  dark:bg-zinc-900
                  dark:text-zinc-300
                  dark:hover:bg-zinc-800
                "
              >
                <ChevronLeft
                  size={16}
                />

                Previous
              </button>

              <button
                type="button"
                onClick={
                  nextPage
                }
                disabled={
                  page >=
                  pagination.pages
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
                  text-zinc-600
                  transition

                  hover:bg-zinc-100

                  disabled:cursor-not-allowed
                  disabled:opacity-40

                  dark:border-zinc-800
                  dark:bg-zinc-900
                  dark:text-zinc-300
                  dark:hover:bg-zinc-800
                "
              >
                Next

                <ChevronRight
                  size={16}
                />
              </button>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

function SearchCard({
  item,
}: {
  item:
    AdminSearchHistoryItem;
}) {
  return (
    <article
      className="
        p-5

        sm:p-6
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
            h-10
            w-10
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
              break-words
              text-sm
              font-semibold
              leading-6
              text-zinc-900

              dark:text-white
            "
          >
            {safeText(
              item.query,
              "Search"
            )}
          </p>

          {item.problem && (
            <p
              className="
                mt-1
                line-clamp-2
                text-xs
                leading-5
                text-zinc-500

                dark:text-zinc-400
              "
            >
              {safeText(
                item.problem
              )}
            </p>
          )}
        </div>

        <UrgencyBadge
          urgency={
            item.urgency
          }
        />
      </div>

      <div
        className="
          mt-5
          grid
          gap-3

          sm:grid-cols-2
        "
      >
        <DetailBox
          label="Service"
          icon={
            Wrench
          }
        >
          {formatService(
            item.service
          )}
        </DetailBox>

        <DetailBox
          label="Location"
          icon={
            MapPin
          }
        >
          {safeText(
            item.location,
            "Not provided"
          )}
        </DetailBox>

        <DetailBox
          label="Results"
          icon={
            Search
          }
        >
          {safeNumber(
            item.resultCount
          )}
        </DetailBox>

        <DetailBox
          label="Searched by"
          icon={
            UserRound
          }
        >
          {safeText(
            item.user?.name,
            item.user?.email ??
              "Unknown user"
          )}
        </DetailBox>
      </div>

      <div
        className="
          mt-4
          flex
          flex-wrap
          items-center
          justify-between
          gap-3
          border-t
          border-zinc-100
          pt-4

          dark:border-zinc-800
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
          {safeText(
            item.user?.email
          )}
        </p>

        <DateValue
          value={
            item.createdAt
          }
        />
      </div>
    </article>
  );
}

function SearchQuery({
  item,
}: {
  item:
    AdminSearchHistoryItem;
}) {
  return (
    <div>
      <p
        className="
          break-words
          text-sm
          font-semibold
          leading-5
          text-zinc-900

          dark:text-white
        "
      >
        {safeText(
          item.query,
          "Search"
        )}
      </p>

      {item.problem && (
        <p
          className="
            mt-1
            line-clamp-2
            text-xs
            leading-5
            text-zinc-400

            dark:text-zinc-500
          "
        >
          {safeText(
            item.problem
          )}
        </p>
      )}
    </div>
  );
}

function SearchUser({
  item,
}: {
  item:
    AdminSearchHistoryItem;
}) {
  return (
    <div
      className="
        min-w-0
      "
    >
      <p
        className="
          truncate
          text-sm
          font-medium
          text-zinc-800

          dark:text-zinc-200
        "
      >
        {safeText(
          item.user?.name,
          "Unknown user"
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
          item.user?.email
        )}
      </p>
    </div>
  );
}

function ServiceBadge({
  service,
}: {
  service: unknown;
}) {
  return (
    <span
      className="
        inline-flex
        max-w-[180px]
        items-center
        gap-1.5
        rounded-lg
        bg-zinc-100
        px-2.5
        py-1.5
        text-xs
        font-medium
        text-zinc-700

        dark:bg-zinc-800
        dark:text-zinc-300
      "
    >
      <Wrench
        size={12}
        className="shrink-0"
      />

      <span className="truncate">
        {formatService(
          service
        )}
      </span>
    </span>
  );
}

function LocationValue({
  value,
}: {
  value: unknown;
}) {
  const location =
    safeText(
      value
    );

  if (!location) {
    return (
      <span
        className="
          text-xs
          text-zinc-400

          dark:text-zinc-500
        "
      >
        Not provided
      </span>
    );
  }

  return (
    <div
      className="
        flex
        items-start
        gap-2
      "
    >
      <MapPin
        size={14}
        className="
          mt-0.5
          shrink-0
          text-zinc-400

          dark:text-zinc-500
        "
      />

      <span
        className="
          text-sm
          leading-5
          text-zinc-600

          dark:text-zinc-300
        "
      >
        {location}
      </span>
    </div>
  );
}

function UrgencyBadge({
  urgency,
}: {
  urgency: unknown;
}) {
  const value =
    normalizeUrgency(
      urgency
    );

  if (
    value ===
    "emergency"
  ) {
    return (
      <span
        className="
          inline-flex
          shrink-0
          rounded-full
          bg-red-50
          px-2.5
          py-1
          text-[11px]
          font-semibold
          capitalize
          text-red-700

          dark:bg-red-950/40
          dark:text-red-300
        "
      >
        Emergency
      </span>
    );
  }

  if (
    value ===
    "high"
  ) {
    return (
      <span
        className="
          inline-flex
          shrink-0
          rounded-full
          bg-orange-50
          px-2.5
          py-1
          text-[11px]
          font-semibold
          capitalize
          text-orange-700

          dark:bg-orange-950/40
          dark:text-orange-300
        "
      >
        High
      </span>
    );
  }

  if (
    value ===
    "low"
  ) {
    return (
      <span
        className="
          inline-flex
          shrink-0
          rounded-full
          bg-blue-50
          px-2.5
          py-1
          text-[11px]
          font-semibold
          capitalize
          text-blue-700

          dark:bg-blue-950/40
          dark:text-blue-300
        "
      >
        Low
      </span>
    );
  }

  return (
    <span
      className="
        inline-flex
        shrink-0
        rounded-full
        bg-zinc-100
        px-2.5
        py-1
        text-[11px]
        font-semibold
        capitalize
        text-zinc-600

        dark:bg-zinc-800
        dark:text-zinc-300
      "
    >
      Normal
    </span>
  );
}

function DateValue({
  value,
}: {
  value: unknown;
}) {
  const date =
    parseDate(value);

  if (!date) {
    return (
      <span
        className="
          text-xs
          text-zinc-400

          dark:text-zinc-500
        "
      >
        —
      </span>
    );
  }

  return (
    <div>
      <div
        className="
          flex
          items-center
          gap-1.5
          text-xs
          font-medium
          text-zinc-600

          dark:text-zinc-300
        "
      >
        <Clock3
          size={12}
        />

        {date.toLocaleDateString(
          [],
          {
            day:
              "numeric",
            month:
              "short",
            year:
              "numeric",
          }
        )}
      </div>

      <p
        className="
          mt-1
          text-[10px]
          text-zinc-400

          dark:text-zinc-500
        "
      >
        {date.toLocaleTimeString(
          [],
          {
            hour:
              "2-digit",
            minute:
              "2-digit",
          }
        )}
      </p>
    </div>
  );
}

function DetailBox({
  label,
  icon: Icon,
  children,
}: {
  label: string;

  icon:
    React.ComponentType<{
      size?: number;
      className?: string;
    }>;

  children:
    React.ReactNode;
}) {
  return (
    <div
      className="
        rounded-xl
        bg-zinc-50
        p-3

        dark:bg-zinc-950
      "
    >
      <div
        className="
          flex
          items-center
          gap-1.5
          text-[10px]
          font-semibold
          uppercase
          tracking-wide
          text-zinc-400

          dark:text-zinc-500
        "
      >
        <Icon
          size={12}
        />

        {label}
      </div>

      <div
        className="
          mt-1.5
          break-words
          text-sm
          font-medium
          text-zinc-800

          dark:text-zinc-200
        "
      >
        {children}
      </div>
    </div>
  );
}

function SummaryCard({
  title,
  value,
  description,
}: {
  title: string;
  value: number;
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
        {formatNumber(
          safeNumber(value)
        )}
      </p>

      <p
        className="
          mt-1
          text-xs
          text-zinc-400

          dark:text-zinc-500
        "
      >
        {description}
      </p>
    </div>
  );
}

function TableHeader({
  children,
}: {
  children:
    React.ReactNode;
}) {
  return (
    <th
      className="
        whitespace-nowrap
        px-5
        py-3
        text-left
        text-[11px]
        font-semibold
        uppercase
        tracking-wider
        text-zinc-400

        dark:text-zinc-500
      "
    >
      {children}
    </th>
  );
}

function SearchesLoading() {
  return (
    <div
      className="
        divide-y
        divide-zinc-100

        dark:divide-zinc-800
      "
    >
      {Array.from({
        length: 8,
      }).map(
        (_, index) => (
          <div
            key={index}
            className="
              flex
              animate-pulse
              items-center
              gap-4
              px-5
              py-5
            "
          >
            <div
              className="
                h-10
                w-10
                shrink-0
                rounded-xl
                bg-zinc-100

                dark:bg-zinc-800
              "
            />

            <div
              className="
                min-w-0
                flex-1
              "
            >
              <div
                className="
                  h-4
                  w-64
                  max-w-full
                  rounded
                  bg-zinc-100

                  dark:bg-zinc-800
                "
              />

              <div
                className="
                  mt-2
                  h-3
                  w-40
                  rounded
                  bg-zinc-100

                  dark:bg-zinc-800
                "
              />
            </div>
          </div>
        )
      )}
    </div>
  );
}

function SearchesError({
  message,
  retry,
}: {
  message: string;

  retry:
    () => void;
}) {
  return (
    <div
      className="
        flex
        min-h-[380px]
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
          bg-red-50
          text-red-600

          dark:bg-red-950/30
          dark:text-red-400
        "
      >
        <CircleAlert
          size={20}
        />
      </div>

      <h2
        className="
          mt-4
          text-base
          font-semibold
          text-zinc-950

          dark:text-white
        "
      >
        Unable to load searches
      </h2>

      <p
        className="
          mt-2
          max-w-md
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
          mt-5
          inline-flex
          h-10
          items-center
          gap-2
          rounded-xl
          bg-zinc-950
          px-4
          text-sm
          font-semibold
          text-white

          dark:bg-white
          dark:text-zinc-950
        "
      >
        <RefreshCw
          size={15}
        />

        Try again
      </button>
    </div>
  );
}

function EmptySearches({
  filtering,
}: {
  filtering:
    boolean;
}) {
  return (
    <div
      className="
        flex
        min-h-[380px]
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
        <Search
          size={20}
        />
      </div>

      <h2
        className="
          mt-4
          text-base
          font-semibold
          text-zinc-950

          dark:text-white
        "
      >
        {filtering
          ? "No matching searches"
          : "No searches yet"}
      </h2>

      <p
        className="
          mt-2
          max-w-sm
          text-sm
          leading-6
          text-zinc-500

          dark:text-zinc-400
        "
      >
        {filtering
          ? "Nothing on this page matches your filter."
          : "User searches will appear here after people begin using Orbi."}
      </p>
    </div>
  );
}

function normalizeUrgency(
  value: unknown
) {
  if (
    typeof value !==
    "string"
  ) {
    return "normal";
  }

  const urgency =
    value
      .trim()
      .toLowerCase();

  if (
    urgency ===
      "emergency" ||
    urgency ===
      "high" ||
    urgency ===
      "low" ||
    urgency ===
      "normal"
  ) {
    return urgency;
  }

  return "normal";
}

function formatService(
  value: unknown
) {
  const service =
    safeText(
      value,
      "Unknown service"
    );

  return service
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
  value: number
) {
  return new Intl.NumberFormat(
    "en-ZA"
  ).format(value);
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

  const date =
    new Date(value);

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return null;
  }

  return date;
}