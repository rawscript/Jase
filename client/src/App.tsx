import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import LoadingScreen from "@/components/loading-screen";
import { Suspense, lazy, useState, useEffect } from "react";
import { ErrorBoundary } from "react-error-boundary";

// Type-safe lazy imports
const LazyHome = lazy(() => import("@/pages/home"));
const LazyNotFound = lazy(() => import("@/pages/not-found"));

function ErrorFallback({ error }: { error: Error }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <h2 className="text-2xl font-semibold mb-4">Something went wrong</h2>
      <pre className="text-sm text-red-500">{error.message}</pre>
    </div>
  );
}

function Router() {
  return (
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      <Suspense fallback={<LoadingScreen />}>
        <Switch>
          <Route path="/" component={() => <LazyHome />} />
          {/* Wildcard fallback for unmatched routes */}
          <Route component={() => <LazyNotFound />} />
        </Switch>
      </Suspense>
    </ErrorBoundary>
  );
}

function App() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <div className="custom-scrollbar">
          <Toaster />
          <Router />
        </div>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
