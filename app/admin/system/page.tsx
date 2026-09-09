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
  Bot,
  CheckCircle2,
  CircleAlert,
  Clock3,
  Database,
  Gauge,
  Globe2,
  LoaderCircle,
  Mail,
  RefreshCw,
  Server,
  ShieldCheck,
  Wifi,
  WifiOff,
  XCircle,
} from "lucide-react";

import {
  getAdminSystem,
} from "@/lib/api";

import type {
  AdminSystemResponse,
} from "@/lib/api";

import {
  showErrorToast,
} from "@/lib/toast";

export default function AdminSystemPage() {
  const [
    system,
    setSystem,
  ] = useState<
    AdminSystemResponse | null
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

  const loadSystem =
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

          const result =
            await getAdminSystem();

          setSystem(
            result
          );
        } catch (error) {
          const message =
            error instanceof Error
              ? error.message
              : "Unable to check Orbi system health.";

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
    loadSystem();
  }, [loadSystem]);

  const healthyServices =
    useMemo(() => {
      if (!system) {
        return 0;
      }

      return [
        system.database
          .online,

        system.services
          .groq
          .online,

        system.services
          .geoapify
          .online,

        system.services
          .email
          .online,
      ].filter(Boolean)
        .length;
    }, [system]);

  if (loading) {
    return (
      <SystemLoading />
    );
  }

  if (
    error &&
    !system
  ) {
    return (
      <SystemError
        message={
          error
        }
        retry={() =>
          loadSystem()
        }
      />
    );
  }

  if (!system) {
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
        {/* HEADER */}

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
                Live infrastructure
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
              System
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
              Real-time health
              checks for Orbi&apos;s
              database, AI,
              provider search and
              email infrastructure.
            </p>
          </div>

          <button
            type="button"
            disabled={
              refreshing
            }
            onClick={() =>
              loadSystem(
                true
              )
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

            Run health checks
          </button>
        </div>

        {/* OVERALL STATUS */}

        <section
          className="
            mt-8
            rounded-2xl
            border
            border-zinc-200
            bg-white
            p-6

            dark:border-zinc-800
            dark:bg-zinc-900
          "
        >
          <div
            className="
              flex
              flex-col
              gap-6

              md:flex-row
              md:items-center
              md:justify-between
            "
          >
            <div
              className="
                flex
                items-center
                gap-4
              "
            >
              <div
                className={`
                  flex
                  h-14
                  w-14
                  shrink-0
                  items-center
                  justify-center
                  rounded-2xl

                  ${system.status ===
                    "operational"
                    ? `
                        bg-emerald-50
                        text-emerald-600

                        dark:bg-emerald-950/40
                        dark:text-emerald-300
                      `
                    : `
                        bg-amber-50
                        text-amber-600

                        dark:bg-amber-950/40
                        dark:text-amber-300
                      `
                  }
                `}
              >
                {system.status ===
                  "operational" ? (
                  <CheckCircle2
                    size={25}
                  />
                ) : (
                  <CircleAlert
                    size={25}
                  />
                )}
              </div>

              <div>
                <div
                  className="
                    flex
                    flex-wrap
                    items-center
                    gap-2
                  "
                >
                  <h2
                    className="
                      text-xl
                      font-semibold
                      text-zinc-950

                      dark:text-white
                    "
                  >
                    {system.status ===
                      "operational"
                      ? "All systems operational"
                      : "System degraded"}
                  </h2>

                  {system.live && (
                    <span
                      className="
                        inline-flex
                        items-center
                        gap-1.5
                        rounded-full
                        bg-emerald-50
                        px-2.5
                        py-1
                        text-[10px]
                        font-bold
                        uppercase
                        tracking-wider
                        text-emerald-700

                        dark:bg-emerald-950/40
                        dark:text-emerald-300
                      "
                    >
                      <span
                        className="
                          h-1.5
                          w-1.5
                          rounded-full
                          bg-emerald-500
                        "
                      />

                      Live
                    </span>
                  )}
                </div>

                <p
                  className="
                    mt-2
                    text-sm
                    text-zinc-500

                    dark:text-zinc-400
                  "
                >
                  {
                    healthyServices
                  }{" "}
                  of 4 core
                  services are
                  currently online.
                </p>
              </div>
            </div>

            <div
              className="
                flex
                flex-wrap
                gap-3
              "
            >
              <InfoBadge
                label="Environment"
                value={
                  system.live
                    ? "LIVE / PRODUCTION"
                    : system.environment.toUpperCase()
                }
              />

              <InfoBadge
                label="Version"
                value={
                  system.version
                }
              />
            </div>
          </div>
        </section>

        {/* SERVICES */}

        <div
          className="
            mt-6
            grid
            gap-4

            md:grid-cols-2
            xl:grid-cols-4
          "
        >
          <HealthCard
            icon={Database}
            name="PostgreSQL"
            description="Primary Orbi database"
            online={
              system.database
                .online
            }
            configured
            latency={
              system.database
                .latencyMs
            }
            error={
              system.database
                .error
            }
          />

          <HealthCard
            icon={Bot}
            name="Groq AI"
            description={
              system.services.groq.modelAvailable
                ? `${system.services.groq.model} available`
                : `${system.services.groq.model} unavailable`
            }
            online={
              system.services
                .groq
                .online
            }
            configured={
              system.services
                .groq
                .configured
            }
            latency={
              system.services
                .groq
                .latencyMs
            }
            error={
              system.services
                .groq
                .error
            }
          />

          <HealthCard
            icon={Globe2}
            name="Geoapify"
            description="Local provider search API"
            online={
              system.services
                .geoapify
                .online
            }
            configured={
              system.services
                .geoapify
                .configured
            }
            latency={
              system.services
                .geoapify
                .latencyMs
            }
            error={
              system.services
                .geoapify
                .error
            }
          />

          <HealthCard
            icon={Mail}
            name="SMTP"
            description="Orbi email delivery"
            online={
              system.services
                .email
                .online
            }
            configured={
              system.services
                .email
                .configured
            }
            latency={
              system.services
                .email
                .latencyMs
            }
            error={
              system.services
                .email
                .error
            }
          />
        </div>

        {/* AI DETAILS */}

<div
  className="
    mt-6
    grid
    gap-6

    xl:grid-cols-2
  "
>
  <Panel
    title="AI runtime"
    icon={Bot}
  >
    <DataRow
      label="Provider"
      value={
        system.services
          .groq
          .provider
      }
    />

    <DataRow
      label="Status"
      value={
        system.services
          .groq
          .online
          ? "Online"
          : "Offline"
      }
    />

    <DataRow
      label="Model"
      value={
        system.services
          .groq
          .model
      }
    />

    <DataRow
      label="Model available"
      value={
        system.services
          .groq
          .modelAvailable
          ? "Yes"
          : "No"
      }
    />

    <DataRow
      label="Response time"
      value={formatLatency(
        system.services
          .groq
          .latencyMs
      )}
    />
  </Panel>

  <Panel
    title="Runtime"
    icon={Server}
  >
    <DataRow
      label="Environment"
      value={
        system.live
          ? "LIVE / PRODUCTION"
          : system.environment.toUpperCase()
      }
    />

    <DataRow
      label="Version"
      value={
        system.version
      }
    />

    <DataRow
      label="Overall"
      value={
        system.status ===
        "operational"
          ? "Operational"
          : "Degraded"
      }
    />

    <DataRow
      label="Healthy services"
      value={`${healthyServices}/4`}
    />

    <DataRow
      label="Last checked"
      value={formatDateTime(
        system.checkedAt
      )}
    />
  </Panel>
</div>

        {/* CONNECTION LATENCY */}

<Panel
  className="mt-6"
  title="Connection latency"
  icon={Gauge}
>
  <div
    className="
      mt-5
      grid
      gap-4

      sm:grid-cols-2
      xl:grid-cols-4
    "
  >
    <LatencyCard
      title="PostgreSQL"
      value={
        system.database
          .latencyMs
      }
      online={
        system.database
          .online
      }
    />

    <LatencyCard
      title="Groq AI"
      value={
        system.services
          .groq
          .latencyMs
      }
      online={
        system.services
          .groq
          .online
      }
    />

    <LatencyCard
      title="Geoapify"
      value={
        system.services
          .geoapify
          .latencyMs
      }
      online={
        system.services
          .geoapify
          .online
      }
    />

    <LatencyCard
      title="SMTP"
      value={
        system.services
          .email
          .latencyMs
      }
      online={
        system.services
          .email
          .online
      }
    />
  </div>
</Panel>

        {/* LAST CHECK */}

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
          <span
            className="
              flex
              items-center
              gap-2
            "
          >
            <Wifi
              size={13}
            />

            Live connectivity
            checks
          </span>

          <span
            className="
              flex
              items-center
              gap-2
            "
          >
            <Clock3
              size={13}
            />

            {formatDateTime(
              system.checkedAt
            )}
          </span>
        </div>
      </div>
    </main>
  );
}

