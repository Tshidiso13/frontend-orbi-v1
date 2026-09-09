"use client";

import {
  useEffect,
  useState,
} from "react";

import Link from "next/link";

import {
  useRouter,
} from "next/navigation";

import {
  Database,
  KeyRound,
  LoaderCircle,
  LogOut,
  Monitor,
  Moon,
  Palette,
  Shield,
  Sun,
  Trash2,
  UserRound,
} from "lucide-react";

import {
  changePassword,
  clearSavedProviders,
  clearSearchHistory,
  deleteAccount,
  getAccessToken,
  getSettings,
  logoutAllDevices,
  logoutUser,
  setStoredUser,
  updateAccountSettings,
  updateAppearance,
} from "@/lib/api";

import type {
  AccentColor,
  ThemeMode,
  UserSettingsResponse,
} from "@/lib/api";

import {
  showErrorToast,
  showSuccessToast,
} from "@/lib/toast";

type Section =
  | "general"
  | "account"
  | "security"
  | "data";

const sections = [
  {
    id: "general" as const,
    name: "General",
    icon: Palette,
  },
  {
    id: "account" as const,
    name: "Account",
    icon: UserRound,
  },
  {
    id: "security" as const,
    name: "Security & login",
    icon: Shield,
  },
  {
    id: "data" as const,
    name: "Data controls",
    icon: Database,
  },
];

export default function SettingsPage() {
  const router =
    useRouter();

  const [
    activeSection,
    setActiveSection,
  ] = useState<Section>(
    "general"
  );

  const [
    settings,
    setSettings,
  ] = useState<
    UserSettingsResponse | null
  >(null);

  const [
    loading,
    setLoading,
  ] = useState(true);

  useEffect(() => {
    const load =
      async () => {
        if (
          !getAccessToken()
        ) {
          setLoading(false);
          return;
        }

        try {
          const data =
            await getSettings();

          setSettings(
            data
          );
        } catch (error) {
          showErrorToast(
            error instanceof Error
              ? error.message
              : "Unable to load settings."
          );
        } finally {
          setLoading(false);
        }
      };

    load();
  }, []);

  if (loading) {
    return <SettingsLoading />;
  }

  if (!settings) {
    return (
      <SignInRequired />
    );
  }

  return (
    <main
      className="
        min-h-screen
        bg-white dark:bg-zinc-950
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
        <div
          className="
            border-b
            border-zinc-200
            pb-7
            dark:border-zinc-800
          "
        >
          <h1
            className="
              text-3xl
              font-semibold
              tracking-tight
               text-zinc-950 dark:text-white
              dark:text-zinc-50
            "
          >
            Settings
          </h1>

          <p
            className="
              mt-2
              text-sm
               text-zinc-500 dark:text-zinc-400
              dark:text-zinc-400
            "
          >
            Manage your Orbi
            account, appearance,
            security and data.
          </p>
        </div>

        <div
          className="
            mt-8
            grid gap-8
            md:grid-cols-[220px_1fr]
          "
        >
          {/* Menu */}
          <nav className="space-y-1">
            {sections.map(
              (section) => {
                const Icon =
                  section.icon;

                const active =
                  activeSection ===
                  section.id;

                return (
                  <button
                    key={
                      section.id
                    }
                    type="button"
                    onClick={() =>
                      setActiveSection(
                        section.id
                      )
                    }
                    className={`
                      flex h-11
                      w-full
                      items-center
                      gap-3
                      rounded-xl
                      px-3
                      text-sm
                      font-medium
                      transition

                      ${
                        active
                          ? "bg-zinc-100  text-zinc-950 dark:text-white dark:bg-zinc-800 dark:text-white"
                          : " text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-900"
                      }
                    `}
                  >
                    <Icon
                      size={18}
                    />

                    {section.name}
                  </button>
                );
              }
            )}
          </nav>

          <div className="min-w-0">
            {activeSection ===
              "general" && (
              <GeneralSettings
                settings={
                  settings
                }
                onUpdate={(
                  appearance
                ) =>
                  setSettings(
                    (
                      current
                    ) =>
                      current
                        ? {
                            ...current,
                            appearance,
                          }
                        : current
                  )
                }
              />
            )}

            {activeSection ===
              "account" && (
              <AccountSettings
                settings={
                  settings
                }
                onUpdate={(
                  account
                ) =>
                  setSettings(
                    (
                      current
                    ) =>
                      current
                        ? {
                            ...current,
                            account,
                          }
                        : current
                  )
                }
              />
            )}

            {activeSection ===
              "security" && (
              <SecuritySettings
                onSignedOut={() => {
                  logoutUser();

                  router.push(
                    "/login"
                  );
                }}
              />
            )}

            {activeSection ===
              "data" && (
              <DataSettings
                onDeleted={() => {
                  logoutUser();

                  router.push(
                    "/register"
                  );
                }}
              />
            )}
          </div>
        </div>
      </div>
    </main>
  );
}

