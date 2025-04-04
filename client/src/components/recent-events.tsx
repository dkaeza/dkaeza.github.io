import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { formatRelativeTime } from "@/lib/api";
import type { Event } from "@/lib/types";

interface RecentEventsProps {
  events: Event[];
  isLoading: boolean;
}

export default function RecentEvents({ events, isLoading }: RecentEventsProps) {
  // Get icon and background color based on event type
  const getEventIcon = (type: string) => {
    switch (type) {
      case 'bot_start':
        return { icon: 'fas fa-check', bg: 'bg-green-500' };
      case 'reaction_triggered':
        return { icon: 'fas fa-comment', bg: 'bg-blue-500' };
      case 'member_join':
        return { icon: 'fas fa-user-plus', bg: 'bg-purple-500' };
      case 'reaction_created':
        return { icon: 'fas fa-plus', bg: 'bg-primary' };
      case 'reaction_updated':
        return { icon: 'fas fa-edit', bg: 'bg-amber-500' };
      case 'reaction_deleted':
        return { icon: 'fas fa-trash', bg: 'bg-red-500' };
      case 'error':
        return { icon: 'fas fa-exclamation-triangle', bg: 'bg-red-500' };
      default:
        return { icon: 'fas fa-info-circle', bg: 'bg-gray-500' };
    }
  };
  
  // Extract event message parts (bold part is wrapped in <span> tag)
  const parseEventMessage = (message: string) => {
    const parts = message.split('"');
    if (parts.length >= 3) {
      return (
        <>
          {parts[0]}
          <span className="font-medium text-gray-900">"{parts[1]}"</span>
          {parts[2]}
        </>
      );
    }
    
    // If no quotes, look for other patterns
    const boldParts = message.split(' a ');
    if (boldParts.length >= 2) {
      return (
        <>
          {boldParts[0]}
          <span className="font-medium text-gray-900"> a {boldParts[1]}</span>
        </>
      );
    }
    
    // If no special format detected, check for "avec succès"
    if (message.includes('avec succès')) {
      const successParts = message.split('avec succès');
      return (
        <>
          {successParts[0]}
          <span className="font-medium text-gray-900">avec succès</span>
          {successParts[1] || ''}
        </>
      );
    }
    
    // Default case, no formatting
    return message;
  };
  
  return (
    <Card className="shadow rounded-lg p-6">
      <CardContent className="p-0">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Événements Récents</h2>
        <div className="flow-root">
          <ul role="list" className="-mb-8">
            {isLoading ? (
              // Loading skeleton
              [...Array(3)].map((_, index) => (
                <li key={index}>
                  <div className="relative pb-8">
                    {index < 2 && (
                      <span className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200" aria-hidden="true"></span>
                    )}
                    <div className="relative flex space-x-3">
                      <div>
                        <Skeleton className="h-8 w-8 rounded-full" />
                      </div>
                      <div className="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                        <div>
                          <Skeleton className="h-5 w-48" />
                        </div>
                        <div className="text-right">
                          <Skeleton className="h-5 w-24" />
                        </div>
                      </div>
                    </div>
                  </div>
                </li>
              ))
            ) : events.length > 0 ? (
              // Actual events data
              events.map((event, index) => {
                const { icon, bg } = getEventIcon(event.type);
                
                return (
                  <li key={event.id}>
                    <div className="relative pb-8">
                      {index < events.length - 1 && (
                        <span className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200" aria-hidden="true"></span>
                      )}
                      <div className="relative flex space-x-3">
                        <div>
                          <span className={`h-8 w-8 rounded-full ${bg} flex items-center justify-center`}>
                            <i className={`${icon} text-white`}></i>
                          </span>
                        </div>
                        <div className="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                          <div>
                            <p className="text-sm text-gray-500">{parseEventMessage(event.message)}</p>
                          </div>
                          <div className="text-right text-sm whitespace-nowrap text-gray-500">
                            {formatRelativeTime(event.timestamp)}
                          </div>
                        </div>
                      </div>
                    </div>
                  </li>
                );
              })
            ) : (
              // Empty state
              <li>
                <div className="text-center py-4 text-sm text-gray-500">
                  Aucun événement récent à afficher.
                </div>
              </li>
            )}
          </ul>
        </div>
        {!isLoading && events.length > 0 && (
          <div className="mt-4 flex">
            <a href="#" className="text-sm font-medium text-primary hover:text-primary-dark">
              Voir tous les événements <i className="fas fa-arrow-right ml-1"></i>
            </a>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
