"use client";

import {
  useEffect,
  useState,
} from "react";

import Link from "next/link";
import { useRouter } from "next/navigation";

import {
  AlertTriangle,
  BadgeCheck,
  Bookmark,
  BookmarkCheck,
  CalendarDays,
  ExternalLink,
  MapPin,
  MessageCircle,
  Phone,
  RotateCcw,
  Search,
  Star,
  Wrench,
} from "lucide-react";

import type {
  BusinessSearchResult,
  SearchResponse,
} from "@/lib/api";

import {
  getSavedProviders,
  saveProvider,
  removeSavedProvider,
} from "@/lib/api";

import {
  showErrorToast,
  showSuccessToast,
} from "@/lib/toast";

export default function ResultsPage() {
  const router = useRouter();

  const [searchData, setSearchData] =
    useState<SearchResponse | null>(
      null
    );

  const [loading, setLoading] =
    useState(true);

  useEffect(() => {
    const storedSearch =
      sessionStorage.getItem(
        "latestSearch"
      );

    if (!storedSearch) {
      setLoading(false);
      return;
    }

    try {
      const parsed =
        JSON.parse(
          storedSearch
        ) as SearchResponse;

      setSearchData(parsed);
    } catch {
      sessionStorage.removeItem(
        "latestSearch"
      );
    } finally {
      setLoading(false);
    }
  }, []);

  if (loading) {
    return <ResultsLoading />;
  }

  if (!searchData) {
    return (
      <NoSearchFound
        onSearch={() =>
          router.push("/")
        }
      />
    );
  }

  const {
    query,
    request,
    results,
    totalResults,
  } = searchData;

  return (
    <main className="min-h-screen bg-white dark:bg-zinc-950">
      <div className="mx-auto w-full max-w-6xl px-5 pb-20 pt-24 sm:px-8 md:pt-12 lg:px-10">

        {/* Header */}
        <div
          className="
            flex flex-col gap-6
            border-b border-zinc-200
            pb-8
            lg:flex-row
            lg:items-end
            lg:justify-between
          "
        >
          <div className="max-w-3xl">
            <p
              className="
                mb-3 text-sm
                font-medium
                 text-zinc-500 dark:text-zinc-400
              "
            >
              Search results
            </p>

            <h1
              className="
                text-3xl
                font-semibold
                tracking-tight
                 text-zinc-950 dark:text-white
                sm:text-4xl
              "
            >
              Best matches for you
            </h1>

            <p
              className="
                mt-4 text-base
                leading-7
                 text-zinc-500 dark:text-zinc-400
              "
            >
              &ldquo;{query}&rdquo;
            </p>
          </div>

          {/* Only ONE search button */}
          <Link
            href="/"
            className="
              flex h-11
              items-center
              justify-center
              gap-2
              rounded-xl
              border border-zinc-200
              px-4
              text-sm font-medium
              text-zinc-700
              transition
              hover:bg-zinc-50
            "
          >
            <RotateCcw size={16} />

            Search again
          </Link>
        </div>

        {/* What AI understood */}
        <section
          className="
            mt-7
            rounded-2xl
            border border-zinc-200
            bg-zinc-50/70
            p-5
            sm:p-6
          "
        >
          <div
            className="
              flex items-center
              gap-2
            "
          >
            <Wrench
              size={17}
              className="text-zinc-700"
            />

            <h2
              className="
                text-sm
                font-semibold
                text-zinc-900
              "
            >
              What Orbi understood
            </h2>
          </div>

          <div
            className="
              mt-4 flex
              flex-wrap gap-2
            "
          >
            <RequestBadge
              icon={
                <Wrench size={14} />
              }
              label={formatService(
                request.service
              )}
            />

            {request.location && (
              <RequestBadge
                icon={
                  <MapPin size={14} />
                }
                label={
                  request.location
                }
              />
            )}

            {request.date && (
              <RequestBadge
                icon={
                  <CalendarDays
                    size={14}
                  />
                }
                label={
                  request.date
                }
              />
            )}

            <RequestBadge
              icon={
                <AlertTriangle
                  size={14}
                />
              }
              label={formatUrgency(
                request.urgency
              )}
            />
          </div>

          {request.problem && (
            <p
              className="
                mt-4
                text-sm
                leading-6
                 text-zinc-500 dark:text-zinc-400
              "
            >
              Problem:{" "}
              <span
                className="
                  font-medium
                  text-zinc-700
                "
              >
                {request.problem}
              </span>
            </p>
          )}
        </section>

        {/* Result count */}
        <div
          className="
            mt-10
            flex items-center
            justify-between
          "
        >
          <div>
            <h2
              className="
                text-lg
                font-semibold
                 text-zinc-950 dark:text-white
              "
            >
              {totalResults === 1
                ? "1 provider found"
                : `${totalResults} providers found`}
            </h2>

            {totalResults > 0 && (
              <p
                className="
                  mt-1
                  text-sm
                   text-zinc-500 dark:text-zinc-400
                "
              >
                Ranked by relevance
                and distance.
              </p>
            )}
          </div>
        </div>

        {/* Results */}
        {results.length > 0 ? (
          <div
            className="
              mt-6
              grid gap-5
              lg:grid-cols-2
            "
          >
            {results.map(
              (
                business,
                index
              ) => (
                <BusinessCard
                  key={business.id}
                  business={
                    business
                  }
                  query={query}
                  rank={index + 1}
                />
              )
            )}
          </div>
        ) : (
          <EmptyResults
            service={
              request.service
            }
            location={
              request.location
            }
          />
        )}
      </div>
    </main>
  );
}

