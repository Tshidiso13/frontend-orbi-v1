import type { Metadata } from "next";
import AppShell from "@/components/layout/AppShell";
import "./globals.css";
import AppSettingsProvider
  from "@/components/settings-provider";
import { Toaster } from "react-hot-toast";

export const metadata: Metadata = {
  title: {
    default: "Orbi",
    template: "%s | Orbi",
  },
  description:
    "Find trusted local service providers using AI.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="bg-white dark:bg-zinc-950  text-zinc-950 dark:text-white antialiased">
        <Toaster
          position="top-center"
          gutter={12}
        />
        <AppSettingsProvider>
          <AppShell>{children}</AppShell>
          
        </AppSettingsProvider>
      </body>
    </html>
  );
}