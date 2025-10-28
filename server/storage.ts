import { beats, purchases, users, storeProducts, type Beat, type InsertBeat, type Purchase, type InsertPurchase, type User, type InsertUser, type StoreProduct, type InsertStoreProduct } from "@shared/schema";

export interface IStorage {
  // Beat operations
  getBeat(id: number): Promise<Beat | undefined>;
  getAllBeats(): Promise<Beat[]>;
  getFeaturedBeats(): Promise<Beat[]>;
  searchBeats(query: string, filters: { genre?: string; key?: string; bpmRange?: string; featured?: boolean }): Promise<Beat[]>;
  createBeat(beat: InsertBeat): Promise<Beat>;
  updateBeat(id: number, beat: Partial<InsertBeat>): Promise<Beat | undefined>;
  deleteBeat(id: number): Promise<boolean>;
  
  // Purchase operations
  createPurchase(purchase: InsertPurchase): Promise<Purchase>;
  getPurchasesByBeat(beatId: number): Promise<Purchase[]>;
  
  // User operations
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  getUserById(id: number): Promise<User | undefined>;
  getAllUsers(): Promise<User[]>;
  deleteUser(id: number): Promise<boolean>;
  getAllArtists(): Promise<User[]>;
  
  // Store Product operations
  getAllStoreProducts(category?: string): Promise<StoreProduct[]>;
  getStoreProduct(id: number): Promise<StoreProduct | undefined>;
  createStoreProduct(product: InsertStoreProduct): Promise<StoreProduct>;
  
  // Pending Store Product operations (legacy - now filtered by isPendingStore flag)
  getAllPendingStoreProducts(category?: string): Promise<StoreProduct[]>;
  getPendingStoreProduct(id: number): Promise<StoreProduct | undefined>;
  createPendingStoreProduct(product: InsertStoreProduct): Promise<StoreProduct>;
}

// Export DatabaseStorage as the default storage
export { DatabaseStorage as Storage } from './dbStorage';