function GeneralSettings({
  settings,
  onUpdate,
}: {
  settings:
    UserSettingsResponse;

  onUpdate: (
    appearance:
      UserSettingsResponse["appearance"]
  ) => void;
}) {
  const [
    saving,
    setSaving,
  ] = useState(false);

  const saveAppearance =
    async (
      theme:
        ThemeMode,
      accentColor:
        AccentColor
    ) => {
      try {
        setSaving(true);

        const result =
          await updateAppearance({
            theme,
            accentColor,
          });

        onUpdate(
          result.appearance
        );

        window.dispatchEvent(
          new CustomEvent(
            "orbi-appearance-updated",
            {
              detail: {
                theme:
                  result
                    .appearance
                    .theme,

                accentColor:
                  result
                    .appearance
                    .accentColor,
              },
            }
          )
        );

        showSuccessToast(
          "Appearance updated."
        );
      } catch (error) {
        showErrorToast(
          error instanceof Error
            ? error.message
            : "Unable to save appearance."
        );
      } finally {
        setSaving(false);
      }
    };

  const {
    theme,
    accentColor,
  } = settings.appearance;

  return (
    <SettingsCard
      title="Appearance"
      description="Choose how Orbi looks on this device and across your account."
    >
      <SettingLabel>
        Color mode
      </SettingLabel>

      <div
        className="
          mt-3
          grid gap-3
          sm:grid-cols-3
        "
      >
        <ThemeButton
          title="System"
          icon={<Monitor size={18} />}
          active={
            theme ===
            "system"
          }
          disabled={
            saving
          }
          onClick={() =>
            saveAppearance(
              "system",
              accentColor
            )
          }
        />

        <ThemeButton
          title="Light"
          icon={<Sun size={18} />}
          active={
            theme ===
            "light"
          }
          disabled={
            saving
          }
          onClick={() =>
            saveAppearance(
              "light",
              accentColor
            )
          }
        />

        <ThemeButton
          title="Dark"
          icon={<Moon size={18} />}
          active={
            theme ===
            "dark"
          }
          disabled={
            saving
          }
          onClick={() =>
            saveAppearance(
              "dark",
              accentColor
            )
          }
        />
      </div>

      <SettingLabel className="mt-8">
        Accent color
      </SettingLabel>

      <div
        className="
          mt-3
          flex flex-wrap
          gap-3
        "
      >
        {(
          [
            "zinc",
            "blue",
            "green",
            "purple",
            "orange",
          ] as AccentColor[]
        ).map(
          (color) => (
            <button
              key={
                color
              }
              type="button"
              disabled={
                saving
              }
              onClick={() =>
                saveAppearance(
                  theme,
                  color
                )
              }
              className={`
                rounded-xl
                border
                px-4 py-2.5
                text-sm
                capitalize
                transition

                ${
                  accentColor ===
                  color
                    ? "border-zinc-950 bg-zinc-950 text-white dark:border-white dark:bg-white dark:bg-zinc-950 dark: text-zinc-950 dark:text-white"
                    : "border-zinc-200 text-zinc-600 hover:bg-zinc-50 dark:border-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-900"
                }
              `}
            >
              {color}
            </button>
          )
        )}
      </div>
    </SettingsCard>
  );
}

