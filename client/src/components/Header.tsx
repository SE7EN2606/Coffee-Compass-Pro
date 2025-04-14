import { useLocation } from "wouter";

const Header = () => {
  const [location] = useLocation();

  return (
    <header className="bg-[#7C5A43] shadow-md">
      <div className="container mx-auto px-4 py-3">
        <div className="flex justify-between items-center">
          <div 
            className="flex items-center space-x-2 cursor-pointer" 
            onClick={() => window.location.href = '/'}
          >
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              viewBox="0 0 24 24"
              fill="none"
              stroke="#E8DCCA"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="w-6 h-6"
            >
              <path d="M17 8h1a4 4 0 1 1 0 8h-1"></path>
              <path d="M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4Z"></path>
              <line x1="6" x2="6" y1="2" y2="4"></line>
              <line x1="10" x2="10" y1="2" y2="4"></line>
              <line x1="14" x2="14" y1="2" y2="4"></line>
            </svg>
            <h1 className="font-['Playfair_Display'] text-xl md:text-2xl font-bold text-white">CoffeeCompass</h1>
          </div>
          <div className="flex items-center space-x-4">
            <div 
              className={`flex items-center text-[#E8DCCA] hover:text-white transition cursor-pointer ${location === '/favorites' ? 'text-white' : ''}`}
              onClick={() => window.location.href = '/favorites'}
            >
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                viewBox="0 0 24 24" 
                fill={location === '/favorites' ? "currentColor" : "none"}
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round"
                className="w-5 h-5"
              >
                <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
              </svg>
              <span className="hidden md:inline ml-1">Favorites</span>
            </div>
            <div 
              className="flex items-center text-[#E8DCCA] hover:text-white transition cursor-pointer"
              onClick={() => alert('Profile feature coming soon!')}
            >
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round"
                className="w-5 h-5"
              >
                <path d="M18 20a6 6 0 0 0-12 0" />
                <circle cx="12" cy="10" r="4" />
                <circle cx="12" cy="12" r="10" />
              </svg>
              <span className="hidden md:inline ml-1">Profile</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
