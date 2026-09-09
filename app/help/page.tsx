"use client";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  CheckCircle2,
  ChevronRight,
  CircleHelp,
  FileText,
  Info,
  LoaderCircle,
  LockKeyhole,
  Mail,
  Search,
  Send,
  ShieldCheck,
  Sparkles,
  X,
} from "lucide-react";

import {
  contactSupport,
  getStoredUser,
} from "@/lib/api";

import {
  showErrorToast,
  showSuccessToast,
} from "@/lib/toast";

type HelpSection =
  | "help"
  | "about"
  | "privacy"
  | "terms"
  | "security"
  | "version";

type Faq = {
  question: string;
  answer: string;
};

const sections = [
  {
    id: "help" as const,
    name: "Help center",
    description:
      "Answers to common questions.",
    icon: CircleHelp,
  },
  {
    id: "about" as const,
    name: "About",
    description:
      "Learn about Orbi.",
    icon: Info,
  },
  {
    id: "privacy" as const,
    name: "Privacy",
    description:
      "How we handle your data.",
    icon: ShieldCheck,
  },
  {
    id: "terms" as const,
    name: "Terms of use",
    description:
      "Rules for using Orbi.",
    icon: FileText,
  },
  {
    id: "security" as const,
    name: "Security",
    description:
      "Account and platform security.",
    icon: LockKeyhole,
  },
  {
    id: "version" as const,
    name: "Version",
    description:
      "App and build information.",
    icon: Sparkles,
  },
];

const faqs: Faq[] = [
  {
    question:
      "What is Orbi?",
    answer:
      "Orbi is an AI-powered local service assistant that helps you understand what service you need and discover relevant service providers near you.",
  },
  {
    question:
      "How does Orbi find service providers?",
    answer:
      "Orbi interprets your request using AI and searches supported location and business data sources for relevant providers near your requested location.",
  },
  {
    question:
      "Does Orbi verify every provider?",
    answer:
      "No. A provider appearing in search results does not automatically mean that Orbi has verified the provider. Verified providers will be clearly marked when verification is available.",
  },
  {
    question:
      "Can I save a provider?",
    answer:
      "Yes. When signed in, you can save providers to your account and access them later from the Saved section.",
  },
  {
    question:
      "Where is my search history stored?",
    answer:
      "Search history for signed-in users is stored with their Orbi account so that previous searches can be reopened later.",
  },
  {
    question:
      "Can I delete my search history?",
    answer:
      "Yes. You can delete individual searches from Search History or clear all search history from Settings under Data controls.",
  },
  {
    question:
      "Can I delete my Orbi account?",
    answer:
      "Yes. Account deletion is available in Settings under Data controls. Deleting your account permanently removes account-linked Orbi data according to our retention requirements.",
  },
  {
    question:
      "Why does a provider sometimes have no phone number or rating?",
    answer:
      "Business information depends on what is available from the data source. Some listings may not include phone numbers, websites, ratings, opening hours, or other information.",
  },
  {
    question:
      "Can Orbi book a provider for me?",
    answer:
      "The current version primarily helps you discover and contact providers. Direct in-app booking is planned for later versions where supported.",
  },
];

