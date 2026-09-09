"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  Bookmark,
  ChevronLeft,
  ChevronRight,
  CircleAlert,
  ExternalLink,
  Globe2,
  LoaderCircle,
  MapPin,
  Phone,
  RefreshCw,
  Search,
  ShieldCheck,
  Star,
  UserRound,
} from "lucide-react";

import {
  getAdminSavedProviders,
} from "@/lib/api";

import type {
  AdminPagination,
  AdminSavedProvider,
} from "@/lib/api";

import {
  showErrorToast,
} from "@/lib/toast";

export default function AdminSavedProvidersPage() {
  const [
    providers,
    setProviders,
  ] = useState<
    AdminSavedProvider[]
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

  const loadProviders =
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
            await getAdminSavedProviders(
              page,
              30
            );

          setProviders(
            Array.isArray(
              data.providers
            )
              ? data.providers
              : []
          );

          setPagination(
            data.pagination
          );
        } catch (error) {
          const message =
            error instanceof Error
              ? error.message
              : "Unable to load saved providers.";

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
    loadProviders();
  }, [loadProviders]);

  const filteredProviders =
    useMemo(() => {
      const value =
        filter
          .trim()
          .toLowerCase();

      if (!value) {
        return providers;
      }

      return providers.filter(
        (provider) => {
          const fields = [
            provider.name,
            provider.category,
            provider.address,
            provider.city,
            provider.phone,
            provider.website,
            provider.user?.name,
            provider.user?.email,
            provider.services?.join(
              " "
            ),
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
      filter,
      providers,
    ]);

  const stats =
    useMemo(() => {
      const verified =
        providers.filter(
          (provider) =>
            Boolean(
              provider.verified
            )
        ).length;

      const withPhone =
        providers.filter(
          (provider) =>
            Boolean(
              safeText(
                provider.phone
              )
            )
        ).length;

      const withWebsite =
        providers.filter(
          (provider) =>
            Boolean(
              safeText(
                provider.website
              )
            )
        ).length;

      return {
        verified,
        withPhone,
        withWebsite,
      };
    }, [providers]);

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
                Provider activity
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
              Saved providers
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
              Review providers saved
              by Orbi users and see
              which businesses are
              being bookmarked.
            </p>
          </div>

          <button
            type="button"
            onClick={() =>
              loadProviders(
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
            title="Total saved"
            value={
              pagination.total
            }
            description="Across all users"
          />

          <SummaryCard
            title="Verified"
            value={
              stats.verified
            }
            description="On this page"
          />

          <SummaryCard
            title="With phone"
            value={
              stats.withPhone
            }
            description="On this page"
          />

          <SummaryCard
            title="With website"
            value={
              stats.withWebsite
            }
            description="On this page"
          />
        </div>

        {/* Filter */}
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
                placeholder="Filter by provider, service, location or user..."
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
              {
                filteredProviders.length
              }{" "}
              of{" "}
              {
                providers.length
              }{" "}
              on this page
            </p>
          </div>
        </div>

        {/* Data */}
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
            <ProvidersLoading />
          ) : error ? (
            <ProvidersError
              message={
                error
              }
              retry={() =>
                loadProviders()
              }
            />
          ) : filteredProviders.length ===
            0 ? (
            <EmptyProviders
              filtering={
                Boolean(
                  filter.trim()
                )
              }
            />
          ) : (
            <>
              {/* Desktop */}
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
                    min-w-[1250px]
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
                        Provider
                      </TableHeader>

                      <TableHeader>
                        Category
                      </TableHeader>

                      <TableHeader>
                        Location
                      </TableHeader>

                      <TableHeader>
                        Contact
                      </TableHeader>

                      <TableHeader>
                        Rating
                      </TableHeader>

                      <TableHeader>
                        Saved by
                      </TableHeader>

                      <TableHeader>
                        Saved
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
                    {filteredProviders.map(
                      (
                        provider
                      ) => (
                        <tr
                          key={
                            provider.id
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
                              max-w-[280px]
                              px-5
                              py-4
                            "
                          >
                            <ProviderIdentity
                              provider={
                                provider
                              }
                            />
                          </td>

                          <td
                            className="
                              px-5
                              py-4
                            "
                          >
                            <CategoryBadge
                              value={
                                provider.category
                              }
                            />
                          </td>

                          <td
                            className="
                              max-w-[240px]
                              px-5
                              py-4
                            "
                          >
                            <LocationValue
                              provider={
                                provider
                              }
                            />
                          </td>

                          <td
                            className="
                              px-5
                              py-4
                            "
                          >
                            <ContactValue
                              provider={
                                provider
                              }
                            />
                          </td>

                          <td
                            className="
                              px-5
                              py-4
                            "
                          >
                            <RatingValue
                              provider={
                                provider
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
                            <SavedBy
                              provider={
                                provider
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
                                provider.createdAt
                              }
                            />
                          </td>
                        </tr>
                      )
                    )}
                  </tbody>
                </table>
              </div>

              {/* Mobile / tablet */}
              <div
                className="
                  divide-y
                  divide-zinc-100

                  dark:divide-zinc-800

                  xl:hidden
                "
              >
                {filteredProviders.map(
                  (
                    provider
                  ) => (
                    <ProviderCard
                      key={
                        provider.id
                      }
                      provider={
                        provider
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
          providers.length >
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
              {
                pagination.page
              }{" "}
              of{" "}
              {Math.max(
                pagination.pages,
                1
              )}{" "}
              ·{" "}
              {formatNumber(
                pagination.total
              )}{" "}
              saved providers
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

function ProviderCard({
  provider,
}: {
  provider:
    AdminSavedProvider;
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
            h-11
            w-11
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
          <Bookmark
            size={18}
          />
        </div>

        <div
          className="
            min-w-0
            flex-1
          "
        >
          <div
            className="
              flex
              flex-wrap
              items-center
              gap-2
            "
          >
            <p
              className="
                break-words
                text-sm
                font-semibold
                text-zinc-900

                dark:text-white
              "
            >
              {safeText(
                provider.name,
                "Local provider"
              )}
            </p>

            {provider.verified && (
              <VerifiedBadge />
            )}
          </div>

          {provider.description && (
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
                provider.description
              )}
            </p>
          )}
        </div>
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
          title="Category"
          value={formatCategory(
            provider.category
          )}
        />

        <DetailBox
          title="Location"
          value={
            safeText(
              provider.address
            ) ||
            safeText(
              provider.city
            ) ||
            "Not available"
          }
        />

        <DetailBox
          title="Phone"
          value={
            safeText(
              provider.phone,
              "Not available"
            )
          }
        />

        <DetailBox
          title="Rating"
          value={
            formatRating(
              provider.rating,
              provider.reviewCount
            )
          }
        />
      </div>

      {Array.isArray(
        provider.services
      ) &&
        provider.services.length >
          0 && (
          <div
            className="
              mt-4
              flex
              flex-wrap
              gap-2
            "
          >
            {provider.services
              .slice(
                0,
                5
              )
              .map(
                (
                  service,
                  index
                ) => (
                  <span
                    key={`${service}-${index}`}
                    className="
                      rounded-lg
                      bg-zinc-100
                      px-2.5
                      py-1
                      text-[11px]
                      font-medium
                      text-zinc-600

                      dark:bg-zinc-800
                      dark:text-zinc-300
                    "
                  >
                    {formatCategory(
                      service
                    )}
                  </span>
                )
              )}
          </div>
        )}

      <div
        className="
          mt-5
          flex
          flex-col
          gap-4
          border-t
          border-zinc-100
          pt-4

          dark:border-zinc-800

          sm:flex-row
          sm:items-center
          sm:justify-between
        "
      >
        <div>
          <p
            className="
              text-[10px]
              font-semibold
              uppercase
              tracking-wide
              text-zinc-400

              dark:text-zinc-500
            "
          >
            Saved by
          </p>

          <p
            className="
              mt-1
              text-sm
              font-medium
              text-zinc-800

              dark:text-zinc-200
            "
          >
            {safeText(
              provider.user?.name,
              "Unknown user"
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
            {safeText(
              provider.user?.email
            )}
          </p>
        </div>

        <div
          className="
            flex
            flex-wrap
            items-center
            gap-2
          "
        >
          {provider.website && (
            <a
              href={
                normalizeWebsite(
                  provider.website
                )
              }
              target="_blank"
              rel="noreferrer"
              className="
                inline-flex
                h-9
                items-center
                gap-2
                rounded-xl
                border
                border-zinc-200
                px-3
                text-xs
                font-medium
                text-zinc-600
                transition

                hover:bg-zinc-50
                hover:text-zinc-950

                dark:border-zinc-700
                dark:text-zinc-300
                dark:hover:bg-zinc-800
                dark:hover:text-white
              "
            >
              <Globe2
                size={14}
              />

              Website
            </a>
          )}

          {provider.mapUrl && (
            <a
              href={
                provider.mapUrl
              }
              target="_blank"
              rel="noreferrer"
              className="
                inline-flex
                h-9
                items-center
                gap-2
                rounded-xl
                border
                border-zinc-200
                px-3
                text-xs
                font-medium
                text-zinc-600
                transition

                hover:bg-zinc-50
                hover:text-zinc-950

                dark:border-zinc-700
                dark:text-zinc-300
                dark:hover:bg-zinc-800
                dark:hover:text-white
              "
            >
              <MapPin
                size={14}
              />

              Map
            </a>
          )}
        </div>
      </div>
    </article>
  );
}

function ProviderIdentity({
  provider,
}: {
  provider:
    AdminSavedProvider;
}) {
  return (
    <div>
      <div
        className="
          flex
          items-center
          gap-2
        "
      >
        <p
          className="
            break-words
            text-sm
            font-semibold
            text-zinc-900

            dark:text-white
          "
        >
          {safeText(
            provider.name,
            "Local provider"
          )}
        </p>

        {provider.verified && (
          <VerifiedBadge />
        )}
      </div>

      {provider.description && (
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
            provider.description
          )}
        </p>
      )}

      {provider.source && (
        <p
          className="
            mt-2
            text-[10px]
            font-medium
            uppercase
            tracking-wide
            text-zinc-400

            dark:text-zinc-600
          "
        >
          {safeText(
            provider.source
          )}
        </p>
      )}
    </div>
  );
}

function CategoryBadge({
  value,
}: {
  value: unknown;
}) {
  return (
    <span
      className="
        inline-flex
        max-w-[180px]
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
      <span
        className="truncate"
      >
        {formatCategory(
          value
        )}
      </span>
    </span>
  );
}

function LocationValue({
  provider,
}: {
  provider:
    AdminSavedProvider;
}) {
  const value =
    safeText(
      provider.address
    ) ||
    safeText(
      provider.city
    );

  if (!value) {
    return (
      <span
        className="
          text-xs
          text-zinc-400
          dark:text-zinc-500
        "
      >
        Not available
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
        {value}
      </span>
    </div>
  );
}

function ContactValue({
  provider,
}: {
  provider:
    AdminSavedProvider;
}) {
  const phone =
    safeText(
      provider.phone
    );

  const website =
    safeText(
      provider.website
    );

  if (
    !phone &&
    !website
  ) {
    return (
      <span
        className="
          text-xs
          text-zinc-400
          dark:text-zinc-500
        "
      >
        Not available
      </span>
    );
  }

  return (
    <div
      className="
        space-y-2
      "
    >
      {phone && (
        <div
          className="
            flex
            items-center
            gap-2
            text-sm
            text-zinc-600

            dark:text-zinc-300
          "
        >
          <Phone
            size={13}
            className="
              shrink-0
              text-zinc-400
            "
          />

          <span>
            {phone}
          </span>
        </div>
      )}

      {website && (
        <a
          href={
            normalizeWebsite(
              website
            )
          }
          target="_blank"
          rel="noreferrer"
          className="
            inline-flex
            items-center
            gap-1.5
            text-xs
            font-medium
            text-zinc-500
            transition

            hover:text-zinc-950

            dark:text-zinc-400
            dark:hover:text-white
          "
        >
          <ExternalLink
            size={12}
          />

          Website
        </a>
      )}
    </div>
  );
}

function RatingValue({
  provider,
}: {
  provider:
    AdminSavedProvider;
}) {
  if (
    typeof provider.rating !==
      "number" ||
    !Number.isFinite(
      provider.rating
    )
  ) {
    return (
      <span
        className="
          text-xs
          text-zinc-400
          dark:text-zinc-500
        "
      >
        No rating data
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
          text-sm
          font-semibold
          text-zinc-800

          dark:text-zinc-200
        "
      >
        <Star
          size={14}
        />

        {provider.rating.toFixed(
          1
        )}
      </div>

      {typeof provider.reviewCount ===
        "number" && (
        <p
          className="
            mt-1
            text-[10px]
            text-zinc-400
            dark:text-zinc-500
          "
        >
          {formatNumber(
            provider.reviewCount
          )}{" "}
          reviews
        </p>
      )}
    </div>
  );
}

function SavedBy({
  provider,
}: {
  provider:
    AdminSavedProvider;
}) {
  return (
    <div
      className="
        flex
        items-start
        gap-2
      "
    >
      <UserRound
        size={14}
        className="
          mt-0.5
          shrink-0
          text-zinc-400

          dark:text-zinc-500
        "
      />

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
            provider.user?.name,
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
            provider.user?.email
          )}
        </p>
      </div>
    </div>
  );
}

function VerifiedBadge() {
  return (
    <span
      className="
        inline-flex
        shrink-0
        items-center
        gap-1
        rounded-full
        bg-emerald-50
        px-2
        py-1
        text-[10px]
        font-semibold
        text-emerald-700

        dark:bg-emerald-950/40
        dark:text-emerald-300
      "
    >
      <ShieldCheck
        size={11}
      />

      Verified
    </span>
  );
}

function DateValue({
  value,
}: {
  value: unknown;
}) {
  const date =
    parseDate(
      value
    );

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
      <p
        className="
          text-xs
          font-medium
          text-zinc-600

          dark:text-zinc-300
        "
      >
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
      </p>

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
  title,
  value,
}: {
  title: string;
  value: string;
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
      <p
        className="
          text-[10px]
          font-semibold
          uppercase
          tracking-wide
          text-zinc-400

          dark:text-zinc-500
        "
      >
        {title}
      </p>

      <p
        className="
          mt-1.5
          break-words
          text-sm
          font-medium
          text-zinc-800

          dark:text-zinc-200
        "
      >
        {value}
      </p>
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

function ProvidersLoading() {
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
                  w-56
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
                  w-36
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

function ProvidersError({
  message,
  retry,
}: {
  message: string;
  retry: () => void;
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
        Unable to load providers
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

function EmptyProviders({
  filtering,
}: {
  filtering: boolean;
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
        <Bookmark
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
          ? "No matching providers"
          : "No saved providers yet"}
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
          : "Providers saved by Orbi users will appear here."}
      </p>
    </div>
  );
}

function formatCategory(
  value: unknown
) {
  const text =
    safeText(
      value,
      "Unknown"
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

function formatRating(
  rating: unknown,
  reviewCount: unknown
) {
  if (
    typeof rating !==
      "number" ||
    !Number.isFinite(
      rating
    )
  ) {
    return "No rating data";
  }

  const reviews =
    typeof reviewCount ===
      "number" &&
    Number.isFinite(
      reviewCount
    )
      ? ` (${formatNumber(
          reviewCount
        )})`
      : "";

  return `${rating.toFixed(
    1
  )}${reviews}`;
}

function normalizeWebsite(
  value: string
) {
  const website =
    value.trim();

  if (
    website.startsWith(
      "http://"
    ) ||
    website.startsWith(
      "https://"
    )
  ) {
    return website;
  }

  return `https://${website}`;
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