function AccountSettings({
  settings,
  onUpdate,
}: {
  settings:
    UserSettingsResponse;

  onUpdate: (
    account:
      UserSettingsResponse["account"]
  ) => void;
}) {
  const [
    name,
    setName,
  ] = useState(
    settings.account.name
  );

  const [
    username,
    setUsername,
  ] = useState(
    settings.account.username ??
      ""
  );

  const [
    email,
    setEmail,
  ] = useState(
    settings.account.email
  );

  const [
    saving,
    setSaving,
  ] = useState(false);

  const submit =
    async (
      event:
        React.FormEvent
    ) => {
      event.preventDefault();

      try {
        setSaving(true);

        const result =
          await updateAccountSettings({
            name:
              name.trim(),

            username:
              username.trim() ||
              null,

            email:
              email.trim(),
          });

        onUpdate(
          result.account
        );

        setStoredUser(
          result.account as any
        );

        showSuccessToast(
          "Account updated."
        );
      } catch (error) {
        showErrorToast(
          error instanceof Error
            ? error.message
            : "Unable to update account."
        );
      } finally {
        setSaving(false);
      }
    };

  return (
    <SettingsCard
      title="Account"
      description="Manage your basic account details."
    >
      <form
        onSubmit={
          submit
        }
        className="space-y-5"
      >
        <SettingsInput
          label="Name"
          value={name}
          onChange={
            setName
          }
        />

        <SettingsInput
          label="Username"
          value={
            username
          }
          onChange={
            setUsername
          }
          placeholder="Optional"
        />

        <SettingsInput
          label="Email"
          type="email"
          value={email}
          onChange={
            setEmail
          }
        />

        <button
          type="submit"
          disabled={
            saving
          }
          className="
            app-accent-bg
            flex h-11
            items-center
            justify-center
            rounded-xl
            px-5
            text-sm
            font-semibold
            disabled:opacity-50
          "
        >
          {saving
            ? "Saving..."
            : "Save changes"}
        </button>
      </form>
    </SettingsCard>
  );
}

function SecuritySettings({
  onSignedOut,
}: {
  onSignedOut:
    () => void;
}) {
  const [
    currentPassword,
    setCurrentPassword,
  ] = useState("");

  const [
    newPassword,
    setNewPassword,
  ] = useState("");

  const [
    saving,
    setSaving,
  ] = useState(false);

  const change =
    async (
      event:
        React.FormEvent
    ) => {
      event.preventDefault();

      try {
        setSaving(true);

        await changePassword({
          currentPassword,
          newPassword,
        });

        showSuccessToast(
          "Password changed. Please sign in again."
        );

        onSignedOut();
      } catch (error) {
        showErrorToast(
          error instanceof Error
            ? error.message
            : "Unable to change password."
        );
      } finally {
        setSaving(false);
      }
    };

  const logoutEverywhere =
    async () => {
      if (
        !window.confirm(
          "Sign out of Orbi on all devices?"
        )
      ) {
        return;
      }

      try {
        await logoutAllDevices();

        showSuccessToast(
          "Signed out on all devices."
        );

        onSignedOut();
      } catch (error) {
        showErrorToast(
          error instanceof Error
            ? error.message
            : "Unable to sign out."
        );
      }
    };

  return (
    <div className="space-y-6">
      <SettingsCard
        title="Password"
        description="Change the password used to access your account."
      >
        <form
          onSubmit={
            change
          }
          className="space-y-5"
        >
          <SettingsInput
            label="Current password"
            type="password"
            value={
              currentPassword
            }
            onChange={
              setCurrentPassword
            }
          />

          <SettingsInput
            label="New password"
            type="password"
            value={
              newPassword
            }
            onChange={
              setNewPassword
            }
          />

          <button
            type="submit"
            disabled={
              saving
            }
            className="
              app-accent-bg
              flex h-11
              items-center
              gap-2
              rounded-xl
              px-5
              text-sm
              font-semibold
              disabled:opacity-50
            "
          >
            <KeyRound
              size={16}
            />

            Change password
          </button>
        </form>
      </SettingsCard>

      <SettingsCard
        title="Login sessions"
        description="Sign out every browser or device currently using your account."
      >
        <button
          type="button"
          onClick={
            logoutEverywhere
          }
          className="
            flex h-11
            items-center
            gap-2
            rounded-xl
            border
            border-zinc-200
            px-4
            text-sm
            font-medium
            text-zinc-700
            transition
            hover:bg-zinc-50
            dark:border-zinc-800
            dark:text-zinc-200
            dark:hover:bg-zinc-900
          "
        >
          <LogOut
            size={16}
          />

          Log out all devices
        </button>
      </SettingsCard>
    </div>
  );
}

