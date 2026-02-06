'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, Home, RotateCcw } from 'lucide-react';
import { useEffect } from 'react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log error to an error reporting service in production
    if (process.env.NODE_ENV === 'production') {
      // Example: Sentry.captureException(error);
    }
  }, [error]);

  const isNetworkError = error.message.includes('network') ||
                         error.message.includes('fetch') ||
                         error.message.includes('offline');

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <Card className="max-w-md w-full">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-destructive/10 flex items-center justify-center">
            <AlertTriangle className="h-8 w-8 text-destructive" />
          </div>
          <CardTitle className="text-2xl">
            {isNetworkError ? 'Connection Problem' : 'Something went wrong'}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-center text-muted-foreground">
            {isNetworkError
              ? 'Unable to connect to the server. Please check your internet connection and try again.'
              : 'An unexpected error occurred. Our team has been notified and is working on a fix.'}
          </p>

          {process.env.NODE_ENV === 'development' && (
            <div className="p-3 bg-muted rounded-lg text-sm font-mono">
              <p className="text-destructive">{error.message}</p>
              {error.digest && (
                <p className="text-muted-foreground mt-1">Digest: {error.digest}</p>
              )}
            </div>
          )}

          <div className="flex gap-3">
            <Button onClick={reset} className="flex-1">
              <RotateCcw className="h-4 w-4 mr-2" />
              Try Again
            </Button>
            <Button variant="outline" asChild>
              <a href="/">
                <Home className="h-4 w-4 mr-2" />
                Home
              </a>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
