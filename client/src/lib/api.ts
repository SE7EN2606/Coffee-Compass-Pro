import { apiRequest } from './queryClient';
import { CoffeeShop, SearchFilters } from './types';

export async function searchCoffeeShops(
  filters: SearchFilters,
  page: number = 1
): Promise<{ shops: CoffeeShop[], hasMore: boolean }> {
  const queryParams = new URLSearchParams();
  
  if (filters.query) queryParams.append('query', filters.query);
  if (filters.filter) queryParams.append('filter', filters.filter);
  if (filters.distance) queryParams.append('distance', filters.distance.toString());
  if (filters.rating) queryParams.append('rating', filters.rating.toString());
  if (filters.coffeeTypes.length) {
    filters.coffeeTypes.forEach(type => queryParams.append('types', type));
  }
  queryParams.append('page', page.toString());

  const response = await apiRequest(
    'GET',
    `/api/coffee-shops/search?${queryParams.toString()}`,
  );
  return response.json();
}

export async function getFavoriteCoffeeShops(): Promise<CoffeeShop[]> {
  const response = await apiRequest('GET', '/api/coffee-shops/favorites');
  return response.json();
}

export async function toggleFavorite(
  shopId: number,
  isFavorite: boolean
): Promise<void> {
  await apiRequest('POST', `/api/coffee-shops/${shopId}/favorite`, { isFavorite });
}

export async function getCoffeeShopDetails(shopId: number): Promise<CoffeeShop> {
  const response = await apiRequest('GET', `/api/coffee-shops/${shopId}`);
  return response.json();
}
