import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import SearchSection, { SearchFilters } from '@/components/SearchSection';
import MapSection from '@/components/MapSection';
import CoffeeShopList from '@/components/CoffeeShopList';
import AddCoffeeShopModal from '@/components/AddCoffeeShopModal';
import { CoffeeShop } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import { askSecrets } from '@lib/api';

const Home = () => {
  const { toast } = useToast();
  const [filters, setFilters] = useState<SearchFilters>({
    query: '',
    filter: '',
    showAdvanced: false,
    distance: 5,
    rating: 0,
    coffeeTypes: []
  });
  const [page, setPage] = useState(1);
  const [hasSearched, setHasSearched] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Check for Google Maps API key
  useEffect(() => {
    // We would check for API key here in a production app
    // and prompt the user if missing
  }, []);

  // Search for coffee shops
  const { data, isLoading, error, refetch } = useQuery<{ shops: CoffeeShop[], hasMore: boolean }>({
    queryKey: ['/api/coffee-shops', filters, page],
    enabled: hasSearched,
  });

  useEffect(() => {
    if (error) {
      toast({
        title: 'Error',
        description: 'Failed to fetch coffee shops. Please try again.',
        variant: 'destructive',
      });
    }
  }, [error, toast]);

  const handleSearch = (newFilters: SearchFilters) => {
    setFilters(newFilters);
    setPage(1);
    setHasSearched(true);
  };

  const handleLoadMore = () => {
    setPage(prevPage => prevPage + 1);
  };

  const coffeeShops = data?.shops || [];
  const hasMore = data?.hasMore || false;

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-[#7C5A43]">Find Your Perfect Brew</h1>
        <Button 
          onClick={() => setIsAddModalOpen(true)}
          className="bg-[#7C5A43] hover:bg-[#6a4c39] text-white flex items-center gap-2"
        >
          <PlusCircle size={18} />
          <span>Add Coffee Shop</span>
        </Button>
      </div>
      
      <SearchSection onSearch={handleSearch} />
      
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
        <MapSection coffeeShops={coffeeShops} />
        <CoffeeShopList 
          coffeeShops={coffeeShops}
          isLoading={isLoading}
          onLoadMore={handleLoadMore}
          hasMore={hasMore}
        />
      </section>

      {/* Add Coffee Shop Modal */}
      <AddCoffeeShopModal 
        isOpen={isAddModalOpen} 
        onClose={() => setIsAddModalOpen(false)} 
      />
    </div>
  );
};

export default Home;
