import { useState } from 'react';
import CoffeeShopCard from './CoffeeShopCard';
import { Button } from '@/components/ui/button';
import { CoffeeShop } from '@/lib/types';
import ShopDetailsModal from './ShopDetailsModal';

interface CoffeeShopListProps {
  coffeeShops: CoffeeShop[];
  isLoading: boolean;
  onLoadMore: () => void;
  hasMore: boolean;
}

const CoffeeShopList: React.FC<CoffeeShopListProps> = ({ 
  coffeeShops, 
  isLoading, 
  onLoadMore, 
  hasMore 
}) => {
  const [selectedShop, setSelectedShop] = useState<CoffeeShop | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const handleViewDetails = (shop: CoffeeShop) => {
    setSelectedShop(shop);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-4 h-[500px] md:h-[600px] overflow-hidden flex flex-col">
      <div className="flex justify-between items-center mb-4">
        <h2 className="font-['Playfair_Display'] text-lg font-semibold text-[#3C2A1E]">Coffee Shops</h2>
        <div className="text-sm text-gray-600">
          {coffeeShops.length > 0 && (
            <span>{coffeeShops.length} result{coffeeShops.length !== 1 ? 's' : ''}</span>
          )}
        </div>
      </div>
      
      <div className="flex-grow overflow-y-auto pr-2 custom-scrollbar">
        {isLoading ? (
          <div className="flex justify-center items-center h-full">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#7C5A43]"></div>
          </div>
        ) : coffeeShops.length > 0 ? (
          coffeeShops.map((shop) => (
            <CoffeeShopCard 
              key={shop.id} 
              shop={shop} 
              onViewDetails={() => handleViewDetails(shop)} 
            />
          ))
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              width="48" 
              height="48" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="1" 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              className="text-gray-400 mb-3"
            >
              <path d="M17 8h1a4 4 0 1 1 0 8h-1"></path>
              <path d="M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4Z"></path>
              <line x1="6" x2="6" y1="2" y2="4"></line>
              <line x1="10" x2="10" y1="2" y2="4"></line>
              <line x1="14" x2="14" y1="2" y2="4"></line>
            </svg>
            <p className="text-gray-500 mb-2">No coffee shops found</p>
            <p className="text-sm text-gray-400">Try adjusting your search filters</p>
          </div>
        )}
      </div>
      
      {coffeeShops.length > 0 && hasMore && (
        <div className="mt-4 text-center">
          <Button 
            className="w-full py-2 bg-[#E8DCCA] hover:bg-[#F5F1EA] text-[#7C5A43] font-medium"
            onClick={onLoadMore}
            disabled={isLoading}
          >
            {isLoading ? (
              <span className="flex items-center justify-center">
                <span className="animate-spin mr-2 h-4 w-4 border-b-2 rounded-full border-current"></span>
                Loading...
              </span>
            ) : 'Load More'}
          </Button>
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

export default CoffeeShopList;
