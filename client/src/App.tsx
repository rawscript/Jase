import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Suspense, lazy } from "react";
import { ErrorBoundary } from "react-error-boundary";
import LoadingScreen from "@/components/loading-screen";

const LazyHome = lazy(() => import("@/pages/home"));
const LazyAbout = lazy(() => import("@/pages/about"));
const LazyNotFound = lazy(() => import("@/pages/not-found"));

function ErrorFallback({ error }: { error: Error }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 font-mono bg-gray-50 text-gray-900">
      <h2 className="text-xl font-semibold mb-4">Something went wrong</h2>
      <pre className="text-sm text-red-500 max-w-lg overflow-x-auto bg-white p-4 border border-gray-200">{error.message}</pre>
    </div>
  );
}

function Router() {
  return (
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      <Suspense fallback={<LoadingScreen />}>
        <Switch>
          <Route path="/" component={() => <LazyHome />} />
          <Route path="/about" component={() => <LazyAbout />} />
          <Route component={() => <LazyNotFound />} />
        </Switch>
      </Suspense>
    </ErrorBoundary>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Router />
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}
