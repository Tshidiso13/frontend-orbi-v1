"use client";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import Link from "next/link";

import {
  useRouter,
} from "next/navigation";

import {
  ArrowUpRight,
  Clock,
  LoaderCircle,
  MapPin,
  Plus,
  Search,
  Trash2,
} from "lucide-react";

import {
  clearSearchHistory,
  deleteSearchHistory,
  getAccessToken,
  getSearchHistory,
  searchBusinesses,
} from "@/lib/api";

import type {
  SearchHistoryItem,
} from "@/lib/api";

import {
  showErrorToast,
  showSuccessToast,
} from "@/lib/toast";

type GroupName =
  | "Today"
  | "Yesterday"
  | "Previous";

const groups: GroupName[] = [
  "Today",
  "Yesterday",
  "Previous",
];

export default function SearchPage() {
  const router =
    useRouter();

  const [
    recentSearches,
    setRecentSearches,
  ] = useState<
    SearchHistoryItem[]
  >([]);

  const [
    searchQuery,
    setSearchQuery,
  ] = useState("");

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    deletingId,
    setDeletingId,
  ] = useState<
    string | null
  >(null);

  const [
    reopeningId,
    setReopeningId,
  ] = useState<
    string | null
  >(null);

  const [
    clearing,
    setClearing,
  ] = useState(false);

  const [
    authenticated,
    setAuthenticated,
  ] = useState(true);

  useEffect(() => {
    const loadHistory =
      async () => {
        const token =
          getAccessToken();

        if (!token) {
          setAuthenticated(
            false
          );

          setLoading(
            false
          );

          return;
        }

        try {
          const data =
            await getSearchHistory();

          setRecentSearches(
            Array.isArray(data)
              ? data
              : []
          );
        } catch (error) {
          showErrorToast(
            error instanceof Error
              ? error.message
              : "Unable to load search history."
          );
        } finally {
          setLoading(
            false
          );
        }
      };

    loadHistory();
  }, []);

  const filteredSearches =
    useMemo(() => {
      const value =
        searchQuery
          .toLowerCase()
          .trim();

      if (!value) {
        return recentSearches;
      }

      return recentSearches.filter(
        (item) => {
          const query =
            typeof item.query ===
            "string"
              ? item.query
              : "";

          const service =
            typeof item.service ===
            "string"
              ? item.service
              : "";

          const location =
            typeof item.location ===
            "string"
              ? item.location
              : "";

          return (
            query
              .toLowerCase()
              .includes(value) ||
            service
              .toLowerCase()
              .includes(value) ||
            location
              .toLowerCase()
              .includes(value)
          );
        }
      );
    }, [
      recentSearches,
      searchQuery,
    ]);

  const deleteRecent =
    async (
      id: string
    ) => {
      try {
        setDeletingId(
          id
        );

        await deleteSearchHistory(
          id
        );

        setRecentSearches(
          (current) =>
            current.filter(
              (item) =>
                item.id !== id
            )
        );

        showSuccessToast(
          "Search removed."
        );
      } catch (error) {
        showErrorToast(
          error instanceof Error
            ? error.message
            : "Unable to delete search."
        );
      } finally {
        setDeletingId(
          null
        );
      }
    };

  const clearAll =
    async () => {
      if (
        !window.confirm(
          "Clear all search history?"
        )
      ) {
        return;
      }

      try {
        setClearing(
          true
        );

        await clearSearchHistory();

        setRecentSearches(
          []
        );

        showSuccessToast(
          "Search history cleared."
        );
      } catch (error) {
        showErrorToast(
          error instanceof Error
            ? error.message
            : "Unable to clear search history."
        );
      } finally {
        setClearing(
          false
        );
      }
    };

  const reopenSearch =
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

  if (loading) {
    return (
      <HistoryLoading />
    );
  }

  if (!authenticated) {
    return (
      <SignInRequired />
    );
  }

  return (
    <main
      className="
        min-h-screen
        bg-white

        dark:bg-zinc-950
      "
    >
      <div
        className="
          mx-auto
          w-full
          max-w-5xl
          px-5
          pb-16
          pt-24

          sm:px-8

          md:pt-12

          lg:px-12
        "
      >
        {/* Header */}
        <div
          className="
            flex
            flex-col
            gap-6

            sm:flex-row
            sm:items-end
            sm:justify-between
          "
        >
          <div>
            <p
              className="
                mb-2
                text-sm
                font-medium
                text-zinc-500

                dark:text-zinc-400
              "
            >
              Search history
            </p>

            <h1
              className="
                text-3xl
                font-semibold
                tracking-tight
                text-zinc-950

                dark:text-white

                sm:text-4xl
              "
            >
              Recent searches
            </h1>

            <p
              className="
                mt-3
                max-w-xl
                text-sm
                leading-6
                text-zinc-500

                dark:text-zinc-400

                sm:text-base
              "
            >
              Continue where you
              left off or revisit
              service providers you
              searched for before.
            </p>
          </div>

          <Link
            href="/"
            className="
              flex h-11
              items-center
              justify-center
              gap-2
              rounded-xl
              bg-zinc-950
              px-5
              text-sm
              font-semibold
              text-white
              transition

              hover:bg-zinc-800

              dark:bg-white
              dark:text-zinc-950
              dark:hover:bg-zinc-200
            "
          >
            <Plus
              size={18}
            />

            New search
          </Link>
        </div>

        {/* Filter */}
        {recentSearches.length >
          0 && (
          <div
            className="
              mt-10
              flex
              flex-col
              gap-3

              sm:flex-row
            "
          >
            <div
              className="
                relative
                flex-1
              "
            >
              <Search
                size={18}
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
                type="text"
                value={
                  searchQuery
                }
                onChange={(
                  event
                ) =>
                  setSearchQuery(
                    event
                      .target
                      .value
                  )
                }
                placeholder="Search your recents..."
                className="
                  h-12
                  w-full
                  rounded-xl
                  border
                  border-zinc-200
                  bg-white
                  pl-11
                  pr-4
                  text-sm
                  text-zinc-900
                  outline-none
                  transition

                  placeholder:text-zinc-400

                  focus:border-zinc-400

                  dark:border-zinc-800
                  dark:bg-zinc-900
                  dark:text-white
                  dark:placeholder:text-zinc-500
                  dark:focus:border-zinc-600
                "
              />
            </div>

            <button
              type="button"
              onClick={
                clearAll
              }
              disabled={
                clearing
              }
              className="
                flex h-12
                items-center
                justify-center
                gap-2
                rounded-xl
                border
                border-zinc-200
                px-4
                text-sm
                font-medium
                text-zinc-500
                transition

                hover:border-red-200
                hover:bg-red-50
                hover:text-red-600

                disabled:opacity-50

                dark:border-zinc-800
                dark:text-zinc-400
                dark:hover:border-red-900
                dark:hover:bg-red-950/30
                dark:hover:text-red-400
              "
            >
              {clearing ? (
                <LoaderCircle
                  size={16}
                  className="animate-spin"
                />
              ) : (
                <Trash2
                  size={16}
                />
              )}

              Clear all
            </button>
          </div>
        )}

        {/* History */}
        {filteredSearches.length >
        0 ? (
          <div
            className="
              mt-10
              space-y-10
            "
          >
            {groups.map(
              (group) => {
                const items =
                  filteredSearches.filter(
                    (item) =>
                      getHistoryGroup(
                        item.createdAt
                      ) === group
                  );

                if (
                  items.length ===
                  0
                ) {
                  return null;
                }

                return (
                  <section
                    key={
                      group
                    }
                  >
                    <div
                      className="
                        mb-3
                        flex
                        items-center
                        gap-2
                      "
                    >
                      <Clock
                        size={14}
                        className="
                          text-zinc-400

                          dark:text-zinc-500
                        "
                      />

                      <h2
                        className="
                          text-xs
                          font-semibold
                          uppercase
                          tracking-wider
                          text-zinc-400

                          dark:text-zinc-500
                        "
                      >
                        {group}
                      </h2>
                    </div>

                    <div
                      className="
                        divide-y
                        divide-zinc-100
                        overflow-hidden
                        rounded-2xl
                        border
                        border-zinc-200
                        bg-white

                        dark:divide-zinc-800
                        dark:border-zinc-800
                        dark:bg-zinc-900
                      "
                    >
                      {items.map(
                        (item) => (
                          <div
                            key={
                              item.id
                            }
                            className="
                              group
                              flex
                              items-center
                              gap-3
                              bg-white
                              p-3
                              transition

                              hover:bg-zinc-50

                              dark:bg-zinc-900
                              dark:hover:bg-zinc-800/80

                              sm:p-4
                            "
                          >
                            {/* Search icon */}
                            <div
                              className="
                                flex
                                h-11 w-11
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
                                size={18}
                              />
                            </div>

                            {/* Search content */}
                            <button
                              type="button"
                              onClick={() =>
                                reopenSearch(
                                  item
                                )
                              }
                              disabled={
                                reopeningId ===
                                item.id
                              }
                              className="
                                min-w-0
                                flex-1
                                text-left

                                disabled:opacity-60
                              "
                            >
                              <div
                                className="
                                  flex
                                  items-center
                                  gap-2
                                "
                              >
                                <h3
                                  className="
                                    truncate
                                    text-sm
                                    font-semibold
                                    text-zinc-900

                                    dark:text-white

                                    sm:text-base
                                  "
                                >
                                  {createHistoryTitle(
                                    item
                                  )}
                                </h3>

                                {reopeningId ===
                                item.id ? (
                                  <LoaderCircle
                                    size={15}
                                    className="
                                      shrink-0
                                      animate-spin
                                      text-zinc-400

                                      dark:text-zinc-500
                                    "
                                  />
                                ) : (
                                  <ArrowUpRight
                                    size={15}
                                    className="
                                      shrink-0
                                      text-zinc-300
                                      transition

                                      group-hover:text-zinc-600

                                      dark:text-zinc-600
                                      dark:group-hover:text-zinc-300
                                    "
                                  />
                                )}
                              </div>

                              <p
                                className="
                                  mt-1
                                  truncate
                                  text-sm
                                  text-zinc-500

                                  dark:text-zinc-400
                                "
                              >
                                {
                                  item.query
                                }
                              </p>

                              <div
                                className="
                                  mt-2
                                  flex
                                  flex-wrap
                                  items-center
                                  gap-x-4
                                  gap-y-1
                                "
                              >
                                <span
                                  className="
                                    text-xs
                                    font-medium
                                    capitalize
                                    text-zinc-500

                                    dark:text-zinc-400
                                  "
                                >
                                  {formatService(
                                    item.service
                                  )}
                                </span>

                                <span
                                  className="
                                    flex
                                    items-center
                                    gap-1
                                    text-xs
                                    text-zinc-400

                                    dark:text-zinc-500
                                  "
                                >
                                  <MapPin
                                    size={12}
                                  />

                                  {getLocationLabel(
                                    item
                                  )}
                                </span>

                                <span
                                  className="
                                    text-xs
                                    text-zinc-400

                                    dark:text-zinc-500
                                  "
                                >
                                  {formatHistoryTime(
                                    item.createdAt
                                  )}
                                </span>

                                <span
                                  className="
                                    text-xs
                                    text-zinc-400

                                    dark:text-zinc-500
                                  "
                                >
                                  {
                                    item.resultCount
                                  }{" "}
                                  {item.resultCount ===
                                  1
                                    ? "provider"
                                    : "providers"}
                                </span>
                              </div>
                            </button>

                            {/* Delete */}
                            <button
                              type="button"
                              onClick={() =>
                                deleteRecent(
                                  item.id
                                )
                              }
                              disabled={
                                deletingId ===
                                item.id
                              }
                              aria-label="Delete search"
                              title="Delete search"
                              className="
                                flex
                                h-9 w-9
                                shrink-0
                                items-center
                                justify-center
                                rounded-lg
                                text-zinc-400
                                opacity-100
                                transition

                                hover:bg-red-50
                                hover:text-red-600

                                disabled:opacity-50

                                dark:text-zinc-500
                                dark:hover:bg-red-950/30
                                dark:hover:text-red-400

                                sm:opacity-0
                                sm:group-hover:opacity-100
                              "
                            >
                              {deletingId ===
                              item.id ? (
                                <LoaderCircle
                                  size={16}
                                  className="animate-spin"
                                />
                              ) : (
                                <Trash2
                                  size={16}
                                />
                              )}
                            </button>
                          </div>
                        )
                      )}
                    </div>
                  </section>
                );
              }
            )}
          </div>
        ) : recentSearches.length ===
          0 ? (
          <EmptyHistory />
        ) : (
          <NoFilteredResults />
        )}
      </div>
    </main>
  );
}