function DataSettings({
  onDeleted,
}: {
  onDeleted:
    () => void;
}) {
  const [
    password,
    setPassword,
  ] = useState("");

  const clearHistory =
    async () => {
      if (
        !window.confirm(
          "Clear all search history?"
        )
      ) {
        return;
      }

      try {
        await clearSearchHistory();

        showSuccessToast(
          "Search history cleared."
        );
      } catch (error) {
        showErrorToast(
          error instanceof Error
            ? error.message
            : "Unable to clear history."
        );
      }
    };

  const clearSaved =
    async () => {
      if (
        !window.confirm(
          "Remove all saved providers?"
        )
      ) {
        return;
      }

      try {
        await clearSavedProviders();

        showSuccessToast(
          "Saved providers cleared."
        );
      } catch (error) {
        showErrorToast(
          error instanceof Error
            ? error.message
            : "Unable to clear saved providers."
        );
      }
    };

  const removeAccount =
    async () => {
      if (!password) {
        showErrorToast(
          "Enter your password first."
        );

        return;
      }

      if (
        !window.confirm(
          "Permanently delete your Orbi account? This cannot be undone."
        )
      ) {
        return;
      }

      try {
        await deleteAccount(
          password
        );

        showSuccessToast(
          "Account deleted."
        );

        onDeleted();
      } catch (error) {
        showErrorToast(
          error instanceof Error
            ? error.message
            : "Unable to delete account."
        );
      }
    };

  return (
    <div className="space-y-6">
      <SettingsCard
        title="Your data"
        description="Control stored search and provider data."
      >
        <div
          className="
            flex flex-col
            gap-3
            sm:flex-row
          "
        >
          <button
            type="button"
            onClick={
              clearHistory
            }
            className="
              rounded-xl
              border
              border-zinc-200
              px-4 py-2.5
              text-sm
              font-medium
              dark:border-zinc-800
            "
          >
            Clear search history
          </button>

          <button
            type="button"
            onClick={
              clearSaved
            }
            className="
              rounded-xl
              border
              border-zinc-200
              px-4 py-2.5
              text-sm
              font-medium
              dark:border-zinc-800
            "
          >
            Clear saved providers
          </button>
        </div>
      </SettingsCard>

      <SettingsCard
        title="Delete account"
        description="Permanently delete your account and associated Orbi data."
      >
        <SettingsInput
          label="Confirm password"
          type="password"
          value={
            password
          }
          onChange={
            setPassword
          }
        />

        <button
          type="button"
          onClick={
            removeAccount
          }
          className="
            mt-5
            flex h-11
            items-center
            gap-2
            rounded-xl
            bg-red-600
            px-4
            text-sm
            font-semibold
            text-white
            hover:bg-red-700
          "
        >
          <Trash2
            size={16}
          />

          Delete account
        </button>
      </SettingsCard>
    </div>
  );
}

