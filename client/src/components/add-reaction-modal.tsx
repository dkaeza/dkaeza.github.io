import { useState } from "react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue 
} from "@/components/ui/select";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import { createReaction } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

interface AddReactionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AddReactionModal({ isOpen, onClose }: AddReactionModalProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Form state
  const [keyword, setKeyword] = useState('');
  const [type, setType] = useState<'message' | 'emoji' | 'command'>('message');
  const [response, setResponse] = useState('');
  
  // Create reaction mutation
  const createMutation = useMutation({
    mutationFn: createReaction,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/reactions'] });
      toast({
        title: "Réaction ajoutée",
        description: "La nouvelle réaction a été créée avec succès.",
      });
      resetForm();
      onClose();
    },
    onError: (error) => {
      toast({
        title: "Erreur",
        description: "Impossible de créer la réaction. Veuillez réessayer.",
        variant: "destructive",
      });
    },
  });
  
  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    if (!keyword.trim()) {
      toast({
        title: "Champ requis",
        description: "Le mot-clé est requis.",
        variant: "destructive",
      });
      return;
    }
    
    if (!response.trim()) {
      toast({
        title: "Champ requis",
        description: "La réponse est requise.",
        variant: "destructive",
      });
      return;
    }
    
    // Submit the form
    createMutation.mutate({
      keyword: keyword.trim(),
      type,
      response: response.trim()
    });
  };
  
  // Reset form to initial state
  const resetForm = () => {
    setKeyword('');
    setType('message');
    setResponse('');
  };
  
  // Handle modal close
  const handleClose = () => {
    if (!createMutation.isPending) {
      resetForm();
      onClose();
    }
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold">Ajouter une Nouvelle Réaction</DialogTitle>
        </DialogHeader>
        
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <Label htmlFor="keyword">Mot-clé</Label>
            <Input
              id="keyword"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="Entrez le mot-clé déclencheur"
              disabled={createMutation.isPending}
              className="mt-1"
            />
          </div>
          
          <div>
            <Label htmlFor="reaction-type">Type de réaction</Label>
            <Select
              value={type}
              onValueChange={(value: 'message' | 'emoji' | 'command') => setType(value)}
              disabled={createMutation.isPending}
            >
              <SelectTrigger id="reaction-type" className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value="message">Message texte</SelectItem>
                  <SelectItem value="emoji">Emoji</SelectItem>
                  <SelectItem value="command">Commande</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Label htmlFor="reaction-content">Contenu de la réaction</Label>
            <Textarea
              id="reaction-content"
              value={response}
              onChange={(e) => setResponse(e.target.value)}
              placeholder="Entrez le contenu de la réaction"
              rows={3}
              disabled={createMutation.isPending}
              className="mt-1"
            />
          </div>
          
          <DialogFooter className="mt-6">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={createMutation.isPending}
            >
              Annuler
            </Button>
            <Button
              type="submit"
              disabled={createMutation.isPending}
              className="bg-primary text-white hover:bg-primary-dark"
            >
              {createMutation.isPending ? "Enregistrement..." : "Enregistrer"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
