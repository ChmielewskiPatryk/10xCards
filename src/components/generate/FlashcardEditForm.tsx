import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { 
  Dialog, 
  DialogContent, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog';
import type { FlashcardCandidateViewModel } from './types';
import type { FlashcardCandidate } from '../../types';
import { AlertCircle } from 'lucide-react';

type FlashcardEditFormProps = {
  flashcard: FlashcardCandidateViewModel;
  onSave: (updatedFlashcard: FlashcardCandidate) => void;
  onCancel: () => void;
};

export function FlashcardEditForm({ 
  flashcard, 
  onSave, 
  onCancel 
}: FlashcardEditFormProps) {
  const [frontContent, setFrontContent] = useState(flashcard.front_content);
  const [backContent, setBackContent] = useState(flashcard.back_content);
  const [errors, setErrors] = useState<{
    frontContent?: string;
    backContent?: string;
  }>({});
  
  // Form validation
  const validate = () => {
    const newErrors: {
      frontContent?: string;
      backContent?: string;
    } = {};
    
    if (!frontContent.trim()) {
      newErrors.frontContent = 'Treść przodu fiszki nie może być pusta';
    }
    
    if (!backContent.trim()) {
      newErrors.backContent = 'Treść tyłu fiszki nie może być pusta';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  // Handle save
  const handleSave = () => {
    if (validate()) {
      // Store the original content in ai_metadata for tracking modifications
      const updatedAiMetadata = {
        ...flashcard.ai_metadata,
        original_content: {
          front_content: flashcard.front_content,
          back_content: flashcard.back_content
        }
      };
      
      onSave({
        front_content: frontContent,
        back_content: backContent,
        ai_metadata: updatedAiMetadata
      });
    }
  };
  
  return (
    <Dialog open={true} onOpenChange={(open) => {
      if (!open) onCancel();
    }}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Edycja fiszki</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="frontContent">
              Przód fiszki (pytanie)
              <span className="text-red-500">*</span>
            </Label>
            
            <Textarea
              id="frontContent"
              value={frontContent}
              onChange={(e) => setFrontContent(e.target.value)}
              placeholder="Wprowadź treść przodu fiszki"
              className="min-h-[100px]"
              aria-invalid={!!errors.frontContent}
              aria-describedby="frontContent-error"
            />
            
            {errors.frontContent && (
              <div className="flex items-center text-red-500 text-sm" id="frontContent-error">
                <AlertCircle className="h-4 w-4 mr-1" />
                {errors.frontContent}
              </div>
            )}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="backContent">
              Tył fiszki (odpowiedź)
              <span className="text-red-500">*</span>
            </Label>
            
            <Textarea
              id="backContent"
              value={backContent}
              onChange={(e) => setBackContent(e.target.value)}
              placeholder="Wprowadź treść tyłu fiszki"
              className="min-h-[120px]"
              aria-invalid={!!errors.backContent}
              aria-describedby="backContent-error"
            />
            
            {errors.backContent && (
              <div className="flex items-center text-red-500 text-sm" id="backContent-error">
                <AlertCircle className="h-4 w-4 mr-1" />
                {errors.backContent}
              </div>
            )}
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={onCancel}>
            Anuluj
          </Button>
          <Button onClick={handleSave}>
            Zapisz zmiany
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 