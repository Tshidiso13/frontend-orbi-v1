import toast from "react-hot-toast";

import type {
  Toast,
} from "react-hot-toast";

import {
  Check,
  CircleAlert,
  LoaderCircle,
  X,
} from "lucide-react";

const TOAST_DURATION =
  3500;

type ToastType =
  | "success"
  | "error";

interface CustomToastProps {
  t: Toast;
  message: string;
  type: ToastType;
}

function CustomToast({
  t,
  message,
  type,
}: CustomToastProps) {
  const success =
    type === "success";

  return (
    <div
      role="status"
      aria-live="polite"
      className={`
        relative
        w-[360px]
        max-w-[calc(100vw-32px)]
        overflow-hidden
        rounded-2xl
        border
        border-zinc-200
        bg-white
        shadow-xl
        shadow-black/10
        transition-all
        duration-300

        dark:border-zinc-800
        dark:bg-zinc-900
        dark:shadow-black/30

        ${
          t.visible
            ? "translate-y-0 opacity-100"
            : "-translate-y-3 opacity-0"
        }
      `}
    >
      <div
        className="
          flex
          items-center
          gap-3
          px-4
          py-4
        "
      >
        {/* Icon */}
        <div
          className={`
            flex
            h-9 w-9
            shrink-0
            items-center
            justify-center
            rounded-full

            ${
              success
                ? `
                  bg-emerald-50
                  text-emerald-600

                  dark:bg-emerald-950/40
                  dark:text-emerald-400
                `
                : `
                  bg-red-50
                  text-red-600

                  dark:bg-red-950/40
                  dark:text-red-400
                `
            }
          `}
        >
          {success ? (
            <Check
              size={18}
              strokeWidth={
                2.5
              }
            />
          ) : (
            <CircleAlert
              size={18}
            />
          )}
        </div>

        {/* Text */}
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
            {success
              ? "Success"
              : "Something went wrong"}
          </p>

          <p
            className="
              mt-0.5
              break-words
              text-sm
              leading-5
              text-zinc-500

              dark:text-zinc-400
            "
          >
            {message}
          </p>
        </div>

        {/* Close */}
        <button
          type="button"
          onClick={() =>
            toast.dismiss(
              t.id
            )
          }
          aria-label="Dismiss notification"
          className="
            flex
            h-8 w-8
            shrink-0
            items-center
            justify-center
            rounded-lg
            text-zinc-400
            transition

            hover:bg-zinc-100
            hover:text-zinc-700

            dark:text-zinc-500
            dark:hover:bg-zinc-800
            dark:hover:text-white
          "
        >
          <X size={16} />
        </button>
      </div>

      {/* Countdown track */}
      <div
        className="
          h-1
          w-full
          bg-zinc-100

          dark:bg-zinc-800
        "
      >
        <div
          className={`
            h-full
            origin-left
            animate-toast-progress

            ${
              success
                ? "bg-emerald-500"
                : "bg-red-500"
            }
          `}
        />
      </div>
    </div>
  );
}

export function showSuccessToast(
  message: string
) {
  return toast.custom(
    (t) => (
      <CustomToast
        t={t}
        message={
          message
        }
        type="success"
      />
    ),
    {
      duration:
        TOAST_DURATION,
    }
  );
}

export function showErrorToast(
  message: string
) {
  return toast.custom(
    (t) => (
      <CustomToast
        t={t}
        message={
          message
        }
        type="error"
      />
    ),
    {
      duration:
        TOAST_DURATION,
    }
  );
}

export function showLoadingToast(
  message: string
) {
  return toast.custom(
    (t) => (
      <div
        role="status"
        aria-live="polite"
        className={`
          flex
          w-[340px]
          max-w-[calc(100vw-32px)]
          items-center
          gap-3
          rounded-2xl
          border
          border-zinc-200
          bg-white
          px-4
          py-4
          shadow-xl
          shadow-black/10
          transition-all
          duration-300

          dark:border-zinc-800
          dark:bg-zinc-900
          dark:shadow-black/30

          ${
            t.visible
              ? "translate-y-0 opacity-100"
              : "-translate-y-3 opacity-0"
          }
        `}
      >
        {/* Loader */}
        <div
          className="
            flex
            h-9 w-9
            shrink-0
            items-center
            justify-center
            rounded-full
            bg-zinc-100

            dark:bg-zinc-800
          "
        >
          <LoaderCircle
            size={18}
            className="
              animate-spin
              text-zinc-700

              dark:text-zinc-300
            "
          />
        </div>

        {/* Text */}
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
            Please wait
          </p>

          <p
            className="
              mt-0.5
              break-words
              text-sm
              leading-5
              text-zinc-500

              dark:text-zinc-400
            "
          >
            {message}
          </p>
        </div>
      </div>
    ),
    {
      duration:
        Infinity,
    }
  );
}

export function dismissToast(
  toastId:
    string
) {
  toast.dismiss(
    toastId
  );
}