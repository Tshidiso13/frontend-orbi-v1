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
  LoaderCircle,
  RefreshCw,
  Search as SearchIcon,
  ShieldCheck,
  UserRound,
  Users,
} from "lucide-react";

import {
  getAdminUsers,
  updateAdminUserRole,
} from "@/lib/api";

import {
  showErrorToast,
  showSuccessToast,
} from "@/lib/toast";

type UserRole =
  | "USER"
  | "BUSINESS"
  | "ADMIN";

type AdminUser = {
  id: string;
  name: string;
  username:
    | string
    | null;
  email: string;
  image:
    | string
    | null;
  role: UserRole;
  createdAt: string;
  updatedAt: string;

  _count: {
    searchHistory: number;
    savedProviders: number;
  };
};

type Pagination = {
  page: number;
  limit: number;
  total: number;
  pages: number;
};

export default function AdminUsersPage() {
  const [
    users,
    setUsers,
  ] = useState<
    AdminUser[]
  >([]);

  const [
    pagination,
    setPagination,
  ] = useState<Pagination>({
    page: 1,
    limit: 20,
    total: 0,
    pages: 1,
  });

  const [
    page,
    setPage,
  ] = useState(1);

  const [
    search,
    setSearch,
  ] = useState("");

  const [
    debouncedSearch,
    setDebouncedSearch,
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
    changingRoleId,
    setChangingRoleId,
  ] = useState<
    string | null
  >(null);

  const [
    error,
    setError,
  ] = useState<
    string | null
  >(null);

  /*
   * Debounce user search so
   * typing doesn't request the
   * backend on every keystroke.
   */
  useEffect(() => {
    const timer =
      window.setTimeout(
        () => {
          setDebouncedSearch(
            search.trim()
          );

          setPage(1);
        },
        350
      );

    return () => {
      window.clearTimeout(
        timer
      );
    };
  }, [search]);

  const loadUsers =
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
            await getAdminUsers({
              page,
              limit: 20,
              search:
                debouncedSearch,
            });

          setUsers(
            Array.isArray(
              data.users
            )
              ? data.users
              : []
          );

          setPagination(
            data.pagination
          );
        } catch (error) {
          const message =
            error instanceof Error
              ? error.message
              : "Unable to load users.";

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
      [
        page,
        debouncedSearch,
      ]
    );

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  const pageRoleStats =
    useMemo(() => {
      return users.reduce(
        (
          totals,
          user
        ) => {
          if (
            user.role ===
            "ADMIN"
          ) {
            totals.admins +=
              1;
          } else if (
            user.role ===
            "BUSINESS"
          ) {
            totals.businesses +=
              1;
          } else {
            totals.users +=
              1;
          }

          return totals;
        },
        {
          users: 0,
          businesses: 0,
          admins: 0,
        }
      );
    }, [users]);

  const handleRoleChange =
    async (
      userId: string,
      role: UserRole
    ) => {
      const current =
        users.find(
          (user) =>
            user.id ===
            userId
        );

      if (
        !current ||
        current.role ===
          role
      ) {
        return;
      }

      try {
        setChangingRoleId(
          userId
        );

        const updated =
          await updateAdminUserRole(
            userId,
            role
          );

        setUsers(
          (currentUsers) =>
            currentUsers.map(
              (user) =>
                user.id ===
                userId
                  ? {
                      ...user,
                      role:
                        updated.role as UserRole,
                    }
                  : user
            )
        );

        showSuccessToast(
          `${safeText(
            updated.name,
            "User"
          )}'s role was updated to ${formatRole(
            updated.role
          )}.`
        );
      } catch (error) {
        showErrorToast(
          error instanceof Error
            ? error.message
            : "Unable to update user role."
        );
      } finally {
        setChangingRoleId(
          null
        );
      }
    };

  const goPrevious =
    () => {
      if (
        page >
        1
      ) {
        setPage(
          (current) =>
            current - 1
        );
      }
    };

  const goNext =
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
                User management
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
              Users
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
              View Orbi accounts,
              inspect activity and
              manage account roles.
            </p>
          </div>

          <button
            type="button"
            onClick={() =>
              loadUsers(
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
            label="Total accounts"
            value={
              pagination.total
            }
            description="Across Orbi"
          />

          <SummaryCard
            label="Users"
            value={
              pageRoleStats.users
            }
            description="On this page"
          />

          <SummaryCard
            label="Businesses"
            value={
              pageRoleStats.businesses
            }
            description="On this page"
          />

          <SummaryCard
            label="Admins"
            value={
              pageRoleStats.admins
            }
            description="On this page"
          />
        </div>

        {/* Search */}
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

                sm:max-w-md
              "
            >
              <SearchIcon
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
                    event.target
                      .value
                  )
                }
                placeholder="Search name, email or username..."
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
              {users.length} of{" "}
              {pagination.total}{" "}
              accounts
            </p>
          </div>
        </div>

        {/* Content */}
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
            <UsersLoading />
          ) : error ? (
            <UsersError
              message={
                error
              }
              retry={() =>
                loadUsers()
              }
            />
          ) : users.length ===
            0 ? (
            <EmptyUsers
              searching={
                Boolean(
                  debouncedSearch
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

                  lg:block
                "
              >
                <table
                  className="
                    w-full
                    min-w-[950px]
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
                      <TableHeading>
                        User
                      </TableHeading>

                      <TableHeading>
                        Role
                      </TableHeading>

                      <TableHeading>
                        Searches
                      </TableHeading>

                      <TableHeading>
                        Saved
                      </TableHeading>

                      <TableHeading>
                        Joined
                      </TableHeading>

                      <TableHeading>
                        Manage role
                      </TableHeading>
                    </tr>
                  </thead>

                  <tbody
                    className="
                      divide-y
                      divide-zinc-100

                      dark:divide-zinc-800
                    "
                  >
                    {users.map(
                      (user) => (
                        <tr
                          key={
                            user.id
                          }
                          className="
                            transition

                            hover:bg-zinc-50

                            dark:hover:bg-zinc-800/40
                          "
                        >
                          <td
                            className="
                              px-5
                              py-4
                            "
                          >
                            <UserIdentity
                              user={
                                user
                              }
                            />
                          </td>

                          <td
                            className="
                              px-5
                              py-4
                            "
                          >
                            <RoleBadge
                              role={
                                user.role
                              }
                            />
                          </td>

                          <td
                            className="
                              px-5
                              py-4
                              text-sm
                              text-zinc-600

                              dark:text-zinc-300
                            "
                          >
                            {formatNumber(
                              safeNumber(
                                user
                                  ._count
                                  .searchHistory
                              )
                            )}
                          </td>

                          <td
                            className="
                              px-5
                              py-4
                              text-sm
                              text-zinc-600

                              dark:text-zinc-300
                            "
                          >
                            {formatNumber(
                              safeNumber(
                                user
                                  ._count
                                  .savedProviders
                              )
                            )}
                          </td>

                          <td
                            className="
                              whitespace-nowrap
                              px-5
                              py-4
                              text-sm
                              text-zinc-500

                              dark:text-zinc-400
                            "
                          >
                            {formatDate(
                              user.createdAt
                            )}
                          </td>

                          <td
                            className="
                              px-5
                              py-4
                            "
                          >
                            <RoleSelector
                              user={
                                user
                              }
                              loading={
                                changingRoleId ===
                                user.id
                              }
                              onChange={(
                                role
                              ) =>
                                handleRoleChange(
                                  user.id,
                                  role
                                )
                              }
                            />
                          </td>
                        </tr>
                      )
                    )}
                  </tbody>
                </table>
              </div>

              {/* Mobile cards */}
              <div
                className="
                  divide-y
                  divide-zinc-100

                  dark:divide-zinc-800

                  lg:hidden
                "
              >
                {users.map(
                  (user) => (
                    <div
                      key={
                        user.id
                      }
                      className="
                        p-5
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
                        <UserIdentity
                          user={
                            user
                          }
                        />

                        <RoleBadge
                          role={
                            user.role
                          }
                        />
                      </div>

                      <div
                        className="
                          mt-5
                          grid
                          grid-cols-3
                          gap-3
                        "
                      >
                        <MobileStat
                          label="Searches"
                          value={
                            user
                              ._count
                              .searchHistory
                          }
                        />

                        <MobileStat
                          label="Saved"
                          value={
                            user
                              ._count
                              .savedProviders
                          }
                        />

                        <MobileStat
                          label="Joined"
                          value={formatShortDate(
                            user.createdAt
                          )}
                          raw
                        />
                      </div>

                      <div
                        className="
                          mt-4
                        "
                      >
                        <p
                          className="
                            mb-2
                            text-xs
                            font-medium
                            text-zinc-500

                            dark:text-zinc-400
                          "
                        >
                          Account role
                        </p>

                        <RoleSelector
                          user={
                            user
                          }
                          loading={
                            changingRoleId ===
                            user.id
                          }
                          onChange={(
                            role
                          ) =>
                            handleRoleChange(
                              user.id,
                              role
                            )
                          }
                          fullWidth
                        />
                      </div>
                    </div>
                  )
                )}
              </div>
            </>
          )}
        </div>

        {/* Pagination */}
        {!loading &&
          users.length >
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
              )}
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
                  goPrevious
                }
                disabled={
                  page <= 1
                }
                className="
                  flex
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
                  goNext
                }
                disabled={
                  page >=
                  pagination.pages
                }
                className="
                  flex
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

