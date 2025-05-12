import type { FlashcardCandidateViewModel } from "./types";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Edit, Trash2 } from "lucide-react";

interface FlashcardCandidateItemProps {
  flashcard: FlashcardCandidateViewModel;
  index: number;
  onSelect: (index: number) => void;
  onEdit: (index: number) => void;
  onReject: (index: number) => void;
}

export function FlashcardCandidateItem({ flashcard, index, onSelect, onEdit, onReject }: FlashcardCandidateItemProps) {
  return (
    <Card
      className={`
        border-l-4 
        ${flashcard.isSelected ? "border-l-blue-600" : "border-l-gray-200"}
        ${flashcard.wasEdited ? "bg-blue-50" : ""}
      `}
      data-testid={`flashcard-candidate-${index}`}
    >
      <CardContent className="pt-6">
        <div className="flex items-start gap-3">
          <Checkbox
            id={`flashcard-${index}`}
            checked={flashcard.isSelected}
            onCheckedChange={() => onSelect(index)}
            className="mt-0.5"
            data-testid={`flashcard-checkbox-${index}`}
          />

          <div className="flex-1 space-y-4">
            <div>
              <label
                htmlFor={`flashcard-${index}`}
                className="text-lg font-medium cursor-pointer"
                data-testid={`flashcard-front-${index}`}
              >
                {flashcard.front_content}
              </label>
            </div>

            <div className="bg-gray-50 p-3 rounded-md" data-testid={`flashcard-back-${index}`}>
              <p className="text-gray-800">{flashcard.back_content}</p>
            </div>

            {flashcard.wasEdited && (
              <div className="text-xs text-blue-600" data-testid={`flashcard-edited-indicator-${index}`}>
                Edytowano ręcznie
              </div>
            )}
          </div>
        </div>
      </CardContent>

      <CardFooter className="flex justify-end gap-2 pt-0 pb-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onEdit(index)}
          data-testid={`flashcard-edit-button-${index}`}
        >
          <Edit className="h-4 w-4 mr-2" />
          Edytuj
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={() => onReject(index)}
          className="text-red-600 hover:text-red-700 hover:bg-red-50"
          data-testid={`flashcard-reject-button-${index}`}
        >
          <Trash2 className="h-4 w-4 mr-2" />
          Odrzuć
        </Button>
      </CardFooter>
    </Card>
  );
}
