export interface CoffeeShop {
  id: number;
  name: string;
  address: string;
  latitude?: number;
  longitude?: number;
  distance: number;
  imageUrl: string;
  rating: number;
  reviewCount: number;
  isOpen: boolean;
  openingTime: string;
  closingTime: string;
  weekdayHours: string;
  weekendHours: string;
  phone?: string;
  website?: string;
  hasWifi: boolean;
  description: string;
  isFavorite: boolean;
  tags: string[];
  popularItems?: string[];
  reviews?: Review[];
}

export interface Review {
  id: number;
  authorName: string;
  rating: number;
  comment: string;
  date: string;
}

export interface SearchFilters {
  query: string;
  filter: string;
  showAdvanced?: boolean;
  distance: number;
  rating: number;
  coffeeTypes: string[];
}
