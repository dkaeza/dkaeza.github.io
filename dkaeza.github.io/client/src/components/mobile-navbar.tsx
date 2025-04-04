interface MobileNavbarProps {
  onMenuClick: () => void;
}

export default function MobileNavbar({ onMenuClick }: MobileNavbarProps) {
  return (
    <div className="md:hidden">
      <div className="flex items-center justify-between bg-primary px-4 py-3 h-16">
        <div className="flex items-center">
          <i className="fas fa-robot text-white text-2xl mr-3"></i>
          <h1 className="text-xl font-semibold text-white">Bot Manager</h1>
        </div>
        <button 
          type="button" 
          className="bg-primary-dark rounded-md p-2 text-white focus:outline-none"
          onClick={onMenuClick}
        >
          <i className="fas fa-bars"></i>
        </button>
      </div>
    </div>
  );
}
