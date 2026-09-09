"use client";

import {
  Suspense,
  useState,
} from "react";

import Image from "next/image";
import Link from "next/link";

import {
  useRouter,
  useSearchParams,
} from "next/navigation";

import {
  ArrowLeft,
  CheckCircle2,
  Eye,
  EyeOff,
  LoaderCircle,
  Lock,
} from "lucide-react";

import {
  resetPassword,
} from "@/lib/api";

import {
  showErrorToast,
  showSuccessToast,
} from "@/lib/toast";

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <ResetLoading />
      }
    >
      <ResetPasswordContent />
    </Suspense>
  );
}

function ResetPasswordContent() {
  const router =
    useRouter();

  const searchParams =
    useSearchParams();

  const token =
    searchParams.get(
      "token"
    );

  const [
    password,
    setPassword,
  ] = useState("");

  const [
    confirmPassword,
    setConfirmPassword,
  ] = useState("");

  const [
    showPassword,
    setShowPassword,
  ] = useState(false);

  const [
    showConfirmPassword,
    setShowConfirmPassword,
  ] = useState(false);

  const [
    loading,
    setLoading,
  ] = useState(false);

  const [
    success,
    setSuccess,
  ] = useState(false);

  const submit =
    async (
      event:
        React.FormEvent<HTMLFormElement>
    ) => {
      event.preventDefault();

      if (loading) {
        return;
      }

      if (!token) {
        showErrorToast(
          "Password reset token is missing."
        );

        return;
      }

      if (
        password.length <
        8
      ) {
        showErrorToast(
          "Password must be at least 8 characters."
        );

        return;
      }

      if (
        password !==
        confirmPassword
      ) {
        showErrorToast(
          "Passwords do not match."
        );

        return;
      }

      try {
        setLoading(
          true
        );

        await resetPassword({
          token,

          newPassword:
            password,
        });

        setSuccess(
          true
        );

        showSuccessToast(
          "Password reset successfully."
        );
      } catch (error) {
        showErrorToast(
          error instanceof Error
            ? error.message
            : "Unable to reset password."
        );
      } finally {
        setLoading(
          false
        );
      }
    };

  if (!token) {
    return (
      <InvalidResetLink />
    );
  }

  if (success) {
    return (
      <main
        className="
          flex
          min-h-screen
          items-center
          justify-center
          bg-white
          px-5
          py-12

          dark:bg-zinc-950
        "
      >
        <div
          className="
            w-full
            max-w-md
          "
        >
          <OrbiLogo />

          <div
            className="
              rounded-3xl
              border
              border-zinc-200
              bg-white
              p-8
              text-center
              shadow-sm

              dark:border-zinc-800
              dark:bg-zinc-900
              dark:shadow-black/20
            "
          >
            <div
              className="
                mx-auto
                flex h-14 w-14
                items-center
                justify-center
                rounded-full
                bg-green-50
                text-green-600

                dark:bg-green-950/30
                dark:text-green-400
              "
            >
              <CheckCircle2
                size={27}
              />
            </div>

            <h1
              className="
                mt-5
                text-2xl
                font-semibold
                tracking-tight
                text-zinc-950

                dark:text-white
              "
            >
              Password changed
            </h1>

            <p
              className="
                mt-3
                text-sm
                leading-6
                text-zinc-500

                dark:text-zinc-400
              "
            >
              Your password has been
              reset successfully.
              Sign in with your new
              password.
            </p>

            <button
              type="button"
              onClick={() =>
                router.push(
                  "/login"
                )
              }
              className="
                mt-7
                flex h-11
                w-full
                items-center
                justify-center
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
              Sign in
            </button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main
      className="
        flex
        min-h-screen
        items-center
        justify-center
        bg-white
        px-5
        py-12

        dark:bg-zinc-950
      "
    >
      <div
        className="
          w-full
          max-w-md
        "
      >
        <OrbiLogo />

        <Link
          href="/login"
          className="
            mb-5
            inline-flex
            items-center
            gap-2
            text-sm
            font-medium
            text-zinc-500
            transition

            hover:text-zinc-950

            dark:text-zinc-400
            dark:hover:text-white
          "
        >
          <ArrowLeft
            size={16}
          />

          Back to sign in
        </Link>

        <div
          className="
            rounded-3xl
            border
            border-zinc-200
            bg-white
            p-7
            shadow-sm

            dark:border-zinc-800
            dark:bg-zinc-900
            dark:shadow-black/20

            sm:p-8
          "
        >
          <h1
            className="
              text-2xl
              font-semibold
              tracking-tight
              text-zinc-950

              dark:text-white
            "
          >
            Create a new password
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
            Choose a strong new
            password for your Orbi
            account. It must contain
            at least 8 characters.
          </p>

          <form
            onSubmit={
              submit
            }
            className="
              mt-7
              space-y-5
            "
          >
            <PasswordField
              id="new-password"
              label="New password"
              value={
                password
              }
              onChange={
                setPassword
              }
              visible={
                showPassword
              }
              onToggle={() =>
                setShowPassword(
                  (
                    current
                  ) =>
                    !current
                )
              }
              disabled={
                loading
              }
            />

            <PasswordField
              id="confirm-password"
              label="Confirm password"
              value={
                confirmPassword
              }
              onChange={
                setConfirmPassword
              }
              visible={
                showConfirmPassword
              }
              onToggle={() =>
                setShowConfirmPassword(
                  (
                    current
                  ) =>
                    !current
                )
              }
              disabled={
                loading
              }
            />

            <button
              type="submit"
              disabled={
                loading ||
                password.length <
                  8 ||
                !confirmPassword
              }
              className="
                flex
                h-12
                w-full
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

                  Resetting...
                </>
              ) : (
                "Reset password"
              )}
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}

