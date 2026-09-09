"use client";

import {
  useEffect,
  useState,
} from "react";

import Link from "next/link";

import {
  BadgeCheck,
  Bookmark,
  ExternalLink,
  LoaderCircle,
  MapPin,
  MessageCircle,
  Phone,
  Search,
  Star,
  Trash2,
} from "lucide-react";

import {
  getAccessToken,
  getSavedProviders,
  removeSavedProvider,
} from "@/lib/api";

import type {
  SavedProvider,
} from "@/lib/api";

import {
  showErrorToast,
  showSuccessToast,
} from "@/lib/toast";

export default function SavedPage() {
  const [
    providers,
    setProviders,
  ] = useState<
    SavedProvider[]
  >([]);

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    removingId,
    setRemovingId,
  ] = useState<
    string | null
  >(null);

  const [
    authenticated,
    setAuthenticated,
  ] = useState(true);

  useEffect(() => {
    const loadSaved =
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
            await getSavedProviders();

          setProviders(
            data
          );
        } catch (error) {
          showErrorToast(
            error instanceof Error
              ? error.message
              : "Unable to load saved providers."
          );
        } finally {
          setLoading(
            false
          );
        }
      };

    loadSaved();
  }, []);

  const handleRemove =
    async (
      provider:
        SavedProvider
    ) => {
      try {
        setRemovingId(
          provider.id
        );

        await removeSavedProvider(
          provider.externalProviderId,
          provider.source
        );

        setProviders(
          (current) =>
            current.filter(
              (item) =>
                item.id !==
                provider.id
            )
        );

        showSuccessToast(
          "Provider removed."
        );
      } catch (error) {
        showErrorToast(
          error instanceof Error
            ? error.message
            : "Unable to remove provider."
        );
      } finally {
        setRemovingId(
          null
        );
      }
    };

  if (loading) {
    return (
      <SavedLoading />
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
          max-w-6xl
          px-5
          pb-20
          pt-24
          sm:px-8
          md:pt-12
          lg:px-10
        "
      >
        {/* Header */}
        <div
          className="
            border-b
            border-zinc-200
            pb-8

            dark:border-zinc-800
          "
        >
          <div
            className="
              flex h-11 w-11
              items-center
              justify-center
              rounded-xl
              bg-zinc-950
              text-white

              dark:bg-white
              dark:text-zinc-950
            "
          >
            <Bookmark
              size={20}
            />
          </div>

          <h1
            className="
              mt-5
              text-3xl
              font-semibold
              tracking-tight
              text-zinc-950

              dark:text-white

              sm:text-4xl
            "
          >
            Saved providers
          </h1>

          <p
            className="
              mt-3
              max-w-xl
              text-sm
              leading-6
              text-zinc-500

              dark:text-zinc-400
            "
          >
            Providers you&apos;ve
            saved for later.
          </p>
        </div>

        {providers.length >
        0 ? (
          <>
            <div
              className="
                mt-8
                flex
                items-center
                justify-between
              "
            >
              <p
                className="
                  text-sm
                  text-zinc-500

                  dark:text-zinc-400
                "
              >
                {providers.length ===
                1
                  ? "1 saved provider"
                  : `${providers.length} saved providers`}
              </p>
            </div>

            <div
              className="
                mt-5
                grid gap-5
                lg:grid-cols-2
              "
            >
              {providers.map(
                (provider) => (
                  <SavedCard
                    key={
                      provider.id
                    }
                    provider={
                      provider
                    }
                    removing={
                      removingId ===
                      provider.id
                    }
                    onRemove={() =>
                      handleRemove(
                        provider
                      )
                    }
                  />
                )
              )}
            </div>
          </>
        ) : (
          <EmptySaved />
        )}
      </div>
    </main>
  );
}

