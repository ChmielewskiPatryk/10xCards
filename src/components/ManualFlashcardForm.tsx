import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useState } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { Textarea } from './ui/textarea';
import { Button } from './ui/button';
import { ConfirmDialog } from './ConfirmDialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from './ui/form';
import type { CreateFlashcardCommand } from '../types';

// Schema for form validation
const FlashcardFormSchema = z.object({
  front_content: z.string()
    .min(1, "Treść przedniej strony jest wymagana")
    .max(200, "Treść przedniej strony nie może przekraczać 200 znaków"),
  back_content: z.string()
    .min(1, "Treść tylnej strony jest wymagana")
    .max(200, "Treść tylnej strony nie może przekraczać 200 znaków"),
});

type FormData = z.infer<typeof FlashcardFormSchema>;

interface FormState {
  isSubmitting: boolean;
  isSuccess: boolean;
  error: string | null;
}

export default function ManualFlashcardForm() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formState, setFormState] = useState<FormState>({
    isSubmitting: false,
    isSuccess: false,
    error: null
  });
  const { toast } = useToast();
  
  const form = useForm<FormData>({
    resolver: zodResolver(FlashcardFormSchema),
    defaultValues: {
      front_content: '',
      back_content: ''
    }
  });
  
  // Function called when trying to submit the form
  const onSubmit = (data: FormData) => {
    setIsDialogOpen(true);
  };
  
  // Function called after confirmation in dialog
  const handleConfirm = async () => {
    const data = form.getValues();
    setFormState({ isSubmitting: true, isSuccess: false, error: null });
    
    try {
      const response = await fetch('/api/flashcards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data as CreateFlashcardCommand)
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Wystąpił błąd podczas zapisywania fiszki');
      }
      
      setFormState({ isSubmitting: false, isSuccess: true, error: null });
      toast({
        title: "Sukces",
        description: "Fiszka została pomyślnie zapisana",
        variant: "default",
      });
      form.reset();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Wystąpił nieznany błąd';
      setFormState({ isSubmitting: false, isSuccess: false, error: errorMessage });
      toast({
        title: "Błąd",
        description: errorMessage,
        variant: "destructive",
      });
    }
    
    setIsDialogOpen(false);
  };
  
  // Function to cancel operation
  const handleCancel = () => {
    setIsDialogOpen(false);
  };

  return (
    <div className="max-w-2xl mx-auto">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="front_content"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Przednia strona</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Textarea 
                      placeholder="Wprowadź treść przedniej strony fiszki" 
                      className="resize-none min-h-[120px]" 
                      {...field} 
                    />
                    <div className="absolute bottom-2 right-2 text-xs text-gray-500">
                      {field.value.length}/200
                    </div>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="back_content"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tylna strona</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Textarea 
                      placeholder="Wprowadź treść tylnej strony fiszki" 
                      className="resize-none min-h-[120px]" 
                      {...field} 
                    />
                    <div className="absolute bottom-2 right-2 text-xs text-gray-500">
                      {field.value.length}/200
                    </div>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <div className="flex justify-end space-x-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => form.reset()}
              disabled={formState.isSubmitting}
            >
              Wyczyść
            </Button>
            <Button
              type="submit"
              disabled={!form.formState.isValid || formState.isSubmitting}
            >
              {formState.isSubmitting ? "Zapisywanie..." : "Zapisz fiszkę"}
            </Button>
          </div>
        </form>
      </Form>
      
      <ConfirmDialog
        open={isDialogOpen}
        message="Czy na pewno chcesz zapisać tę fiszkę?"
        onConfirm={handleConfirm}
        onCancel={handleCancel}
        confirmText="Zapisz"
      />
    </div>
  );
} 