function HealthCard({
  icon: Icon,
  name,
  description,
  online,
  configured,
  latency,
  error,
}: {
  icon:
  ComponentType<{
    size?: number;
    className?: string;
  }>;

  name:
  string;

  description:
  string;

  online:
  boolean;

  configured:
  boolean;

  latency:
  number | null;

  error:
  string | null;
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

        <HealthBadge
          online={
            online
          }
          configured={
            configured
          }
        />
      </div>

      <h2
        className="
          mt-5
          text-base
          font-semibold
          text-zinc-950

          dark:text-white
        "
      >
        {name}
      </h2>

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

      <div
        className="
          mt-4
          flex
          items-center
          justify-between
          gap-3
        "
      >
        <span
          className="
            text-xs
            text-zinc-500

            dark:text-zinc-400
          "
        >
          Response
        </span>

        <span
          className="
            text-xs
            font-semibold
            text-zinc-800

            dark:text-zinc-200
          "
        >
          {formatLatency(
            latency
          )}
        </span>
      </div>

      {error && (
        <div
          className="
            mt-4
            rounded-xl
            bg-red-50
            px-3
            py-2.5
            text-[11px]
            leading-5
            text-red-700

            dark:bg-red-950/30
            dark:text-red-300
          "
        >
          {error}
        </div>
      )}
    </section>
  );
}