function UserIdentity({
  user,
}: {
  user: AdminUser;
}) {
  return (
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
          h-10
          w-10
          shrink-0
          items-center
          justify-center
          overflow-hidden
          rounded-full
          bg-zinc-900
          text-xs
          font-semibold
          text-white

          dark:bg-zinc-800
        "
      >
        {user.image ? (
          <img
            src={
              user.image
            }
            alt=""
            className="
              h-full
              w-full
              object-cover
            "
          />
        ) : (
          getInitials(
            user.name
          )
        )}
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
            text-zinc-500

            dark:text-zinc-400
          "
        >
          {safeText(
            user.email
          )}
        </p>

        {user.username && (
          <p
            className="
              mt-0.5
              truncate
              text-[11px]
              text-zinc-400

              dark:text-zinc-500
            "
          >
            @
            {safeText(
              user.username
            )}
          </p>
        )}
      </div>
    </div>
  );
}

function RoleSelector({
  user,
  loading,
  onChange,
  fullWidth = false,
}: {
  user: AdminUser;
  loading: boolean;
  onChange:
    (role: UserRole) =>
      void;
  fullWidth?: boolean;
}) {
  return (
    <div
      className={`
        relative

        ${
          fullWidth
            ? "w-full"
            : "w-36"
        }
      `}
    >
      <select
        value={
          user.role
        }
        disabled={
          loading
        }
        onChange={(
          event
        ) =>
          onChange(
            event.target
              .value as UserRole
          )
        }
        aria-label={`Change ${user.name}'s role`}
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
          font-medium
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
        <option value="USER">
          User
        </option>

        <option value="BUSINESS">
          Business
        </option>

        <option value="ADMIN">
          Admin
        </option>
      </select>

      {loading ? (
        <LoaderCircle
          size={15}
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
        <ChevronRight
          size={14}
          className="
            pointer-events-none
            absolute
            right-3
            top-1/2
            -translate-y-1/2
            rotate-90
            text-zinc-400
          "
        />
      )}
    </div>
  );
}

