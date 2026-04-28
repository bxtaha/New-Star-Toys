"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { I18nProvider } from "@/components/I18nProvider";

export default function Providers({ children, initialLanguage }) {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      <I18nProvider initialLanguage={initialLanguage}>
        {children}
        <Sonner />
      </I18nProvider>
    </QueryClientProvider>
  );
}
