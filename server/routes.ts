import type { Express } from "express";
import { createServer, type Server } from "http";
import multer from "multer";
import path from "path";
import { storage } from "./storage";
import { insertBeatSchema, insertPurchaseSchema } from "@shared/schema";
import { z } from "zod";

// Configure multer for file uploads
const upload = multer({
  dest: 'uploads/',
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['audio/mpeg', 'audio/wav', 'audio/mp3'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only MP3 and WAV files are allowed.'));
    }
  },
});

export async function registerRoutes(app: Express): Promise<Server> {
  
  // Get all beats
  app.get("/api/beats", async (req, res) => {
    try {
      const { search, genre, key, bpmRange } = req.query;
      
      const beats = await storage.searchBeats(
        search as string || "",
        {
          genre: genre as string,
          key: key as string,
          bpmRange: bpmRange as string,
        }
      );
      
      res.json(beats);
    } catch (error) {
      console.error("Error fetching beats:", error);
      res.status(500).json({ message: "Failed to fetch beats" });
    }
  });

  // Get featured beats
  app.get("/api/beats/featured", async (req, res) => {
    try {
      const beats = await storage.getFeaturedBeats();
      res.json(beats);
    } catch (error) {
      console.error("Error fetching featured beats:", error);
      res.status(500).json({ message: "Failed to fetch featured beats" });
    }
  });

  // Get beat by ID
  app.get("/api/beats/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const beat = await storage.getBeat(id);
      
      if (!beat) {
        return res.status(404).json({ message: "Beat not found" });
      }
      
      res.json(beat);
    } catch (error) {
      console.error("Error fetching beat:", error);
      res.status(500).json({ message: "Failed to fetch beat" });
    }
  });

  // Upload new beat
  app.post("/api/beats", upload.single('beatFile'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No audio file provided" });
      }

      const beatData = {
        title: req.body.title,
        fileName: req.file.originalname,
        filePath: `/uploads/${req.file.filename}`,
        duration: parseInt(req.body.duration) || 120, // Default 2 minutes
        bpm: parseInt(req.body.bpm),
        key: req.body.key,
        tags: req.body.tags ? req.body.tags.split(',').map((tag: string) => tag.trim()) : [],
        leasePrice: req.body.leasePrice,
        exclusivePrice: req.body.exclusivePrice,
        isFeatured: req.body.isFeatured === 'true',
      };

      const validatedData = insertBeatSchema.parse(beatData);
      const beat = await storage.createBeat(validatedData);
      
      res.status(201).json(beat);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Invalid beat data", 
          errors: error.errors 
        });
      }
      console.error("Error creating beat:", error);
      res.status(500).json({ message: "Failed to create beat" });
    }
  });

  // Process purchase
  app.post("/api/purchases", async (req, res) => {
    try {
      const purchaseData = insertPurchaseSchema.parse(req.body);
      
      // Verify beat exists
      const beat = await storage.getBeat(purchaseData.beatId);
      if (!beat) {
        return res.status(404).json({ message: "Beat not found" });
      }

      // Mock payment processing - in real app would integrate with Stripe/PayPal
      const purchase = await storage.createPurchase(purchaseData);
      
      // Return success with download link
      res.status(201).json({
        ...purchase,
        downloadLink: `/api/downloads/${beat.id}`, // Mock download endpoint
        message: "Purchase successful! Check your email for download instructions."
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Invalid purchase data", 
          errors: error.errors 
        });
      }
      console.error("Error processing purchase:", error);
      res.status(500).json({ message: "Failed to process purchase" });
    }
  });

  // Get purchases for a beat
  app.get("/api/beats/:id/purchases", async (req, res) => {
    try {
      const beatId = parseInt(req.params.id);
      const purchases = await storage.getPurchasesByBeat(beatId);
      res.json(purchases);
    } catch (error) {
      console.error("Error fetching purchases:", error);
      res.status(500).json({ message: "Failed to fetch purchases" });
    }
  });

  // Serve uploaded files
  app.use('/uploads', (req, res, next) => {
    // In production, you'd want proper authentication here
    next();
  });

  // Mock download endpoint
  app.get("/api/downloads/:beatId", async (req, res) => {
    try {
      const beatId = parseInt(req.params.beatId);
      const beat = await storage.getBeat(beatId);
      
      if (!beat) {
        return res.status(404).json({ message: "Beat not found" });
      }

      res.json({
        message: "Download link generated",
        downloadUrl: beat.filePath,
        usageRules: "/api/usage-rules.pdf",
        splits: "/api/splits-info.pdf"
      });
    } catch (error) {
      console.error("Error generating download:", error);
      res.status(500).json({ message: "Failed to generate download" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
