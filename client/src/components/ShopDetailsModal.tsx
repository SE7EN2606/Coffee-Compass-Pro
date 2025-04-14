import { useState } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { CoffeeShop, Review } from '@/lib/types';
import { X, Heart, Star, Phone, Globe, Wifi, Navigation, User } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { apiRequest } from '@/lib/queryClient';
import { queryClient } from '@/lib/queryClient';

interface ShopDetailsModalProps {
  shop: CoffeeShop;
  isOpen: boolean;
  onClose: () => void;
}

const ShopDetailsModal: React.FC<ShopDetailsModalProps> = ({ shop, isOpen, onClose }) => {
  const [isFavorite, setIsFavorite] = useState(shop.isFavorite);
  const [isUpdating, setIsUpdating] = useState(false);

  const toggleFavorite = async () => {
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

  const getDirections = () => {
    if (shop.latitude && shop.longitude) {
      window.open(`https://www.google.com/maps/dir/?api=1&destination=${shop.latitude},${shop.longitude}`, '_blank');
    }
  };

  const callCoffeeShop = () => {
    if (shop.phone) {
      window.open(`tel:${shop.phone}`, '_blank');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="p-0 overflow-hidden max-w-2xl">
        <div className="relative h-60">
          <img 
            src={shop.imageUrl} 
            alt={`${shop.name} coffee shop`}
            className="w-full h-full object-cover" 
          />
          <Button 
            variant="secondary"
            size="icon"
            className="absolute top-4 right-4 bg-white rounded-full p-2 shadow-md text-gray-600 hover:text-gray-900"
            onClick={onClose}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        
        <div className="p-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="font-['Playfair_Display'] text-2xl font-bold text-[#3C2A1E]">{shop.name}</h3>
              <div className="flex items-center mt-1">
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
                <span className="ml-1 text-sm text-gray-600">{shop.rating} ({shop.reviewCount} reviews)</span>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className={`text-2xl ${isFavorite ? 'text-[#B85042]' : 'text-gray-400 hover:text-[#B85042]'}`}
              onClick={toggleFavorite}
              disabled={isUpdating}
            >
              <Heart className={isFavorite ? 'fill-current' : ''} size={24} />
            </Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2">Location & Hours</h4>
              <p className="text-sm text-gray-600">{shop.address}</p>
              <p className="text-sm text-gray-600 mb-2">{shop.distance} km from your location</p>
              <div className="space-y-1">
                <p className="text-sm"><span className="font-medium">Mon-Fri:</span> {shop.weekdayHours}</p>
                <p className="text-sm"><span className="font-medium">Sat-Sun:</span> {shop.weekendHours}</p>
                <p className={`text-sm font-medium mt-2 ${shop.isOpen ? 'text-green-600' : 'text-gray-600'}`}>
                  {shop.isOpen ? 'Open Now' : 'Closed'}
                </p>
              </div>
            </div>
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2">Contact & Details</h4>
              <p className="text-sm text-gray-600 flex items-center">
                <Phone className="h-4 w-4 mr-2" />
                {shop.phone}
              </p>
              <p className="text-sm text-gray-600 flex items-center">
                <Globe className="h-4 w-4 mr-2" />
                {shop.website}
              </p>
              {shop.hasWifi && (
                <p className="text-sm text-gray-600 flex items-center">
                  <Wifi className="h-4 w-4 mr-2" />
                  Free WiFi
                </p>
              )}
              <div className="mt-2 flex flex-wrap">
                {shop.tags.map((tag, index) => (
                  <Badge key={index} variant="outline" className="mr-1 mb-1 bg-[#F5F1EA] text-[#7C5A43] border-[#E8DCCA]">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
          
          <div className="mb-6">
            <h4 className="text-sm font-medium text-gray-700 mb-2">About</h4>
            <p className="text-sm text-gray-600">{shop.description}</p>
          </div>
          
          {shop.popularItems && shop.popularItems.length > 0 && (
            <div className="mb-6">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Popular Menu Items</h4>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {shop.popularItems.map((item, index) => (
                  <div key={index} className="text-center">
                    <div className="bg-[#F5F1EA] rounded-lg p-2 mb-1 flex justify-center">
                      <svg 
                        xmlns="http://www.w3.org/2000/svg" 
                        viewBox="0 0 24 24" 
                        fill="none" 
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="h-6 w-6 text-[#7C5A43]"
                      >
                        <path d="M17 8h1a4 4 0 1 1 0 8h-1"></path>
                        <path d="M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4Z"></path>
                      </svg>
                    </div>
                    <p className="text-xs font-medium">{item}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {shop.reviews && shop.reviews.length > 0 && (
            <div className="mb-6">
              <div className="flex justify-between items-center mb-2">
                <h4 className="text-sm font-medium text-gray-700">Reviews</h4>
                <a href="#" className="text-[#7C5A43] hover:text-[#B85042] text-sm">
                  See all {shop.reviewCount} reviews
                </a>
              </div>
              
              {shop.reviews.slice(0, 1).map((review, index) => (
                <div key={index} className="mb-3 pb-3 border-b border-gray-200">
                  <div className="flex justify-between items-center mb-1">
                    <div className="flex items-center">
                      <div className="w-8 h-8 rounded-full bg-gray-300 mr-2 flex items-center justify-center">
                        <User className="h-4 w-4 text-gray-500" />
                      </div>
                      <span className="font-medium text-sm">{review.authorName}</span>
                    </div>
                    <div className="flex">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star 
                          key={i}
                          className={`h-3 w-3 ${i < review.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
                        />
                      ))}
                    </div>
                  </div>
                  <p className="text-xs text-gray-600">{review.comment}</p>
                </div>
              ))}
            </div>
          )}
          
          <div className="flex space-x-3">
            <Button 
              className="flex-1 bg-[#7C5A43] hover:bg-[#3C2A1E] text-white"
              onClick={getDirections}
            >
              <Navigation className="mr-2 h-4 w-4" /> Get Directions
            </Button>
            <Button 
              variant="outline"
              className="flex-1 bg-[#E8DCCA] hover:bg-[#F5F1EA] text-[#7C5A43] border-[#E8DCCA]"
              onClick={callCoffeeShop}
              disabled={!shop.phone}
            >
              <Phone className="mr-2 h-4 w-4" /> Call
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ShopDetailsModal;