function RoleBadge({
  role,
}: {
  role: UserRole;
}) {
  if (
    role ===
    "ADMIN"
  ) {
    return (
      <span
        className="
          inline-flex
          items-center
          gap-1.5
          whitespace-nowrap
          rounded-full
          bg-purple-50
          px-2.5
          py-1
          text-[11px]
          font-semibold
          text-purple-700

          dark:bg-purple-950/40
          dark:text-purple-300
        "
      >
        <ShieldCheck
          size={12}
        />

        Admin
      </span>
    );
  }

  if (
    role ===
    "BUSINESS"
  ) {
    return (
      <span
        className="
          inline-flex
          whitespace-nowrap
          rounded-full
          bg-blue-50
          px-2.5
          py-1
          text-[11px]
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
        whitespace-nowrap
        rounded-full
        bg-zinc-100
        px-2.5
        py-1
        text-[11px]
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

function TableHeading({
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

function MobileStat({
  label,
  value,
  raw = false,
}: {
  label: string;
  value:
    | number
    | string;
  raw?: boolean;
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
          font-medium
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
          mt-1
          truncate
          text-sm
          font-semibold
          text-zinc-900

          dark:text-white
        "
      >
        {raw
          ? value
          : formatNumber(
              safeNumber(
                value
              )
            )}
      </p>
    </div>
  );
}

function UsersLoading() {
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
                rounded-full
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
                  w-40
                  rounded
                  bg-zinc-100

                  dark:bg-zinc-800
                "
              />

              <div
                className="
                  mt-2
                  h-3
                  w-56
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
                w-28
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

function UsersError({
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
        min-h-[360px]
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
        <UserRound
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
        Unable to load users
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

function EmptyUsers({
  searching,
}: {
  searching: boolean;
}) {
  return (
    <div
      className="
        flex
        min-h-[360px]
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
        <Users
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
        {searching
          ? "No users found"
          : "No users yet"}
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
        {searching
          ? "No Orbi accounts match your search."
          : "Registered Orbi accounts will appear here."}
      </p>
    </div>
  );
}

function formatRole(
  value: unknown
) {
  if (
    typeof value !==
    "string"
  ) {
    return "User";
  }

  const role =
    value
      .trim()
      .toUpperCase();

  if (
    role ===
    "ADMIN"
  ) {
    return "Admin";
  }

  if (
    role ===
    "BUSINESS"
  ) {
    return "Business";
  }

  return "User";
}

function formatDate(
  value: unknown
) {
  if (
    typeof value !==
    "string"
  ) {
    return "—";
  }

  const date =
    new Date(value);

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return "—";
  }

  return date.toLocaleDateString(
    [],
    {
      day:
        "numeric",
      month:
        "short",
      year:
        "numeric",
    }
  );
}

function formatShortDate(
  value: unknown
) {
  if (
    typeof value !==
    "string"
  ) {
    return "—";
  }

  const date =
    new Date(value);

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
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

function safeNumber(
  value: unknown
) {
  const result =
    Number(value);

  return Number.isFinite(
    result
  )
    ? result
    : 0;
}

function formatNumber(
  value: number
) {
  return new Intl.NumberFormat(
    "en-ZA"
  ).format(value);
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