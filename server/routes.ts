import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertUserSchema, insertVendorProfileSchema, insertPredictionSchema, insertGroupBuySchema, insertGroupBuyParticipantSchema, insertRescueItemSchema, insertReviewSchema } from "@shared/schema";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { aiService } from "./ai-service";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

// Middleware to verify JWT token
const authenticateToken = (req: any, res: any, next: any) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
    if (err) {
      return res.status(403).json({ message: 'Invalid token' });
    }
    req.user = user;
    next();
  });
};

// Extended Request interface to include user
declare global {
  namespace Express {
    interface Request {
      user?: {
        userId: string;
        role: string;
      };
    }
  }
}

// Simulate AI prediction with OpenWeatherMap integration
const generateAIPrediction = async (city: string) => {
  // In production, integrate with OpenWeatherMap API
  const weatherApiKey = process.env.OPENWEATHER_API_KEY;
  
  // For now, return simulated predictions based on weather patterns
  const predictions = {
    onions: "3.2kg",
    tomatoes: "2.5kg", 
    paneer: "1.5kg",
    potatoes: "2.8kg",
    garlic: "0.8kg",
    ginger: "0.6kg"
  };

  const weather = {
    temperature: 28 + Math.random() * 10, // 28-38°C
    condition: "sunny",
    humidity: 60 + Math.random() * 30
  };

  return {
    predictions: JSON.stringify(predictions),
    weather: weather.condition,
    temperature: weather.temperature.toString(),
    confidence: "0.92"
  };
};

