
"use client";

import { Loader2 } from "lucide-react";
import Image from "next/image";
import { Card, CardContent } from "./ui/card";

interface StepVisualAidProps {
  isGenerating: boolean;
  visualAidUri?: string | null;
}

export function StepVisualAid({ isGenerating, visualAidUri }: StepVisualAidProps) {
  if (isGenerating) {
    return (
      <Card className="border-dashed">
        <CardContent className="p-4">
          <div className="flex flex-col items-center justify-center gap-3 aspect-video">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-muted-foreground text-sm">Generating your visual aid... this can take a moment.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!visualAidUri) {
    return null;
  }

  return (
    <div>
        <h4 className="font-headline text-lg mb-2">Visual Aid</h4>
        <div className="relative aspect-video w-full overflow-hidden rounded-lg border">
        <Image
            src={visualAidUri}
            alt="AI-generated visual aid for the course step"
            fill
            className="object-contain"
            data-ai-hint="infographic diagram"
        />
        </div>
    </div>
  );
}
