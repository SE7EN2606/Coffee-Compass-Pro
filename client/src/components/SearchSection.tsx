import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Separator } from '@/components/ui/separator';
import { Search, ChevronDown, ChevronUp, Star } from 'lucide-react';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';

export type SearchFilters = {
  query: string;
  filter: string;
  showAdvanced: boolean;
  distance: number;
  rating: number;
  coffeeTypes: string[];
};

interface SearchSectionProps {
  onSearch: (filters: SearchFilters) => void;
}

const SearchSection: React.FC<SearchSectionProps> = ({ onSearch }) => {
  const [filters, setFilters] = useState<SearchFilters>({
    query: '',
    filter: '',
    showAdvanced: false,
    distance: 5,
    rating: 0,
    coffeeTypes: []
  });

  const handleSearch = () => {
    onSearch(filters);
  };

  const toggleAdvancedFilters = () => {
    setFilters(prev => ({ ...prev, showAdvanced: !prev.showAdvanced }));
  };

  const handleCoffeeTypeToggle = (value: string) => {
    setFilters(prev => {
      const newTypes = prev.coffeeTypes.includes(value)
        ? prev.coffeeTypes.filter(type => type !== value)
        : [...prev.coffeeTypes, value];
      return { ...prev, coffeeTypes: newTypes };
    });
  };

  return (
    <section className="mb-8">
      <div className="bg-white rounded-lg shadow-md p-4">
        <h2 className="font-['Playfair_Display'] text-xl font-semibold text-[#3C2A1E] mb-4">Find Your Perfect Brew</h2>
        
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-grow relative">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <Search className="h-4 w-4 text-gray-400" />
            </div>
            <Input 
              type="text" 
              placeholder="Search by location or coffee shop name"
              className="pl-10"
              value={filters.query}
              onChange={(e) => setFilters(prev => ({ ...prev, query: e.target.value }))}
            />
          </div>
          
          <div className="md:w-1/4">
            <Select
              value={filters.filter}
              onValueChange={(value) => setFilters(prev => ({ ...prev, filter: value }))}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Filter options" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="open_now">Open Now</SelectItem>
                <SelectItem value="highest_rated">Highest Rated</SelectItem>
                <SelectItem value="nearest">Nearest</SelectItem>
                <SelectItem value="specialty">Specialty Coffee</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <Button 
            onClick={handleSearch}
            className="bg-[#B85042] hover:bg-red-700"
          >
            Search
          </Button>
        </div>
        
        <div className="mt-4">
          <Button 
            variant="ghost" 
            className="flex items-center text-[#7C5A43] hover:text-[#3C2A1E] font-medium text-sm p-0"
            onClick={toggleAdvancedFilters}
          >
            <span>Advanced Filters</span>
            {filters.showAdvanced ? <ChevronUp className="ml-1 h-4 w-4" /> : <ChevronDown className="ml-1 h-4 w-4" />}
          </Button>
          
          {filters.showAdvanced && (
            <div className="mt-3 p-3 bg-[#F5F1EA] rounded-lg">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Distance Range */}
                <div>
                  <label htmlFor="distance-range" className="block mb-2 text-sm font-medium text-gray-700">Distance (km)</label>
                  <Slider
                    id="distance-range"
                    min={1}
                    max={20}
                    step={1}
                    value={[filters.distance]}
                    onValueChange={(value) => setFilters(prev => ({ ...prev, distance: value[0] }))}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>1km</span>
                    <span>{filters.distance}km</span>
                    <span>20km</span>
                  </div>
                </div>
                
                {/* Rating Filter */}
                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-700">Minimum Rating</label>
                  <div className="flex items-center" id="rating-filter">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Button
                        key={star}
                        variant="ghost"
                        size="sm"
                        className={`p-1 text-xl ${star <= filters.rating ? 'text-yellow-400' : 'text-gray-300'}`}
                        onClick={() => setFilters(prev => ({ ...prev, rating: star }))}
                      >
                        <Star className="fill-current" />
                      </Button>
                    ))}
                  </div>
                </div>
                
                {/* Coffee Type Filter */}
                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-700">Coffee Types</label>
                  <div className="flex flex-wrap gap-2">
                    {['Espresso', 'Cold Brew', 'Pour Over', 'Specialty'].map((type) => (
                      <Button
                        key={type}
                        variant="outline"
                        size="sm"
                        className={`px-3 py-1 rounded-full text-xs font-medium border ${
                          filters.coffeeTypes.includes(type)
                            ? 'bg-[#7C5A43] text-white'
                            : 'border-[#7C5A43] text-[#7C5A43] hover:bg-[#7C5A43] hover:text-white'
                        }`}
                        onClick={() => handleCoffeeTypeToggle(type)}
                      >
                        {type}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default SearchSection;
