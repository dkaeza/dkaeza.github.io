import { useLocation } from "wouter";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const [location] = useLocation();
  
  // Define sidebar links
  const links = [
    { 
      name: "Tableau de bord", 
      path: "/", 
      icon: "fas fa-tachometer-alt",
      current: location === "/" 
    },
    { 
      name: "Réactions", 
      path: "/reactions", 
      icon: "fas fa-comments",
      current: location === "/reactions" 
    },
    { 
      name: "Profil du Bot", 
      path: "/profile", 
      icon: "fas fa-user-circle",
      current: location === "/profile" 
    },
    { 
      name: "Paramètres", 
      path: "/settings", 
      icon: "fas fa-cog",
      current: location === "/settings" 
    },
    { 
      name: "Aide", 
      path: "/help", 
      icon: "fas fa-question-circle",
      current: location === "/help" 
    },
  ];

  // Style classes
  const sidebarClass = `md:flex md:flex-shrink-0 ${isOpen ? 'fixed inset-0 z-40 flex' : 'hidden'}`;
  
  return (
    <div className={sidebarClass}>
      {/* Overlay to close the sidebar on mobile */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-gray-600 bg-opacity-75 md:hidden" 
          onClick={onClose}
        />
      )}
      
      <div className="flex flex-col w-64 bg-white border-r border-gray-200">
        {/* Header */}
        <div className="flex items-center justify-center h-16 px-4 bg-primary">
          <div className="flex items-center">
            <i className="fas fa-robot text-white text-2xl mr-3"></i>
            <h1 className="text-xl font-semibold text-white">Bot Manager</h1>
          </div>
        </div>

        {/* Navigation links */}
        <div className="flex flex-col flex-grow pt-5 pb-4 overflow-y-auto">
          <nav className="flex-1 px-2 space-y-1">
            {links.map((link) => (
              <a
                key={link.path}
                href={link.path}
                className={`flex items-center px-2 py-2 text-base rounded-md ${
                  link.current 
                    ? 'bg-gray-100 text-primary-dark font-medium' 
                    : 'text-gray-600 hover:bg-gray-50 hover:text-primary'
                }`}
                aria-current={link.current ? 'page' : undefined}
              >
                <i className={`${link.icon} w-6 mr-3 ${link.current ? 'text-primary-dark' : 'text-gray-400'}`}></i>
                {link.name}
              </a>
            ))}
          </nav>
        </div>

        {/* User section */}
        <div className="p-4 border-t border-gray-200">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="h-8 w-8 rounded-full bg-primary-light flex items-center justify-center text-white">
                <span className="text-sm font-medium">AD</span>
              </div>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-700">Admin Discord</p>
              <p className="text-xs font-medium text-gray-500">Déconnexion</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
