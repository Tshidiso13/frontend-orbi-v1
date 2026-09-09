"use client";

import {
  FormEvent,
  useState,
} from "react";

import Image from "next/image";
import Link from "next/link";

import {
  ArrowLeft,
  CheckCircle2,
  LoaderCircle,
  Mail,
} from "lucide-react";

import {
  forgotPassword,
} from "@/lib/api";

import {
  showErrorToast,
  showSuccessToast,
} from "@/lib/toast";

export default function ForgotPasswordPage() {
  const [
    email,
    setEmail,
  ] = useState("");

  const [
    loading,
    setLoading,
  ] = useState(false);

  const [
    sent,
    setSent,
  ] = useState(false);

  const submit =
    async (
      event:
        FormEvent<HTMLFormElement>
    ) => {
      event.preventDefault();

      const cleanEmail =
        email
          .trim()
          .toLowerCase();

      if (!cleanEmail) {
        showErrorToast(
          "Please enter your email address."
        );

        return;
      }

      try {
        setLoading(
          true
        );

        await forgotPassword(
          cleanEmail
        );

        setEmail(
          cleanEmail
        );

        setSent(
          true
        );

        showSuccessToast(
          "Password reset request sent."
        );
      } catch (error) {
        showErrorToast(
          error instanceof Error
            ? error.message
            : "Unable to request password reset."
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
        {/* Logo */}
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

        {/* Back */}
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

        {/* Card */}
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
          {!sent ? (
            <>
              {/* Heading */}
              <h1
                className="
                  text-2xl
                  font-semibold
                  tracking-tight
                  text-zinc-950

                  dark:text-white
                "
              >
                Forgot your
                password?
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
                Enter the email
                associated with your
                Orbi account and
                we&apos;ll send you
                a password reset
                link.
              </p>

              <form
                onSubmit={
                  submit
                }
                className="mt-7"
              >
                <label
                  htmlFor="email"
                  className="
                    block
                    text-sm
                    font-medium
                    text-zinc-800

                    dark:text-zinc-200
                  "
                >
                  Email address
                </label>

                <div
                  className="
                    relative
                    mt-2
                  "
                >
                  <Mail
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
                    id="email"
                    type="email"
                    required
                    autoComplete="email"
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
                    placeholder="you@example.com"
                    disabled={
                      loading
                    }
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
                </div>

                <button
                  type="submit"
                  disabled={
                    loading ||
                    !email.trim()
                  }
                  className="
                    mt-5
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

                      Sending...
                    </>
                  ) : (
                    <>
                      <Mail
                        size={16}
                      />

                      Send reset link
                    </>
                  )}
                </button>
              </form>

              <p
                className="
                  mt-5
                  text-center
                  text-xs
                  leading-5
                  text-zinc-400

                  dark:text-zinc-500
                "
              >
                For security, we
                won&apos;t tell you
                whether an account
                exists for that
                email.
              </p>
            </>
          ) : (
            <div
              className="
                py-3
                text-center
              "
            >
              {/* Success */}
              <div
                className="
                  mx-auto
                  flex
                  h-14 w-14
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
                Check your email
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
                If an account exists
                for{" "}
                <strong
                  className="
                    font-semibold
                    text-zinc-800

                    dark:text-zinc-200
                  "
                >
                  {email}
                </strong>
                , we sent a password
                reset link.
              </p>

              <p
                className="
                  mt-3
                  text-xs
                  leading-5
                  text-zinc-400

                  dark:text-zinc-500
                "
              >
                The link expires
                after 30 minutes.
                Check your spam
                folder if you
                don&apos;t see the
                email.
              </p>

              <Link
                href="/login"
                className="
                  mt-7
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
                Return to sign in
              </Link>

              <button
                type="button"
                onClick={() =>
                  setSent(
                    false
                  )
                }
                className="
                  mt-4
                  block
                  w-full
                  text-sm
                  font-medium
                  text-zinc-500
                  transition

                  hover:text-zinc-950

                  dark:text-zinc-400
                  dark:hover:text-white
                "
              >
                Use another email
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <p
          className="
            mt-8
            text-center
            text-xs
            text-zinc-400

            dark:text-zinc-500
          "
        >
          ©{" "}
          {new Date().getFullYear()}{" "}
          Orbi
        </p>
      </div>
    </main>
  );
}