export async function registerRoutes(app: Express): Promise<Server> {
  
  // Authentication routes
  app.post("/api/auth/register", async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      
      // Check if user already exists
      const existingUser = await storage.getUserByEmail(userData.email);
      if (existingUser) {
        return res.status(400).json({ message: "User already exists" });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(userData.password, 10);
      const user = await storage.createUser({
        ...userData,
        password: hashedPassword
      });

      // Create vendor profile if role is vendor
      if (user.role === "vendor") {
        await storage.createVendorProfile({
          userId: user.id,
          businessName: userData.username + "'s Kitchen"
        });
      }

      // Generate JWT token
      const token = jwt.sign({ userId: user.id, role: user.role }, JWT_SECRET);
      
      res.json({ 
        user: { ...user, password: undefined }, 
        token 
      });
    } catch (error) {
      res.status(400).json({ message: "Invalid input data" });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      const { email, password } = req.body;
      
      const user = await storage.getUserByEmail(email);
      if (!user) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      const token = jwt.sign({ userId: user.id, role: user.role }, JWT_SECRET);
      
      res.json({ 
        user: { ...user, password: undefined }, 
        token 
      });
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // AI Prediction endpoint with OpenAI integration
  app.post("/api/predict", authenticateToken, async (req, res) => {
    try {
      const vendorId = req.user.userId;
      
      // Get user profile to determine vendor type and city
      const profile = await storage.getVendorProfile(vendorId);
      const user = await storage.getUserById(vendorId);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Generate AI-powered predictions
      const aiPrediction = await aiService.generateIngredientPredictions({
        city: user.city,
        vendorType: profile?.vendorType || "street food",
        currentInventory: []
      });

      // Save prediction to storage
      const prediction = await storage.createPrediction({
        vendorId,
        city: user.city,
        predictions: aiPrediction.predictions.map(p => ({
          ingredient: p.ingredient,
          quantity: p.suggestedQuantity,
          confidence: p.confidence,
          reasoning: p.reasoning
        })),
        date: new Date(),
        weather: aiPrediction.weather.description,
        temperature: aiPrediction.weather.temperature,
        confidence: aiPrediction.predictions.reduce((acc, p) => acc + p.confidence, 0) / aiPrediction.predictions.length
      });

      // Update vendor profile - used AI prediction
      await storage.updateVendorProfile(vendorId, { 
        usedAiPrediction: true,
        lastActivityDate: new Date()
      });

      res.json({
        ...prediction,
        predictions: aiPrediction.predictions,
        weather: aiPrediction.weather,
        marketTrends: aiPrediction.marketTrends
      });
    } catch (error) {
      console.error("AI prediction error:", error);
      res.status(500).json({ message: "Failed to generate prediction" });
    }
  });

  app.get("/api/predict/latest", authenticateToken, async (req, res) => {
    try {
      const vendorId = req.user.userId;
      const prediction = await storage.getLatestPrediction(vendorId);
      
      if (prediction) {
        // Return stored prediction with enhanced format
        res.json({
          ...prediction,
          predictions: prediction.predictions || [],
          weather: {
            description: prediction.weather || "Clear skies",
            temperature: prediction.temperature || 28,
            condition: "sunny"
          },
          marketTrends: {
            demand: "medium",
            factors: ["Weather conditions", "Local preferences"]
          }
        });
      } else {
        res.json(null);
      }
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch prediction" });
    }
  });

  // Group Buy endpoints
  app.post("/api/groupbuy", authenticateToken, async (req, res) => {
    try {
      const groupBuyData = insertGroupBuySchema.parse(req.body);
      const organizerId = req.user.userId;

      const groupBuy = await storage.createGroupBuy({
        ...groupBuyData,
        organizerId
      });

      // Update vendor profile - participated in group buy
      await storage.updateVendorProfile(organizerId, { 
        participatedGroupBuy: true,
        lastActivityDate: new Date()
      });

      res.json(groupBuy);
    } catch (error) {
      res.status(400).json({ message: "Invalid group buy data" });
    }
  });

  app.get("/api/groupbuy", async (req, res) => {
    try {
      const { city } = req.query;
      if (!city) {
        return res.status(400).json({ message: "City parameter required" });
      }
      
      const groupBuys = await storage.getGroupBuys(city as string);
      res.json(groupBuys);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch group buys" });
    }
  });

  app.post("/api/groupbuy/:id/join", authenticateToken, async (req, res) => {
    try {
      const { id } = req.params;
      const { quantity } = req.body;
      const vendorId = req.user.userId;

      await storage.joinGroupBuy(id, {
        groupBuyId: id,
        vendorId,
        quantity: quantity.toString()
      });

      // Update vendor profile - participated in group buy
      await storage.updateVendorProfile(vendorId, { 
        participatedGroupBuy: true,
        lastActivityDate: new Date()
      });

      const updatedGroupBuy = await storage.getGroupBuy(id);
      res.json(updatedGroupBuy);
    } catch (error) {
      res.status(400).json({ message: "Failed to join group buy" });
    }
  });

  // Rescue Item endpoints
  app.post("/api/rescue", authenticateToken, async (req, res) => {
    try {
      const rescueData = insertRescueItemSchema.parse(req.body);
      const vendorId = req.user.userId;

      const rescueItem = await storage.createRescueItem({
        ...rescueData,
        vendorId
      });

      // Update vendor profile - posted rescue item
      await storage.updateVendorProfile(vendorId, { 
        postedRescueItem: true,
        lastActivityDate: new Date()
      });

      res.json(rescueItem);
    } catch (error) {
      res.status(400).json({ message: "Invalid rescue item data" });
    }
  });

  app.get("/api/rescue", async (req, res) => {
    try {
      const { city } = req.query;
      if (!city) {
        return res.status(400).json({ message: "City parameter required" });
      }
      
      const rescueItems = await storage.getRescueItems(city as string);
      res.json(rescueItems);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch rescue items" });
    }
  });

  app.post("/api/rescue/:id/claim", authenticateToken, async (req, res) => {
    try {
      const { id } = req.params;
      const buyerId = req.user.userId;

      const claimedItem = await storage.claimRescueItem(id, buyerId);
      if (!claimedItem) {
        return res.status(404).json({ message: "Item not available" });
      }

      res.json(claimedItem);
    } catch (error) {
      res.status(400).json({ message: "Failed to claim item" });
    }
  });

  // Vendor Profile endpoints
  app.get("/api/vendor-profile/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const user = await storage.getUser(id);
      const profile = await storage.getVendorProfile(id);
      const reviews = await storage.getVendorReviews(id);

      if (!user || !profile) {
        return res.status(404).json({ message: "Vendor not found" });
      }

      res.json({
        user: { ...user, password: undefined },
        profile,
        reviews
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch vendor profile" });
    }
  });

  app.get("/api/vendor-profile", authenticateToken, async (req, res) => {
    try {
      const userId = req.user.userId;
      const user = await storage.getUser(userId);
      const profile = await storage.getVendorProfile(userId);
      const reviews = await storage.getVendorReviews(userId);

      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      res.json({
        user: { ...user, password: undefined },
        profile,
        reviews
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch profile" });
    }
  });

  app.put("/api/vendor-profile", authenticateToken, async (req, res) => {
    try {
      const userId = req.user.userId;
      const updates = req.body;

      const updatedProfile = await storage.updateVendorProfile(userId, updates);
      res.json(updatedProfile);
    } catch (error) {
      res.status(400).json({ message: "Failed to update profile" });
    }
  });

  // Review endpoints
  app.post("/api/buyer-review", authenticateToken, async (req, res) => {
    try {
      const reviewData = insertReviewSchema.parse(req.body);
      const buyerId = req.user.userId;

      const review = await storage.createReview({
        ...reviewData,
        buyerId
      });

      res.json(review);
    } catch (error) {
      res.status(400).json({ message: "Invalid review data" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