function EmptyHistory() {
  return (
    <div
      className="
        mt-24
        flex
        flex-col
        items-center
        text-center
      "
    >
      <div
        className="
          flex h-14 w-14
          items-center
          justify-center
          rounded-2xl
          bg-zinc-100
          text-zinc-500

          dark:bg-zinc-900
          dark:text-zinc-400
        "
      >
        <Clock
          size={24}
        />
      </div>

      <h2
        className="
          mt-5
          text-lg
          font-semibold
          text-zinc-900

          dark:text-white
        "
      >
        No recent searches
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
        Searches you make with Orbi
        will appear here so you can
        return to them later.
      </p>

      <Link
        href="/"
        className="
          mt-6
          flex
          items-center
          gap-2
          rounded-xl
          bg-zinc-950
          px-5 py-3
          text-sm
          font-semibold
          text-white
          transition

          hover:bg-zinc-800

          dark:bg-white
          dark:text-zinc-950
          dark:hover:bg-zinc-200
        "
      >
        <Plus
          size={17}
        />

        Start a search
      </Link>
    </div>
  );
}

function NoFilteredResults() {
  return (
    <div
      className="
        mt-20
        text-center
      "
    >
      <div
        className="
          mx-auto
          flex h-14 w-14
          items-center
          justify-center
          rounded-2xl
          bg-zinc-100

          dark:bg-zinc-900
        "
      >
        <Search
          size={24}
          className="
            text-zinc-400

            dark:text-zinc-500
          "
        />
      </div>

      <h2
        className="
          mt-4
          text-base
          font-semibold
          text-zinc-900

          dark:text-white
        "
      >
        No searches found
      </h2>

      <p
        className="
          mt-2
          text-sm
          text-zinc-500

          dark:text-zinc-400
        "
      >
        Try searching for something
        else.
      </p>
    </div>
  );
}

