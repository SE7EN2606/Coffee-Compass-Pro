import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { CoffeeShop } from '@/lib/types';
import { Heart, Star, MapPin } from 'lucide-react';
import { queryClient } from '@/lib/queryClient';
import { apiRequest } from '@/lib/queryClient';

interface CoffeeShopCardProps {
  shop: CoffeeShop;
  onViewDetails: () => void;
}

const CoffeeShopCard: React.FC<CoffeeShopCardProps> = ({ shop, onViewDetails }) => {
  const [isFavorite, setIsFavorite] = useState(shop.isFavorite);
  const [isUpdating, setIsUpdating] = useState(false);

  const toggleFavorite = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isUpdating) return;

    setIsUpdating(true);
    try {
      await apiRequest('POST', `/api/coffee-shops/${shop.id}/favorite`, { isFavorite: !isFavorite });
      setIsFavorite(!isFavorite);
      queryClient.invalidateQueries({ queryKey: ['/api/coffee-shops/favorites'] });
    } catch (error) {
      console.error('Failed to update favorite status:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="mb-4 bg-white rounded-lg border border-gray-200 card-shadow">
      <div className="flex flex-col sm:flex-row">
        <div className="sm:w-1/3 h-32 sm:h-auto">
          <img 
            src={shop.imageUrl} 
            alt={`${shop.name} coffee shop`} 
            className="w-full h-full object-cover rounded-t-lg sm:rounded-l-lg sm:rounded-t-none"
          />
        </div>
        <div className="p-4 flex-grow">
          <div className="flex justify-between">
            <h3 className="font-medium text-lg text-[#3C2A1E]">{shop.name}</h3>
            <Button
              variant="ghost"
              size="sm"
              className={`p-0 h-auto ${isFavorite ? 'text-[#B85042]' : 'text-gray-400 hover:text-[#B85042]'}`}
              onClick={toggleFavorite}
              disabled={isUpdating}
            >
              <Heart className={isFavorite ? 'fill-current' : ''} size={18} />
            </Button>
          </div>
          <div className="flex items-center mt-1 mb-2">
            <div className="flex">
              {Array.from({ length: 5 }).map((_, i) => {
                const showHalfStar = i + 0.5 === shop.rating;
                const showFullStar = i < shop.rating;
                
                return (
                  <span key={i} className="text-yellow-400">
                    {showFullStar && <Star className="h-4 w-4 fill-current" />}
                    {showHalfStar && (
                      <span className="relative">
                        <Star className="h-4 w-4 text-gray-300 fill-current" />
                        <Star className="h-4 w-4 text-yellow-400 fill-current absolute inset-0" style={{ clipPath: 'inset(0 50% 0 0)' }} />
                      </span>
                    )}
                    {!showFullStar && !showHalfStar && <Star className="h-4 w-4 text-gray-300" />}
                  </span>
                );
              })}
            </div>
            <span className="ml-1 text-sm text-gray-600">{shop.rating} ({shop.reviewCount})</span>
            <span className="mx-2 text-gray-300">|</span>
            <span className={`text-sm ${shop.isOpen ? 'text-green-600' : 'text-gray-600'}`}>
              {shop.isOpen ? 'Open' : 'Closed'}
            </span>
            <span className="text-sm text-gray-600 ml-1">
              {shop.isOpen ? `• Closes ${shop.closingTime}` : `• Opens ${shop.openingTime}`}
            </span>
          </div>
          <p className="text-sm text-gray-600 mb-3">{shop.tags.join(', ')}</p>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-500">
              <MapPin className="inline mr-1 h-3 w-3" />
              {shop.distance} km away
            </span>
            <Button 
              variant="ghost"
              size="sm"
              className="text-[#7C5A43] hover:text-[#B85042] text-sm font-medium p-0"
              onClick={onViewDetails}
            >
              View Details
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CoffeeShopCard;