function BusinessCard({
  business,
  query,
  rank,
}: {
  business: BusinessSearchResult;
  query: string;
  rank: number;
}) {
  const [saved, setSaved] =
    useState(false);

  /*
   * Check whether this provider
   * is already saved.
   */
  useEffect(() => {
  let cancelled = false;

  const checkSaved =
    async () => {
      try {
        const providers =
          await getSavedProviders();

        if (cancelled) {
          return;
        }

        setSaved(
          providers.some(
            (provider) =>
              provider.externalProviderId ===
                business.id &&
              provider.source ===
                (
                  business.source ??
                  "geoapify"
                )
          )
        );
      } catch {
        // Not signed in or
        // unable to check.
      }
    };

  checkSaved();

  return () => {
    cancelled = true;
  };
}, [
  business.id,
  business.source,
]);
  const whatsappUrl =
    business.whatsapp
      ? createWhatsAppUrl(
          business.whatsapp,
          business.name,
          query
        )
      : null;

  const handleSave = async () => {
  try {
    if (saved) {
      await removeSavedProvider(
        business.id,
        business.source ??
          "geoapify"
      );

      setSaved(false);

      showSuccessToast(
        "Removed from saved."
      );

      return;
    }

    await saveProvider(
      business
    );

    setSaved(true);

    showSuccessToast(
      "Provider saved."
    );
  } catch (error) {
    showErrorToast(
      error instanceof Error
        ? error.message
        : "Unable to update saved providers."
    );
  }
};

  return (
    <article
      className="
        rounded-2xl
        border border-zinc-200
        bg-white dark:bg-zinc-950
        p-5
        transition
        hover:border-zinc-300
        hover:shadow-md
        sm:p-6
      "
    >
      {/* Main business header */}
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
            min-w-0
            items-start
            gap-4
          "
        >
          {/* Initials */}
          <div
            className="
              flex h-12 w-12
              shrink-0
              items-center
              justify-center
              rounded-xl
              bg-zinc-950
              text-sm
              font-semibold
              text-white
            "
          >
            {getInitials(
              business.name
            )}
          </div>

          <div className="min-w-0">
            <div
              className="
                flex
                flex-wrap
                items-center
                gap-2
              "
            >
              <h3
                className="
                  text-lg
                  font-semibold
                   text-zinc-950 dark:text-white
                "
              >
                {business.name}
              </h3>

              {business.verified && (
                <BadgeCheck
                  size={17}
                  className="text-blue-600"
                />
              )}
            </div>

            <p
              className="
                mt-1
                text-sm
                capitalize
                 text-zinc-500 dark:text-zinc-400
              "
            >
              {business.category}
            </p>
          </div>
        </div>

        {/* Rank + Save */}
        <div
          className="
            flex shrink-0
            flex-col
            items-end
            gap-2
          "
        >
          <span
            className="
              rounded-full
              bg-zinc-100
              px-2.5 py-1
              text-xs
              font-medium
               text-zinc-500 dark:text-zinc-400
            "
          >
            #{rank}
          </span>

          <button
            type="button"
            onClick={
              handleSave
            }
            className={`
              flex h-9
              items-center
              justify-center
              gap-1.5
              rounded-lg
              border
              px-3
              text-xs
              font-medium
              transition

              ${
                saved
                  ? "border-zinc-950 bg-zinc-950 text-white"
                  : "border-zinc-200 bg-white dark:bg-zinc-950 text-zinc-600 hover:bg-zinc-50 hover: text-zinc-950 dark:text-white"
              }
            `}
          >
            {saved ? (
              <>
                <BookmarkCheck
                  size={15}
                />

                Saved
              </>
            ) : (
              <>
                <Bookmark
                  size={15}
                />

                Save
              </>
            )}
          </button>
        </div>
      </div>

      {/* Rating + distance */}
      <div
        className="
          mt-5
          flex flex-wrap
          items-center
          gap-x-5
          gap-y-2
        "
      >
        {business.rating !==
          null &&
        business.rating !==
          undefined ? (
          <div
            className="
              flex items-center
              gap-1.5
            "
          >
            <Star
              size={16}
              className="
                fill-current
                text-amber-500
              "
            />

            <span
              className="
                text-sm
                font-semibold
                text-zinc-800
              "
            >
              {business.rating.toFixed(
                1
              )}
            </span>

            {business.reviewCount !==
              null &&
              business.reviewCount !==
                undefined && (
                <span
                  className="
                    text-xs
                    text-zinc-400
                  "
                >
                  (
                  {
                    business.reviewCount
                  }{" "}
                  reviews)
                </span>
              )}
          </div>
        ) : (
          <span
            className="
              text-sm
              text-zinc-400
            "
          >
            No rating data
          </span>
        )}

        {business.distance !==
          null &&
          business.distance !==
            undefined && (
            <span
              className="
                flex items-center
                gap-1
                text-sm
                 text-zinc-500 dark:text-zinc-400
              "
            >
              <MapPin size={14} />

              {business.distance} km
              away
            </span>
          )}
      </div>

      {/* Description */}
      {business.description && (
        <p
          className="
            mt-4
            line-clamp-3
            text-sm
            leading-6
             text-zinc-500 dark:text-zinc-400
          "
        >
          {business.description}
        </p>
      )}

      {/* Address */}
      {(business.address ||
        business.city) && (
        <div
          className="
            mt-4
            flex items-start
            gap-2
            text-sm
             text-zinc-500 dark:text-zinc-400
          "
        >
          <MapPin
            size={15}
            className="
              mt-0.5
              shrink-0
            "
          />

          <span>
            {formatAddress(
              business.address,
              business.city
            )}
          </span>
        </div>
      )}

      {/* Services */}
      {business.services &&
        business.services.length >
          0 && (
          <div
            className="
              mt-5
              flex flex-wrap
              gap-2
            "
          >
            {business.services
              .slice(0, 4)
              .map(
                (service) => (
                  <span
                    key={
                      service
                    }
                    className="
                      rounded-full
                      bg-zinc-100
                      px-3 py-1.5
                      text-xs
                      font-medium
                      text-zinc-600
                    "
                  >
                    {service}
                  </span>
                )
              )}
          </div>
        )}

      {/* Website + Map */}
      {(business.website ||
        business.mapUrl) && (
        <div
          className="
            mt-5
            flex flex-wrap
            gap-2
          "
        >
          {business.website && (
            <a
              href={
                business.website
              }
              target="_blank"
              rel="noopener noreferrer"
              className="
                flex h-10
                items-center
                justify-center
                gap-2
                rounded-lg
                border
                border-zinc-200
                px-4
                text-sm
                font-medium
                text-zinc-700
                transition
                hover:bg-zinc-50
              "
            >
              <ExternalLink
                size={15}
              />

              Website / Book
            </a>
          )}

          {business.mapUrl && (
            <a
              href={
                business.mapUrl
              }
              target="_blank"
              rel="noopener noreferrer"
              className="
                flex h-10
                items-center
                justify-center
                gap-2
                rounded-lg
                border
                border-zinc-200
                px-4
                text-sm
                font-medium
                text-zinc-700
                transition
                hover:bg-zinc-50
              "
            >
              <MapPin size={15} />

              View map
            </a>
          )}
        </div>
      )}

      {/* Contact actions */}
      <div
        className="
          mt-6
          grid
          grid-cols-1
          gap-2
          border-t
          border-zinc-100
          pt-5
          sm:grid-cols-2
        "
      >
        {business.phone ? (
          <a
            href={`tel:${business.phone}`}
            className="
              flex h-11
              items-center
              justify-center
              gap-2
              rounded-xl
              border
              border-zinc-200
              text-sm
              font-medium
              text-zinc-700
              transition
              hover:bg-zinc-50
            "
          >
            <Phone size={16} />

            Call
          </a>
        ) : (
          <button
            type="button"
            disabled
            className="
              flex h-11
              items-center
              justify-center
              gap-2
              rounded-xl
              border
              border-zinc-200
              text-sm
              text-zinc-300
            "
          >
            <Phone size={16} />

            No phone
          </button>
        )}

        {whatsappUrl ? (
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="
              flex h-11
              items-center
              justify-center
              gap-2
              rounded-xl
              bg-zinc-950
              text-sm
              font-semibold
              text-white
              transition
              hover:bg-zinc-800
            "
          >
            <MessageCircle
              size={16}
            />

            WhatsApp
          </a>
        ) : (
          <button
            type="button"
            disabled
            className="
              flex h-11
              items-center
              justify-center
              gap-2
              rounded-xl
              bg-zinc-100
              text-sm
              text-zinc-400
            "
          >
            <MessageCircle
              size={16}
            />

            No WhatsApp
          </button>
        )}
      </div>
    </article>
  );
}