function SignInRequired() {
  return (
    <main
      className="
        flex
        min-h-screen
        items-center
        justify-center
        bg-white
        px-6

        dark:bg-zinc-950
      "
    >
      <div className="text-center">
        <div
          className="
            mx-auto
            flex h-14 w-14
            items-center
            justify-center
            rounded-2xl
            bg-zinc-100
            text-zinc-500

            dark:bg-zinc-900
            dark:text-zinc-400
          "
        >
          <Clock
            size={26}
          />
        </div>

        <h1
          className="
            mt-5
            text-xl
            font-semibold
            text-zinc-950

            dark:text-white
          "
        >
          Sign in to view your
          search history
        </h1>

        <p
          className="
            mt-2
            text-sm
            text-zinc-500

            dark:text-zinc-400
          "
        >
          Your previous searches are
          linked to your Orbi
          account.
        </p>

        <Link
          href="/login"
          className="
            mt-6
            inline-flex
            rounded-xl
            bg-zinc-950
            px-5 py-3
            text-sm
            font-semibold
            text-white
            transition

            hover:bg-zinc-800

            dark:bg-white
            dark:text-zinc-950
            dark:hover:bg-zinc-200
          "
        >
          Sign in
        </Link>
      </div>
    </main>
  );
}

function HistoryLoading() {
  return (
    <main
      className="
        min-h-screen
        bg-white
        px-5
        pb-20
        pt-24

        dark:bg-zinc-950

        md:pt-12
      "
    >
      <div
        className="
          mx-auto
          max-w-5xl
          animate-pulse
        "
      >
        <div
          className="
            h-5 w-28
            rounded
            bg-zinc-100

            dark:bg-zinc-800
          "
        />

        <div
          className="
            mt-4
            h-10 w-64
            rounded-lg
            bg-zinc-100

            dark:bg-zinc-800
          "
        />

        <div
          className="
            mt-4
            h-5 w-96
            max-w-full
            rounded
            bg-zinc-100

            dark:bg-zinc-800
          "
        />

        <div
          className="
            mt-10
            h-12
            rounded-xl
            bg-zinc-100

            dark:bg-zinc-900
          "
        />

        <div
          className="
            mt-10
            h-64
            rounded-2xl
            bg-zinc-100

            dark:bg-zinc-900
          "
        />
      </div>
    </main>
  );
}

