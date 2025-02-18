"use client";

import type React from "react";
import { GeistProvider, CssBaseline } from "@geist-ui/core";
import { ThemeProvider } from "@/components/theme-provider";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import "./globals.css";
import SharedLayout from "./shared-layout";

const queryClient = new QueryClient();

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <QueryClientProvider client={queryClient}>
          <SharedLayout>{children}</SharedLayout>
        </QueryClientProvider>
      </body>
    </html>
  );
}