function HealthBadge({
  online,
  configured,
}: {
  online:
  boolean;

  configured:
  boolean;
}) {
  if (online) {
    return (
      <span
        className="
          inline-flex
          items-center
          gap-1.5
          rounded-full
          bg-emerald-50
          px-2.5
          py-1
          text-[10px]
          font-semibold
          uppercase
          tracking-wide
          text-emerald-700

          dark:bg-emerald-950/40
          dark:text-emerald-300
        "
      >
        <CheckCircle2
          size={11}
        />

        Online
      </span>
    );
  }

  return (
    <span
      className="
        inline-flex
        items-center
        gap-1.5
        rounded-full
        bg-red-50
        px-2.5
        py-1
        text-[10px]
        font-semibold
        uppercase
        tracking-wide
        text-red-700

        dark:bg-red-950/30
        dark:text-red-300
      "
    >
      <XCircle
        size={11}
      />

      {configured
        ? "Offline"
        : "Not configured"}
    </span>
  );
}

function Panel({
  children,
  title,
  icon: Icon,
  className = "",
}: {
  children:
  React.ReactNode;

  title:
  string;

  icon:
  ComponentType<{
    size?: number;
    className?: string;
  }>;

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
      <div
        className="
          flex
          items-center
          gap-3
        "
      >
        <div
          className="
            flex
            h-9
            w-9
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
      </div>

      <div
        className="
          mt-5
          space-y-4
        "
      >
        {children}
      </div>
    </section>
  );
}