function getHistoryGroup(
  createdAt: string
): GroupName {
  const date =
    new Date(createdAt);

  /*
   * Invalid date should simply
   * fall into Previous.
   */
  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return "Previous";
  }

  const now =
    new Date();

  const today =
    new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate()
    );

  const itemDate =
    new Date(
      date.getFullYear(),
      date.getMonth(),
      date.getDate()
    );

  const difference =
    today.getTime() -
    itemDate.getTime();

  const days =
    Math.round(
      difference /
        86_400_000
    );

  if (days === 0) {
    return "Today";
  }

  if (days === 1) {
    return "Yesterday";
  }

  return "Previous";
}

function formatHistoryTime(
  createdAt: string
) {
  const date =
    new Date(createdAt);

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return "";
  }

  const group =
    getHistoryGroup(
      createdAt
    );

  if (
    group === "Today" ||
    group === "Yesterday"
  ) {
    return date.toLocaleTimeString(
      [],
      {
        hour:
          "2-digit",
        minute:
          "2-digit",
      }
    );
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

function createHistoryTitle(
  item:
    SearchHistoryItem
) {
  const service =
    formatService(
      item.service
    );

  if (
    typeof item.location ===
      "string" &&
    item.location.trim()
  ) {
    return `${service} in ${item.location.trim()}`;
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

function getLocationLabel(
  item:
    SearchHistoryItem
) {
  if (
    typeof item.location ===
      "string" &&
    item.location.trim()
  ) {
    return item.location.trim();
  }

  if (
    item.latitude !==
      null &&
    item.longitude !==
      null
  ) {
    return "Current location";
  }

  return "Location not specified";
}

function formatService(
  value: unknown
) {
  if (
    typeof value !==
      "string"
  ) {
    return "Service";
  }

  const cleaned =
    value
      .trim()
      .replace(
        /[_-]+/g,
        " "
      );

  if (!cleaned) {
    return "Service";
  }

  return cleaned
    .split(/\s+/)
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