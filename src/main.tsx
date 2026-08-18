import React from "react";
import { createRoot } from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import "./index.css";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 30_000,
      // A run is driven entirely by the backend worker - it does not pause
      // just because this tab isn't focused, so polling for it shouldn't
      // either. Without this, TanStack Query's default (false) freezes every
      // refetchInterval the moment the tab is backgrounded, which looks
      // exactly like the scrape itself stopping.
      refetchIntervalInBackground: true,
      // Snap back to fresh data the instant the user returns to the tab,
      // rather than waiting up to one more poll interval.
      refetchOnWindowFocus: true,
    },
  },
});

createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </QueryClientProvider>
  </React.StrictMode>,
);