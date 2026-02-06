import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { HelpCircle } from 'lucide-react';
import { useState } from 'react';

interface GameGuideDialogProps {
  title: string;
  description: string;
  rules: string[];
  scoring?: string[];
  controls?: string[];
  children?: React.ReactNode;
}

export function GameGuideDialog({
  title,
  description,
  rules,
  scoring,
  controls,
  children,
}: GameGuideDialogProps) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button variant="ghost" size="icon">
            <HelpCircle className="h-5 w-5" />
            <span className="sr-only">How to play</span>
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-md max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <HelpCircle className="h-5 w-5 text-primary" />
            How to Play: {title}
          </DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <h4 className="font-semibold mb-2 text-primary">Rules</h4>
            <ul className="list-disc pl-5 space-y-1 text-sm text-muted-foreground">
              {rules.map((rule, i) => (
                <li key={i}>{rule}</li>
              ))}
            </ul>
          </div>

          {scoring && (
            <div>
              <h4 className="font-semibold mb-2 text-primary">Scoring</h4>
              <ul className="list-disc pl-5 space-y-1 text-sm text-muted-foreground">
                {scoring.map((item, i) => (
                  <li key={i}>{item}</li>
                ))}
              </ul>
            </div>
          )}

          {controls && (
            <div>
              <h4 className="font-semibold mb-2 text-primary">Controls</h4>
              <ul className="list-disc pl-5 space-y-1 text-sm text-muted-foreground">
                {controls.map((item, i) => (
                  <li key={i}>{item}</li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button onClick={() => setOpen(false)}>Got it!</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
