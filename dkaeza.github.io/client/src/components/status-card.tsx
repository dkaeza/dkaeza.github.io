import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

interface StatusCardProps {
  isLoading: boolean;
  status?: boolean;
  memberCount?: number;
  activity?: string;
}

export default function StatusCard({ isLoading, status, memberCount, activity }: StatusCardProps) {
  return (
    <Card className="mb-6">
      <CardContent className="p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Status du Bot</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Status Card */}
          <div className="bg-gray-50 p-4 rounded-md border border-gray-200">
            <div className="flex items-center">
              <div className={`p-3 rounded-full ${status ? 'bg-green-100' : 'bg-red-100'} mr-4`}>
                <i className={`fas fa-circle ${status ? 'text-green-500' : 'text-red-500'}`}></i>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Statut</p>
                {isLoading ? (
                  <Skeleton className="h-6 w-20" />
                ) : (
                  <p className="text-lg font-semibold text-gray-900">
                    {status ? 'En ligne' : 'Hors ligne'}
                  </p>
                )}
              </div>
            </div>
          </div>
          
          {/* Members Card */}
          <div className="bg-gray-50 p-4 rounded-md border border-gray-200">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-primary bg-opacity-10 mr-4">
                <i className="fas fa-users text-primary"></i>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Membres</p>
                {isLoading ? (
                  <Skeleton className="h-6 w-20" />
                ) : (
                  <p className="text-lg font-semibold text-gray-900">
                    {memberCount}
                  </p>
                )}
              </div>
            </div>
          </div>
          
          {/* Activity Card */}
          <div className="bg-gray-50 p-4 rounded-md border border-gray-200">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-primary bg-opacity-10 mr-4">
                <i className="fas fa-comment text-primary"></i>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Activité</p>
                {isLoading ? (
                  <Skeleton className="h-6 w-48" />
                ) : (
                  <p className="text-lg font-semibold text-gray-900">
                    {activity}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
