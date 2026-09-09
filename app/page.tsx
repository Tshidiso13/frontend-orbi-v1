// frontend/app/page.tsx
"use client";

import {
  FormEvent,
  useState,
} from "react";

import {
  useRouter,
} from "next/navigation";

import {
  ArrowUp,
  LocateFixed,
  LoaderCircle,
} from "lucide-react";

import {
  searchBusinesses,
} from "@/lib/api";

import {
  showErrorToast,
  showSuccessToast,
} from "@/lib/toast";

export default function HomePage() {
  const router =
    useRouter();

  const [
    query,
    setQuery,
  ] = useState("");

  const [
    loading,
    setLoading,
  ] = useState(false);

  const [
    locating,
    setLocating,
  ] = useState(false);

  const [
    location,
    setLocation,
  ] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);

  const handleLocation =
    () => {
      if (
        !navigator.geolocation
      ) {
        showErrorToast(
          "Location is not supported by your browser."
        );

        return;
      }

      setLocating(true);

      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            latitude:
              position.coords
                .latitude,

            longitude:
              position.coords
                .longitude,
          });

          setLocating(
            false
          );

          showSuccessToast(
            "Location added."
          );
        },

        (error) => {
          setLocating(
            false
          );

          if (
            error.code ===
            error.PERMISSION_DENIED
          ) {
            showErrorToast(
              "Location permission was denied."
            );

            return;
          }

          showErrorToast(
            "Unable to access your location."
          );
        },

        {
          enableHighAccuracy:
            true,

          timeout:
            10000,

          maximumAge:
            60000,
        }
      );
    };

  const handleSubmit =
    async (
      event:
        FormEvent
    ) => {
      event.preventDefault();

      const cleanQuery =
        query.trim();

      if (
        !cleanQuery ||
        loading
      ) {
        return;
      }

      try {
        setLoading(
          true
        );

        const data =
          await searchBusinesses({
            query:
              cleanQuery,

            ...(location ??
              {}),
          });

        /*
         * Store current search result
         * for the results page.
         */
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
        const message =
          error instanceof Error
            ? error.message
            : "Unable to search right now.";

        showErrorToast(
          message
        );
      } finally {
        setLoading(
          false
        );
      }
    };

  const examples = [
    "Fix my leaking geyser",
    "Electrician near me",
    "My washing machine is broken",
    "I need a gardener this weekend",
  ];

  return (
    <main
      className="
        min-h-screen
        bg-white
        transition-colors

        dark:bg-zinc-950
      "
    >
      <section
        className="
          flex
          min-h-screen
          items-center
          justify-center
          px-5
          py-20

          sm:px-6
        "
      >
        <div
          className="
            w-full
            max-w-3xl
            text-center
          "
        >
          {/* Small heading */}
          <p
            className="
              mb-4
              text-sm
              font-semibold
              uppercase
              tracking-widest
              text-blue-600

              dark:text-blue-400
            "
          >
            Your local AI assistant
          </p>

          {/* Main heading */}
          <h1
            className="
              text-4xl
              font-bold
              tracking-tight
              text-zinc-950

              dark:text-white

              sm:text-5xl
              md:text-6xl
            "
          >
            What do you need?
          </h1>

          {/* Description */}
          <p
            className="
              mx-auto
              mt-5
              max-w-2xl
              text-base
              leading-7
              text-zinc-600

              dark:text-zinc-400

              sm:text-lg
            "
          >
            Tell us what you need
            in your own words and
            we&apos;ll help you find
            the right local service
            provider.
          </p>

          {/* Search form */}
          <form
            onSubmit={
              handleSubmit
            }
            className="
              mx-auto
              mt-10
              max-w-2xl
            "
          >
            <div
              className="
                rounded-2xl
                border
                border-zinc-200
                bg-white
                p-3
                shadow-lg
                transition

                focus-within:border-zinc-300
                focus-within:shadow-xl

                dark:border-zinc-800
                dark:bg-zinc-900
                dark:shadow-black/20
                dark:focus-within:border-zinc-700
              "
            >
              <textarea
                value={
                  query
                }
                onChange={(
                  event
                ) =>
                  setQuery(
                    event
                      .target
                      .value
                  )
                }
                placeholder="e.g. I need a plumber tomorrow in Centurion"
                rows={4}
                disabled={
                  loading
                }
                className="
                  w-full
                  resize-none
                  rounded-xl
                  border-none
                  bg-transparent
                  p-4
                  text-base
                  text-zinc-900
                  outline-none

                  placeholder:text-zinc-400

                  disabled:opacity-60

                  dark:text-white
                  dark:placeholder:text-zinc-500
                "
              />

              {/* Form actions */}
              <div
                className="
                  flex
                  flex-col
                  gap-3
                  border-t
                  border-zinc-100
                  pt-3

                  dark:border-zinc-800

                  sm:flex-row
                  sm:items-center
                  sm:justify-between
                "
              >
                {/* Location */}
                <button
                  type="button"
                  onClick={
                    handleLocation
                  }
                  disabled={
                    loading ||
                    locating
                  }
                  className={`
                    flex
                    items-center
                    justify-center
                    gap-2
                    rounded-lg
                    px-4
                    py-2
                    text-sm
                    font-medium
                    transition

                    disabled:cursor-not-allowed
                    disabled:opacity-50

                    ${
                      location
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
                          dark:hover:bg-zinc-800
                          dark:hover:text-white
                        `
                    }
                  `}
                >
                  {locating ? (
                    <LoaderCircle
                      size={17}
                      className="animate-spin"
                    />
                  ) : (
                    <LocateFixed
                      size={17}
                    />
                  )}

                  {locating
                    ? "Getting location..."
                    : location
                      ? "Location added"
                      : "Use my location"}
                </button>

                {/* Submit */}
                <button
                  type="submit"
                  disabled={
                    loading ||
                    !query.trim()
                  }
                  className="
                    flex
                    items-center
                    justify-center
                    gap-2
                    rounded-xl
                    bg-zinc-950
                    px-6
                    py-3
                    text-sm
                    font-semibold
                    text-white
                    transition

                    hover:bg-zinc-800

                    disabled:cursor-not-allowed
                    disabled:opacity-50

                    dark:bg-white
                    dark:text-zinc-950
                    dark:hover:bg-zinc-200
                  "
                >
                  {loading ? (
                    <>
                      <LoaderCircle
                        size={17}
                        className="animate-spin"
                      />

                      Searching...
                    </>
                  ) : (
                    <>
                      Find someone

                      <ArrowUp
                        size={17}
                      />
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>

          {/* Examples */}
          <div className="mt-8">
            <p
              className="
                mb-3
                text-sm
                text-zinc-500

                dark:text-zinc-400
              "
            >
              Try asking:
            </p>

            <div
              className="
                flex
                flex-wrap
                justify-center
                gap-2
              "
            >
              {examples.map(
                (prompt) => (
                  <button
                    key={
                      prompt
                    }
                    type="button"
                    onClick={() =>
                      setQuery(
                        prompt
                      )
                    }
                    disabled={
                      loading
                    }
                    className="
                      rounded-full
                      border
                      border-zinc-200
                      bg-white
                      px-4
                      py-2
                      text-sm
                      text-zinc-600
                      transition

                      hover:border-zinc-300
                      hover:bg-zinc-50
                      hover:text-zinc-950

                      disabled:opacity-50

                      dark:border-zinc-800
                      dark:bg-zinc-900
                      dark:text-zinc-400
                      dark:hover:border-zinc-700
                      dark:hover:bg-zinc-800
                      dark:hover:text-white
                    "
                  >
                    {prompt}
                  </button>
                )
              )}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}