function SavedCard({
  provider,
  removing,
  onRemove,
}: {
  provider:
    SavedProvider;

  removing: boolean;

  onRemove:
    () => void;
}) {
  const providerName =
    getProviderName(
      provider.name
    );

  const whatsappUrl =
    provider.whatsapp
      ? createWhatsAppUrl(
          provider.whatsapp,
          providerName
        )
      : null;

  return (
    <article
      className="
        rounded-2xl
        border
        border-zinc-200
        bg-white
        p-5
        transition

        hover:border-zinc-300
        hover:shadow-md

        dark:border-zinc-800
        dark:bg-zinc-900
        dark:hover:border-zinc-700
        dark:hover:shadow-black/20

        sm:p-6
      "
    >
      {/* Header */}
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

              dark:bg-zinc-800
              dark:text-white
            "
          >
            {getInitials(
              provider.name
            )}
          </div>

          <div className="min-w-0">
            <div
              className="
                flex
                items-center
                gap-2
              "
            >
              <h2
                className="
                  truncate
                  text-lg
                  font-semibold
                  text-zinc-950

                  dark:text-white
                "
              >
                {providerName}
              </h2>

              {provider.verified && (
                <BadgeCheck
                  size={17}
                  className="
                    shrink-0
                    text-blue-600

                    dark:text-blue-400
                  "
                />
              )}
            </div>

            {provider.category && (
              <p
                className="
                  mt-1
                  text-sm
                  capitalize
                  text-zinc-500

                  dark:text-zinc-400
                "
              >
                {
                  provider.category
                }
              </p>
            )}
          </div>
        </div>

        {/* Remove */}
        <button
          type="button"
          onClick={
            onRemove
          }
          disabled={
            removing
          }
          aria-label="Remove saved provider"
          className="
            flex h-9 w-9
            shrink-0
            items-center
            justify-center
            rounded-lg
            border
            border-zinc-200
            text-zinc-400
            transition

            hover:border-red-200
            hover:bg-red-50
            hover:text-red-600

            dark:border-zinc-700
            dark:text-zinc-500
            dark:hover:border-red-900
            dark:hover:bg-red-950/30
            dark:hover:text-red-400

            disabled:opacity-50
          "
        >
          {removing ? (
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

      {/* Rating */}
      <div
        className="
          mt-5
          flex
          flex-wrap
          items-center
          gap-4
        "
      >
        {provider.rating !==
          null &&
        provider.rating !==
          undefined ? (
          <span
            className="
              flex
              items-center
              gap-1.5
              text-sm
              text-zinc-800

              dark:text-zinc-200
            "
          >
            <Star
              size={15}
              className="
                fill-current
                text-amber-500
              "
            />

            <strong>
              {provider.rating.toFixed(
                1
              )}
            </strong>

            {provider.reviewCount !==
              null &&
              provider.reviewCount !==
                undefined && (
                <span
                  className="
                    text-zinc-400

                    dark:text-zinc-500
                  "
                >
                  (
                  {
                    provider.reviewCount
                  }
                  )
                </span>
              )}
          </span>
        ) : (
          <span
            className="
              text-sm
              text-zinc-400

              dark:text-zinc-500
            "
          >
            No rating data
          </span>
        )}
      </div>

      {/* Address */}
      {(provider.address ||
        provider.city) && (
        <div
          className="
            mt-4
            flex
            items-start
            gap-2
            text-sm
            leading-6
            text-zinc-500

            dark:text-zinc-400
          "
        >
          <MapPin
            size={15}
            className="
              mt-1
              shrink-0
            "
          />

          <span>
            {formatAddress(
              provider.address,
              provider.city
            )}
          </span>
        </div>
      )}

      {/* Services */}
      {Array.isArray(
        provider.services
      ) &&
        provider.services.length >
          0 && (
          <div
            className="
              mt-5
              flex
              flex-wrap
              gap-2
            "
          >
            {provider.services
              .slice(0, 4)
              .map(
                (
                  service,
                  index
                ) => (
                  <span
                    key={`${service}-${index}`}
                    className="
                      rounded-full
                      bg-zinc-100
                      px-3 py-1.5
                      text-xs
                      font-medium
                      text-zinc-600

                      dark:bg-zinc-800
                      dark:text-zinc-300
                    "
                  >
                    {service}
                  </span>
                )
              )}
          </div>
        )}

      {/* Website + Map */}
      {(provider.website ||
        provider.mapUrl) && (
        <div
          className="
            mt-5
            flex
            flex-wrap
            gap-2
          "
        >
          {provider.website && (
            <a
              href={
                provider.website
              }
              target="_blank"
              rel="noopener noreferrer"
              className="
                flex h-10
                items-center
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

                dark:border-zinc-700
                dark:text-zinc-300
                dark:hover:bg-zinc-800
                dark:hover:text-white
              "
            >
              <ExternalLink
                size={15}
              />

              Website / Book
            </a>
          )}

          {provider.mapUrl && (
            <a
              href={
                provider.mapUrl
              }
              target="_blank"
              rel="noopener noreferrer"
              className="
                flex h-10
                items-center
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

                dark:border-zinc-700
                dark:text-zinc-300
                dark:hover:bg-zinc-800
                dark:hover:text-white
              "
            >
              <MapPin
                size={15}
              />

              View map
            </a>
          )}
        </div>
      )}

      {/* Contact */}
      <div
        className="
          mt-6
          grid
          grid-cols-1
          gap-2
          border-t
          border-zinc-100
          pt-5

          dark:border-zinc-800

          sm:grid-cols-2
        "
      >
        {provider.phone ? (
          <a
            href={`tel:${provider.phone}`}
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

              dark:border-zinc-700
              dark:text-zinc-300
              dark:hover:bg-zinc-800
              dark:hover:text-white
            "
          >
            <Phone
              size={16}
            />

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

              dark:border-zinc-800
              dark:text-zinc-600
            "
          >
            <Phone
              size={16}
            />

            No phone
          </button>
        )}

        {whatsappUrl ? (
          <a
            href={
              whatsappUrl
            }
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

              dark:bg-white
              dark:text-zinc-950
              dark:hover:bg-zinc-200
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

              dark:bg-zinc-800
              dark:text-zinc-500
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

function EmptySaved() {
  return (
    <div
      className="
        mt-10
        flex
        flex-col
        items-center
        rounded-3xl
        border
        border-dashed
        border-zinc-200
        px-6 py-20
        text-center

        dark:border-zinc-800
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
        <Bookmark
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
        Nothing saved yet
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
        Save providers from your
        search results and they will
        appear here.
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
        <Search
          size={16}
        />

        Find a provider
      </Link>
    </div>
  );
}

function SignInRequired() {
  return (
    <main
      className="
        flex min-h-screen
        items-center
        justify-center
        bg-white
        px-6

        dark:bg-zinc-950
      "
    >
      <div
        className="
          max-w-md
          text-center
        "
      >
        <Bookmark
          size={30}
          className="
            mx-auto
            text-zinc-400

            dark:text-zinc-500
          "
        />

        <h1
          className="
            mt-5
            text-xl
            font-semibold
            text-zinc-950

            dark:text-white
          "
        >
          Sign in to view saved
          providers
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
          Your saved providers are
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

function SavedLoading() {
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
          max-w-6xl
          animate-pulse
        "
      >
        <div
          className="
            h-11 w-11
            rounded-xl
            bg-zinc-100

            dark:bg-zinc-800
          "
        />

        <div
          className="
            mt-5
            h-10 w-72
            rounded-lg
            bg-zinc-100

            dark:bg-zinc-800
          "
        />

        <div
          className="
            mt-4
            h-5 w-80
            max-w-full
            rounded
            bg-zinc-100

            dark:bg-zinc-800
          "
        />

        <div
          className="
            mt-12
            grid gap-5
            lg:grid-cols-2
          "
        >
          <div
            className="
              h-80
              rounded-2xl
              bg-zinc-100

              dark:bg-zinc-900
            "
          />

          <div
            className="
              h-80
              rounded-2xl
              bg-zinc-100

              dark:bg-zinc-900
            "
          />
        </div>
      </div>
    </main>
  );
}

function createWhatsAppUrl(
  phone: string,
  businessName: string
) {
  let clean =
    phone.replace(
      /\D/g,
      ""
    );

  /*
   * South African local number:
   * 082... -> 2782...
   */
  if (
    clean.startsWith(
      "0"
    )
  ) {
    clean =
      `27${clean.slice(
        1
      )}`;
  }

  const message =
    `Hi ${businessName}, ` +
    `I found your business through Orbi.`;

  return (
    `https://wa.me/${clean}` +
    `?text=${encodeURIComponent(
      message
    )}`
  );
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

/*
 * Protect the UI from malformed
 * provider names coming from
 * external APIs or old saved data.
 */
function getProviderName(
  value: unknown
): string {
  if (
    typeof value ===
    "string"
  ) {
    const name =
      value.trim();

    if (name) {
      return name;
    }
  }

  if (
    value &&
    typeof value ===
      "object"
  ) {
    const object =
      value as Record<
        string,
        unknown
      >;

    if (
      typeof object.name ===
      "string" &&
      object.name.trim()
    ) {
      return object.name.trim();
    }

    if (
      typeof object.title ===
      "string" &&
      object.title.trim()
    ) {
      return object.title.trim();
    }
  }

  return "Local provider";
}

function getInitials(
  value: unknown
) {
  const name =
    getProviderName(
      value
    );

  const words =
    name
      .split(/\s+/)
      .filter(Boolean);

  if (
    words.length === 0
  ) {
    return "LP";
  }

  if (
    words.length === 1
  ) {
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