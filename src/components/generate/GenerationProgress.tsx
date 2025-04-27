import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';

type GenerationProgressProps = {
  onCancel: () => void;
  startTime: number;
  timeout: number; // Default: 120000 (2 minutes)
};

export function GenerationProgress({ 
  onCancel, 
  startTime, 
  timeout = 120000 
}: GenerationProgressProps) {
  const [elapsed, setElapsed] = useState(0);
  const [progress, setProgress] = useState(0);
  
  // Update elapsed time and progress
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      const newElapsed = now - startTime;
      
      setElapsed(newElapsed);
      setProgress(Math.min((newElapsed / timeout) * 100, 100));
      
      if (newElapsed >= timeout) {
        clearInterval(interval);
        onCancel();
      }
    }, 100);
    
    return () => clearInterval(interval);
  }, [startTime, timeout, onCancel]);
  
  // Format time
  const formatTime = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };
  
  // Remaining time
  const remainingMs = Math.max(0, timeout - elapsed);
  
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center">
          <Loader2 className="h-5 w-5 mr-2 animate-spin" />
          Generowanie fiszek
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Czas generowania</span>
            <span className="font-medium">
              {formatTime(elapsed)} / {formatTime(timeout)}
            </span>
          </div>
          <Progress value={progress} max={100} />
        </div>
        
        <div className="bg-amber-50 border border-amber-200 rounded-md p-3 text-sm text-amber-800">
          <p>Generowanie fiszek może potrwać do 2 minut. Operacja zostanie automatycznie anulowana po tym czasie.</p>
        </div>
      </CardContent>
      <CardFooter className="flex justify-end">
        <Button 
          variant="outline" 
          onClick={onCancel}
        >
          Anuluj
        </Button>
      </CardFooter>
    </Card>
  );
} 