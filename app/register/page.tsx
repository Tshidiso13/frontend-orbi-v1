"use client";

import {
  FormEvent,
  useState,
} from "react";

import Image from "next/image";
import Link from "next/link";

import {
  useRouter,
} from "next/navigation";

import {
  ArrowRight,
  Eye,
  EyeOff,
  Lock,
  Mail,
  User,
} from "lucide-react";

import {
  registerUser,
} from "@/lib/api";

import {
  dismissToast,
  showErrorToast,
  showLoadingToast,
  showSuccessToast,
} from "@/lib/toast";

export default function RegisterPage() {
  const router =
    useRouter();

  const [
    name,
    setName,
  ] = useState("");

  const [
    email,
    setEmail,
  ] = useState("");

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
    error,
    setError,
  ] = useState("");

  const [
    loading,
    setLoading,
  ] = useState(false);

  const handleSubmit =
    async (
      event:
        FormEvent<HTMLFormElement>
    ) => {
      event.preventDefault();

      if (loading) {
        return;
      }

      setError("");

      const cleanName =
        name.trim();

      const cleanEmail =
        email
          .trim()
          .toLowerCase();

      if (
        !cleanName ||
        !cleanEmail ||
        !password ||
        !confirmPassword
      ) {
        const message =
          "Please complete all fields.";

        setError(
          message
        );

        showErrorToast(
          message
        );

        return;
      }

      if (
        cleanName.length <
        2
      ) {
        const message =
          "Please enter your full name.";

        setError(
          message
        );

        showErrorToast(
          message
        );

        return;
      }

      const emailRegex =
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

      if (
        !emailRegex.test(
          cleanEmail
        )
      ) {
        const message =
          "Please enter a valid email address.";

        setError(
          message
        );

        showErrorToast(
          message
        );

        return;
      }

      if (
        password.length <
        8
      ) {
        const message =
          "Password must be at least 8 characters long.";

        setError(
          message
        );

        showErrorToast(
          message
        );

        return;
      }

      if (
        password !==
        confirmPassword
      ) {
        const message =
          "Passwords do not match.";

        setError(
          message
        );

        showErrorToast(
          message
        );

        return;
      }

      let loadingToastId:
        string | undefined;

      try {
        setLoading(
          true
        );

        const startedAt =
          Date.now();

        loadingToastId =
          showLoadingToast(
            "Creating your Orbi account..."
          );

        const data =
          await registerUser({
            name:
              cleanName,

            email:
              cleanEmail,

            password,
          });

        const elapsed =
          Date.now() -
          startedAt;

        const minimumLoadingTime =
          900;

        if (
          elapsed <
          minimumLoadingTime
        ) {
          await new Promise(
            (resolve) =>
              setTimeout(
                resolve,
                minimumLoadingTime -
                  elapsed
              )
          );
        }

        if (
          loadingToastId
        ) {
          dismissToast(
            loadingToastId
          );
        }

        showSuccessToast(
          `Welcome to Orbi, ${data.user.name}!`
        );

        await new Promise(
          (resolve) =>
            setTimeout(
              resolve,
              250
            )
        );

        router.push(
          "/"
        );

        router.refresh();
      } catch (error) {
        if (
          loadingToastId
        ) {
          dismissToast(
            loadingToastId
          );
        }

        const message =
          error instanceof Error
            ? error.message
            : "Something went wrong. Please try again.";

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
      }
    };

  return (
    <main
      className="
        flex
        min-h-screen
        items-center
        justify-center
        bg-white
        px-5
        py-16

        dark:bg-zinc-950
      "
    >
      <div
        className="
          w-full
          max-w-md
        "
      >
        {/* Logo */}
        <div
          className="
            mb-10
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

        {/* Heading */}
        <div className="text-center">
          <h1
            className="
              text-3xl
              font-semibold
              tracking-tight
              text-zinc-950

              dark:text-white
            "
          >
            Create your account
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
            Save providers, keep
            your search history and
            continue where you left
            off.
          </p>
        </div>

        {/* Form */}
        <form
          onSubmit={
            handleSubmit
          }
          noValidate
          className="
            mt-8
            space-y-5
          "
        >
          {/* Error */}
          {error && (
            <div
              role="alert"
              className="
                rounded-xl
                border
                border-red-200
                bg-red-50
                px-4
                py-3
                text-sm
                text-red-600

                dark:border-red-900/60
                dark:bg-red-950/30
                dark:text-red-400
              "
            >
              {error}
            </div>
          )}

          {/* Name */}
          <div>
            <label
              htmlFor="name"
              className="
                mb-2
                block
                text-sm
                font-medium
                text-zinc-700

                dark:text-zinc-300
              "
            >
              Full name
            </label>

            <div className="relative">
              <User
                size={18}
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
                id="name"
                type="text"
                value={
                  name
                }
                onChange={(
                  event
                ) =>
                  setName(
                    event
                      .target
                      .value
                  )
                }
                autoComplete="name"
                placeholder="Your full name"
                disabled={
                  loading
                }
                required
                className="
                  h-12
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

                  disabled:cursor-not-allowed
                  disabled:bg-zinc-50

                  dark:border-zinc-800
                  dark:bg-zinc-900
                  dark:text-white
                  dark:placeholder:text-zinc-500
                  dark:focus:border-zinc-600
                  dark:focus:ring-zinc-800
                  dark:disabled:bg-zinc-900
                "
              />
            </div>
          </div>

          {/* Email */}
          <div>
            <label
              htmlFor="email"
              className="
                mb-2
                block
                text-sm
                font-medium
                text-zinc-700

                dark:text-zinc-300
              "
            >
              Email address
            </label>

            <div className="relative">
              <Mail
                size={18}
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
                id="email"
                type="email"
                value={
                  email
                }
                onChange={(
                  event
                ) =>
                  setEmail(
                    event
                      .target
                      .value
                  )
                }
                autoComplete="email"
                placeholder="you@example.com"
                disabled={
                  loading
                }
                required
                className="
                  h-12
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

                  disabled:cursor-not-allowed
                  disabled:bg-zinc-50

                  dark:border-zinc-800
                  dark:bg-zinc-900
                  dark:text-white
                  dark:placeholder:text-zinc-500
                  dark:focus:border-zinc-600
                  dark:focus:ring-zinc-800
                  dark:disabled:bg-zinc-900
                "
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label
              htmlFor="password"
              className="
                mb-2
                block
                text-sm
                font-medium
                text-zinc-700

                dark:text-zinc-300
              "
            >
              Password
            </label>

            <div className="relative">
              <Lock
                size={18}
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
                id="password"
                type={
                  showPassword
                    ? "text"
                    : "password"
                }
                value={
                  password
                }
                onChange={(
                  event
                ) =>
                  setPassword(
                    event
                      .target
                      .value
                  )
                }
                autoComplete="new-password"
                placeholder="Minimum 8 characters"
                disabled={
                  loading
                }
                minLength={8}
                required
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

                  dark:border-zinc-800
                  dark:bg-zinc-900
                  dark:text-white
                  dark:placeholder:text-zinc-500
                  dark:focus:border-zinc-600
                  dark:focus:ring-zinc-800
                  dark:disabled:bg-zinc-900
                "
              />

              <button
                type="button"
                onClick={() =>
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
                aria-label={
                  showPassword
                    ? "Hide password"
                    : "Show password"
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
                {showPassword ? (
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

          {/* Confirm Password */}
          <div>
            <label
              htmlFor="confirmPassword"
              className="
                mb-2
                block
                text-sm
                font-medium
                text-zinc-700

                dark:text-zinc-300
              "
            >
              Confirm password
            </label>

            <div className="relative">
              <Lock
                size={18}
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
                id="confirmPassword"
                type={
                  showConfirmPassword
                    ? "text"
                    : "password"
                }
                value={
                  confirmPassword
                }
                onChange={(
                  event
                ) =>
                  setConfirmPassword(
                    event
                      .target
                      .value
                  )
                }
                autoComplete="new-password"
                placeholder="Enter password again"
                disabled={
                  loading
                }
                minLength={8}
                required
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

                  dark:border-zinc-800
                  dark:bg-zinc-900
                  dark:text-white
                  dark:placeholder:text-zinc-500
                  dark:focus:border-zinc-600
                  dark:focus:ring-zinc-800
                  dark:disabled:bg-zinc-900
                "
              />

              <button
                type="button"
                onClick={() =>
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
                aria-label={
                  showConfirmPassword
                    ? "Hide password"
                    : "Show password"
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
                {showConfirmPassword ? (
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

          {/* Submit */}
          <button
            type="submit"
            disabled={
              loading
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
              px-5
              text-sm
              font-semibold
              text-white
              transition

              hover:bg-zinc-800

              disabled:cursor-not-allowed
              disabled:opacity-60

              dark:bg-white
              dark:text-zinc-950
              dark:hover:bg-zinc-200
            "
          >
            {loading ? (
              <>
                <span
                  className="
                    h-4 w-4
                    animate-spin
                    rounded-full
                    border-2
                    border-white/30
                    border-t-white

                    dark:border-zinc-950/30
                    dark:border-t-zinc-950
                  "
                />

                Creating account...
              </>
            ) : (
              <>
                Create account

                <ArrowRight
                  size={17}
                />
              </>
            )}
          </button>
        </form>

        {/* Login */}
        <p
          className="
            mt-8
            text-center
            text-sm
            text-zinc-500

            dark:text-zinc-400
          "
        >
          Already have an
          account?{" "}

          <Link
            href="/login"
            className="
              font-semibold
              text-zinc-950

              hover:underline

              dark:text-white
            "
          >
            Sign in
          </Link>
        </p>

        {/* Terms */}
        <p
          className="
            mx-auto
            mt-8
            max-w-sm
            text-center
            text-xs
            leading-5
            text-zinc-400

            dark:text-zinc-500
          "
        >
          By creating an account,
          you agree to our{" "}

          <Link
            href="/help"
            className="
              underline
              underline-offset-2
              transition

              hover:text-zinc-700

              dark:hover:text-zinc-300
            "
          >
            Terms of Service
          </Link>

          {" "}and{" "}

          <Link
            href="/help"
            className="
              underline
              underline-offset-2
              transition

              hover:text-zinc-700

              dark:hover:text-zinc-300
            "
          >
            Privacy Policy
          </Link>
          .
        </p>
      </div>
    </main>
  );
}