function DataRow({
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
        items-start
        justify-between
        gap-5
        border-b
        border-zinc-100
        pb-4

        last:border-0
        last:pb-0

        dark:border-zinc-800
      "
    >
      <span
        className="
          shrink-0
          text-sm
          text-zinc-500

          dark:text-zinc-400
        "
      >
        {label}
      </span>

      <span
        className="
          max-w-[65%]
          break-words
          text-right
          text-sm
          font-semibold
          text-zinc-900

          dark:text-white
        "
      >
        {value}
      </span>
    </div>
  );
}

function LatencyCard({
  title,
  value,
  online,
}: {
  title:
  string;

  value:
  number | null;

  online:
  boolean;
}) {
  return (
    <div
      className="
        rounded-xl
        bg-zinc-50
        p-4

        dark:bg-zinc-950
      "
    >
      <div
        className="
          flex
          items-center
          justify-between
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

        {online ? (
          <Wifi
            size={14}
            className="
              text-emerald-600

              dark:text-emerald-300
            "
          />
        ) : (
          <WifiOff
            size={14}
            className="
              text-red-500

              dark:text-red-300
            "
          />
        )}
      </div>

      <p
        className="
          mt-3
          text-xl
          font-semibold
          text-zinc-950

          dark:text-white
        "
      >
        {formatLatency(
          value
        )}
      </p>
    </div>
  );
}

function InfoBadge({
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
        rounded-xl
        bg-zinc-50
        px-4
        py-3

        dark:bg-zinc-950
      "
    >
      <p
        className="
          text-[9px]
          font-semibold
          uppercase
          tracking-wider
          text-zinc-400

          dark:text-zinc-500
        "
      >
        {label}
      </p>

      <p
        className="
          mt-1
          text-xs
          font-semibold
          text-zinc-800

          dark:text-zinc-200
        "
      >
        {value}
      </p>
    </div>
  );
}

function formatLatency(
  value:
    number | null
) {
  if (
    typeof value !==
    "number" ||
    !Number.isFinite(
      value
    )
  ) {
    return "—";
  }

  return `${Math.max(
    0,
    Math.round(value)
  )} ms`;
}

function formatDateTime(
  value:
    unknown
) {
  if (
    typeof value !==
    "string"
  ) {
    return "Unknown";
  }

  const date =
    new Date(value);

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return "Unknown";
  }

  return date.toLocaleString(
    [],
    {
      day:
        "numeric",

      month:
        "short",

      year:
        "numeric",

      hour:
        "2-digit",

      minute:
        "2-digit",

      second:
        "2-digit",
    }
  );
}

function SystemLoading() {
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
            h-9
            w-44
            rounded-xl
            bg-zinc-200

            dark:bg-zinc-800
          "
        />

        <div
          className="
            mt-8
            h-40
            rounded-2xl
            bg-zinc-200

            dark:bg-zinc-900
          "
        />

        <div
          className="
            mt-6
            grid
            gap-4

            md:grid-cols-2
            xl:grid-cols-4
          "
        >
          {Array.from({
            length: 4,
          }).map(
            (_, index) => (
              <div
                key={
                  index
                }
                className="
                  h-64
                  rounded-2xl
                  bg-zinc-200

                  dark:bg-zinc-900
                "
              />
            )
          )}
        </div>
      </div>
    </main>
  );
}

function SystemError({
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
        min-h-screen
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
        <CircleAlert
          size={24}
          className="
            mx-auto
            text-red-500
          "
        />

        <h2
          className="
            mt-4
            text-lg
            font-semibold
            text-zinc-950

            dark:text-white
          "
        >
          Health check failed
        </h2>

        <p
          className="
            mt-2
            text-sm
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
            rounded-xl
            bg-zinc-950
            px-5
            py-2.5
            text-sm
            font-semibold
            text-white

            dark:bg-white
            dark:text-zinc-950
          "
        >
          Try again
        </button>
      </div>
    </main>
  );
}