function ThemeButton({
  title,
  icon,
  active,
  disabled,
  onClick,
}: {
  title: string;
  icon:
    React.ReactNode;
  active: boolean;
  disabled: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      disabled={
        disabled
      }
      onClick={
        onClick
      }
      className={`
        flex h-20
        flex-col
        items-center
        justify-center
        gap-2
        rounded-xl
        border
        text-sm
        font-medium
        transition

        ${
          active
            ? "border-zinc-950 bg-zinc-100  text-zinc-950 dark:text-white dark:border-white dark:bg-zinc-800 dark:text-white"
            : "border-zinc-200  text-zinc-500 dark:text-zinc-400 hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-900"
        }
      `}
    >
      {icon}
      {title}
    </button>
  );
}

function SettingsCard({
  title,
  description,
  children,
}: {
  title: string;
  description:
    string;
  children:
    React.ReactNode;
}) {
  return (
    <section
      className="
        rounded-2xl
        border
        border-zinc-200
        bg-white dark:bg-zinc-950
        p-6
        dark:border-zinc-800
        dark:bg-zinc-950
      "
    >
      <h2
        className="
          text-lg
          font-semibold
           text-zinc-950 dark:text-white
          dark:text-zinc-50
        "
      >
        {title}
      </h2>

      <p
        className="
          mt-1
          text-sm
          leading-6
           text-zinc-500 dark:text-zinc-400
          dark:text-zinc-400
        "
      >
        {description}
      </p>

      <div className="mt-6">
        {children}
      </div>
    </section>
  );
}

function SettingLabel({
  children,
  className = "",
}: {
  children:
    React.ReactNode;
  className?: string;
}) {
  return (
    <p
      className={`
        text-sm
        font-medium
        text-zinc-900
        dark:text-zinc-100
        ${className}
      `}
    >
      {children}
    </p>
  );
}

function SettingsInput({
  label,
  value,
  onChange,
  type = "text",
  placeholder,
}: {
  label: string;
  value: string;
  onChange:
    (value: string) =>
      void;
  type?: string;
  placeholder?: string;
}) {
  return (
    <label className="block">
      <span
        className="
          text-sm
          font-medium
          text-zinc-800
          dark:text-zinc-200
        "
      >
        {label}
      </span>

      <input
        type={type}
        value={value}
        placeholder={
          placeholder
        }
        onChange={(
          event
        ) =>
          onChange(
            event.target
              .value
          )
        }
        className="
          mt-2
          h-11 w-full
          rounded-xl
          border
          border-zinc-200
          bg-white dark:bg-zinc-950
          px-4
          text-sm
          text-zinc-900
          outline-none
          transition
          focus:border-zinc-400
          dark:border-zinc-800
          dark:bg-zinc-900
          dark:text-zinc-100
        "
      />
    </label>
  );
}

function SettingsLoading() {
  return (
    <main
      className="
        min-h-screen
        bg-white dark:bg-zinc-950
        dark:bg-zinc-950
      "
    >
      <div
        className="
          mx-auto
          max-w-6xl
          px-6
          pt-20
        "
      >
        <LoaderCircle
          className="
            animate-spin
            text-zinc-400
          "
        />
      </div>
    </main>
  );
}

function SignInRequired() {
  return (
    <main
      className="
        flex min-h-screen
        items-center
        justify-center
        bg-white dark:bg-zinc-950
        px-6
        dark:bg-zinc-950
      "
    >
      <div className="text-center">
        <Shield
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
            dark:text-white
          "
        >
          Sign in to manage settings
        </h1>

        <Link
          href="/login"
          className="
            app-accent-bg
            mt-6
            inline-flex
            rounded-xl
            px-5 py-3
            text-sm
            font-semibold
          "
        >
          Sign in
        </Link>
      </div>
    </main>
  );
}