function RequestBadge({
  icon,
  label,
}: {
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <div
      className="
        flex items-center
        gap-1.5
        rounded-full
        border border-zinc-200
        bg-white dark:bg-zinc-950
        px-3 py-1.5
        text-xs
        font-medium
        text-zinc-600
      "
    >
      {icon}

      {label}
    </div>
  );
}

function EmptyResults({
  service,
  location,
}: {
  service: string;
  location: string | null;
}) {
  return (
    <div
      className="
        mt-10
        flex flex-col
        items-center
        rounded-3xl
        border
        border-dashed
        border-zinc-200
        px-6 py-20
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
           text-zinc-500 dark:text-zinc-400
        "
      >
        <Search size={24} />
      </div>

      <h2
        className="
          mt-5
          text-lg
          font-semibold
          text-zinc-900
        "
      >
        No providers found
      </h2>

      <p
        className="
          mt-2
          max-w-md
          text-sm
          leading-6
           text-zinc-500 dark:text-zinc-400
        "
      >
        We couldn&apos;t find any
        mapped{" "}
        <strong>
          {formatService(service)}
        </strong>
        {location
          ? ` providers around ${location}`
          : " providers near this location"}
        .
      </p>

      <Link
        href="/"
        className="
          mt-6
          rounded-xl
          bg-zinc-950
          px-5 py-3
          text-sm
          font-semibold
          text-white
          transition
          hover:bg-zinc-800
        "
      >
        Try another search
      </Link>
    </div>
  );
}

