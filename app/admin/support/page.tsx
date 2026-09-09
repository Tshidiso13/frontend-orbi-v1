"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  CheckCircle2,
  ChevronDown,
  CircleAlert,
  Clock3,
  Inbox,
  LoaderCircle,
  Mail,
  MailOpen,
  RefreshCw,
  Search,
  Send,
  ShieldCheck,
  UserRound,
  X,
} from "lucide-react";

import {
  getAdminSupportTickets,
  updateSupportTicketStatus,
} from "@/lib/api";

import type {
  SupportTicket,
  SupportTicketStatus,
} from "@/lib/api";

import {
  showErrorToast,
  showSuccessToast,
} from "@/lib/toast";

type StatusFilter =
  | "ALL"
  | SupportTicketStatus;

const statusOptions: {
  value: StatusFilter;
  label: string;
}[] = [
  {
    value: "ALL",
    label: "All tickets",
  },
  {
    value: "OPEN",
    label: "Open",
  },
  {
    value: "IN_PROGRESS",
    label: "In progress",
  },
  {
    value: "RESOLVED",
    label: "Resolved",
  },
  {
    value: "CLOSED",
    label: "Closed",
  },
];

export default function AdminSupportPage() {
  const [
    tickets,
    setTickets,
  ] = useState<
    SupportTicket[]
  >([]);

  const [
    selectedTicket,
    setSelectedTicket,
  ] = useState<
    SupportTicket | null
  >(null);

  const [
    filter,
    setFilter,
  ] = useState<StatusFilter>(
    "ALL"
  );

  const [
    search,
    setSearch,
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
    updatingTicketId,
    setUpdatingTicketId,
  ] = useState<
    string | null
  >(null);

  const [
    error,
    setError,
  ] = useState<
    string | null
  >(null);

  const loadTickets =
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
            await getAdminSupportTickets(
              filter ===
                "ALL"
                ? undefined
                : filter
            );

          setTickets(
            Array.isArray(
              data
            )
              ? data
              : []
          );
        } catch (error) {
          const message =
            error instanceof Error
              ? error.message
              : "Unable to load support tickets.";

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
      [filter]
    );

  useEffect(() => {
    loadTickets();
  }, [loadTickets]);

  const filteredTickets =
    useMemo(() => {
      const value =
        search
          .trim()
          .toLowerCase();

      if (!value) {
        return tickets;
      }

      return tickets.filter(
        (ticket) => {
          const fields = [
            ticket.name,
            ticket.email,
            ticket.subject,
            ticket.message,
            ticket.status,
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
      tickets,
      search,
    ]);

  const stats =
    useMemo(() => {
      return tickets.reduce(
        (
          total,
          ticket
        ) => {
          switch (
            ticket.status
          ) {
            case "OPEN":
              total.open +=
                1;

              break;

            case "IN_PROGRESS":
              total.inProgress +=
                1;

              break;

            case "RESOLVED":
              total.resolved +=
                1;

              break;

            case "CLOSED":
              total.closed +=
                1;

              break;
          }

          return total;
        },
        {
          open: 0,
          inProgress: 0,
          resolved: 0,
          closed: 0,
        }
      );
    }, [tickets]);

  const handleStatusChange =
    async (
      ticketId: string,
      status:
        SupportTicketStatus
    ) => {
      const currentTicket =
        tickets.find(
          (ticket) =>
            ticket.id ===
            ticketId
        );

      if (
        !currentTicket ||
        currentTicket.status ===
          status
      ) {
        return;
      }

      try {
        setUpdatingTicketId(
          ticketId
        );

        const updated =
          await updateSupportTicketStatus(
            ticketId,
            status
          );

        setTickets(
          (current) =>
            current.map(
              (ticket) =>
                ticket.id ===
                ticketId
                  ? updated
                  : ticket
            )
        );

        setSelectedTicket(
          (current) =>
            current?.id ===
            ticketId
              ? updated
              : current
        );

        showSuccessToast(
          `Ticket marked as ${formatStatus(
            updated.status
          )}.`
        );
      } catch (error) {
        showErrorToast(
          error instanceof Error
            ? error.message
            : "Unable to update ticket status."
        );
      } finally {
        setUpdatingTicketId(
          null
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
                Customer support
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
              Support inbox
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
              Review support
              requests sent through
              Orbi and manage their
              progress.
            </p>
          </div>

          <button
            type="button"
            onClick={() =>
              loadTickets(
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
            label="Open"
            value={
              stats.open
            }
            description="Needs attention"
          />

          <SummaryCard
            label="In progress"
            value={
              stats.inProgress
            }
            description="Being handled"
          />

          <SummaryCard
            label="Resolved"
            value={
              stats.resolved
            }
            description="Resolved requests"
          />

          <SummaryCard
            label="Closed"
            value={
              stats.closed
            }
            description="Completed tickets"
          />
        </div>

        {/* Controls */}
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

              md:flex-row
              md:items-center
              md:justify-between
            "
          >
            <div
              className="
                relative
                w-full

                md:max-w-lg
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
                  search
                }
                onChange={(
                  event
                ) =>
                  setSearch(
                    event.target.value
                  )
                }
                placeholder="Search name, email, subject or message..."
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

            <div
              className="
                relative
                w-full

                md:w-48
              "
            >
              <select
                value={
                  filter
                }
                onChange={(
                  event
                ) =>
                  setFilter(
                    event.target
                      .value as StatusFilter
                  )
                }
                className="
                  h-11
                  w-full
                  appearance-none
                  rounded-xl
                  border
                  border-zinc-200
                  bg-white
                  px-4
                  pr-10
                  text-sm
                  font-medium
                  text-zinc-700
                  outline-none
                  transition

                  focus:border-zinc-400
                  focus:ring-2
                  focus:ring-zinc-100

                  dark:border-zinc-700
                  dark:bg-zinc-950
                  dark:text-zinc-300
                  dark:focus:border-zinc-600
                  dark:focus:ring-zinc-800
                "
              >
                {statusOptions.map(
                  (option) => (
                    <option
                      key={
                        option.value
                      }
                      value={
                        option.value
                      }
                    >
                      {
                        option.label
                      }
                    </option>
                  )
                )}
              </select>

              <ChevronDown
                size={15}
                className="
                  pointer-events-none
                  absolute
                  right-4
                  top-1/2
                  -translate-y-1/2
                  text-zinc-400
                "
              />
            </div>
          </div>
        </div>

        {/* Inbox */}
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
            <SupportLoading />
          ) : error ? (
            <SupportError
              message={
                error
              }
              retry={() =>
                loadTickets()
              }
            />
          ) : filteredTickets.length ===
            0 ? (
            <EmptySupport
              filtering={
                Boolean(
                  search.trim()
                ) ||
                filter !==
                  "ALL"
              }
            />
          ) : (
            <div
              className="
                divide-y
                divide-zinc-100

                dark:divide-zinc-800
              "
            >
              {filteredTickets.map(
                (ticket) => (
                  <TicketRow
                    key={
                      ticket.id
                    }
                    ticket={
                      ticket
                    }
                    updating={
                      updatingTicketId ===
                      ticket.id
                    }
                    onOpen={() =>
                      setSelectedTicket(
                        ticket
                      )
                    }
                    onStatusChange={(
                      status
                    ) =>
                      handleStatusChange(
                        ticket.id,
                        status
                      )
                    }
                  />
                )
              )}
            </div>
          )}
        </div>

        {!loading &&
          filteredTickets.length >
            0 && (
          <p
            className="
              mt-4
              text-xs
              text-zinc-400

              dark:text-zinc-500
            "
          >
            Showing{" "}
            {
              filteredTickets.length
            }{" "}
            support{" "}
            {filteredTickets.length ===
            1
              ? "ticket"
              : "tickets"}
          </p>
        )}
      </div>

      <TicketModal
        ticket={
          selectedTicket
        }
        updating={
          selectedTicket
            ? updatingTicketId ===
              selectedTicket.id
            : false
        }
        onClose={() =>
          setSelectedTicket(
            null
          )
        }
        onStatusChange={
          handleStatusChange
        }
      />
    </main>
  );
}

function TicketRow({
  ticket,
  updating,
  onOpen,
  onStatusChange,
}: {
  ticket:
    SupportTicket;

  updating:
    boolean;

  onOpen:
    () => void;

  onStatusChange:
    (
      status:
        SupportTicketStatus
    ) => void;
}) {
  return (
    <article
      className="
        flex
        flex-col
        gap-4
        p-5
        transition

        hover:bg-zinc-50

        dark:hover:bg-zinc-800/30

        lg:flex-row
        lg:items-center
      "
    >
      <button
        type="button"
        onClick={
          onOpen
        }
        className="
          flex
          min-w-0
          flex-1
          items-start
          gap-4
          text-left
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
          {ticket.status ===
          "OPEN" ? (
            <Mail
              size={17}
            />
          ) : (
            <MailOpen
              size={17}
            />
          )}
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
                truncate
                text-sm
                font-semibold
                text-zinc-900

                dark:text-white
              "
            >
              {safeText(
                ticket.subject,
                "Support request"
              )}
            </p>

            <StatusBadge
              status={
                ticket.status
              }
            />
          </div>

          <p
            className="
              mt-1
              line-clamp-2
              text-sm
              leading-6
              text-zinc-500

              dark:text-zinc-400
            "
          >
            {safeText(
              ticket.message
            )}
          </p>

          <div
            className="
              mt-2
              flex
              flex-wrap
              items-center
              gap-x-4
              gap-y-1
              text-xs
              text-zinc-400

              dark:text-zinc-500
            "
          >
            <span
              className="
                inline-flex
                items-center
                gap-1.5
              "
            >
              <UserRound
                size={12}
              />

              {safeText(
                ticket.name,
                "Unknown user"
              )}
            </span>

            <span
              className="
                inline-flex
                items-center
                gap-1.5
              "
            >
              <Clock3
                size={12}
              />

              {formatRelativeTime(
                ticket.createdAt
              )}
            </span>
          </div>
        </div>
      </button>

      <div
        className="
          flex
          items-center
          gap-2

          lg:shrink-0
        "
      >
        <TicketStatusSelect
          value={
            ticket.status
          }
          loading={
            updating
          }
          onChange={
            onStatusChange
          }
        />

        <button
          type="button"
          onClick={
            onOpen
          }
          className="
            inline-flex
            h-10
            items-center
            justify-center
            rounded-xl
            border
            border-zinc-200
            bg-white
            px-4
            text-xs
            font-semibold
            text-zinc-600
            transition

            hover:bg-zinc-100
            hover:text-zinc-950

            dark:border-zinc-700
            dark:bg-zinc-900
            dark:text-zinc-300
            dark:hover:bg-zinc-800
            dark:hover:text-white
          "
        >
          Open
        </button>
      </div>
    </article>
  );
}

function TicketModal({
  ticket,
  updating,
  onClose,
  onStatusChange,
}: {
  ticket:
    SupportTicket | null;

  updating:
    boolean;

  onClose:
    () => void;

  onStatusChange:
    (
      ticketId: string,
      status:
        SupportTicketStatus
    ) => void;
}) {
  useEffect(() => {
    if (!ticket) {
      return;
    }

    const previousOverflow =
      document.body.style
        .overflow;

    document.body.style.overflow =
      "hidden";

    const handleKeyDown =
      (
        event:
          KeyboardEvent
      ) => {
        if (
          event.key ===
            "Escape" &&
          !updating
        ) {
          onClose();
        }
      };

    window.addEventListener(
      "keydown",
      handleKeyDown
    );

    return () => {
      document.body.style.overflow =
        previousOverflow;

      window.removeEventListener(
        "keydown",
        handleKeyDown
      );
    };
  }, [
    ticket,
    updating,
    onClose,
  ]);

  if (!ticket) {
    return null;
  }

  const mailto =
    createReplyUrl(
      ticket
    );

  return (
    <div
      className="
        fixed
        inset-0
        z-[120]
        flex
        items-center
        justify-center
        p-4

        sm:p-6
      "
    >
      <button
        type="button"
        aria-label="Close support ticket"
        onClick={
          updating
            ? undefined
            : onClose
        }
        className="
          absolute
          inset-0
          bg-black/50
          backdrop-blur-[2px]

          dark:bg-black/70
        "
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="support-ticket-title"
        className="
          relative
          z-10
          flex
          max-h-[90vh]
          w-full
          max-w-2xl
          flex-col
          overflow-hidden
          rounded-3xl
          border
          border-zinc-200
          bg-white
          shadow-2xl

          dark:border-zinc-800
          dark:bg-zinc-900
          dark:shadow-black/40
        "
      >
        {/* Header */}
        <div
          className="
            flex
            items-start
            justify-between
            gap-4
            border-b
            border-zinc-100
            px-6
            py-5

            dark:border-zinc-800
          "
        >
          <div
            className="
              min-w-0
            "
          >
            <div
              className="
                mb-3
                flex
                items-center
                gap-2
              "
            >
              <StatusBadge
                status={
                  ticket.status
                }
              />

              <span
                className="
                  text-xs
                  text-zinc-400

                  dark:text-zinc-500
                "
              >
                {formatDateTime(
                  ticket.createdAt
                )}
              </span>
            </div>

            <h2
              id="support-ticket-title"
              className="
                break-words
                text-xl
                font-semibold
                text-zinc-950

                dark:text-white
              "
            >
              {safeText(
                ticket.subject,
                "Support request"
              )}
            </h2>
          </div>

          <button
            type="button"
            onClick={
              onClose
            }
            disabled={
              updating
            }
            aria-label="Close"
            className="
              flex
              h-9
              w-9
              shrink-0
              items-center
              justify-center
              rounded-lg
              text-zinc-400
              transition

              hover:bg-zinc-100
              hover:text-zinc-950

              disabled:cursor-not-allowed
              disabled:opacity-50

              dark:text-zinc-500
              dark:hover:bg-zinc-800
              dark:hover:text-white
            "
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div
          className="
            flex-1
            overflow-y-auto
            px-6
            py-6
          "
        >
          {/* Sender */}
          <div
            className="
              rounded-2xl
              border
              border-zinc-200
              bg-zinc-50
              p-4

              dark:border-zinc-800
              dark:bg-zinc-950
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
                  rounded-full
                  bg-zinc-900
                  text-xs
                  font-semibold
                  text-white

                  dark:bg-zinc-800
                "
              >
                {getInitials(
                  ticket.name
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
                    text-sm
                    font-semibold
                    text-zinc-900

                    dark:text-white
                  "
                >
                  {safeText(
                    ticket.name,
                    "Unknown user"
                  )}
                </p>

                <a
                  href={`mailto:${encodeURIComponent(
                    ticket.email
                  )}`}
                  className="
                    mt-0.5
                    block
                    break-all
                    text-xs
                    text-zinc-500
                    transition

                    hover:text-zinc-950

                    dark:text-zinc-400
                    dark:hover:text-white
                  "
                >
                  {safeText(
                    ticket.email
                  )}
                </a>
              </div>
            </div>
          </div>

          {/* Message */}
          <div
            className="
              mt-5
            "
          >
            <p
              className="
                text-xs
                font-semibold
                uppercase
                tracking-wider
                text-zinc-400

                dark:text-zinc-500
              "
            >
              Message
            </p>

            <div
              className="
                mt-3
                whitespace-pre-wrap
                break-words
                rounded-2xl
                border
                border-zinc-200
                bg-white
                p-5
                text-sm
                leading-7
                text-zinc-700

                dark:border-zinc-800
                dark:bg-zinc-950
                dark:text-zinc-300
              "
            >
              {safeText(
                ticket.message,
                "No message provided."
              )}
            </div>
          </div>

          {/* Details */}
          <div
            className="
              mt-5
              grid
              gap-3

              sm:grid-cols-2
            "
          >
            <DetailCard
              label="Ticket ID"
              value={
                ticket.id
              }
            />

            <DetailCard
              label="Created"
              value={formatDateTime(
                ticket.createdAt
              )}
            />

            <DetailCard
              label="Last updated"
              value={formatDateTime(
                ticket.updatedAt
              )}
            />

            <DetailCard
              label="Current status"
              value={formatStatus(
                ticket.status
              )}
            />
          </div>
        </div>

        {/* Footer */}
        <div
          className="
            flex
            flex-col
            gap-3
            border-t
            border-zinc-100
            px-6
            py-5

            dark:border-zinc-800

            sm:flex-row
            sm:items-center
            sm:justify-between
          "
        >
          <TicketStatusSelect
            value={
              ticket.status
            }
            loading={
              updating
            }
            onChange={(
              status
            ) =>
              onStatusChange(
                ticket.id,
                status
              )
            }
            wide
          />

          <a
            href={
              mailto
            }
            className="
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
              transition

              hover:bg-zinc-800

              dark:bg-white
              dark:text-zinc-950
              dark:hover:bg-zinc-200
            "
          >
            <Send
              size={16}
            />

            Reply by email
          </a>
        </div>
      </div>
    </div>
  );
}

function TicketStatusSelect({
  value,
  loading,
  onChange,
  wide = false,
}: {
  value:
    SupportTicketStatus;

  loading:
    boolean;

  onChange:
    (
      status:
        SupportTicketStatus
    ) => void;

  wide?:
    boolean;
}) {
  return (
    <div
      className={`
        relative

        ${
          wide
            ? "w-full sm:w-52"
            : "w-40"
        }
      `}
    >
      <select
        value={
          value
        }
        disabled={
          loading
        }
        onChange={(
          event
        ) =>
          onChange(
            event.target
              .value as SupportTicketStatus
          )
        }
        aria-label="Change ticket status"
        className="
          h-10
          w-full
          appearance-none
          rounded-xl
          border
          border-zinc-200
          bg-white
          px-3
          pr-9
          text-xs
          font-semibold
          text-zinc-700
          outline-none
          transition

          focus:border-zinc-400
          focus:ring-2
          focus:ring-zinc-100

          disabled:cursor-not-allowed
          disabled:opacity-60

          dark:border-zinc-700
          dark:bg-zinc-950
          dark:text-zinc-300
          dark:focus:border-zinc-600
          dark:focus:ring-zinc-800
        "
      >
        <option value="OPEN">
          Open
        </option>

        <option value="IN_PROGRESS">
          In progress
        </option>

        <option value="RESOLVED">
          Resolved
        </option>

        <option value="CLOSED">
          Closed
        </option>
      </select>

      {loading ? (
        <LoaderCircle
          size={14}
          className="
            pointer-events-none
            absolute
            right-3
            top-1/2
            -translate-y-1/2
            animate-spin
            text-zinc-400
          "
        />
      ) : (
        <ChevronDown
          size={14}
          className="
            pointer-events-none
            absolute
            right-3
            top-1/2
            -translate-y-1/2
            text-zinc-400
          "
        />
      )}
    </div>
  );
}

function StatusBadge({
  status,
}: {
  status:
    SupportTicketStatus;
}) {
  if (
    status ===
    "OPEN"
  ) {
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

          dark:bg-red-950/40
          dark:text-red-300
        "
      >
        <CircleAlert
          size={11}
        />

        Open
      </span>
    );
  }

  if (
    status ===
    "IN_PROGRESS"
  ) {
    return (
      <span
        className="
          inline-flex
          items-center
          gap-1.5
          rounded-full
          bg-amber-50
          px-2.5
          py-1
          text-[10px]
          font-semibold
          uppercase
          tracking-wide
          text-amber-700

          dark:bg-amber-950/40
          dark:text-amber-300
        "
      >
        <Clock3
          size={11}
        />

        In progress
      </span>
    );
  }

  if (
    status ===
    "RESOLVED"
  ) {
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

        Resolved
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
        bg-zinc-100
        px-2.5
        py-1
        text-[10px]
        font-semibold
        uppercase
        tracking-wide
        text-zinc-600

        dark:bg-zinc-800
        dark:text-zinc-300
      "
    >
      Closed
    </span>
  );
}

function SummaryCard({
  label,
  value,
  description,
}: {
  label: string;
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
        {label}
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
          value
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

function DetailCard({
  label,
  value,
}: {
  label: string;
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
        {label}
      </p>

      <p
        className="
          mt-1.5
          break-all
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

function SupportLoading() {
  return (
    <div
      className="
        divide-y
        divide-zinc-100

        dark:divide-zinc-800
      "
    >
      {Array.from({
        length: 7,
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
                  w-52
                  rounded
                  bg-zinc-100

                  dark:bg-zinc-800
                "
              />

              <div
                className="
                  mt-2
                  h-3
                  w-80
                  max-w-full
                  rounded
                  bg-zinc-100

                  dark:bg-zinc-800
                "
              />
            </div>

            <div
              className="
                hidden
                h-9
                w-32
                rounded-xl
                bg-zinc-100

                dark:bg-zinc-800

                sm:block
              "
            />
          </div>
        )
      )}
    </div>
  );
}

function SupportError({
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
        min-h-[400px]
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
        Unable to load support
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

function EmptySupport({
  filtering,
}: {
  filtering:
    boolean;
}) {
  return (
    <div
      className="
        flex
        min-h-[400px]
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
        <Inbox
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
          ? "No matching tickets"
          : "Support inbox is empty"}
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
          ? "No support requests match the current search or status filter."
          : "Messages submitted through Orbi's Help & Support page will appear here."}
      </p>
    </div>
  );
}

function formatStatus(
  value:
    SupportTicketStatus
) {
  switch (value) {
    case "OPEN":
      return "Open";

    case "IN_PROGRESS":
      return "In progress";

    case "RESOLVED":
      return "Resolved";

    case "CLOSED":
      return "Closed";
  }
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
  const number =
    Number(value);

  return new Intl.NumberFormat(
    "en-ZA"
  ).format(
    Number.isFinite(
      number
    )
      ? number
      : 0
  );
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

function formatDateTime(
  value: unknown
) {
  const date =
    parseDate(
      value
    );

  if (!date) {
    return "Unknown";
  }

  return date.toLocaleString(
    [],
    {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }
  );
}

function formatRelativeTime(
  value: unknown
) {
  const date =
    parseDate(
      value
    );

  if (!date) {
    return "Unknown";
  }

  const difference =
    Date.now() -
    date.getTime();

  const minute =
    60 * 1000;

  const hour =
    minute * 60;

  const day =
    hour * 24;

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
    return `${Math.floor(
      difference /
        minute
    )}m ago`;
  }

  if (
    difference <
    day
  ) {
    return `${Math.floor(
      difference /
        hour
    )}h ago`;
  }

  if (
    difference <
    day * 7
  ) {
    return `${Math.floor(
      difference /
        day
    )}d ago`;
  }

  return date.toLocaleDateString(
    [],
    {
      day: "numeric",
      month: "short",
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

function createReplyUrl(
  ticket:
    SupportTicket
) {
  const email =
    safeText(
      ticket.email
    );

  const subject =
    safeText(
      ticket.subject,
      "Support request"
    );

  const replySubject =
    subject
      .toLowerCase()
      .startsWith("re:")
      ? subject
      : `Re: ${subject}`;

  const body =
    `Hi ${safeText(
      ticket.name,
      "there"
    )},\n\n` +
    `Thank you for contacting Orbi support.\n\n\n` +
    `Regards,\nOrbi Support`;

  return (
    `mailto:${encodeURIComponent(
      email
    )}` +
    `?subject=${encodeURIComponent(
      replySubject
    )}` +
    `&body=${encodeURIComponent(
      body
    )}`
  );
}