export default function HelpPage() {
  const [
    activeSection,
    setActiveSection,
  ] = useState<HelpSection>(
    "help"
  );

  const [
    searchQuery,
    setSearchQuery,
  ] = useState("");

  const filteredFaqs =
    useMemo(() => {
      const value =
        searchQuery
          .trim()
          .toLowerCase();

      if (!value) {
        return faqs;
      }

      return faqs.filter(
        (faq) =>
          faq.question
            .toLowerCase()
            .includes(value) ||
          faq.answer
            .toLowerCase()
            .includes(value)
      );
    }, [searchQuery]);

  return (
    <main
      className="
        min-h-screen
        bg-white
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
        {/* Header */}
        <div
          className="
            border-b
            border-zinc-200
            pb-8
            dark:border-zinc-800
          "
        >
          <div
            className="
              flex h-11 w-11
              items-center
              justify-center
              rounded-xl
              bg-zinc-950
              text-white
              dark:bg-white
              dark:text-zinc-950
            "
          >
            <CircleHelp
              size={20}
            />
          </div>

          <h1
            className="
              mt-5
              text-3xl
              font-semibold
              tracking-tight
              text-zinc-950
              dark:text-white
              sm:text-4xl
            "
          >
            Help & support
          </h1>

          <p
            className="
              mt-3
              max-w-2xl
              text-sm
              leading-6
              text-zinc-500
              dark:text-zinc-400
            "
          >
            Find answers, learn how
            Orbi works and review
            important product
            information.
          </p>
        </div>

        <div
          className="
            mt-8
            grid
            gap-8
            md:grid-cols-[230px_1fr]
          "
        >
          {/* Side navigation */}
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
                      flex
                      w-full
                      items-center
                      gap-3
                      rounded-xl
                      px-3
                      py-3
                      text-left
                      transition

                      ${
                        active
                          ? `
                            bg-zinc-100
                            text-zinc-950
                            dark:bg-zinc-800
                            dark:text-white
                          `
                          : `
                            text-zinc-500
                            hover:bg-zinc-50
                            hover:text-zinc-950
                            dark:text-zinc-400
                            dark:hover:bg-zinc-900
                            dark:hover:text-white
                          `
                      }
                    `}
                  >
                    <Icon
                      size={18}
                      className="shrink-0"
                    />

                    <span
                      className="
                        min-w-0
                        flex-1
                      "
                    >
                      <span
                        className="
                          block
                          text-sm
                          font-medium
                        "
                      >
                        {section.name}
                      </span>

                      <span
                        className="
                          mt-0.5
                          block
                          text-xs
                          text-zinc-400
                          dark:text-zinc-500
                        "
                      >
                        {
                          section.description
                        }
                      </span>
                    </span>

                    <ChevronRight
                      size={15}
                      className="
                        shrink-0
                        text-zinc-300
                        dark:text-zinc-600
                      "
                    />
                  </button>
                );
              }
            )}
          </nav>

          {/* Content */}
          <div className="min-w-0">
            {activeSection ===
              "help" && (
              <HelpCenter
                searchQuery={
                  searchQuery
                }
                setSearchQuery={
                  setSearchQuery
                }
                faqs={
                  filteredFaqs
                }
              />
            )}

            {activeSection ===
              "about" && (
              <AboutSection />
            )}

            {activeSection ===
              "privacy" && (
              <PrivacySection />
            )}

            {activeSection ===
              "terms" && (
              <TermsSection />
            )}

            {activeSection ===
              "security" && (
              <SecuritySection />
            )}

            {activeSection ===
              "version" && (
              <VersionSection />
            )}
          </div>
        </div>
      </div>
    </main>
  );
}

function HelpCenter({
  searchQuery,
  setSearchQuery,
  faqs,
}: {
  searchQuery: string;

  setSearchQuery:
    (value: string) =>
      void;

  faqs: Faq[];
}) {
  return (
    <div>
      <SectionHeader
        title="Help center"
        description="Search common questions about Orbi."
      />

      <div
        className="
          relative
          mt-6
        "
      >
        <Search
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
          value={
            searchQuery
          }
          onChange={(
            event
          ) =>
            setSearchQuery(
              event.target.value
            )
          }
          placeholder="Search help..."
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

            dark:border-zinc-800
            dark:bg-zinc-900
            dark:text-white
            dark:placeholder:text-zinc-500
            dark:focus:border-zinc-600
            dark:focus:ring-zinc-800
          "
        />
      </div>

      <div
        className="
          mt-6
          space-y-3
        "
      >
        {faqs.length >
        0 ? (
          faqs.map(
            (faq) => (
              <FaqItem
                key={
                  faq.question
                }
                faq={faq}
              />
            )
          )
        ) : (
          <div
            className="
              rounded-2xl
              border
              border-dashed
              border-zinc-200
              px-6
              py-12
              text-center

              dark:border-zinc-800
            "
          >
            <Search
              size={22}
              className="
                mx-auto
                text-zinc-400
                dark:text-zinc-500
              "
            />

            <p
              className="
                mt-3
                text-sm
                text-zinc-500
                dark:text-zinc-400
              "
            >
              No help articles
              match your search.
            </p>
          </div>
        )}
      </div>

      <SupportCard />
    </div>
  );
}

function FaqItem({
  faq,
}: {
  faq: Faq;
}) {
  const [
    open,
    setOpen,
  ] = useState(false);

  return (
    <button
      type="button"
      onClick={() =>
        setOpen(
          (current) =>
            !current
        )
      }
      className="
        w-full
        rounded-2xl
        border
        border-zinc-200
        bg-white
        p-5
        text-left
        transition

        hover:border-zinc-300

        dark:border-zinc-800
        dark:bg-zinc-900
        dark:hover:border-zinc-700
      "
    >
      <div
        className="
          flex
          items-center
          justify-between
          gap-4
        "
      >
        <span
          className="
            text-sm
            font-semibold
            text-zinc-900
            dark:text-zinc-100
          "
        >
          {faq.question}
        </span>

        <ChevronRight
          size={17}
          className={`
            shrink-0
            text-zinc-400
            transition-transform
            dark:text-zinc-500

            ${
              open
                ? "rotate-90"
                : ""
            }
          `}
        />
      </div>

      {open && (
        <p
          className="
            mt-4
            text-sm
            leading-6
            text-zinc-500
            dark:text-zinc-400
          "
        >
          {faq.answer}
        </p>
      )}
    </button>
  );
}

function AboutSection() {
  return (
    <div>
      <SectionHeader
        title="About Orbi"
        description="AI-powered local service discovery."
      />

      <ContentCard>
        <div
          className="
            flex
            h-12 w-12
            items-center
            justify-center
            rounded-xl
            bg-zinc-950
            text-white

            dark:bg-white
            dark:text-zinc-950
          "
        >
          <Sparkles
            size={20}
          />
        </div>

        <h3
          className="
            mt-5
            text-xl
            font-semibold
            text-zinc-950
            dark:text-white
          "
        >
          Orbi
        </h3>

        <p
          className="
            mt-3
            text-sm
            leading-7
            text-zinc-500
            dark:text-zinc-400
          "
        >
          Orbi is an
          AI-powered service
          assistant designed to
          make finding local
          service providers
          simpler.
        </p>

        <p
          className="
            mt-4
            text-sm
            leading-7
            text-zinc-500
            dark:text-zinc-400
          "
        >
          Instead of manually
          searching directories,
          users can describe what
          they need naturally.
          Orbi interprets the
          request, identifies the
          type of service required
          and searches available
          location data for
          relevant providers.
        </p>
      </ContentCard>

      <ContentCard className="mt-5">
        <h3
          className="
            font-semibold
            text-zinc-950
            dark:text-white
          "
        >
          Our goal
        </h3>

        <p
          className="
            mt-3
            text-sm
            leading-7
            text-zinc-500
            dark:text-zinc-400
          "
        >
          Our goal is to reduce
          the effort required to
          discover, compare and
          eventually book trusted
          local services.
        </p>
      </ContentCard>
    </div>
  );
}

function PrivacySection() {
  return (
    <div>
      <SectionHeader
        title="Privacy"
        description="Information about how Orbi handles account and service data."
      />

      <ContentCard>
        <LegalHeading>
          Information we collect
        </LegalHeading>

        <LegalText>
          Orbi may store account
          details such as your name,
          email address, username
          and profile information.
          When signed in, we may
          also store your search
          history, saved providers
          and application
          preferences.
        </LegalText>

        <LegalHeading>
          Search information
        </LegalHeading>

        <LegalText>
          Search requests may
          contain service names,
          locations and problem
          descriptions necessary to
          process the request and
          return relevant results.
        </LegalText>

        <LegalHeading>
          Location
        </LegalHeading>

        <LegalText>
          When you choose to use
          your current location,
          Orbi may use geographic
          coordinates to find
          nearby providers. Location
          permission remains under
          the control of your
          browser or device.
        </LegalText>

        <LegalHeading>
          Third-party services
        </LegalHeading>

        <LegalText>
          Orbi may use external
          infrastructure and data
          providers to provide
          features such as maps,
          business discovery, email
          delivery and hosting.
        </LegalText>

        <LegalHeading>
          Your controls
        </LegalHeading>

        <LegalText>
          You can delete search
          history, remove saved
          providers and delete your
          Orbi account through
          Settings where those
          controls are available.
        </LegalText>
      </ContentCard>

      <LegalNotice />
    </div>
  );
}

function TermsSection() {
  return (
    <div>
      <SectionHeader
        title="Terms of use"
        description="Basic rules governing the use of Orbi."
      />

      <ContentCard>
        <LegalHeading>
          Using Orbi
        </LegalHeading>

        <LegalText>
          You may use Orbi for
          lawful purposes and in
          accordance with these
          terms.
        </LegalText>

        <LegalHeading>
          Provider information
        </LegalHeading>

        <LegalText>
          Service-provider
          information may originate
          from external data
          sources. Orbi does not
          guarantee that every
          listing, phone number,
          address, website,
          availability or other
          provider detail is always
          complete or current.
        </LegalText>

        <LegalHeading>
          Independent providers
        </LegalHeading>

        <LegalText>
          Unless explicitly stated
          otherwise, providers
          discovered through Orbi
          are independent third
          parties and are not
          employees or agents of
          Orbi.
        </LegalText>

        <LegalHeading>
          Verification
        </LegalHeading>

        <LegalText>
          Appearance in search
          results does not by itself
          mean that Orbi has
          verified or endorsed a
          provider. Any verified
          status will be explicitly
          indicated.
        </LegalText>

        <LegalHeading>
          User responsibility
        </LegalHeading>

        <LegalText>
          Users should evaluate a
          provider before sharing
          sensitive information,
          making payments or
          entering into agreements
          for services.
        </LegalText>

        <LegalHeading>
          Accounts
        </LegalHeading>

        <LegalText>
          You are responsible for
          protecting your login
          credentials and for
          activity performed through
          your account.
        </LegalText>
      </ContentCard>

      <LegalNotice />
    </div>
  );
}

function SecuritySection() {
  return (
    <div>
      <SectionHeader
        title="Security"
        description="How Orbi protects accounts and what you can do to stay secure."
      />

      <div className="space-y-4">
        <SecurityItem
          title="Passwords"
          description="Passwords are stored using secure password hashing rather than being stored as plain text."
        />

        <SecurityItem
          title="Account sessions"
          description="Authentication tokens are used to protect account-only features such as saved providers, history and settings."
        />

        <SecurityItem
          title="Password reset"
          description="Password-reset links use temporary one-time tokens and expire after a limited period."
        />

        <SecurityItem
          title="Sign out all devices"
          description="You can invalidate existing login sessions from Security & login in Settings."
        />

        <SecurityItem
          title="API credentials"
          description="Sensitive service credentials are kept on the backend and are not intentionally exposed through public frontend environment variables."
        />
      </div>

      <SupportCard />
    </div>
  );
}

function VersionSection() {
  const version =
    process.env
      .NEXT_PUBLIC_APP_VERSION ??
    "0.1.0";

  const environment =
    process.env.NODE_ENV ===
    "production"
      ? "Production"
      : "Development";

  return (
    <div>
      <SectionHeader
        title="Version"
        description="Information about the Orbi build currently running."
      />

      <ContentCard>
        <VersionRow
          label="Product"
          value="Orbi"
        />

        <VersionRow
          label="Version"
          value={version}
        />

        <VersionRow
          label="Environment"
          value={
            environment
          }
        />

        <VersionRow
          label="Platform"
          value="Web"
        />

        <VersionRow
          label="Frontend"
          value="Next.js"
        />

        <VersionRow
          label="Backend"
          value="NestJS"
        />

        <VersionRow
          label="Database"
          value="PostgreSQL"
        />
      </ContentCard>

      <p
        className="
          mt-4
          text-xs
          text-zinc-400
          dark:text-zinc-500
        "
      >
        © {new Date().getFullYear()}{" "}
        Orbi. All rights reserved.
      </p>
    </div>
  );
}

function SecurityItem({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <ContentCard>
      <div
        className="
          flex
          items-start
          gap-4
        "
      >
        <div
          className="
            flex
            h-10 w-10
            shrink-0
            items-center
            justify-center
            rounded-xl
            bg-zinc-100
            text-zinc-700

            dark:bg-zinc-800
            dark:text-zinc-300
          "
        >
          <LockKeyhole
            size={17}
          />
        </div>

        <div>
          <h3
            className="
              text-sm
              font-semibold
              text-zinc-950
              dark:text-white
            "
          >
            {title}
          </h3>

          <p
            className="
              mt-1
              text-sm
              leading-6
              text-zinc-500
              dark:text-zinc-400
            "
          >
            {description}
          </p>
        </div>
      </div>
    </ContentCard>
  );
}

function SupportCard() {
  const [
    modalOpen,
    setModalOpen,
  ] = useState(false);

  return (
    <>
      <div
        className="
          mt-8
          rounded-2xl
          border
          border-zinc-200
          bg-zinc-50
          p-6

          dark:border-zinc-800
          dark:bg-zinc-900
        "
      >
        <div
          className="
            flex
            h-10 w-10
            items-center
            justify-center
            rounded-xl
            bg-white
            text-zinc-700

            dark:bg-zinc-800
            dark:text-zinc-200
          "
        >
          <Mail
            size={18}
          />
        </div>

        <h3
          className="
            mt-4
            font-semibold
            text-zinc-950
            dark:text-white
          "
        >
          Still need help?
        </h3>

        <p
          className="
            mt-2
            text-sm
            leading-6
            text-zinc-500
            dark:text-zinc-400
          "
        >
          Contact the Orbi
          support team and tell us
          what you need help with.
        </p>

        <button
          type="button"
          onClick={() =>
            setModalOpen(
              true
            )
          }
          className="
            mt-5
            inline-flex
            items-center
            gap-2
            rounded-xl
            bg-zinc-950
            px-4
            py-2.5
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
          <Mail
            size={15}
          />

          Contact support
        </button>
      </div>

      <SupportModal
        open={
          modalOpen
        }
        onClose={() =>
          setModalOpen(
            false
          )
        }
      />
    </>
  );
}

function SupportModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const [
    name,
    setName,
  ] = useState("");

  const [
    email,
    setEmail,
  ] = useState("");

  const [
    subject,
    setSubject,
  ] = useState("");

  const [
    message,
    setMessage,
  ] = useState("");

  const [
    loading,
    setLoading,
  ] = useState(false);

  const [
    sent,
    setSent,
  ] = useState(false);

  useEffect(() => {
    if (!open) {
      return;
    }

    const user =
      getStoredUser();

    if (user) {
      setName(
        typeof user.name ===
          "string"
          ? user.name
          : ""
      );

      setEmail(
        typeof user.email ===
          "string"
          ? user.email
          : ""
      );
    }
  }, [open]);

  useEffect(() => {
    if (!open) {
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
          !loading
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
    open,
    loading,
    onClose,
  ]);

  if (!open) {
    return null;
  }

  const resetForm =
    () => {
      setSubject("");
      setMessage("");
      setSent(false);
    };

  const closeModal =
    () => {
      if (loading) {
        return;
      }

      resetForm();

      onClose();
    };

  const submit =
    async (
      event:
        React.FormEvent<HTMLFormElement>
    ) => {
      event.preventDefault();

      const cleanName =
        name.trim();

      const cleanEmail =
        email
          .trim()
          .toLowerCase();

      const cleanSubject =
        subject.trim();

      const cleanMessage =
        message.trim();

      if (
        !cleanName ||
        !cleanEmail ||
        !cleanSubject ||
        !cleanMessage
      ) {
        showErrorToast(
          "Please complete all fields."
        );

        return;
      }

      if (
        cleanName.length <
        2
      ) {
        showErrorToast(
          "Please enter your name."
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
        showErrorToast(
          "Please enter a valid email address."
        );

        return;
      }

      if (
        cleanSubject.length <
        3
      ) {
        showErrorToast(
          "Please enter a subject."
        );

        return;
      }

      if (
        cleanMessage.length <
        10
      ) {
        showErrorToast(
          "Please provide a little more information about the problem."
        );

        return;
      }

      try {
        setLoading(
          true
        );

        await contactSupport({
          name:
            cleanName,

          email:
            cleanEmail,

          subject:
            cleanSubject,

          message:
            cleanMessage,
        });

        setEmail(
          cleanEmail
        );

        setSent(
          true
        );

        showSuccessToast(
          "Your message has been sent."
        );
      } catch (error) {
        showErrorToast(
          error instanceof Error
            ? error.message
            : "Unable to send your message."
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
        p-4

        sm:p-6
      "
    >
      {/* Backdrop */}
      <button
        type="button"
        aria-label="Close support modal"
        onClick={
          closeModal
        }
        className="
          absolute
          inset-0
          bg-black/50
          backdrop-blur-[2px]

          dark:bg-black/70
        "
      />

      {/* Modal */}
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="support-modal-title"
        className="
          relative
          z-10
          w-full
          max-w-lg
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
            p-6

            dark:border-zinc-800
          "
        >
          <div>
            <div
              className="
                flex
                h-10 w-10
                items-center
                justify-center
                rounded-xl
                bg-zinc-950
                text-white

                dark:bg-white
                dark:text-zinc-950
              "
            >
              <Mail
                size={18}
              />
            </div>

            <h2
              id="support-modal-title"
              className="
                mt-4
                text-xl
                font-semibold
                text-zinc-950
                dark:text-white
              "
            >
              Contact support
            </h2>

            <p
              className="
                mt-1
                text-sm
                leading-6
                text-zinc-500
                dark:text-zinc-400
              "
            >
              Tell us what happened
              and we&apos;ll get back
              to you by email.
            </p>
          </div>

          <button
            type="button"
            onClick={
              closeModal
            }
            disabled={
              loading
            }
            aria-label="Close"
            className="
              flex
              h-9 w-9
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

        {sent ? (
          <div
            className="
              px-6
              py-12
              text-center
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

                dark:bg-green-950/40
                dark:text-green-400
              "
            >
              <CheckCircle2
                size={27}
              />
            </div>

            <h3
              className="
                mt-5
                text-lg
                font-semibold
                text-zinc-950
                dark:text-white
              "
            >
              Message sent
            </h3>

            <p
              className="
                mx-auto
                mt-2
                max-w-sm
                text-sm
                leading-6
                text-zinc-500
                dark:text-zinc-400
              "
            >
              Your message has been
              sent to Orbi support.
              We&apos;ll respond to{" "}

              <strong
                className="
                  font-semibold
                  text-zinc-800
                  dark:text-zinc-200
                "
              >
                {email}
              </strong>
              .
            </p>

            <button
              type="button"
              onClick={
                closeModal
              }
              className="
                mt-6
                rounded-xl
                bg-zinc-950
                px-5
                py-3
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
              Done
            </button>
          </div>
        ) : (
          <form
            onSubmit={
              submit
            }
            className="
              max-h-[70vh]
              overflow-y-auto
              p-6
            "
          >
            <div
              className="
                grid
                gap-5

                sm:grid-cols-2
              "
            >
              <SupportInput
                label="Name"
                value={
                  name
                }
                onChange={
                  setName
                }
                placeholder="Your name"
                autoComplete="name"
                disabled={
                  loading
                }
              />

              <SupportInput
                label="Email"
                type="email"
                value={
                  email
                }
                onChange={
                  setEmail
                }
                placeholder="you@example.com"
                autoComplete="email"
                disabled={
                  loading
                }
              />
            </div>

            <div className="mt-5">
              <SupportInput
                label="Subject"
                value={
                  subject
                }
                onChange={
                  setSubject
                }
                placeholder="What do you need help with?"
                disabled={
                  loading
                }
              />
            </div>

            <label
              className="
                mt-5
                block
              "
            >
              <span
                className="
                  text-sm
                  font-medium
                  text-zinc-800

                  dark:text-zinc-200
                "
              >
                Message
              </span>

              <textarea
                value={
                  message
                }
                required
                minLength={10}
                maxLength={5000}
                disabled={
                  loading
                }
                onChange={(
                  event
                ) =>
                  setMessage(
                    event.target.value
                  )
                }
                placeholder="Describe the problem you're having..."
                rows={6}
                className="
                  mt-2
                  w-full
                  resize-none
                  rounded-xl
                  border
                  border-zinc-200
                  bg-white
                  px-4
                  py-3
                  text-sm
                  leading-6
                  text-zinc-950
                  outline-none
                  transition

                  placeholder:text-zinc-400

                  focus:border-zinc-400
                  focus:ring-2
                  focus:ring-zinc-100

                  disabled:cursor-not-allowed
                  disabled:opacity-60

                  dark:border-zinc-700
                  dark:bg-zinc-950
                  dark:text-white
                  dark:placeholder:text-zinc-500
                  dark:focus:border-zinc-600
                  dark:focus:ring-zinc-800
                "
              />

              <div
                className="
                  mt-1
                  text-right
                  text-xs
                  text-zinc-400
                  dark:text-zinc-500
                "
              >
                {message.length}
                /5000
              </div>
            </label>

            <div
              className="
                mt-6
                flex
                flex-col-reverse
                gap-2

                sm:flex-row
                sm:justify-end
              "
            >
              <button
                type="button"
                onClick={
                  closeModal
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
                  font-medium
                  text-zinc-600
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
                type="submit"
                disabled={
                  loading
                }
                className="
                  flex
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
                      size={16}
                      className="animate-spin"
                    />

                    Sending...
                  </>
                ) : (
                  <>
                    <Send
                      size={16}
                    />

                    Send message
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

function SupportInput({
  label,
  value,
  onChange,
  type = "text",
  placeholder,
  autoComplete,
  disabled = false,
}: {
  label: string;
  value: string;

  onChange:
    (value: string) =>
      void;

  type?: string;
  placeholder?: string;
  autoComplete?: string;
  disabled?: boolean;
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
        required
        value={
          value
        }
        autoComplete={
          autoComplete
        }
        placeholder={
          placeholder
        }
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
        className="
          mt-2
          h-11
          w-full
          rounded-xl
          border
          border-zinc-200
          bg-white
          px-4
          text-sm
          text-zinc-950
          outline-none
          transition

          placeholder:text-zinc-400

          focus:border-zinc-400
          focus:ring-2
          focus:ring-zinc-100

          disabled:cursor-not-allowed
          disabled:opacity-60

          dark:border-zinc-700
          dark:bg-zinc-950
          dark:text-white
          dark:placeholder:text-zinc-500
          dark:focus:border-zinc-600
          dark:focus:ring-zinc-800
        "
      />
    </label>
  );
}

function LegalNotice() {
  return (
    <div
      className="
        mt-5
        rounded-xl
        border
        border-amber-200
        bg-amber-50
        p-4
        text-sm
        leading-6
        text-amber-900

        dark:border-amber-900/50
        dark:bg-amber-950/30
        dark:text-amber-200
      "
    >
      These are starter product
      terms for Orbi V1. Before
      public commercial launch, the
      final Privacy Policy and Terms
      should be reviewed for your
      business, jurisdiction and
      actual data practices.
    </div>
  );
}

function VersionRow({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div
      className="
        flex
        items-center
        justify-between
        gap-6
        border-b
        border-zinc-100
        py-4
        last:border-0

        dark:border-zinc-800
      "
    >
      <span
        className="
          text-sm
          text-zinc-500
          dark:text-zinc-400
        "
      >
        {label}
      </span>

      <span
        className="
          text-sm
          font-medium
          text-zinc-900
          dark:text-zinc-100
        "
      >
        {value}
      </span>
    </div>
  );
}

function SectionHeader({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div>
      <h2
        className="
          text-2xl
          font-semibold
          tracking-tight
          text-zinc-950

          dark:text-white
        "
      >
        {title}
      </h2>

      <p
        className="
          mt-2
          text-sm
          leading-6
          text-zinc-500

          dark:text-zinc-400
        "
      >
        {description}
      </p>
    </div>
  );
}

function ContentCard({
  children,
  className = "",
}: {
  children:
    React.ReactNode;

  className?: string;
}) {
  return (
    <section
      className={`
        mt-6
        rounded-2xl
        border
        border-zinc-200
        bg-white
        p-6

        dark:border-zinc-800
        dark:bg-zinc-900

        ${className}
      `}
    >
      {children}
    </section>
  );
}

function LegalHeading({
  children,
}: {
  children:
    React.ReactNode;
}) {
  return (
    <h3
      className="
        mt-7
        text-sm
        font-semibold
        text-zinc-950
        first:mt-0

        dark:text-white
      "
    >
      {children}
    </h3>
  );
}

function LegalText({
  children,
}: {
  children:
    React.ReactNode;
}) {
  return (
    <p
      className="
        mt-2
        text-sm
        leading-7
        text-zinc-500

        dark:text-zinc-400
      "
    >
      {children}
    </p>
  );
}