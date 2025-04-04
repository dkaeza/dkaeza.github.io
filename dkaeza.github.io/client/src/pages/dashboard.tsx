import { useState } from "react";
import Sidebar from "@/components/sidebar";
import MobileNavbar from "@/components/mobile-navbar";
import StatusCard from "@/components/status-card";
import ReactionsManager from "@/components/reactions-manager";
import ActivitySettings from "@/components/activity-settings";
import RecentEvents from "@/components/recent-events";
import AddReactionModal from "@/components/add-reaction-modal";
import { useQuery } from "@tanstack/react-query";
import { fetchBotStatus, fetchReactions, fetchEvents } from "@/lib/api";

export default function Dashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Fetch data
  const { data: botStatus, isLoading: isLoadingStatus } = useQuery({
    queryKey: ['/api/status'],
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  const { data: reactions, isLoading: isLoadingReactions } = useQuery({
    queryKey: ['/api/reactions'],
  });

  const { data: events, isLoading: isLoadingEvents } = useQuery({
    queryKey: ['/api/events'],
  });

  // Toggle sidebar on mobile
  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  // Toggle add reaction modal
  const toggleAddModal = () => {
    setIsAddModalOpen(!isAddModalOpen);
  };

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar - hidden on mobile */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      {/* Main content */}
      <div className="flex flex-col flex-1 w-0 overflow-hidden">
        {/* Mobile navigation bar */}
        <MobileNavbar onMenuClick={toggleSidebar} />
        
        {/* Main content */}
        <main className="flex-1 relative overflow-y-auto focus:outline-none">
          <div className="py-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
              <h1 className="text-2xl font-semibold text-gray-900">Tableau de Bord</h1>
            </div>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
              {/* Dashboard content */}
              <div className="py-4">
                {/* StatusCard component */}
                <StatusCard 
                  isLoading={isLoadingStatus} 
                  status={botStatus?.isOnline}
                  memberCount={botStatus?.memberCount} 
                  activity={botStatus?.activity}
                />
                
                {/* ReactionsManager component */}
                <ReactionsManager 
                  isLoading={isLoadingReactions}
                  reactions={reactions || []}
                  onAddClick={toggleAddModal}
                />
                
                {/* ActivitySettings component */}
                <ActivitySettings />
                
                {/* RecentEvents component */}
                <RecentEvents 
                  isLoading={isLoadingEvents}
                  events={events || []}
                />
              </div>
            </div>
          </div>
        </main>
      </div>
      
      {/* AddReactionModal component */}
      <AddReactionModal 
        isOpen={isAddModalOpen} 
        onClose={toggleAddModal} 
      />
    </div>
  );
}
