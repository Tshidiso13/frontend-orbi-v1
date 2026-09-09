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
} from "lucide-react";

import {
  loginUser,
} from "@/lib/api";

import {
  dismissToast,
  showErrorToast,
  showLoadingToast,
  showSuccessToast,
} from "@/lib/toast";

export default function LoginPage() {
  const router =
    useRouter();

  const [
    email,
    setEmail,
  ] = useState("");

  const [
    password,
    setPassword,
  ] = useState("");

  const [
    showPassword,
    setShowPassword,
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

      if (
        !email.trim() ||
        !password.trim()
      ) {
        const message =
          "Please enter your email and password.";

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

        loadingToastId =
          showLoadingToast(
            "Signing you into Orbi..."
          );

        const data =
          await loginUser({
            email:
              email
                .trim()
                .toLowerCase(),

            password,
          });

        if (
          loadingToastId
        ) {
          dismissToast(
            loadingToastId
          );
        }

        showSuccessToast(
          `Welcome back, ${data.user.name}!`
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
                flex h-11 w-11
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

            <div
              className="
                text-left
              "
            >
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
            Welcome back
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
            Sign in to continue
            finding trusted local
            service providers.
          </p>
        </div>

        {/* Form */}
        <form
          onSubmit={
            handleSubmit
          }
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
            <div
              className="
                mb-2
                flex
                items-center
                justify-between
                gap-3
              "
            >
              <label
                htmlFor="password"
                className="
                  text-sm
                  font-medium
                  text-zinc-700

                  dark:text-zinc-300
                "
              >
                Password
              </label>

              <Link
                href="/forgot-password"
                className="
                  text-xs
                  font-medium
                  text-zinc-500
                  transition

                  hover:text-zinc-950

                  dark:text-zinc-400
                  dark:hover:text-white
                "
              >
                Forgot password?
              </Link>
            </div>

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
                autoComplete="current-password"
                placeholder="Enter your password"
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
                aria-label={
                  showPassword
                    ? "Hide password"
                    : "Show password"
                }
                disabled={
                  loading
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

          {/* Submit */}
          <button
            type="submit"
            disabled={
              loading
            }
            className="
              flex h-12
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

                Signing in...
              </>
            ) : (
              <>
                Sign in

                <ArrowRight
                  size={17}
                />
              </>
            )}
          </button>
        </form>

        {/* Register */}
        <p
          className="
            mt-8
            text-center
            text-sm
            text-zinc-500

            dark:text-zinc-400
          "
        >
          Don&apos;t have an
          account?{" "}

          <Link
            href="/register"
            className="
              font-semibold
              text-zinc-950

              hover:underline

              dark:text-white
            "
          >
            Create account
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
          By continuing, you agree
          to our{" "}

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