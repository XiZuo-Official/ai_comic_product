"use client";

import { Button } from "@ai-comic/ui/components/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@ai-comic/ui/components/card";

export default function Error({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div className="grid min-h-72 place-items-center">
      <Card className="max-w-lg">
        <CardHeader>
          <CardTitle>Something went wrong</CardTitle>
          <CardDescription>{error.message}</CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={reset} type="button">Try Again</Button>
        </CardContent>
      </Card>
    </div>
  );
}
