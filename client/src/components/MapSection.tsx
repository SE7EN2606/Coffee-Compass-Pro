import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { CoffeeShop } from '@/lib/types';
import { MapPin } from 'lucide-react';

interface MapSectionProps {
  coffeeShops: CoffeeShop[];
  onSelectShop?: (shop: CoffeeShop) => void;
}

const MapSection: React.FC<MapSectionProps> = ({ coffeeShops, onSelectShop }) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [markers, setMarkers] = useState<google.maps.Marker[]>([]);

  // Load Google Maps
  useEffect(() => {
    // Since we don't have access to Google Maps API key, we'll simulate the map loading
    const loadMap = () => {
      if (mapRef.current && !mapLoaded) {
        // In a real implementation, we would initialize Google Maps here
        setMapLoaded(true);
      }
    };

    loadMap();
    // Try to get user's location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        () => {
          // Default to a fallback location if user denies permission
          setUserLocation({ lat: 40.7128, lng: -74.0060 }); // NYC default
        }
      );
    }
  }, [mapLoaded]);

  // Update markers when coffee shops change
  useEffect(() => {
    // This would update markers on the map in a real implementation
  }, [coffeeShops, map]);

  const handleUseMyLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const newLocation = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          setUserLocation(newLocation);
        },
        (error) => {
          console.error("Error getting location:", error);
        }
      );
    }
  };

  return (
    <div className="lg:col-span-2 bg-white rounded-lg shadow-md overflow-hidden h-[500px] md:h-[600px]">
      <div className="h-full relative">
        <div className="map-container" ref={mapRef}>
          <div className="absolute inset-0 flex justify-center items-center bg-gray-200">
            {!mapLoaded ? (
              <p className="text-gray-500">Loading map...</p>
            ) : coffeeShops.length > 0 ? (
              <div className="flex items-center justify-center">
                <p className="text-gray-600">Map would display {coffeeShops.length} coffee shops here</p>
              </div>
            ) : (
              <p className="text-gray-500">Search for coffee shops to see them on the map</p>
            )}
            
            <div className="absolute top-4 right-4 bg-white p-2 rounded-lg shadow-md z-10">
              <Button 
                variant="ghost" 
                size="sm" 
                className="flex items-center text-[#7C5A43] font-medium text-sm"
                onClick={handleUseMyLocation}
              >
                <MapPin className="mr-1 h-4 w-4" />
                <span>Use my location</span>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MapSection;