function NoSearchFound({
  onSearch,
}: {
  onSearch: () => void;
}) {
  return (
    <main
      className="
        flex min-h-screen
        items-center
        justify-center
        bg-white dark:bg-zinc-950
        px-6
      "
    >
      <div className="text-center">
        <Search
          size={30}
          className="
            mx-auto
            text-zinc-400
          "
        />

        <h1
          className="
            mt-5
            text-xl
            font-semibold
            text-zinc-900
          "
        >
          No search found
        </h1>

        <p
          className="
            mt-2
            text-sm
             text-zinc-500 dark:text-zinc-400
          "
        >
          Start a new search to find
          local service providers.
        </p>

        <button
          type="button"
          onClick={onSearch}
          className="
            mt-6
            rounded-xl
            bg-zinc-950
            px-5 py-3
            text-sm
            font-semibold
            text-white
            transition
            hover:bg-zinc-800
          "
        >
          Start searching
        </button>
      </div>
    </main>
  );
}

function ResultsLoading() {
  return (
    <main
      className="
        min-h-screen
        bg-white dark:bg-zinc-950
        px-5
        pb-20
        pt-24
        md:pt-12
      "
    >
      <div
        className="
          mx-auto
          max-w-6xl
          animate-pulse
        "
      >
        <div
          className="
            h-5 w-24
            rounded
            bg-zinc-100
          "
        />

        <div
          className="
            mt-8
            h-10
            w-80
            max-w-full
            rounded-lg
            bg-zinc-100
          "
        />

        <div
          className="
            mt-4
            h-5
            w-96
            max-w-full
            rounded
            bg-zinc-100
          "
        />

        <div
          className="
            mt-10
            h-32
            rounded-2xl
            bg-zinc-100
          "
        />

        <div
          className="
            mt-10
            grid gap-5
            lg:grid-cols-2
          "
        >
          <div
            className="
              h-80
              rounded-2xl
              bg-zinc-100
            "
          />

          <div
            className="
              h-80
              rounded-2xl
              bg-zinc-100
            "
          />
        </div>
      </div>
    </main>
  );
}

