import { db } from './db';
import { beats, users, purchases, storeProducts } from '@shared/schema';
import { eq, desc, and } from 'drizzle-orm';
import type { IStorage } from './storage';
import type { Beat, InsertBeat, User, InsertUser, Purchase, InsertPurchase, StoreProduct, InsertStoreProduct } from '@shared/schema';

/**
 * Database-backed storage implementation
 * 
 * TO USE THIS:
 * 1. Sign up for Neon: https://neon.tech/ (free tier available)
 * 2. Create a .env.local file with: DATABASE_URL="your-connection-string"
 * 3. Run: npm run db:push
 * 4. Replace 'storage' import from './storage' to './dbStorage' in API routes
 * 
 * See SERVER_SETUP.md for detailed instructions
 */
export class DatabaseStorage implements IStorage {
  // Beat operations
  async getBeat(id: number): Promise<Beat | undefined> {
    const result = await db.select().from(beats).where(eq(beats.id, id)).limit(1);
    return result[0];
  }

  async getAllBeats(): Promise<Beat[]> {
    return await db.select().from(beats).orderBy(desc(beats.createdAt));
  }

  async getFeaturedBeats(): Promise<Beat[]> {
    return await db.select().from(beats).where(eq(beats.isFeatured, true)).orderBy(desc(beats.createdAt));
  }

  async searchBeats(query: string, filters: { genre?: string; key?: string; bpmRange?: string; featured?: boolean }): Promise<Beat[]> {
    // Start with base query
    let results: Beat[];
    
    // Apply featured filter if specified
    if (filters.featured) {
      results = await db.select().from(beats).where(eq(beats.isFeatured, true)).orderBy(desc(beats.createdAt));
    } else {
      results = await db.select().from(beats).orderBy(desc(beats.createdAt));
    }
    
    // Filter by search query in memory (since Drizzle doesn't support complex tag filtering)
    if (query) {
      results = results.filter(beat => 
        beat.title.toLowerCase().includes(query.toLowerCase()) ||
        beat.producer.toLowerCase().includes(query.toLowerCase()) ||
        beat.tags.some(tag => tag.toLowerCase().includes(query.toLowerCase()))
      );
    }
    
    // Apply additional filters in memory
    if (filters.genre) {
      results = results.filter(beat => 
        beat.tags.some(tag => tag.toLowerCase().includes(filters.genre!.toLowerCase()))
      );
    }
    
    if (filters.key) {
      results = results.filter(beat => beat.key.toLowerCase() === filters.key!.toLowerCase());
    }
    
    if (filters.bpmRange) {
      const [min, max] = filters.bpmRange.split('-').map(Number);
      results = results.filter(beat => beat.bpm >= min && beat.bpm <= max);
    }
    
    return results;
  }

  async createBeat(beatData: InsertBeat): Promise<Beat> {
    const result = await db.insert(beats).values(beatData).returning();
    return result[0];
  }

  async updateBeat(id: number, beatData: Partial<InsertBeat>): Promise<Beat | undefined> {
    const result = await db.update(beats).set(beatData).where(eq(beats.id, id)).returning();
    return result[0];
  }

  async deleteBeat(id: number): Promise<boolean> {
    const result = await db.delete(beats).where(eq(beats.id, id)).returning();
    return result.length > 0;
  }

  // Purchase operations
  async createPurchase(purchaseData: InsertPurchase): Promise<Purchase> {
    const result = await db.insert(purchases).values(purchaseData).returning();
    return result[0];
  }

  async getPurchasesByBeat(beatId: number): Promise<Purchase[]> {
    return await db.select().from(purchases).where(eq(purchases.beatId, beatId));
  }

  // User operations
  async getUserByEmail(email: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.email, email)).limit(1);
    return result[0];
  }

  async createUser(userData: InsertUser): Promise<User> {
    const result = await db.insert(users).values(userData).returning();
    return result[0];
  }

  async getUserById(id: number): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
    return result[0];
  }

  async getAllUsers(): Promise<User[]> {
    return await db.select().from(users).orderBy(desc(users.createdAt));
  }

  async deleteUser(id: number): Promise<boolean> {
    const result = await db.delete(users).where(eq(users.id, id)).returning();
    return result.length > 0;
  }

  async getAllArtists(): Promise<User[]> {
    return await db.select().from(users).where(eq(users.role, 'artist'));
  }

  // Store Product operations
  async getAllStoreProducts(category?: string): Promise<StoreProduct[]> {
    const query = db.select().from(storeProducts);
    
    if (category) {
      return await query.where(eq(storeProducts.category, category));
    }
    
    return await query.orderBy(desc(storeProducts.createdAt));
  }

  async getStoreProduct(id: number): Promise<StoreProduct | undefined> {
    const result = await db.select().from(storeProducts).where(eq(storeProducts.id, id)).limit(1);
    return result[0];
  }

  async createStoreProduct(productData: InsertStoreProduct): Promise<StoreProduct> {
    const result = await db.insert(storeProducts).values(productData).returning();
    return result[0];
  }

  // Pending Store Products (filtered by isPendingStore flag)
  async getAllPendingStoreProducts(category?: string): Promise<StoreProduct[]> {
    const results = await db.select().from(storeProducts);
    
    // Filter in memory to avoid complex query builder issues
    let filtered = results.filter(p => p.isPendingStore);
    
    if (category) {
      filtered = filtered.filter(p => p.category === category);
    }
    
    return filtered.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async getPendingStoreProduct(id: number): Promise<StoreProduct | undefined> {
    const result = await db.select().from(storeProducts).where(eq(storeProducts.id, id)).limit(1);
    const product = result[0];
    return product?.isPendingStore ? product : undefined;
  }

  async createPendingStoreProduct(productData: InsertStoreProduct): Promise<StoreProduct> {
    const result = await db.insert(storeProducts).values({
      ...productData,
      isPendingStore: true
    }).returning();
    return result[0];
  }
}

