import { beats, purchases, type Beat, type InsertBeat, type Purchase, type InsertPurchase } from "@shared/schema";

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
}

export class MemStorage implements IStorage {
  private beats: Map<number, Beat>;
  private purchases: Map<number, Purchase>;
  private currentBeatId: number;
  private currentPurchaseId: number;

  constructor() {
    this.beats = new Map();
    this.purchases = new Map();
    this.currentBeatId = 1;
    this.currentPurchaseId = 1;
    
    // Add some initial beats
    this.initializeBeats();
  }

  private async initializeBeats() {
    const initialBeats: InsertBeat[] = [
      {
        title: "Dark Trap Anthem",
        producer: "TrapKing",
        fileName: "dark-trap-anthem.mp3",
        filePath: "/uploads/dark-trap-anthem.mp3",
        duration: 150,
        bpm: 140,
        key: "G Minor",
        tags: ["Hip Hop", "Trap"],
        leasePrice: "29.00",
        exclusivePrice: "199.00",
        isFeatured: true,
      },
      {
        title: "Smooth Vibes",
        producer: "SoulBeats",
        fileName: "smooth-vibes.mp3",
        filePath: "/uploads/smooth-vibes.mp3",
        duration: 195,
        bpm: 85,
        key: "C Major",
        tags: ["R&B", "Soul"],
        leasePrice: "35.00",
        exclusivePrice: "249.00",
        isFeatured: true,
      },
      {
        title: "Electric Dreams",
        producer: "SynthWave",
        fileName: "electric-dreams.mp3",
        filePath: "/uploads/electric-dreams.mp3",
        duration: 165,
        bpm: 128,
        key: "A Minor",
        tags: ["Pop", "Dance"],
        leasePrice: "39.00",
        exclusivePrice: "299.00",
        isFeatured: true,
      },
      {
        title: "Night Crawler",
        producer: "DarkBeats",
        fileName: "night-crawler.mp3",
        filePath: "/uploads/night-crawler.mp3",
        duration: 135,
        bpm: 120,
        key: "D Minor",
        tags: ["Hip Hop"],
        leasePrice: "25.00",
        exclusivePrice: "149.00",
        isFeatured: false,
      },
      {
        title: "City Lights",
        producer: "UrbanSounds",
        fileName: "city-lights.mp3",
        filePath: "/uploads/city-lights.mp3",
        duration: 118,
        bpm: 160,
        key: "F# Minor",
        tags: ["Trap"],
        leasePrice: "30.00",
        exclusivePrice: "179.00",
        isFeatured: false,
      },
    ];

    for (const beat of initialBeats) {
      await this.createBeat(beat);
    }
  }

  async getBeat(id: number): Promise<Beat | undefined> {
    return this.beats.get(id);
  }

  async getAllBeats(): Promise<Beat[]> {
    return Array.from(this.beats.values()).sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  async getFeaturedBeats(): Promise<Beat[]> {
    return Array.from(this.beats.values())
      .filter(beat => beat.isFeatured)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async searchBeats(query: string, filters: { genre?: string; key?: string; bpmRange?: string; featured?: boolean }): Promise<Beat[]> {
    let results = Array.from(this.beats.values());

    // Featured filter (apply first if specified)
    if (filters.featured !== undefined) {
      results = results.filter(beat => beat.isFeatured === filters.featured);
    }

    // Enhanced text search - search by beat name (title), producer, tags, and key
    if (query) {
      const lowerQuery = query.toLowerCase();
      results = results.filter(beat => 
        beat.title.toLowerCase().includes(lowerQuery) ||
        (beat.producer && beat.producer.toLowerCase().includes(lowerQuery)) ||
        beat.key.toLowerCase().includes(lowerQuery) ||
        beat.tags.some(tag => tag.toLowerCase().includes(lowerQuery)) ||
        beat.bpm.toString().includes(query) // Allow BPM search in main search
      );
    }

    // Genre filter
    if (filters.genre && filters.genre !== "All Genres") {
      results = results.filter(beat => 
        beat.tags.some(tag => tag.toLowerCase() === filters.genre!.toLowerCase())
      );
    }

    // Key filter
    if (filters.key && filters.key !== "All Keys") {
      results = results.filter(beat => beat.key === filters.key);
    }

    // BPM filter
    if (filters.bpmRange && filters.bpmRange !== "All BPM") {
      const [min, max] = this.parseBpmRange(filters.bpmRange);
      results = results.filter(beat => beat.bpm >= min && beat.bpm <= max);
    }

    return results.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  private parseBpmRange(range: string): [number, number] {
    switch (range) {
      case "60-80 BPM": return [60, 80];
      case "80-120 BPM": return [80, 120];
      case "120-140 BPM": return [120, 140];
      case "140+ BPM": return [140, 999];
      default: return [0, 999];
    }
  }

  async createBeat(insertBeat: InsertBeat): Promise<Beat> {
    const id = this.currentBeatId++;
    const beat: Beat = {
      ...insertBeat,
      tags: insertBeat.tags || [],
      isFeatured: insertBeat.isFeatured || false,
      id,
      createdAt: new Date(),
    };
    this.beats.set(id, beat);
    return beat;
  }

  async updateBeat(id: number, beatUpdate: Partial<InsertBeat>): Promise<Beat | undefined> {
    const existingBeat = this.beats.get(id);
    if (!existingBeat) return undefined;

    const updatedBeat: Beat = {
      ...existingBeat,
      ...beatUpdate,
    };
    this.beats.set(id, updatedBeat);
    return updatedBeat;
  }

  async deleteBeat(id: number): Promise<boolean> {
    return this.beats.delete(id);
  }

  async createPurchase(insertPurchase: InsertPurchase): Promise<Purchase> {
    const id = this.currentPurchaseId++;
    const purchase: Purchase = {
      ...insertPurchase,
      id,
      createdAt: new Date(),
    };
    this.purchases.set(id, purchase);
    return purchase;
  }

  async getPurchasesByBeat(beatId: number): Promise<Purchase[]> {
    return Array.from(this.purchases.values())
      .filter(purchase => purchase.beatId === beatId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }
}

export const storage = new MemStorage();
