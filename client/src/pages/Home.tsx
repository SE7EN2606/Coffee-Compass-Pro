import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import SearchSection, { SearchFilters } from '@/components/SearchSection';
import MapSection from '@/components/MapSection';
import CoffeeShopList from '@/components/CoffeeShopList';
import { CoffeeShop } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';

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
      <SearchSection onSearch={handleSearch} />
      
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <MapSection coffeeShops={coffeeShops} />
        <CoffeeShopList 
          coffeeShops={coffeeShops}
          isLoading={isLoading}
          onLoadMore={handleLoadMore}
          hasMore={hasMore}
        />
      </section>
    </div>
  );
};

export default Home;
