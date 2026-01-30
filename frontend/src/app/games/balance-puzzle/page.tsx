'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Construction, Scale } from 'lucide-react';
import Link from 'next/link';

export default function BalancePuzzlePage() {
  return (
    <div className="min-h-screen px-4 py-8 flex items-center justify-center">
      <Card className="w-full max-w-lg">
        <CardHeader className="text-center">
          <div className="h-16 w-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
            <Construction className="h-8 w-8 text-muted-foreground" />
          </div>
          <CardTitle className="text-2xl flex items-center justify-center gap-2">
            <Scale className="h-6 w-6 text-primary" />
            Balance Puzzle
          </CardTitle>
          <Badge variant="outline" className="mx-auto mt-2">Coming Soon</Badge>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className="text-muted-foreground">
            Determine the weight needed to balance the scale! This game is currently under development.
          </p>
          <Button asChild variant="outline">
            <Link href="/games">Back to Games</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
