import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { CoffeeShop } from '@/lib/types';
import CoffeeShopCard from '@/components/CoffeeShopCard';
import ShopDetailsModal from '@/components/ShopDetailsModal';
import { useToast } from '@/hooks/use-toast';

const Favorites = () => {
  const { toast } = useToast();
  const [selectedShop, setSelectedShop] = useState<CoffeeShop | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const { data: favorites, isLoading, error } = useQuery<CoffeeShop[]>({
    queryKey: ['/api/coffee-shops/favorites'],
  });

  if (error) {
    toast({
      title: "Error",
      description: "Could not load favorites. Please try again later.",
      variant: "destructive",
    });
  }

  const handleViewDetails = (shop: CoffeeShop) => {
    setSelectedShop(shop);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <h1 className="font-['Playfair_Display'] text-2xl font-bold text-[#3C2A1E] mb-6">Your Favorite Coffee Shops</h1>

      {isLoading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#7C5A43]"></div>
        </div>
      ) : favorites && favorites.length > 0 ? (
        <div className="grid grid-cols-1 gap-4">
          {favorites.map((shop) => (
            <CoffeeShopCard 
              key={shop.id} 
              shop={shop} 
              onViewDetails={() => handleViewDetails(shop)} 
            />
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <div className="flex flex-col items-center justify-center">
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              className="text-gray-400 w-16 h-16 mb-4"
            >
              <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"></path>
            </svg>
            <h2 className="text-xl font-semibold text-[#3C2A1E] mb-2">No Favorites Yet</h2>
            <p className="text-gray-600 mb-6">Start adding your favorite coffee shops by clicking the heart icon.</p>
            <a 
              href="/" 
              className="px-4 py-2 bg-[#7C5A43] text-white rounded-lg hover:bg-[#3C2A1E] transition-all"
            >
              Discover Coffee Shops
            </a>
          </div>
        </div>
      )}

      {selectedShop && (
        <ShopDetailsModal 
          shop={selectedShop} 
          isOpen={modalOpen} 
          onClose={handleCloseModal} 
        />
      )}
    </div>
  );
};

export default Favorites;
