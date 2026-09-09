"use client";

import {
  ChangeEvent,
  useEffect,
  useRef,
  useState,
} from "react";

import {
  Camera,
  LoaderCircle,
  X,
} from "lucide-react";

import {
  getStoredUser,
  updateProfile,
} from "@/lib/api";

import type {
  AuthUser,
} from "@/lib/api";

import {
  dismissToast,
  showErrorToast,
  showLoadingToast,
  showSuccessToast,
} from "@/lib/toast";

interface ProfileProps {
  open: boolean;
  onClose: () => void;
}

export default function Profile({
  open,
  onClose,
}: ProfileProps) {
  const fileInputRef =
    useRef<HTMLInputElement>(
      null
    );

  const [
    user,
    setUser,
  ] = useState<
    AuthUser | null
  >(null);

  const [
    name,
    setName,
  ] = useState("");

  const [
    username,
    setUsername,
  ] = useState("");

  const [
    selectedImage,
    setSelectedImage,
  ] = useState<
    File | null
  >(null);

  const [
    preview,
    setPreview,
  ] = useState<
    string | null
  >(null);

  const [
    loading,
    setLoading,
  ] = useState(false);

  /*
   * Load current user whenever
   * the profile modal opens.
   */
  useEffect(() => {
    if (!open) {
      return;
    }

    const storedUser =
      getStoredUser();

    setUser(
      storedUser
    );

    setName(
      typeof storedUser?.name ===
        "string"
        ? storedUser.name
        : ""
    );

    setUsername(
      typeof storedUser?.username ===
        "string"
        ? storedUser.username
        : ""
    );

    setSelectedImage(
      null
    );

    setPreview(
      typeof storedUser?.image ===
        "string"
        ? storedUser.image
        : null
    );
  }, [open]);

  /*
   * Clean up temporary preview URL.
   */
  useEffect(() => {
    return () => {
      if (
        preview &&
        preview.startsWith(
          "blob:"
        )
      ) {
        URL.revokeObjectURL(
          preview
        );
      }
    };
  }, [preview]);

  /*
   * Close with Escape.
   */
  useEffect(() => {
    if (!open) {
      return;
    }

    const handleEscape =
      (
        event:
          KeyboardEvent
      ) => {
        if (
          event.key ===
          "Escape" &&
          !loading
        ) {
          onClose();
        }
      };

    window.addEventListener(
      "keydown",
      handleEscape
    );

    return () => {
      window.removeEventListener(
        "keydown",
        handleEscape
      );
    };
  }, [
    open,
    loading,
    onClose,
  ]);

  /*
   * Prevent the page behind
   * the modal from scrolling.
   */
  useEffect(() => {
    if (!open) {
      return;
    }

    const previousOverflow =
      document.body.style
        .overflow;

    document.body.style.overflow =
      "hidden";

    return () => {
      document.body.style.overflow =
        previousOverflow;
    };
  }, [open]);

  if (!open) {
    return null;
  }

  const handleImageChange =
    (
      event:
        ChangeEvent<HTMLInputElement>
    ) => {
      const file =
        event.target
          .files?.[0];

      if (!file) {
        return;
      }

      const allowedTypes = [
        "image/jpeg",
        "image/png",
        "image/webp",
      ];

      if (
        !allowedTypes.includes(
          file.type
        )
      ) {
        showErrorToast(
          "Please select a JPG, PNG or WebP image."
        );

        event.target.value =
          "";

        return;
      }

      const maxSize =
        5 *
        1024 *
        1024;

      if (
        file.size >
        maxSize
      ) {
        showErrorToast(
          "Profile image must be smaller than 5 MB."
        );

        event.target.value =
          "";

        return;
      }

      if (
        preview &&
        preview.startsWith(
          "blob:"
        )
      ) {
        URL.revokeObjectURL(
          preview
        );
      }

      setSelectedImage(
        file
      );

      setPreview(
        URL.createObjectURL(
          file
        )
      );
    };

  const handleSave =
    async () => {
      if (loading) {
        return;
      }

      const cleanName =
        name.trim();

      const cleanUsername =
        username
          .trim()
          .toLowerCase();

      if (
        cleanName.length <
        2
      ) {
        showErrorToast(
          "Please enter your display name."
        );

        return;
      }

      if (
        cleanUsername.length <
        3
      ) {
        showErrorToast(
          "Username must be at least 3 characters."
        );

        return;
      }

      const validUsername =
        /^[a-zA-Z0-9_]+$/;

      if (
        !validUsername.test(
          cleanUsername
        )
      ) {
        showErrorToast(
          "Username can only contain letters, numbers and underscores."
        );

        return;
      }

      let toastId:
        | string
        | undefined;

      try {
        setLoading(
          true
        );

        toastId =
          showLoadingToast(
            "Updating your profile..."
          );

        const formData =
          new FormData();

        formData.append(
          "name",
          cleanName
        );

        formData.append(
          "username",
          cleanUsername
        );

        if (
          selectedImage
        ) {
          formData.append(
            "image",
            selectedImage
          );
        }

        const response =
          await updateProfile(
            formData
          );

        if (toastId) {
          dismissToast(
            toastId
          );
        }

        setUser(
          response.user
        );

        setName(
          typeof response.user
            .name === "string"
            ? response.user.name
            : cleanName
        );

        setUsername(
          typeof response.user
            .username ===
            "string"
            ? response.user
                .username
            : cleanUsername
        );

        setPreview(
          typeof response.user
            .image === "string"
            ? response.user.image
            : preview
        );

        setSelectedImage(
          null
        );

        showSuccessToast(
          "Profile updated successfully."
        );

        onClose();
      } catch (error) {
        if (toastId) {
          dismissToast(
            toastId
          );
        }

        const message =
          error instanceof Error
            ? error.message
            : "Unable to update profile.";

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
    <div
      className="
        fixed
        inset-0
        z-[100]
        flex
        items-center
        justify-center
        bg-black/50
        px-4
        py-6
        backdrop-blur-[2px]

        dark:bg-black/70
      "
      onMouseDown={(
        event
      ) => {
        if (
          !loading &&
          event.currentTarget ===
            event.target
        ) {
          onClose();
        }
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="profile-title"
        className="
          relative
          w-full
          max-w-md
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
            items-center
            justify-between
            border-b
            border-zinc-100
            px-6
            py-5

            dark:border-zinc-800
          "
        >
          <div>
            <h2
              id="profile-title"
              className="
                text-lg
                font-semibold
                text-zinc-950

                dark:text-white
              "
            >
              Edit profile
            </h2>

            <p
              className="
                mt-1
                text-xs
                text-zinc-500

                dark:text-zinc-400
              "
            >
              Update your Orbi
              profile details.
            </p>
          </div>

          <button
            type="button"
            onClick={
              onClose
            }
            disabled={
              loading
            }
            aria-label="Close profile"
            className="
              flex
              h-9 w-9
              items-center
              justify-center
              rounded-xl
              text-zinc-400
              transition

              hover:bg-zinc-100
              hover:text-zinc-700

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

        {/* Avatar */}
        <div
          className="
            flex
            justify-center
            px-6
            pb-8
            pt-9
          "
        >
          <div className="relative">
            <div
              className="
                flex
                h-32 w-32
                items-center
                justify-center
                overflow-hidden
                rounded-full
                bg-zinc-900
                text-4xl
                font-medium
                text-white

                dark:bg-zinc-800
              "
            >
              {preview ? (
                <img
                  src={
                    preview
                  }
                  alt="Profile"
                  className="
                    h-full
                    w-full
                    object-cover
                  "
                />
              ) : (
                getInitials(
                  name
                )
              )}
            </div>

            {/* Change image */}
            <button
              type="button"
              onClick={() =>
                fileInputRef
                  .current
                  ?.click()
              }
              disabled={
                loading
              }
              className="
                absolute
                bottom-1
                right-1
                flex
                h-10 w-10
                items-center
                justify-center
                rounded-full
                border-4
                border-white
                bg-zinc-900
                text-white
                shadow-sm
                transition

                hover:bg-zinc-700

                disabled:cursor-not-allowed
                disabled:opacity-60

                dark:border-zinc-900
                dark:bg-white
                dark:text-zinc-950
                dark:hover:bg-zinc-200
              "
              aria-label="Change profile picture"
            >
              <Camera
                size={15}
              />
            </button>

            <input
              ref={
                fileInputRef
              }
              type="file"
              accept="
                image/png,
                image/jpeg,
                image/webp
              "
              onChange={
                handleImageChange
              }
              className="hidden"
            />
          </div>
        </div>

        {/* Form */}
        <div
          className="
            space-y-4
            px-6
          "
        >
          {/* Display name */}
          <div>
            <label
              htmlFor="displayName"
              className="
                mb-2
                block
                text-sm
                font-medium
                text-zinc-700

                dark:text-zinc-300
              "
            >
              Display name
            </label>

            <div
              className="
                rounded-xl
                border
                border-zinc-200
                bg-white
                px-4
                transition

                focus-within:border-zinc-400
                focus-within:ring-2
                focus-within:ring-zinc-100

                dark:border-zinc-700
                dark:bg-zinc-950
                dark:focus-within:border-zinc-600
                dark:focus-within:ring-zinc-800
              "
            >
              <input
                id="displayName"
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
                disabled={
                  loading
                }
                autoComplete="name"
                placeholder="Your name"
                className="
                  h-12
                  w-full
                  bg-transparent
                  text-sm
                  font-medium
                  text-zinc-900
                  outline-none

                  placeholder:text-zinc-400

                  disabled:cursor-not-allowed
                  disabled:opacity-60

                  dark:text-white
                  dark:placeholder:text-zinc-500
                "
              />
            </div>
          </div>

          {/* Username */}
          <div>
            <label
              htmlFor="username"
              className="
                mb-2
                block
                text-sm
                font-medium
                text-zinc-700

                dark:text-zinc-300
              "
            >
              Username
            </label>

            <div
              className="
                flex
                items-center
                rounded-xl
                border
                border-zinc-200
                bg-white
                px-4
                transition

                focus-within:border-zinc-400
                focus-within:ring-2
                focus-within:ring-zinc-100

                dark:border-zinc-700
                dark:bg-zinc-950
                dark:focus-within:border-zinc-600
                dark:focus-within:ring-zinc-800
              "
            >
              <span
                className="
                  mr-1
                  text-sm
                  text-zinc-400

                  dark:text-zinc-500
                "
              >
                @
              </span>

              <input
                id="username"
                type="text"
                value={
                  username
                }
                onChange={(
                  event
                ) =>
                  setUsername(
                    event
                      .target
                      .value
                  )
                }
                disabled={
                  loading
                }
                autoComplete="username"
                placeholder="username"
                className="
                  h-12
                  min-w-0
                  flex-1
                  bg-transparent
                  text-sm
                  font-medium
                  text-zinc-900
                  outline-none

                  placeholder:text-zinc-400

                  disabled:cursor-not-allowed
                  disabled:opacity-60

                  dark:text-white
                  dark:placeholder:text-zinc-500
                "
              />
            </div>

            <p
              className="
                mt-2
                text-xs
                text-zinc-400

                dark:text-zinc-500
              "
            >
              Letters, numbers and
              underscores only.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div
          className="
            mt-6
            flex
            justify-end
            gap-3
            border-t
            border-zinc-100
            px-6
            py-5

            dark:border-zinc-800
          "
        >
          <button
            type="button"
            onClick={
              onClose
            }
            disabled={
              loading
            }
            className="
              h-11
              rounded-xl
              border
              border-zinc-200
              bg-white
              px-5
              text-sm
              font-semibold
              text-zinc-700
              transition

              hover:bg-zinc-50

              disabled:cursor-not-allowed
              disabled:opacity-50

              dark:border-zinc-700
              dark:bg-zinc-900
              dark:text-zinc-300
              dark:hover:bg-zinc-800
              dark:hover:text-white
            "
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={
              handleSave
            }
            disabled={
              loading
            }
            className="
              flex
              h-11
              min-w-[100px]
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
                <LoaderCircle
                  size={16}
                  className="animate-spin"
                />

                Saving...
              </>
            ) : (
              "Save"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

/*
 * Safe initials helper.
 */
function getInitials(
  value: unknown
) {
  if (
    typeof value !==
    "string"
  ) {
    return "U";
  }

  const parts =
    value
      .trim()
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