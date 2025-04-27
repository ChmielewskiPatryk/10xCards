import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle } from 'lucide-react';
import type { GenerateFlashcardsFormData } from '../hooks/useGenerateFlashcards';

type SourceTextFormProps = {
  onSubmit: (formData: GenerateFlashcardsFormData) => Promise<void>;
  isLoading: boolean;
};

export function SourceTextForm({ onSubmit, isLoading }: SourceTextFormProps) {
  const [sourceText, setSourceText] = useState('');
  const [maxFlashcards, setMaxFlashcards] = useState(10);
  const [errors, setErrors] = useState<{
    sourceText?: string;
    maxFlashcards?: string;
  }>({});
  const [characterCount, setCharacterCount] = useState(0);

  // Aktualizacja licznika znaków przy każdej zmianie tekstu
  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const text = e.target.value;
    setSourceText(text);
    setCharacterCount(text.length);
    
    // Walidacja tekstu na bieżąco
    if (text.length < 1000) {
      setErrors(prev => ({ ...prev, sourceText: 'Tekst musi mieć co najmniej 1000 znaków' }));
    } else if (text.length > 10000) {
      setErrors(prev => ({ ...prev, sourceText: 'Tekst nie może przekraczać 10000 znaków' }));
    } else {
      setErrors(prev => ({ ...prev, sourceText: undefined }));
    }
  };
  
  // Walidacja liczby fiszek
  const handleMaxFlashcardsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value) || 0;
    setMaxFlashcards(value);
    
    if (value < 1) {
      setErrors(prev => ({ ...prev, maxFlashcards: 'Minimalna liczba fiszek to 1' }));
    } else if (value > 30) {
      setErrors(prev => ({ ...prev, maxFlashcards: 'Maksymalna liczba fiszek to 30' }));
    } else {
      setErrors(prev => ({ ...prev, maxFlashcards: undefined }));
    }
  };

  // Form validation
  const validate = () => {
    const newErrors: {
      sourceText?: string;
      maxFlashcards?: string;
    } = {};
    
    if (sourceText.length < 1000) {
      newErrors.sourceText = 'Tekst musi mieć co najmniej 1000 znaków';
    } else if (sourceText.length > 10000) {
      newErrors.sourceText = 'Tekst nie może przekraczać 10000 znaków';
    }
    
    if (maxFlashcards < 1) {
      newErrors.maxFlashcards = 'Minimalna liczba fiszek to 1';
    } else if (maxFlashcards > 30) {
      newErrors.maxFlashcards = 'Maksymalna liczba fiszek to 30';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validate()) {
      onSubmit({
        source_text: sourceText,
        options: {
          max_flashcards: maxFlashcards
        }
      });
    }
  };
  
  // Character count color
  const getCharCountColor = () => {
    if (characterCount < 1000) return 'text-amber-500';
    if (characterCount > 9000) return 'text-amber-500';
    if (characterCount > 10000) return 'text-red-500';
    return 'text-gray-500';
  };

  // Sprawdzamy, czy przycisk generowania powinien być aktywny
  const isGenerateButtonDisabled = () => {
    return isLoading || 
           sourceText.length < 1000 || 
           sourceText.length > 10000 || 
           maxFlashcards < 1 || 
           maxFlashcards > 30;
  };

  return (
    <Card className="w-full">
      <form onSubmit={handleSubmit}>
        <CardHeader>
          <CardTitle>Tekst źródłowy</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="sourceText">
              Wprowadź tekst, z którego chcesz wygenerować fiszki
              <span className="text-red-500">*</span>
            </Label>
            
            <Textarea
              id="sourceText"
              value={sourceText}
              onChange={handleTextChange}
              className="min-h-[200px] resize-y"
              placeholder="Wprowadź tekst, z którego chcesz wygenerować fiszki (min. 1000 znaków)"
              aria-invalid={!!errors.sourceText}
              aria-describedby="sourceText-error"
            />
            
            <div className="flex justify-between items-center">
              <p className={`text-xs ${getCharCountColor()}`}>
                {characterCount} / 10000 znaków
              </p>
              
              {errors.sourceText && (
                <div className="flex items-center text-red-500 text-sm" id="sourceText-error">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  {errors.sourceText}
                </div>
              )}
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="maxFlashcards">
              Maksymalna liczba fiszek
            </Label>
            
            <Input
              id="maxFlashcards"
              type="number"
              min={1}
              max={30}
              value={maxFlashcards}
              onChange={handleMaxFlashcardsChange}
              className="w-full sm:w-32"
              aria-invalid={!!errors.maxFlashcards}
              aria-describedby="maxFlashcards-error"
            />
            
            {errors.maxFlashcards && (
              <div className="flex items-center text-red-500 text-sm" id="maxFlashcards-error">
                <AlertCircle className="h-4 w-4 mr-1" />
                {errors.maxFlashcards}
              </div>
            )}
          </div>
        </CardContent>
        
        <CardFooter className="flex justify-end">
          <Button 
            type="submit" 
            disabled={isGenerateButtonDisabled()}
          >
            {isLoading ? 'Generowanie...' : 'Generuj fiszki'}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}