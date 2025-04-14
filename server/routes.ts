import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { z } from "zod";
import { insertCoffeeShopSchema, insertReviewSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Coffee Shop endpoints
  app.get("/api/coffee-shops/search", async (req: Request, res: Response) => {
    try {
      const query = req.query.query as string || "";
      const filter = req.query.filter as string || "";
      const distance = Number(req.query.distance) || 5;
      const rating = Number(req.query.rating) || 0;
      const types = Array.isArray(req.query.types) 
        ? req.query.types as string[] 
        : req.query.types 
          ? [req.query.types as string] 
          : [];
      const page = Number(req.query.page) || 1;
      const limit = 10;

      const result = await storage.searchCoffeeShops({
        query,
        filter,
        distance,
        rating,
        types,
        page,
        limit,
      });

      res.json(result);
    } catch (error) {
      console.error("Error searching coffee shops:", error);
      res.status(500).json({ message: "Failed to search coffee shops" });
    }
  });

  app.get("/api/coffee-shops/favorites", async (req: Request, res: Response) => {
    try {
      // In a real app, we would get the user ID from the session
      const userId = 1; // Mock user ID
      const favorites = await storage.getFavoriteCoffeeShops(userId);
      res.json(favorites);
    } catch (error) {
      console.error("Error fetching favorites:", error);
      res.status(500).json({ message: "Failed to fetch favorites" });
    }
  });

  app.get("/api/coffee-shops/:id", async (req: Request, res: Response) => {
    try {
      const id = Number(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid ID format" });
      }

      const shop = await storage.getCoffeeShopById(id);
      if (!shop) {
        return res.status(404).json({ message: "Coffee shop not found" });
      }
      
      res.json(shop);
    } catch (error) {
      console.error("Error fetching coffee shop:", error);
      res.status(500).json({ message: "Failed to fetch coffee shop details" });
    }
  });

  app.post("/api/coffee-shops/:id/favorite", async (req: Request, res: Response) => {
    try {
      const shopId = Number(req.params.id);
      if (isNaN(shopId)) {
        return res.status(400).json({ message: "Invalid shop ID" });
      }

      const schema = z.object({
        isFavorite: z.boolean(),
      });

      const { isFavorite } = schema.parse(req.body);
      const userId = 1; // Mock user ID

      if (isFavorite) {
        await storage.addFavorite(userId, shopId);
      } else {
        await storage.removeFavorite(userId, shopId);
      }

      res.status(200).json({ success: true });
    } catch (error) {
      console.error("Error updating favorite:", error);
      res.status(500).json({ message: "Failed to update favorite status" });
    }
  });

  app.post("/api/coffee-shops/:id/reviews", async (req: Request, res: Response) => {
    try {
      const coffeeShopId = Number(req.params.id);
      if (isNaN(coffeeShopId)) {
        return res.status(400).json({ message: "Invalid shop ID" });
      }

      const reviewData = insertReviewSchema.parse({
        ...req.body,
        coffeeShopId,
      });

      const review = await storage.addReview(reviewData);
      res.status(201).json(review);
    } catch (error) {
      console.error("Error adding review:", error);
      res.status(500).json({ message: "Failed to add review" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
