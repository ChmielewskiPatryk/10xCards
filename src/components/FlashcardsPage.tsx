import * as React from 'react';
import { FilterSortControls } from './FilterSortControls';
import { FlashcardsList } from './FlashcardsList';
import { Pagination } from './Pagination';
import { ConfirmDialog } from './ConfirmDialog';
import { Toast } from './Toast';
import { useFlashcards } from './hooks/useFlashcards';
import type { Filters } from './hooks/useFlashcards';
import type { ToastType } from './Toast';
import DashboardHeader from './dashboard/DashboardHeader';
import useAuth from './hooks/useAuth';
import { FlashcardEditForm } from './generate/FlashcardEditForm';
import type { FlashcardCandidateViewModel } from './generate/types';
import type { FlashcardCandidate, Flashcard } from '../types';

export default function FlashcardsPage() {
  const { user } = useAuth();
  const [filters, setFilters] = React.useState<Filters>({
    source: 'manual',
    sort: 'created_at',
    order: 'asc'
  });
  const [page, setPage] = React.useState(1);
  const limit = 20;
  const [confirmOpen, setConfirmOpen] = React.useState(false);
  const [deleteId, setDeleteId] = React.useState<string | null>(null);
  const [toast, setToast] = React.useState<{ message: string; type: ToastType; open: boolean }>({ message: '', type: 'success', open: false });
  const [editingFlashcard, setEditingFlashcard] = React.useState<FlashcardCandidateViewModel | null>(null);

  const { data, pagination, loading, error, refresh } = useFlashcards(filters, page, limit);

  // Calculate stats for the dashboard summary cards
  const totalFlashcards = pagination?.total || 0;
  const studiedToday = 0; // To be implemented - would come from actual data
  const mastered = 0; // To be implemented - would come from actual data

  const handleSourceChange = (value: Filters['source']) => { setFilters((f) => ({ ...f, source: value })); setPage(1); };
  const handleSortChange = (value: Filters['sort']) => { setFilters((f) => ({ ...f, sort: value })); setPage(1); };
  const handleOrderChange = (value: Filters['order']) => { setFilters((f) => ({ ...f, order: value })); setPage(1); };
  const handlePageChange = (n: number) => setPage(n);
  
  const handleEdit = (id: string) => {
    const flashcard = data.find(f => f.id === id);
    if (flashcard) {
      setEditingFlashcard({
        front_content: flashcard.front_content,
        back_content: flashcard.back_content,
        ai_metadata: {
          model: flashcard.source === 'ai' ? 'AI Generated' : 'Manual',
          generation_time: flashcard.created_at,
          parameters: {}
        },
        isSelected: false,
        isEditing: true,
        wasEdited: false
      });
    }
  };
  
  const handleSaveEdit = async (updatedFlashcard: FlashcardCandidate) => {
    if (!editingFlashcard) return;
    
    try {
      const flashcard = data.find(f => f.front_content === editingFlashcard.front_content && f.back_content === editingFlashcard.back_content);
      if (!flashcard) {
        setToast({ message: 'Nie znaleziono fiszki do edycji', type: 'error', open: true });
        return;
      }
      
      // Update ai_metadata to track the original content
      const ai_metadata = {
        model: flashcard.source === 'ai' ? 'AI Generated' : 'Manual',
        generation_time: flashcard.created_at,
        parameters: {},
        original_content: {
          front_content: flashcard.front_content,
          back_content: flashcard.back_content
        },
        edited_at: new Date().toISOString()
      };
      
      // Make API request to update the flashcard
      const response = await fetch(`/api/flashcards/${flashcard.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          front_content: updatedFlashcard.front_content,
          back_content: updatedFlashcard.back_content,
          ai_metadata
        })
      });
      
      if (!response.ok) {
        throw new Error('Nie udało się zaktualizować fiszki');
      }
      
      // Refresh the data
      await refresh();
      setToast({ message: 'Fiszka została zaktualizowana', type: 'success', open: true });
    } catch (error) {
      setToast({ message: error instanceof Error ? error.message : 'Błąd podczas aktualizacji fiszki', type: 'error', open: true });
    } finally {
      setEditingFlashcard(null);
    }
  };
  
  const handleCancelEdit = () => {
    setEditingFlashcard(null);
  };
  
  const handleDelete = (id: string) => { setDeleteId(id); setConfirmOpen(true); };
  const confirmDelete = async () => {
    setConfirmOpen(false);
    if (deleteId) {
      try {
        // Make the DELETE request to the API endpoint
        const response = await fetch(`/api/flashcards/${deleteId}`, {
          method: 'DELETE'
        });
        
        if (!response.ok) {
          throw new Error('Nie udało się usunąć fiszki');
        }
        
        await refresh();
        setToast({ message: 'Usunięto fiszkę', type: 'success', open: true });
      } catch (error) {
        setToast({ message: error instanceof Error ? error.message : 'Błąd podczas usuwania', type: 'error', open: true });
      }
    }
    setDeleteId(null);
  };
  const cancelDelete = () => { setConfirmOpen(false); setDeleteId(null); };
  const closeToast = () => setToast((t) => ({ ...t, open: false }));

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Main navigation header */}
      {user && <DashboardHeader user={user} activePath="/flashcards" />}

      {/* Header section with background */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white p-6 rounded-b-lg shadow-md">
        <h1 className="text-3xl font-bold">Przegląd fiszek</h1>
        <p className="text-blue-100 mt-2">Zarządzaj swoimi fiszkami i monitoruj postęp nauki</p>
      </div>

      {/* Dashboard summary cards */}
      <div className="container mx-auto px-4 -mt-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-blue-500 flex items-center">
            <div className="bg-blue-100 p-3 rounded-full mr-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <p className="text-gray-500 text-sm font-medium uppercase">Łącznie fiszek</p>
              <p className="text-3xl font-bold text-gray-800">{totalFlashcards}</p>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-green-500 flex items-center">
            <div className="bg-green-100 p-3 rounded-full mr-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <div>
              <p className="text-gray-500 text-sm font-medium uppercase">Dziś przetrenowane</p>
              <p className="text-3xl font-bold text-gray-800">{studiedToday}</p>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-purple-500 flex items-center">
            <div className="bg-purple-100 p-3 rounded-full mr-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p className="text-gray-500 text-sm font-medium uppercase">Opanowane</p>
              <p className="text-3xl font-bold text-gray-800">{mastered}</p>
            </div>
          </div>
        </div>

        {/* Main content card with filters and flashcards list */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Filtry i sortowanie</h2>
            <div className="p-4 bg-gray-50 rounded-lg">
              <FilterSortControls
                source={filters.source}
                sort={filters.sort}
                order={filters.order}
                onSourceChange={handleSourceChange}
                onSortChange={handleSortChange}
                onOrderChange={handleOrderChange}
                hideAllOption={true}
              />
            </div>
          </div>
          
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Lista fiszek</h2>
            <div className="overflow-hidden rounded-lg border border-gray-200">
              <FlashcardsList items={data} loading={loading} onEdit={handleEdit} onDelete={handleDelete} />
            </div>
          </div>
          
          <div className="flex justify-center mt-6">
            <Pagination page={pagination.page} pages={pagination.pages} onPageChange={handlePageChange} />
          </div>
        </div>
      </div>

      {/* Edit Flashcard Dialog */}
      {editingFlashcard && (
        <FlashcardEditForm
          flashcard={editingFlashcard}
          onSave={handleSaveEdit}
          onCancel={handleCancelEdit}
        />
      )}

      <ConfirmDialog
        open={confirmOpen}
        message="Czy na pewno chcesz usunąć tę fiszkę?"
        onConfirm={confirmDelete}
        onCancel={cancelDelete}
      />
      <Toast message={toast.message} type={toast.type} open={toast.open} onClose={closeToast} />
    </div>
  );
} 