function createWhatsAppUrl(
  phone: string,
  businessName: string,
  query: string
) {
  const cleanPhone =
    normalizeWhatsAppNumber(
      phone
    );

  const message =
    `Hi ${businessName}, I found your business through Orbi. ` +
    `I'm looking for help with: "${query}". Are you available?`;

  return (
    `https://wa.me/${cleanPhone}` +
    `?text=${encodeURIComponent(
      message
    )}`
  );
}

function normalizeWhatsAppNumber(
  phone: string
) {
  let clean =
    phone.replace(/\D/g, "");

  /*
   * South African local:
   * 0123456789
   * becomes
   * 27123456789
   */
  if (
    clean.startsWith("0")
  ) {
    clean =
      `27${clean.slice(1)}`;
  }

  return clean;
}

function formatAddress(
  address:
    | string
    | null
    | undefined,
  city:
    | string
    | null
    | undefined
) {
  if (!address) {
    return city ?? "";
  }

  if (!city) {
    return address;
  }

  /*
   * Geoapify addresses often
   * already contain the city.
   */
  if (
    address
      .toLowerCase()
      .includes(
        city.toLowerCase()
      )
  ) {
    return address;
  }

  return `${address}, ${city}`;
}

function getInitials(
  name: string
) {
  const words = name
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  if (words.length === 0) {
    return "B";
  }

  if (words.length === 1) {
    return words[0]
      .slice(0, 2)
      .toUpperCase();
  }

  return `${words[0][0]}${
    words[
      words.length - 1
    ][0]
  }`.toUpperCase();
}

function formatService(
  value: string
) {
  if (!value) {
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

function formatUrgency(
  urgency: string
) {
  switch (urgency) {
    case "emergency":
      return "Emergency";

    case "high":
      return "High urgency";

    case "low":
      return "Low urgency";

    default:
      return "Normal urgency";
  }
}