import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchBotSettings, updateBotSettings, fetchBotStatus } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

export default function ActivitySettings() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Local state for form values
  const [prefix, setPrefix] = useState("Regarde");
  const [suffix, setSuffix] = useState("sur");
  const [previewText, setPreviewText] = useState("");
  
  // Fetch settings and status
  const { data: settings, isLoading: isLoadingSettings } = useQuery({
    queryKey: ['/api/settings'],
  });
  
  const { data: status } = useQuery({
    queryKey: ['/api/status'],
  });
  
  // Update local state when settings are fetched
  useEffect(() => {
    if (settings) {
      setPrefix(settings.activityPrefix);
      setSuffix(settings.activitySuffix);
    }
  }, [settings]);
  
  // Update preview text when any dependency changes
  useEffect(() => {
    if (status) {
      setPreviewText(`${prefix} ${status.memberCount} ${suffix} ${status.guildName}`);
    }
  }, [prefix, suffix, status]);
  
  // Update settings mutation
  const updateMutation = useMutation({
    mutationFn: updateBotSettings,
    onSuccess: () => {
      toast({
        title: "Paramètres sauvegardés",
        description: "Les paramètres d'activité ont été mis à jour avec succès.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/settings'] });
      queryClient.invalidateQueries({ queryKey: ['/api/status'] });
    },
    onError: () => {
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour les paramètres d'activité.",
        variant: "destructive",
      });
    },
  });
  
  // Handle form submit
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateMutation.mutate({
      activityPrefix: prefix,
      activitySuffix: suffix
    });
  };
  
  // Handle reset
  const handleReset = () => {
    if (settings) {
      setPrefix(settings.activityPrefix);
      setSuffix(settings.activitySuffix);
    }
  };
  
  return (
    <Card className="shadow rounded-lg p-6 mb-6">
      <CardContent className="p-0">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Personnaliser l'Activité</h2>
        <form className="space-y-6" onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
            <div className="sm:col-span-3">
              <Label htmlFor="activity-prefix">Préfixe d'activité</Label>
              <div className="mt-1">
                <Input
                  id="activity-prefix"
                  value={prefix}
                  onChange={(e) => setPrefix(e.target.value)}
                  disabled={isLoadingSettings || updateMutation.isPending}
                  className="shadow-sm focus:ring-primary focus:border-primary block w-full sm:text-sm border-gray-300 rounded-md"
                />
              </div>
              <p className="mt-2 text-sm text-gray-500">Le texte affiché avant le nombre de membres</p>
            </div>
            
            <div className="sm:col-span-3">
              <Label htmlFor="activity-suffix">Suffixe d'activité</Label>
              <div className="mt-1">
                <Input
                  id="activity-suffix"
                  value={suffix}
                  onChange={(e) => setSuffix(e.target.value)}
                  disabled={isLoadingSettings || updateMutation.isPending}
                  className="shadow-sm focus:ring-primary focus:border-primary block w-full sm:text-sm border-gray-300 rounded-md"
                />
              </div>
              <p className="mt-2 text-sm text-gray-500">Le texte affiché entre le nombre et le nom</p>
            </div>
          </div>
          
          <div>
            <Label htmlFor="activity-preview">Aperçu de l'activité</Label>
            <div className="mt-1 p-3 bg-gray-100 border border-gray-300 rounded-md text-gray-700">
              <p id="activity-preview">{previewText}</p>
            </div>
          </div>
          
          <div className="flex justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={handleReset}
              disabled={updateMutation.isPending}
              className="mr-3"
            >
              Réinitialiser
            </Button>
            <Button
              type="submit"
              disabled={updateMutation.isPending}
              className="bg-primary hover:bg-primary-dark text-white"
            >
              {updateMutation.isPending ? "Enregistrement..." : "Enregistrer"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
