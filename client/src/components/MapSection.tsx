import { useEffect, useRef, useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { CoffeeShop } from '@/lib/types';
import { MapPin } from 'lucide-react';

interface MapSectionProps {
  coffeeShops: CoffeeShop[];
  onSelectShop?: (shop: CoffeeShop) => void;
}

declare global {
  interface Window {
    initGoogleMap: () => void;
    google: any;
  }
}

const MapSection: React.FC<MapSectionProps> = ({ coffeeShops, onSelectShop }) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [scriptLoaded, setScriptLoaded] = useState(false);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number }>({ lat: 40.7128, lng: -74.0060 });
  const [map, setMap] = useState<any>(null);
  const [markers, setMarkers] = useState<any[]>([]);
  const [loadError, setLoadError] = useState<string | null>(null);

  // Initialize map once script is loaded
  const initializeMap = useCallback(() => {
    if (!mapRef.current || !window.google || mapLoaded) return;

    try {
      const mapOptions = {
        center: userLocation,
        zoom: 13,
        mapTypeControl: false,
        fullscreenControl: false,
        streetViewControl: false,
        styles: [
          {
            featureType: "poi.business",
            elementType: "labels",
            stylers: [{ visibility: "on" }]
          }
        ]
      };

      const googleMap = new window.google.maps.Map(mapRef.current, mapOptions);
      setMap(googleMap);
      setMapLoaded(true);
    } catch (error) {
      console.error("Error initializing map:", error);
      setLoadError("Failed to initialize map. Please reload the page.");
    }
  }, [userLocation, mapLoaded]);

  // Load Google Maps script
  useEffect(() => {
    if (scriptLoaded) return;

    // Use the API key from the environment variable 
    // This will be accessed from the server-side
    const loadMap = async () => {
      try {
        // Fetch the API key from our server
        const response = await fetch('/api/get-maps-key');
        if (!response.ok) {
          throw new Error('Failed to get API key');
        }
        
        const data = await response.json();
        const apiKey = data.key;
        
        if (!apiKey) {
          setLoadError("Google Maps API key is missing. Please check your environment configuration.");
          return;
        }

        window.initGoogleMap = () => {
          setScriptLoaded(true);
        };

        const script = document.createElement('script');
        script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places&callback=initGoogleMap`;
        script.async = true;
        script.defer = true;
        script.onerror = () => {
          setLoadError("Failed to load Google Maps. Please check your internet connection and try again.");
        };

        document.head.appendChild(script);
      } catch (error) {
        console.error('Error loading Google Maps:', error);
        setLoadError("Failed to load Google Maps API key.");
      }
    };

    loadMap();

    return () => {
      window.initGoogleMap = () => {};
    };
  }, []);

  // Initialize map once script is loaded
  useEffect(() => {
    if (scriptLoaded && !mapLoaded) {
      initializeMap();
    }
  }, [scriptLoaded, mapLoaded, initializeMap]);

  // Get user's location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const userPos = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          setUserLocation(userPos);
          
          // Center map on user's location if map is already loaded
          if (map) {
            map.setCenter(userPos);
          }
        },
        (error) => {
          console.warn("Geolocation error:", error.message);
          // Using default NYC location as fallback
        }
      );
    }
  }, [map]);

  // Update markers when coffee shops change
  useEffect(() => {
    if (!map || !coffeeShops.length) return;

    // Clear existing markers
    markers.forEach(marker => marker.setMap(null));
    const newMarkers: any[] = [];

    // Create bounds to fit all markers
    const bounds = new window.google.maps.LatLngBounds();

    // Add user location to bounds
    bounds.extend(userLocation);

    // Create info window for markers
    const infoWindow = new window.google.maps.InfoWindow();

    // Add markers for each coffee shop
    coffeeShops.forEach(shop => {
      if (!shop.latitude || !shop.longitude) return;

      const position = { lat: shop.latitude, lng: shop.longitude };
      const marker = new window.google.maps.Marker({
        position,
        map,
        title: shop.name,
        animation: window.google.maps.Animation.DROP,
        icon: {
          url: 'https://maps.google.com/mapfiles/ms/icons/coffee.png',
          scaledSize: new window.google.maps.Size(32, 32)
        }
      });

      // Create marker click listener
      marker.addListener('click', () => {
        // Set content and open info window
        infoWindow.setContent(`
          <div class="p-2">
            <h3 class="font-bold">${shop.name}</h3>
            <p class="text-sm">${shop.address}</p>
            <p class="text-sm mt-1">Rating: ${shop.rating} ⭐ (${shop.reviewCount} reviews)</p>
            <p class="text-sm">${shop.isOpen ? 'Open Now' : 'Closed'}</p>
          </div>
        `);
        infoWindow.open(map, marker);
        
        // Call the onSelectShop callback if provided
        if (onSelectShop) {
          onSelectShop(shop);
        }
      });

      newMarkers.push(marker);
      bounds.extend(position);
    });

    // Fit the map to the bounds to show all markers
    if (newMarkers.length > 0) {
      map.fitBounds(bounds);
      
      // Don't zoom in too far on small datasets
      const listener = window.google.maps.event.addListener(map, 'idle', () => {
        if (map.getZoom() > 16) map.setZoom(16);
        window.google.maps.event.removeListener(listener);
      });
    }

    setMarkers(newMarkers);
  }, [coffeeShops, map, onSelectShop, userLocation]);

  const handleUseMyLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const newLocation = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          setUserLocation(newLocation);
          
          if (map) {
            map.setCenter(newLocation);
            map.setZoom(14);
          }
        },
        (error) => {
          console.error("Error getting location:", error);
        }
      );
    }
  };

  if (loadError) {
    return (
      <div className="lg:col-span-2 bg-white rounded-lg shadow-md overflow-hidden h-[500px] md:h-[600px] flex items-center justify-center">
        <div className="text-center p-4">
          <p className="text-red-500 mb-2">{loadError}</p>
          <Button 
            onClick={() => window.location.reload()}
            className="mt-4 bg-[#7C5A43] hover:bg-[#6a4c39]"
          >
            Reload
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="lg:col-span-2 bg-white rounded-lg shadow-md overflow-hidden h-[500px] md:h-[600px]">
      <div className="h-full relative">
        <div className="h-full w-full" ref={mapRef}>
          {!scriptLoaded && (
            <div className="absolute inset-0 flex justify-center items-center bg-gray-100">
              <div className="text-center">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#7C5A43] mb-2"></div>
                <p className="text-gray-600">Loading map...</p>
              </div>
            </div>
          )}
        </div>
        
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
        
        {coffeeShops.length === 0 && mapLoaded && (
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-white p-2 rounded-lg shadow-md z-10 text-center">
            <p className="text-gray-600 text-sm">Search for coffee shops to see them on the map</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MapSection;
