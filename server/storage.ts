import { 
  type User, type InsertUser, 
  type VendorProfile, type InsertVendorProfile,
  type Prediction, type InsertPrediction,
  type GroupBuy, type InsertGroupBuy,
  type GroupBuyParticipant, type InsertGroupBuyParticipant,
  type RescueItem, type InsertRescueItem,
  type Review, type InsertReview
} from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // User operations
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Vendor profile operations
  getVendorProfile(userId: string): Promise<VendorProfile | undefined>;
  createVendorProfile(profile: InsertVendorProfile): Promise<VendorProfile>;
  updateVendorProfile(userId: string, updates: Partial<VendorProfile>): Promise<VendorProfile | undefined>;
  
  // Prediction operations
  createPrediction(prediction: InsertPrediction): Promise<Prediction>;
  getLatestPrediction(vendorId: string): Promise<Prediction | undefined>;
  
  // Group buy operations
  createGroupBuy(groupBuy: InsertGroupBuy): Promise<GroupBuy>;
  getGroupBuys(city: string): Promise<GroupBuy[]>;
  getGroupBuy(id: string): Promise<GroupBuy | undefined>;
  joinGroupBuy(groupBuyId: string, participant: InsertGroupBuyParticipant): Promise<void>;
  updateGroupBuy(id: string, updates: Partial<GroupBuy>): Promise<GroupBuy | undefined>;
  getGroupBuyParticipants(groupBuyId: string): Promise<GroupBuyParticipant[]>;
  
  // Rescue item operations
  createRescueItem(item: InsertRescueItem): Promise<RescueItem>;
  getRescueItems(city: string): Promise<RescueItem[]>;
  claimRescueItem(itemId: string, buyerId: string): Promise<RescueItem | undefined>;
  
  // Review operations
  createReview(review: InsertReview): Promise<Review>;
  getVendorReviews(vendorId: string): Promise<Review[]>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User> = new Map();
  private vendorProfiles: Map<string, VendorProfile> = new Map();
  private predictions: Map<string, Prediction> = new Map();
  private groupBuys: Map<string, GroupBuy> = new Map();
  private groupBuyParticipants: Map<string, GroupBuyParticipant> = new Map();
  private rescueItems: Map<string, RescueItem> = new Map();
  private reviews: Map<string, Review> = new Map();

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.email === email);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { 
      ...insertUser,
      role: insertUser.role || "vendor",
      id, 
      profileImage: null,
      rating: "0.0",
      reviewCount: 0,
      createdAt: new Date() 
    };
    this.users.set(id, user);
    return user;
  }

  async getVendorProfile(userId: string): Promise<VendorProfile | undefined> {
    return Array.from(this.vendorProfiles.values()).find(profile => profile.userId === userId);
  }

  async createVendorProfile(insertProfile: InsertVendorProfile): Promise<VendorProfile> {
    const id = randomUUID();
    const profile: VendorProfile = { 
      ...insertProfile, 
      id,
      sourcingMethod: null,
      trustScore: 0,
      hasTrustBadge: false,
      usedAiPrediction: false,
      participatedGroupBuy: false,
      postedRescueItem: false,
      lastActivityDate: new Date()
    };
    this.vendorProfiles.set(id, profile);
    return profile;
  }

  async updateVendorProfile(userId: string, updates: Partial<VendorProfile>): Promise<VendorProfile | undefined> {
    const profile = await this.getVendorProfile(userId);
    if (!profile) return undefined;
    
    const updatedProfile = { ...profile, ...updates };
    this.vendorProfiles.set(profile.id, updatedProfile);
    return updatedProfile;
  }

  async createPrediction(insertPrediction: InsertPrediction): Promise<Prediction> {
    const id = randomUUID();
    const prediction: Prediction = { 
      ...insertPrediction, 
      id, 
      date: new Date(),
      weather: null,
      temperature: null,
      confidence: null
    };
    this.predictions.set(id, prediction);
    return prediction;
  }

  async getLatestPrediction(vendorId: string): Promise<Prediction | undefined> {
    const vendorPredictions = Array.from(this.predictions.values())
      .filter(p => p.vendorId === vendorId)
      .sort((a, b) => new Date(b.date || new Date()).getTime() - new Date(a.date || new Date()).getTime());
    return vendorPredictions[0];
  }

  async createGroupBuy(insertGroupBuy: InsertGroupBuy): Promise<GroupBuy> {
    const id = randomUUID();
    const groupBuy: GroupBuy = { 
      ...insertGroupBuy, 
      id, 
      currentQuantity: "0",
      status: "active",
      participantCount: 1,
      createdAt: new Date()
    };
    this.groupBuys.set(id, groupBuy);
    return groupBuy;
  }

  async getGroupBuys(city: string): Promise<GroupBuy[]> {
    return Array.from(this.groupBuys.values())
      .filter(gb => gb.city === city && gb.status === "active")
      .sort((a, b) => new Date(b.createdAt || new Date()).getTime() - new Date(a.createdAt || new Date()).getTime());
  }

  async getGroupBuy(id: string): Promise<GroupBuy | undefined> {
    return this.groupBuys.get(id);
  }

  async joinGroupBuy(groupBuyId: string, participant: InsertGroupBuyParticipant): Promise<void> {
    const id = randomUUID();
    const newParticipant: GroupBuyParticipant = { 
      ...participant, 
      id, 
      joinedAt: new Date() 
    };
    this.groupBuyParticipants.set(id, newParticipant);

    // Update group buy totals
    const groupBuy = this.groupBuys.get(groupBuyId);
    if (groupBuy) {
      const currentQuantity = parseFloat(groupBuy.currentQuantity || "0") + parseFloat(participant.quantity);
      const participantCount = (groupBuy.participantCount || 0) + 1;
      this.groupBuys.set(groupBuyId, { 
        ...groupBuy, 
        currentQuantity: currentQuantity.toString(),
        participantCount 
      });
    }
  }

  async updateGroupBuy(id: string, updates: Partial<GroupBuy>): Promise<GroupBuy | undefined> {
    const groupBuy = this.groupBuys.get(id);
    if (!groupBuy) return undefined;
    
    const updatedGroupBuy = { ...groupBuy, ...updates };
    this.groupBuys.set(id, updatedGroupBuy);
    return updatedGroupBuy;
  }

  async getGroupBuyParticipants(groupBuyId: string): Promise<GroupBuyParticipant[]> {
    return Array.from(this.groupBuyParticipants.values())
      .filter(p => p.groupBuyId === groupBuyId);
  }

  async createRescueItem(insertItem: InsertRescueItem): Promise<RescueItem> {
    const id = randomUUID();
    const item: RescueItem = { 
      ...insertItem,
      isHot: insertItem.isHot || null,
      id, 
      status: "available",
      claimedBy: null,
      createdAt: new Date()
    };
    this.rescueItems.set(id, item);
    return item;
  }

  async getRescueItems(city: string): Promise<RescueItem[]> {
    return Array.from(this.rescueItems.values())
      .filter(item => item.city === city && item.status === "available")
      .sort((a, b) => new Date(b.createdAt || new Date()).getTime() - new Date(a.createdAt || new Date()).getTime());
  }

  async claimRescueItem(itemId: string, buyerId: string): Promise<RescueItem | undefined> {
    const item = this.rescueItems.get(itemId);
    if (!item || item.status !== "available") return undefined;
    
    const updatedItem = { ...item, status: "claimed" as const, claimedBy: buyerId };
    this.rescueItems.set(itemId, updatedItem);
    return updatedItem;
  }

  async createReview(insertReview: InsertReview): Promise<Review> {
    const id = randomUUID();
    const review: Review = { 
      ...insertReview,
      comment: insertReview.comment || null,
      rescueItemId: insertReview.rescueItemId || null,
      id, 
      createdAt: new Date()
    };
    this.reviews.set(id, review);
    return review;
  }

  async getVendorReviews(vendorId: string): Promise<Review[]> {
    return Array.from(this.reviews.values())
      .filter(review => review.vendorId === vendorId)
      .sort((a, b) => new Date(b.createdAt || new Date()).getTime() - new Date(a.createdAt || new Date()).getTime());
  }
}

export const storage = new MemStorage();
