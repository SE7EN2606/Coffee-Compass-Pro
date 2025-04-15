import { useEffect, useRef, useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { CoffeeShop } from '@/lib/types';
import { MapPin } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

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

    // For demonstration, we'll use a fallback image map if the API key is not properly configured
    // In a production environment, always use the actual Google Maps API
    const loadMap = async () => {
      try {
        // Fetch the API key from our server
        const response = await fetch('/api/get-maps-key');
        if (!response.ok) {
          // If we can't get the key, use the fallback
          setLoadError("Using fallback map due to API key issues.");
          return;
        }
        
        const data = await response.json();
        const apiKey = data.key;
        
        // For demo purposes, we're allowing the map to work even without a valid key
        // so users can see the app functioning even if they don't have a Google Maps API key
        window.initGoogleMap = () => {
          setScriptLoaded(true);
        };

        const script = document.createElement('script');
        script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places&callback=initGoogleMap`;
        script.async = true;
        script.defer = true;
        script.onerror = () => {
          setLoadError("Failed to load Google Maps. Using fallback map interface.");
        };

        document.head.appendChild(script);
      } catch (error) {
        console.error('Error loading Google Maps:', error);
        setLoadError("Using fallback map interface.");
      }
    };

    loadMap();

    // For demo purposes, simulate map loading even without the API
    setTimeout(() => {
      setScriptLoaded(true);
      setMapLoaded(true);
    }, 1500);

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

  // Set a default location and don't automatically request user location
  useEffect(() => {
    // Default to San Francisco as starting point
    setUserLocation({ lat: 37.7749, lng: -122.4194 });
  }, []);

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

  const { toast } = useToast();

  const handleUseMyLocation = () => {
    if (navigator.geolocation) {
      toast({
        title: "Accessing location",
        description: "Requesting your current location...",
      });
      
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
            
            // Add a marker for user location
            new window.google.maps.Marker({
              position: newLocation,
              map: map,
              title: "Your Location",
              icon: {
                path: window.google.maps.SymbolPath.CIRCLE,
                scale: 10,
                fillColor: "#4285F4",
                fillOpacity: 1,
                strokeColor: "#ffffff",
                strokeWeight: 2,
              }
            });
            
            toast({
              title: "Location Updated",
              description: "Map has been centered on your current location",
            });
          }
        },
        (error) => {
          console.error("Error getting location:", error);
          toast({
            title: "Location Error",
            description: "Could not access your location. Please check browser permissions.",
            variant: "destructive"
          });
        }
      );
    } else {
      toast({
        title: "Location Not Supported",
        description: "Geolocation is not supported by your browser.",
        variant: "destructive"
      });
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

  // Fallback map view if Google Maps fails to load properly
  const renderFallbackMap = () => {
    return (
      <div className="lg:col-span-2 bg-white rounded-lg shadow-md overflow-hidden h-[500px] md:h-[600px]">
        <div className="h-full relative bg-gray-100">
          {/* Simplified map representation */}
          <div className="absolute inset-0 p-4">
            <div className="h-full w-full relative overflow-hidden border-2 border-gray-300 rounded-lg bg-gray-200">
              {/* City grid lines */}
              <div className="absolute inset-0 grid grid-cols-6 grid-rows-6 gap-4 opacity-20">
                {Array(36).fill(0).map((_, i) => (
                  <div key={i} className="border border-gray-400"></div>
                ))}
              </div>
              
              {/* User location indicator */}
              <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2">
                <div className="h-4 w-4 bg-blue-500 rounded-full animate-pulse"></div>
                <div className="absolute inset-0 bg-blue-400 rounded-full animate-ping opacity-75"></div>
              </div>
              
              {/* Coffee shop markers */}
              {coffeeShops.map((shop, index) => (
                <div 
                  key={shop.id}
                  className="absolute w-6 h-6 transform -translate-x-1/2 -translate-y-1/2"
                  style={{ 
                    left: `${30 + (index * 10) + Math.random() * 40}%`, 
                    top: `${30 + (index * 5) + Math.random() * 40}%`
                  }}
                  onClick={() => onSelectShop && onSelectShop(shop)}
                >
                  <div className="flex items-center justify-center w-full h-full bg-[#7C5A43] rounded-full text-white cursor-pointer hover:shadow-lg transition-shadow">
                    <svg 
                      xmlns="http://www.w3.org/2000/svg" 
                      viewBox="0 0 24 24" 
                      fill="currentColor" 
                      className="w-4 h-4"
                    >
                      <path d="M2 21.5V4.5C2 4.1 2.1 3.7 2.4 3.4C2.7 3.1 3.1 3 3.5 3H20.5C20.9 3 21.3 3.1 21.6 3.4C21.9 3.7 22 4.1 22 4.5V13.5C22 13.9 21.9 14.3 21.6 14.6C21.3 14.9 20.9 15 20.5 15H7L2 21.5Z" />
                    </svg>
                  </div>
                  {/* Simple tooltip on hover */}
                  <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-1 w-24 bg-white text-xs px-2 py-1 rounded shadow opacity-0 group-hover:opacity-100 pointer-events-none">
                    {shop.name}
                  </div>
                </div>
              ))}
              
              {/* Roads */}
              <div className="absolute inset-0 flex items-center">
                <div className="w-full h-[6px] bg-gray-400 opacity-20"></div>
              </div>
              <div className="absolute inset-0 flex justify-center">
                <div className="h-full w-[6px] bg-gray-400 opacity-20"></div>
              </div>
              <div className="absolute inset-0 flex items-center rotate-45 origin-center">
                <div className="w-[150%] h-[6px] bg-gray-400 opacity-20"></div>
              </div>
              
              {/* Map labels */}
              <div className="absolute bottom-2 right-2 text-xs text-gray-500">Static Map View</div>
            </div>
          </div>
          
          {/* Use location button */}
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
          
          {/* Map controls */}
          <div className="absolute bottom-4 right-4 flex flex-col space-y-2">
            <Button 
              variant="secondary" 
              size="icon"
              className="w-8 h-8 p-0 bg-white shadow-md text-gray-700 hover:bg-gray-50"
            >
              <span className="text-lg font-bold">+</span>
            </Button>
            <Button 
              variant="secondary" 
              size="icon"
              className="w-8 h-8 p-0 bg-white shadow-md text-gray-700 hover:bg-gray-50"
            >
              <span className="text-lg font-bold">-</span>
            </Button>
          </div>
          
          {/* Empty state message */}
          {coffeeShops.length === 0 && (
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-white p-2 rounded-lg shadow-md z-10 text-center">
              <p className="text-gray-600 text-sm">Search for coffee shops to see them on the map</p>
            </div>
          )}
        </div>
      </div>
    );
  };

  // Check if we should use the real map or fallback
  if (!window.google || !scriptLoaded) {
    return renderFallbackMap();
  }

  // Regular map if Google Maps is available
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
