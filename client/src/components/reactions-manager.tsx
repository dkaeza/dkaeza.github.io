import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import { deleteReaction, formatRelativeTime } from "@/lib/api";
import type { Reaction } from "@/lib/types";

interface ReactionsManagerProps {
  reactions: Reaction[];
  isLoading: boolean;
  onAddClick: () => void;
}

export default function ReactionsManager({ reactions, isLoading, onAddClick }: ReactionsManagerProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  
  // Calculate pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = reactions.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(reactions.length / itemsPerPage);
  
  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: deleteReaction,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/reactions'] });
      toast({
        title: "Réaction supprimée",
        description: "La réaction a été supprimée avec succès.",
      });
    },
    onError: (error) => {
      toast({
        title: "Erreur",
        description: "Impossible de supprimer la réaction.",
        variant: "destructive",
      });
    },
  });
  
  // Handle delete
  const handleDelete = (id: number) => {
    if (confirm("Êtes-vous sûr de vouloir supprimer cette réaction ?")) {
      deleteMutation.mutate(id);
    }
  };
  
  // Get badge color based on type
  const getBadgeClass = (type: string) => {
    switch (type) {
      case 'message':
        return 'bg-green-100 text-green-800';
      case 'emoji':
        return 'bg-blue-100 text-blue-800';
      case 'command':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  
  // Translate type to French
  const translateType = (type: string) => {
    switch (type) {
      case 'message':
        return 'Message';
      case 'emoji':
        return 'Emoji';
      case 'command':
        return 'Commande';
      default:
        return type;
    }
  };
  
  return (
    <Card className="shadow rounded-lg overflow-hidden mb-6">
      <div className="border-b border-gray-200 px-6 py-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">Réactions aux Mots-clés</h2>
        <Button onClick={onAddClick} className="bg-primary hover:bg-primary-dark text-white">
          <i className="fas fa-plus mr-2"></i>
          Ajouter
        </Button>
      </div>
      
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Mot-clé
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Réaction
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Type
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Dernier déclenchement
              </th>
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {isLoading ? (
              // Loading skeleton
              [...Array(3)].map((_, index) => (
                <tr key={index}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Skeleton className="h-5 w-20" />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Skeleton className="h-5 w-40" />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Skeleton className="h-5 w-16" />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Skeleton className="h-5 w-24" />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <Skeleton className="h-5 w-16 ml-auto" />
                  </td>
                </tr>
              ))
            ) : currentItems.length > 0 ? (
              // Actual data
              currentItems.map((reaction) => (
                <tr key={reaction.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{reaction.keyword}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{reaction.response}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getBadgeClass(reaction.type)}`}>
                      {translateType(reaction.type)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {reaction.lastTriggered ? formatRelativeTime(reaction.lastTriggered) : 'Jamais'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button 
                      className="text-primary hover:text-primary-dark mr-3"
                      aria-label="Modifier"
                    >
                      <i className="fas fa-edit"></i>
                    </button>
                    <button 
                      className="text-red-500 hover:text-red-700"
                      onClick={() => handleDelete(reaction.id)}
                      aria-label="Supprimer"
                      disabled={deleteMutation.isPending}
                    >
                      <i className="fas fa-trash"></i>
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              // Empty state
              <tr>
                <td colSpan={5} className="px-6 py-4 text-center text-sm text-gray-500">
                  Aucune réaction configurée. Cliquez sur "Ajouter" pour créer votre première réaction.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      
      {/* Pagination */}
      {!isLoading && reactions.length > 0 && (
        <div className="bg-gray-50 px-6 py-3 flex items-center justify-between border-t border-gray-200">
          <div className="flex-1 flex justify-between sm:hidden">
            <Button
              variant="outline"
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
            >
              Précédent
            </Button>
            <Button
              variant="outline"
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
            >
              Suivant
            </Button>
          </div>
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700">
                Affichage <span className="font-medium">{indexOfFirstItem + 1}</span> à{" "}
                <span className="font-medium">
                  {Math.min(indexOfLastItem, reactions.length)}
                </span>{" "}
                sur <span className="font-medium">{reactions.length}</span> résultats
              </p>
            </div>
            <div>
              <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                <Button
                  variant="outline"
                  className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                >
                  <span className="sr-only">Précédent</span>
                  <i className="fas fa-chevron-left"></i>
                </Button>
                
                {/* Generate page numbers */}
                {[...Array(totalPages)].map((_, index) => (
                  <Button
                    key={index}
                    variant={currentPage === index + 1 ? "default" : "outline"}
                    className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                      currentPage === index + 1
                        ? "bg-primary text-white border-primary z-10"
                        : "bg-white text-gray-500 border-gray-300 hover:bg-gray-50"
                    }`}
                    onClick={() => setCurrentPage(index + 1)}
                  >
                    {index + 1}
                  </Button>
                ))}
                
                <Button
                  variant="outline"
                  className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                >
                  <span className="sr-only">Suivant</span>
                  <i className="fas fa-chevron-right"></i>
                </Button>
              </nav>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
}