function PasswordField({
  id,
  label,
  value,
  onChange,
  visible,
  onToggle,
  disabled,
}: {
  id: string;

  label: string;

  value: string;

  onChange:
    (value: string) =>
      void;

  visible: boolean;

  onToggle: () => void;

  disabled: boolean;
}) {
  return (
    <div>
      <label
        htmlFor={id}
        className="
          mb-2
          block
          text-sm
          font-medium
          text-zinc-800

          dark:text-zinc-200
        "
      >
        {label}
      </label>

      <div className="relative">
        <Lock
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
          id={id}
          type={
            visible
              ? "text"
              : "password"
          }
          value={
            value
          }
          required
          minLength={8}
          autoComplete="new-password"
          disabled={
            disabled
          }
          onChange={(
            event
          ) =>
            onChange(
              event.target.value
            )
          }
          placeholder={
            label ===
            "New password"
              ? "Minimum 8 characters"
              : "Enter password again"
          }
          className="
            h-12
            w-full
            rounded-xl
            border
            border-zinc-200
            bg-white
            pl-11
            pr-12
            text-sm
            text-zinc-950
            outline-none
            transition

            placeholder:text-zinc-400

            focus:border-zinc-400
            focus:ring-2
            focus:ring-zinc-100

            disabled:cursor-not-allowed
            disabled:bg-zinc-50
            disabled:opacity-70

            dark:border-zinc-700
            dark:bg-zinc-950
            dark:text-white
            dark:placeholder:text-zinc-500
            dark:focus:border-zinc-600
            dark:focus:ring-zinc-800
            dark:disabled:bg-zinc-950
          "
        />

        <button
          type="button"
          onClick={
            onToggle
          }
          disabled={
            disabled
          }
          aria-label={
            visible
              ? `Hide ${label.toLowerCase()}`
              : `Show ${label.toLowerCase()}`
          }
          className="
            absolute
            right-3
            top-1/2
            flex h-8 w-8
            -translate-y-1/2
            items-center
            justify-center
            rounded-lg
            text-zinc-400
            transition

            hover:bg-zinc-100
            hover:text-zinc-700

            disabled:opacity-50

            dark:text-zinc-500
            dark:hover:bg-zinc-800
            dark:hover:text-white
          "
        >
          {visible ? (
            <EyeOff
              size={18}
            />
          ) : (
            <Eye
              size={18}
            />
          )}
        </button>
      </div>
    </div>
  );
}

function InvalidResetLink() {
  return (
    <main
      className="
        flex
        min-h-screen
        items-center
        justify-center
        bg-white
        px-5
        py-12

        dark:bg-zinc-950
      "
    >
      <div
        className="
          w-full
          max-w-md
        "
      >
        <OrbiLogo />

        <div
          className="
            rounded-3xl
            border
            border-zinc-200
            bg-white
            p-8
            text-center
            shadow-sm

            dark:border-zinc-800
            dark:bg-zinc-900
            dark:shadow-black/20
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
              text-zinc-500

              dark:bg-zinc-800
              dark:text-zinc-400
            "
          >
            <Lock
              size={24}
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
            Invalid reset link
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
            This password reset
            link is missing or
            invalid. Request a new
            one to continue.
          </p>

          <Link
            href="/forgot-password"
            className="
              mt-6
              inline-flex
              h-11
              items-center
              justify-center
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
            Request new link
          </Link>
        </div>
      </div>
    </main>
  );
}

function ResetLoading() {
  return (
    <main
      className="
        flex
        min-h-screen
        items-center
        justify-center
        bg-white

        dark:bg-zinc-950
      "
    >
      <div
        className="
          flex
          flex-col
          items-center
          gap-3
        "
      >
        <LoaderCircle
          size={25}
          className="
            animate-spin
            text-zinc-700

            dark:text-zinc-300
          "
        />

        <p
          className="
            text-sm
            text-zinc-500

            dark:text-zinc-400
          "
        >
          Loading...
        </p>
      </div>
    </main>
  );
}

function OrbiLogo() {
  return (
    <div
      className="
        mb-8
        text-center
      "
    >
      <Link
        href="/"
        className="
          inline-flex
          items-center
          gap-3
        "
      >
        <div
          className="
            flex
            h-11 w-11
            shrink-0
            items-center
            justify-center
            overflow-hidden
            rounded-xl
          "
        >
          <Image
            src="/orbi-logo.png"
            alt="Orbi logo"
            width={44}
            height={44}
            priority
            className="
              h-full
              w-full
              object-contain
            "
          />
        </div>

        <div className="text-left">
          <p
            className="
              text-xl
              font-semibold
              tracking-tight
              text-zinc-950

              dark:text-white
            "
          >
            Orbi
          </p>

          <p
            className="
              text-[11px]
              text-zinc-500

              dark:text-zinc-400
            "
          >
            Service Assistant
          </p>
        </div>
      </Link>
    </div>
  );
}