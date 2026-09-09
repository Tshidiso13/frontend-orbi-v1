"use client";

import {
  useEffect,
} from "react";

import {
  getAccessToken,
  getSettings,
} from "@/lib/api";

import type {
  AccentColor,
  ThemeMode,
} from "@/lib/api";

type Appearance = {
  theme: ThemeMode;
  accentColor: AccentColor;
};

type AppearanceUpdate =
  Partial<Appearance>;

const STORAGE_KEY =
  "orbi-appearance";

const defaultAppearance:
  Appearance = {
    theme: "system",
    accentColor: "zinc",
  };

const validThemes:
  ThemeMode[] = [
    "system",
    "light",
    "dark",
  ];

const validAccentColors:
  AccentColor[] = [
    "zinc",
    "blue",
    "green",
    "purple",
    "orange",
  ];

export default function AppSettingsProvider({
  children,
}: {
  children:
    React.ReactNode;
}) {
  useEffect(() => {
    let cancelled =
      false;

    /*
     * Validate a value before
     * treating it as ThemeMode.
     */
    const isValidTheme =
      (
        value: unknown
      ): value is ThemeMode => {
        return (
          typeof value ===
            "string" &&
          validThemes.includes(
            value as ThemeMode
          )
        );
      };

    /*
     * Validate accent color.
     */
    const isValidAccent =
      (
        value: unknown
      ): value is AccentColor => {
        return (
          typeof value ===
            "string" &&
          validAccentColors.includes(
            value as AccentColor
          )
        );
      };

    /*
     * Safely normalize any
     * appearance object.
     */
    const normalizeAppearance =
      (
        value: unknown
      ): Appearance => {
        if (
          !value ||
          typeof value !==
            "object"
        ) {
          return {
            ...defaultAppearance,
          };
        }

        const object =
          value as Record<
            string,
            unknown
          >;

        return {
          theme:
            isValidTheme(
              object.theme
            )
              ? object.theme
              : defaultAppearance
                  .theme,

          accentColor:
            isValidAccent(
              object.accentColor
            )
              ? object.accentColor
              : defaultAppearance
                  .accentColor,
        };
      };

    /*
     * Read saved local settings.
     */
    const getStoredAppearance =
      (): Appearance => {
        try {
          const stored =
            localStorage.getItem(
              STORAGE_KEY
            );

          if (!stored) {
            return {
              ...defaultAppearance,
            };
          }

          const parsed =
            JSON.parse(
              stored
            );

          return normalizeAppearance(
            parsed
          );
        } catch {
          return {
            ...defaultAppearance,
          };
        }
      };

    /*
     * Save settings locally.
     */
    const saveAppearance =
      (
        appearance:
          Appearance
      ) => {
        try {
          localStorage.setItem(
            STORAGE_KEY,
            JSON.stringify(
              appearance
            )
          );
        } catch {
          // localStorage may be
          // unavailable in some
          // browser environments.
        }
      };

    /*
     * Apply theme + accent to
     * the document.
     */
    const applyAppearance =
      (
        appearance:
          Appearance
      ) => {
        const root =
          document
            .documentElement;

        const prefersDark =
          window.matchMedia(
            "(prefers-color-scheme: dark)"
          ).matches;

        const dark =
          appearance.theme ===
            "dark" ||
          (
            appearance.theme ===
              "system" &&
            prefersDark
          );

        root.classList.toggle(
          "dark",
          dark
        );

        root.dataset.accent =
          appearance
            .accentColor;

        root.style.colorScheme =
          dark
            ? "dark"
            : "light";
      };

    /*
     * Apply local appearance
     * immediately.
     */
    const applyStoredAppearance =
      () => {
        const appearance =
          getStoredAppearance();

        applyAppearance(
          appearance
        );
      };

    applyStoredAppearance();

    /*
     * Load the signed-in user's
     * appearance from PostgreSQL.
     */
    const loadServerSettings =
      async () => {
        const token =
          getAccessToken();

        /*
         * Logged-out users keep
         * their local preference.
         */
        if (!token) {
          applyStoredAppearance();

          return;
        }

        try {
          const settings =
            await getSettings();

          if (cancelled) {
            return;
          }

          const appearance =
            normalizeAppearance({
              theme:
                settings
                  .appearance
                  .theme,

              accentColor:
                settings
                  .appearance
                  .accentColor,
            });

          saveAppearance(
            appearance
          );

          applyAppearance(
            appearance
          );
        } catch {
          /*
           * Server unavailable,
           * expired token, etc.
           *
           * Keep the local
           * preference instead.
           */
          if (
            !cancelled
          ) {
            applyStoredAppearance();
          }
        }
      };

    loadServerSettings();

    /*
     * Settings page can dispatch:
     *
     * window.dispatchEvent(
     *   new CustomEvent(
     *     "orbi-appearance-updated",
     *     { detail: appearance }
     *   )
     * );
     */
    const handleSettingsUpdate =
      (
        event: Event
      ) => {
        const custom =
          event as CustomEvent<
            AppearanceUpdate
          >;

        const current =
          getStoredAppearance();

        const next =
          normalizeAppearance({
            ...current,
            ...(
              custom.detail ??
              {}
            ),
          });

        saveAppearance(
          next
        );

        applyAppearance(
          next
        );
      };

    /*
     * Auth state changed.
     *
     * Important when the user
     * logs in without refreshing.
     */
    const handleAuthUpdate =
      () => {
        loadServerSettings();
      };

    /*
     * Synchronize settings
     * between browser tabs.
     */
    const handleStorage =
      (
        event:
          StorageEvent
      ) => {
        if (
          event.key ===
          STORAGE_KEY
        ) {
          applyStoredAppearance();
        }
      };

    /*
     * Follow operating-system
     * theme while using
     * theme = "system".
     */
    const media =
      window.matchMedia(
        "(prefers-color-scheme: dark)"
      );

    const handleSystemChange =
      () => {
        const appearance =
          getStoredAppearance();

        if (
          appearance.theme ===
          "system"
        ) {
          applyAppearance(
            appearance
          );
        }
      };

    window.addEventListener(
      "orbi-appearance-updated",
      handleSettingsUpdate
    );

    window.addEventListener(
      "auth-updated",
      handleAuthUpdate
    );

    window.addEventListener(
      "storage",
      handleStorage
    );

    media.addEventListener(
      "change",
      handleSystemChange
    );

    return () => {
      cancelled =
        true;

      window.removeEventListener(
        "orbi-appearance-updated",
        handleSettingsUpdate
      );

      window.removeEventListener(
        "auth-updated",
        handleAuthUpdate
      );

      window.removeEventListener(
        "storage",
        handleStorage
      );

      media.removeEventListener(
        "change",
        handleSystemChange
      );
    };
  }, []);

  return (
    <>
      {children}
    </>
  );
}