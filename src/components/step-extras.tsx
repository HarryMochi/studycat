
"use client";

import type { Step } from "@/lib/types";
import { Button } from "./ui/button";
import { Bot, Lightbulb, Link as LinkIcon, Images, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import Link from "next/link";
import { Separator } from "./ui/separator";

interface StepExtrasProps {
  step: Step;
  onAskAiClick: (e: React.MouseEvent) => void;
  onGenerateVisualClick: (e: React.MouseEvent) => void;
  isGeneratingVisual: boolean;
}

export function StepExtras({ step, onAskAiClick, onGenerateVisualClick, isGeneratingVisual }: StepExtrasProps) {
  const hasExtras = step.funFact || (step.externalLinks && step.externalLinks.length > 0);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        <Button onClick={onAskAiClick} variant="outline">
          <Bot className="mr-2 h-4 w-4" />
          Ask AI a Question
        </Button>
        <Button onClick={onGenerateVisualClick} variant="outline" disabled={isGeneratingVisual || !step.content || !!step.visualAid}>
            {isGeneratingVisual ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Images className="mr-2 h-4 w-4" />}
            {step.visualAid ? 'Visual Generated' : 'Visualize Step'}
        </Button>
      </div>

      {hasExtras && <Separator />}

      {step.funFact && (
        <Card className="bg-accent/10 border-accent/20 border-dashed">
            <CardHeader className="flex-row items-center gap-3 space-y-0 pb-2">
                <Lightbulb className="h-6 w-6 text-accent" />
                <CardTitle className="text-lg font-headline text-accent">Fun Fact</CardTitle>
            </CardHeader>
            <CardContent>
                <p className="text-sm text-foreground/80">{step.funFact}</p>
            </CardContent>
        </Card>
      )}

      {step.externalLinks && step.externalLinks.length > 0 && (
        <div>
            <h4 className="font-headline text-lg mb-2">Further Reading</h4>
            <div className="space-y-2">
                {step.externalLinks.map((link) => (
                    <Button 
                        key={link.url}
                        asChild 
                        variant="ghost" 
                        className="w-full justify-start gap-2 text-muted-foreground hover:text-primary"
                    >
                        <Link href={link.url} target="_blank" rel="noopener noreferrer">
                            <LinkIcon className="h-4 w-4" />
                            <span>{link.title}</span>
                        </Link>
                    </Button>
                ))}
            </div>
        </div>
      )}
    </div>
  );
}
