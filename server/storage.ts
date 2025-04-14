import { 
  users, 
  coffeeShops, 
  reviews, 
  favorites,
  type User, 
  type InsertUser, 
  type CoffeeShop, 
  type InsertCoffeeShop,
  type Review,
  type InsertReview,
  type Favorite,
  type InsertFavorite
} from "@shared/schema";

// Search params type
export interface SearchParams {
  query: string;
  filter: string;
  distance: number;
  rating: number;
  types: string[];
  page: number;
  limit: number;
}

// Storage interface
export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Coffee shop methods
  getCoffeeShopById(id: number): Promise<CoffeeShop | undefined>;
  searchCoffeeShops(params: SearchParams): Promise<{ shops: CoffeeShop[], hasMore: boolean }>;
  
  // Review methods
  getReviewsForShop(shopId: number): Promise<Review[]>;
  addReview(review: InsertReview): Promise<Review>;
  
  // Favorites methods
  getFavoriteCoffeeShops(userId: number): Promise<CoffeeShop[]>;
  addFavorite(userId: number, coffeeShopId: number): Promise<void>;
  removeFavorite(userId: number, coffeeShopId: number): Promise<void>;
  isFavorite(userId: number, coffeeShopId: number): Promise<boolean>;
}

// Mock image URLs for coffee shops
const COFFEE_SHOP_IMAGES = [
  "https://images.unsplash.com/photo-1554118811-1e0d58224f24?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8Y29mZmVlJTIwc2hvcHxlbnwwfHwwfHx8MA%3D%3D&auto=format&fit=crop&w=800&q=60",
  "https://images.unsplash.com/photo-1600093463592-8e36ae95ef56?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NXx8Y29mZmVlJTIwc2hvcHxlbnwwfHwwfHx8MA%3D%3D&auto=format&fit=crop&w=800&q=60",
  "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8OXx8Y29mZmVlJTIwc2hvcHxlbnwwfHwwfHx8MA%3D%3D&auto=format&fit=crop&w=800&q=60",
  "https://images.unsplash.com/photo-1559925393-8be0ec4767c8?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8OHx8Y29mZmVlJTIwc2hvcHxlbnwwfHwwfHx8MA%3D%3D&auto=format&fit=crop&w=800&q=60"
];

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private coffeeShops: Map<number, CoffeeShop>;
  private reviews: Map<number, Review>;
  private favorites: Map<string, Favorite>;
  
  private userCurrentId: number;
  private shopCurrentId: number;
  private reviewCurrentId: number;
  private favoriteCurrentId: number;

  constructor() {
    this.users = new Map();
    this.coffeeShops = new Map();
    this.reviews = new Map();
    this.favorites = new Map();
    
    this.userCurrentId = 1;
    this.shopCurrentId = 1;
    this.reviewCurrentId = 1;
    this.favoriteCurrentId = 1;
    
    // Initialize with sample data
    this.initializeSampleData();
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userCurrentId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }
  
  // Coffee shop methods
  async getCoffeeShopById(id: number): Promise<CoffeeShop | undefined> {
    return this.coffeeShops.get(id);
  }
  
  async searchCoffeeShops(params: SearchParams): Promise<{ shops: CoffeeShop[], hasMore: boolean }> {
    let shops = Array.from(this.coffeeShops.values());
    const { query, filter, distance, rating, types, page, limit } = params;
    
    // Apply filters
    if (query) {
      const lowercaseQuery = query.toLowerCase();
      shops = shops.filter(shop => 
        shop.name.toLowerCase().includes(lowercaseQuery) || 
        shop.address.toLowerCase().includes(lowercaseQuery)
      );
    }
    
    if (filter) {
      switch (filter) {
        case 'open_now':
          shops = shops.filter(shop => shop.isOpen);
          break;
        case 'highest_rated':
          shops = shops.sort((a, b) => b.rating - a.rating);
          break;
        case 'nearest':
          shops = shops.sort((a, b) => a.distance - b.distance);
          break;
        case 'specialty':
          shops = shops.filter(shop => 
            shop.tags.some(tag => tag.toLowerCase().includes('specialty'))
          );
          break;
      }
    }
    
    if (distance > 0) {
      shops = shops.filter(shop => shop.distance <= distance);
    }
    
    if (rating > 0) {
      shops = shops.filter(shop => shop.rating >= rating);
    }
    
    if (types.length > 0) {
      shops = shops.filter(shop => 
        types.some(type => 
          shop.tags.some(tag => tag.toLowerCase().includes(type.toLowerCase()))
        )
      );
    }
    
    // Paginate results
    const startIdx = (page - 1) * limit;
    const endIdx = page * limit;
    const paginatedShops = shops.slice(startIdx, endIdx);
    const hasMore = endIdx < shops.length;
    
    // Enhance shop data with reviews for each shop
    const enhancedShops = await Promise.all(paginatedShops.map(async (shop) => {
      const shopReviews = await this.getReviewsForShop(shop.id);
      const isFavorite = await this.isFavorite(1, shop.id); // Mock user ID = 1
      
      return {
        ...shop,
        reviews: shopReviews,
        isFavorite
      };
    }));
    
    return { shops: enhancedShops, hasMore };
  }
  
  // Review methods
  async getReviewsForShop(shopId: number): Promise<Review[]> {
    return Array.from(this.reviews.values())
      .filter(review => review.coffeeShopId === shopId);
  }
  
  async addReview(insertReview: InsertReview): Promise<Review> {
    const id = this.reviewCurrentId++;
    const now = new Date();
    
    const review: Review = {
      ...insertReview,
      id,
      date: now
    };
    
    this.reviews.set(id, review);
    
    // Update shop rating and review count
    const shop = await this.getCoffeeShopById(insertReview.coffeeShopId);
    if (shop) {
      const shopReviews = await this.getReviewsForShop(shop.id);
      const totalRating = shopReviews.reduce((sum, review) => sum + review.rating, 0);
      const newRating = totalRating / shopReviews.length;
      
      const updatedShop: CoffeeShop = {
        ...shop,
        rating: parseFloat(newRating.toFixed(1)),
        reviewCount: shopReviews.length
      };
      
      this.coffeeShops.set(shop.id, updatedShop);
    }
    
    return review;
  }
  
  // Favorites methods
  async getFavoriteCoffeeShops(userId: number): Promise<CoffeeShop[]> {
    const userFavorites = Array.from(this.favorites.values())
      .filter(favorite => favorite.userId === userId);
    
    const favoriteShops = await Promise.all(
      userFavorites.map(async (favorite) => {
        const shop = await this.getCoffeeShopById(favorite.coffeeShopId);
        if (shop) {
          const shopReviews = await this.getReviewsForShop(shop.id);
          return {
            ...shop,
            reviews: shopReviews,
            isFavorite: true
          };
        }
        return null;
      })
    );
    
    return favoriteShops.filter((shop): shop is CoffeeShop => shop !== null);
  }
  
  async addFavorite(userId: number, coffeeShopId: number): Promise<void> {
    const key = `${userId}-${coffeeShopId}`;
    
    // Check if already a favorite
    if (!this.favorites.has(key)) {
      const id = this.favoriteCurrentId++;
      const favorite: Favorite = {
        id,
        userId,
        coffeeShopId
      };
      
      this.favorites.set(key, favorite);
    }
  }
  
  async removeFavorite(userId: number, coffeeShopId: number): Promise<void> {
    const key = `${userId}-${coffeeShopId}`;
    this.favorites.delete(key);
  }
  
  async isFavorite(userId: number, coffeeShopId: number): Promise<boolean> {
    const key = `${userId}-${coffeeShopId}`;
    return this.favorites.has(key);
  }
  
  // Initialize sample data
  private initializeSampleData(): void {
    // Create a mock user
    const mockUser: InsertUser = {
      username: "user",
      password: "password"
    };
    this.createUser(mockUser);
    
    // Create sample coffee shops
    const sampleShops: InsertCoffeeShop[] = [
      {
        name: "The Daily Grind",
        address: "123 Coffee Street, Brewsville",
        latitude: 40.7128,
        longitude: -74.0060,
        imageUrl: COFFEE_SHOP_IMAGES[0],
        rating: 4.5,
        reviewCount: 128,
        isOpen: true,
        openingTime: "7AM",
        closingTime: "8PM",
        weekdayHours: "7AM - 8PM",
        weekendHours: "8AM - 9PM",
        phone: "(555) 123-4567",
        website: "www.dailygrind.com",
        hasWifi: true,
        description: "The Daily Grind is a specialty coffee shop focusing on ethically sourced beans and expert brewing methods. Our cozy atmosphere makes it perfect for both quick coffee runs and longer work sessions. We offer a variety of pastries and light meals to complement your coffee experience.",
        tags: ["Specialty Coffee", "Pastries", "Vegan Options"],
        popularItems: ["Signature Latte", "Pour Over", "Cold Brew", "Vegan Muffin"],
      },
      {
        name: "Brew Haven",
        address: "456 Espresso Avenue, Coffeeburgh",
        latitude: 40.7282,
        longitude: -74.0776,
        imageUrl: COFFEE_SHOP_IMAGES[1],
        rating: 5.0,
        reviewCount: 210,
        isOpen: true,
        openingTime: "6AM",
        closingTime: "9PM",
        weekdayHours: "6AM - 9PM",
        weekendHours: "7AM - 10PM",
        phone: "(555) 987-6543",
        website: "www.brewhaven.com",
        hasWifi: true,
        description: "Brew Haven is an artisanal coffee shop that prides itself on serving some of the best coffee in town. Our beans are carefully selected from sustainable farms around the world and roasted in-house. Enjoy a relaxing atmosphere with outdoor seating perfect for brunch with friends.",
        tags: ["Artisanal Coffee", "Brunch", "Outdoor Seating"],
        popularItems: ["House Blend", "Avocado Toast", "Maple Latte", "Cold Brew"],
      },
      {
        name: "Urban Beans",
        address: "789 Latte Lane, Bean City",
        latitude: 40.7053,
        longitude: -74.0088,
        imageUrl: COFFEE_SHOP_IMAGES[2],
        rating: 4.0,
        reviewCount: 95,
        isOpen: false,
        openingTime: "7AM",
        closingTime: "7PM",
        weekdayHours: "7AM - 7PM",
        weekendHours: "8AM - 6PM",
        phone: "(555) 456-7890",
        website: "www.urbanbeans.com",
        hasWifi: true,
        description: "Urban Beans is a modern coffee shop with an industrial vibe. We specialize in pour over and cold brew methods, and offer ample workspaces for remote workers and students. Our minimalist design and carefully crafted coffee make us a favorite among locals.",
        tags: ["Pour Over", "Cold Brew", "Workspaces"],
        popularItems: ["Cold Brew", "Nitro Coffee", "Scones", "Breakfast Sandwich"],
      },
      {
        name: "Roast & Relax",
        address: "321 Mocha Drive, Beantown",
        latitude: 40.7223,
        longitude: -74.0021,
        imageUrl: COFFEE_SHOP_IMAGES[3],
        rating: 3.5,
        reviewCount: 62,
        isOpen: true,
        openingTime: "8AM",
        closingTime: "6PM",
        weekdayHours: "8AM - 6PM",
        weekendHours: "9AM - 5PM",
        phone: "(555) 234-5678",
        website: "www.roastandrelax.com",
        hasWifi: false,
        description: "Roast & Relax offers a cozy, quiet environment where you can enjoy traditional espresso drinks made with care. Our no-laptop policy encourages conversation and relaxation. We're the perfect spot to unwind with a good book or catch up with friends over excellent coffee.",
        tags: ["Traditional Espresso", "Quiet Atmosphere", "No Laptops"],
        popularItems: ["Classic Espresso", "Cappuccino", "Croissants", "Tiramisu"],
      }
    ];
    
    // Add sample shops to storage
    sampleShops.forEach(shopData => {
      const id = this.shopCurrentId++;
      const shop: CoffeeShop = { ...shopData, id, distance: this.getRandomDistance() };
      this.coffeeShops.set(id, shop);
    });
    
    // Add sample reviews
    const sampleReviews: InsertReview[] = [
      {
        coffeeShopId: 1,
        authorName: "Sarah J.",
        rating: 5.0,
        comment: "Amazing coffee and atmosphere! The baristas are friendly and knowledgeable. Their signature latte is not to be missed. Great spot for working remotely as well."
      },
      {
        coffeeShopId: 1,
        authorName: "Mike T.",
        rating: 4.0,
        comment: "Good coffee and nice atmosphere. Gets a bit crowded during peak hours but worth the wait."
      },
      {
        coffeeShopId: 2,
        authorName: "Lisa R.",
        rating: 5.0,
        comment: "Best coffee in town! The outdoor seating area is so peaceful. I come here every weekend for brunch."
      },
      {
        coffeeShopId: 3,
        authorName: "David K.",
        rating: 3.0,
        comment: "Decent coffee but the service can be slow. I like the workspace options though."
      },
      {
        coffeeShopId: 4,
        authorName: "Emma P.",
        rating: 4.0,
        comment: "Love the traditional atmosphere. Perfect place to relax with a book. The cappuccino is excellent!"
      }
    ];
    
    sampleReviews.forEach(reviewData => {
      this.addReview(reviewData);
    });
    
    // Add sample favorites
    this.addFavorite(1, 2); // User 1 favorites Shop 2 (Brew Haven)
  }
  
  private getRandomDistance(): number {
    return parseFloat((Math.random() * 3 + 0.5).toFixed(1));
  }
}

export const storage = new MemStorage();
