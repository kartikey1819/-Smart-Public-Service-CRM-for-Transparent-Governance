import dotenv from "dotenv";
dotenv.config();

console.log("Mongo URI:", process.env.MONGODB_URI);
import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import mongoose from "mongoose";
import Database from "better-sqlite3";
import { GoogleGenAI, Type } from "@google/genai";




const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Database State
let isUsingMongoDB = false;
let sqliteDb: any;

// MongoDB Connection
const MONGODB_URI = process.env.MONGODB_URI;

if (MONGODB_URI) {
  mongoose.connect(MONGODB_URI)
    .then(() => {
      console.log("Connected to MongoDB");
      isUsingMongoDB = true;
    })
    .catch(err => {
      console.error("MongoDB connection error:", err);
      setupSQLite();
    });
} else {
  console.warn("MONGODB_URI not found. Falling back to SQLite for local development.");
  setupSQLite();
}

function setupSQLite() {
  sqliteDb = new Database("complaints.db");
  sqliteDb.exec(`
    CREATE TABLE IF NOT EXISTS complaints (
      id TEXT PRIMARY KEY,
      ward TEXT,
      gali TEXT,
      category TEXT,
      priority TEXT,
      status TEXT,
      description TEXT,
      lastUpdated TEXT,
      timeline TEXT,
      officerLog TEXT,
      feedback TEXT,
      imageUrl TEXT,
      afterImageUrl TEXT,
      slaDeadline TEXT,
      isAppealed INTEGER DEFAULT 0,
      appealTimeline TEXT,
      assignedOfficer TEXT
    )
  `);
}

// Define Schema
const complaintSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  ward: String,
  gali: String,
  category: String,
  priority: String,
  status: String,
  description: String,
  lastUpdated: { type: Date, default: Date.now },
  timeline: [{
    status: String,
    date: Date,
    note: String
  }],
  officerLog: [{
    action: String,
    date: Date
  }],
  feedback: {
    rating: Number,
    comment: String
  },
  imageUrl: String,
  afterImageUrl: String,
  slaDeadline: Date,
  isAppealed: { type: Boolean, default: false },
  appealTimeline: [{
    status: String,
    date: Date,
    note: String
  }],
  assignedOfficer: {
    name: String,
    email: String,
    contact: String,
    address: String,
    department: String,
    assignedBy: String
  }
});

const Complaint = mongoose.model("Complaint", complaintSchema);

// Seed Data Helper
async function seedData() {
  if (isUsingMongoDB) {
    const count = await Complaint.countDocuments();
    if (count === 0) {
      const seedComplaints = [
        {
          id: "CRM45821",
          ward: "W1",
          gali: "Main Street",
          category: "Water Supply",
          priority: "High",
          status: "Pending",
          description: "Water leakage in main pipe near W1 junction.",
          lastUpdated: new Date(),
          timeline: [{ status: "Filed", date: new Date(), note: "Complaint registered by citizen." }],
          officerLog: [],
          feedback: null,
          imageUrl: "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&q=80&w=1000",
          afterImageUrl: null,
          slaDeadline: new Date(Date.now() + 3600000 * 24),
          isAppealed: false,
          appealTimeline: [],
          assignedOfficer: {
            name: "Officer Anjali Sharma",
            email: "anjali.sharma@indore.gov.in",
            contact: "+91 98765 43212",
            address: "Zone 1 Municipal Office, Indore",
            department: "Water Supply Department",
            assignedBy: "AI"
          }
        },
        {
          id: "CRM45822",
          ward: "W3",
          gali: "Sector 4",
          category: "Road",
          priority: "Medium",
          status: "Assigned",
          description: "Potholes on the main road causing traffic issues.",
          lastUpdated: new Date(),
          timeline: [
            { status: "Filed", date: new Date(), note: "Complaint registered." },
            { status: "Assigned", date: new Date(), note: "Assigned to PWD department." }
          ],
          officerLog: [{ action: "Complaint assigned to field worker", date: new Date() }],
          feedback: null,
          imageUrl: "https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&q=80&w=1000",
          afterImageUrl: null,
          slaDeadline: new Date(Date.now() + 3600000 * 1.5),
          isAppealed: false,
          appealTimeline: [],
          assignedOfficer: {
            name: "Officer Ramesh Kumar",
            email: "ramesh.kumar@indore.gov.in",
            contact: "+91 98765 43210",
            address: "Zone 3 Municipal Office, Indore",
            department: "Public Works Department",
            assignedBy: "AI"
          }
        },
        {
          id: "CRM45824",
          ward: "W2",
          gali: "Green Park Avenue",
          category: "Sanitation",
          priority: "Medium",
          status: "Resolved",
          description: "Illegal garbage dumping site cleared and beautified.",
          lastUpdated: new Date(),
          timeline: [
            { status: "Filed", date: new Date(Date.now() - 86400000 * 3), note: "Complaint registered." },
            { status: "Assigned", date: new Date(Date.now() - 86400000 * 2), note: "Assigned to Sanitation Dept." },
            { status: "In Progress", date: new Date(Date.now() - 86400000 * 1), note: "Cleaning crew dispatched." },
            { status: "Resolved", date: new Date(), note: "Site cleared and fenced." }
          ],
          officerLog: [
            { action: "Site inspection completed", date: new Date(Date.now() - 86400000 * 2.5) },
            { action: "Cleaning crew arrived", date: new Date(Date.now() - 86400000 * 1) },
            { action: "Final verification done", date: new Date() }
          ],
          feedback: { rating: 5, comment: "Excellent work! The area looks completely different now." },
          imageUrl: "https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?auto=format&fit=crop&q=80&w=1000",
          afterImageUrl: "https://images.unsplash.com/photo-1526948128573-703ee1aeb6fa?auto=format&fit=crop&q=80&w=1000",
          slaDeadline: new Date(Date.now() - 3600000 * 5),
          isAppealed: false,
          appealTimeline: [],
          assignedOfficer: {
            name: "Officer Suresh Singh",
            email: "suresh.singh@indore.gov.in",
            contact: "+91 98765 43211",
            address: "Zone 2 Municipal Office, Indore",
            department: "Sanitation Department",
            assignedBy: "Manual"
          }
        }
      ];
      await Complaint.insertMany(seedComplaints);
      console.log("MongoDB seeded successfully");
    }
  } else if (sqliteDb) {
    const count = sqliteDb.prepare("SELECT COUNT(*) as count FROM complaints").get() as any;
    if (count.count === 0) {
      const seedComplaints = [
        {
          id: "CRM45821",
          ward: "W1",
          gali: "Main Street",
          category: "Water Supply",
          priority: "High",
          status: "Pending",
          description: "Water leakage in main pipe near W1 junction.",
          lastUpdated: new Date().toISOString(),
          timeline: JSON.stringify([{ status: "Filed", date: new Date().toISOString(), note: "Complaint registered by citizen." }]),
          officerLog: JSON.stringify([]),
          feedback: null,
          imageUrl: "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&q=80&w=1000",
          afterImageUrl: null,
          slaDeadline: new Date(Date.now() + 3600000 * 24).toISOString(),
          isAppealed: 0,
          appealTimeline: JSON.stringify([]),
          assignedOfficer: JSON.stringify({
            name: "Officer Anjali Sharma",
            email: "anjali.sharma@indore.gov.in",
            contact: "+91 98765 43212",
            address: "Zone 1 Municipal Office, Indore",
            department: "Water Supply Department",
            assignedBy: "AI"
          })
        },
        {
          id: "CRM45822",
          ward: "W3",
          gali: "Sector 4",
          category: "Road",
          priority: "Medium",
          status: "Assigned",
          description: "Potholes on the main road causing traffic issues.",
          lastUpdated: new Date().toISOString(),
          timeline: JSON.stringify([
            { status: "Filed", date: new Date().toISOString(), note: "Complaint registered." },
            { status: "Assigned", date: new Date().toISOString(), note: "Assigned to PWD department." }
          ]),
          officerLog: JSON.stringify([{ action: "Complaint assigned to field worker", date: new Date().toISOString() }]),
          feedback: null,
          imageUrl: "https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&q=80&w=1000",
          afterImageUrl: null,
          slaDeadline: new Date(Date.now() + 3600000 * 1.5).toISOString(),
          isAppealed: 0,
          appealTimeline: JSON.stringify([]),
          assignedOfficer: JSON.stringify({
            name: "Officer Ramesh Kumar",
            email: "ramesh.kumar@indore.gov.in",
            contact: "+91 98765 43210",
            address: "Zone 3 Municipal Office, Indore",
            department: "Public Works Department",
            assignedBy: "AI"
          })
        },
        {
          id: "CRM45824",
          ward: "W2",
          gali: "Green Park Avenue",
          category: "Sanitation",
          priority: "Medium",
          status: "Resolved",
          description: "Illegal garbage dumping site cleared and beautified.",
          lastUpdated: new Date().toISOString(),
          timeline: JSON.stringify([
            { status: "Filed", date: new Date(Date.now() - 86400000 * 3).toISOString(), note: "Complaint registered." },
            { status: "Assigned", date: new Date(Date.now() - 86400000 * 2).toISOString(), note: "Assigned to Sanitation Dept." },
            { status: "In Progress", date: new Date(Date.now() - 86400000 * 1).toISOString(), note: "Cleaning crew dispatched." },
            { status: "Resolved", date: new Date().toISOString(), note: "Site cleared and fenced." }
          ]),
          officerLog: JSON.stringify([
            { action: "Site inspection completed", date: new Date(Date.now() - 86400000 * 2.5).toISOString() },
            { action: "Cleaning crew arrived", date: new Date(Date.now() - 86400000 * 1).toISOString() },
            { action: "Final verification done", date: new Date().toISOString() }
          ]),
          feedback: JSON.stringify({ rating: 5, comment: "Excellent work! The area looks completely different now." }),
          imageUrl: "https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?auto=format&fit=crop&q=80&w=1000",
          afterImageUrl: "https://images.unsplash.com/photo-1526948128573-703ee1aeb6fa?auto=format&fit=crop&q=80&w=1000",
          slaDeadline: new Date(Date.now() - 3600000 * 5).toISOString(),
          isAppealed: 0,
          appealTimeline: JSON.stringify([]),
          assignedOfficer: JSON.stringify({
            name: "Officer Suresh Singh",
            email: "suresh.singh@indore.gov.in",
            contact: "+91 98765 43211",
            address: "Zone 2 Municipal Office, Indore",
            department: "Sanitation Department",
            assignedBy: "Manual"
          })
        }
      ];

      const insert = sqliteDb.prepare(`
        INSERT INTO complaints (id, ward, gali, category, priority, status, description, lastUpdated, timeline, officerLog, feedback, imageUrl, afterImageUrl, slaDeadline, isAppealed, appealTimeline, assignedOfficer)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);

      for (const c of seedComplaints) {
        insert.run(c.id, c.ward, c.gali, c.category, c.priority, c.status, c.description, c.lastUpdated, c.timeline, c.officerLog, c.feedback, c.imageUrl, c.afterImageUrl, c.slaDeadline, c.isAppealed, c.appealTimeline, c.assignedOfficer);
      }
      console.log("SQLite seeded successfully");
    }
  }
}

// Initialize Gemini AI
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '50mb' }));

  // Seed data on start
  await seedData();

  // AI Helper: Categorize and Prioritize
  async function processComplaintWithAI(description: string) {
    try {
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `Analyze this municipal complaint and provide a JSON response with category, priority (High, Medium, Low), and a suggested department.
        Complaint: "${description}"`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              category: { type: Type.STRING },
              priority: { type: Type.STRING },
              department: { type: Type.STRING },
              summary: { type: Type.STRING }
            },
            required: ["category", "priority", "department", "summary"]
          }
        }
      });
      return JSON.parse(response.text || "{}");
    } catch (error) {
      console.error("AI Processing Error:", error);
      return { category: "General", priority: "Medium", department: "General Administration", summary: description };
    }
  }

  // API Routes
  app.get("/api/dashboard", async (req, res) => {
    try {
      let complaints: any[] = [];
      if (isUsingMongoDB) {
        complaints = await Complaint.find().sort({ lastUpdated: -1 });
      } else if (sqliteDb) {
        const rows = sqliteDb.prepare("SELECT * FROM complaints ORDER BY lastUpdated DESC").all() as any[];
        complaints = rows.map(row => ({
          ...row,
          timeline: JSON.parse(row.timeline),
          officerLog: JSON.parse(row.officerLog),
          feedback: row.feedback ? JSON.parse(row.feedback) : null,
          appealTimeline: row.appealTimeline ? JSON.parse(row.appealTimeline) : [],
          assignedOfficer: row.assignedOfficer ? JSON.parse(row.assignedOfficer) : null,
          isAppealed: row.isAppealed === 1
        }));
      }

      const now = new Date();
      const overdueCount = complaints.filter(c => c.status !== "Resolved" && c.slaDeadline && new Date(c.slaDeadline) < now).length;

      const stats = {
        totalComplaints: complaints.length,
        pendingComplaints: complaints.filter(c => c.status === "Pending").length,
        inProgressComplaints: complaints.filter(c => c.status === "In Progress" || c.status === "Assigned").length,
        resolvedComplaints: complaints.filter(c => c.status === "Resolved").length,
        overdueCount,
        avgResolutionTime: "4.2 hrs"
      };
      res.json({ complaints, stats });
    } catch (error) {
      console.error("Dashboard Error:", error);
      res.status(500).json({ error: "Failed to fetch dashboard data" });
    }
  });

  app.get("/api/leaderboard", (req, res) => {
    const officers = [
      { name: "Ramesh Kumar", resolved: 45, rating: 4.8, badge: "🥇 #1 Resolver" },
      { name: "Suresh Singh", resolved: 38, rating: 4.6, badge: "🥈 Top Performer" },
      { name: "Anjali Sharma", resolved: 32, rating: 4.9, badge: "🥉 Quality Lead" },
      { name: "Vikram Mehta", resolved: 28, rating: 4.4, badge: null },
      { name: "Priya Das", resolved: 25, rating: 4.5, badge: null }
    ];
    res.json(officers);
  });

  app.get("/api/alerts", (req, res) => {
    res.json([
      { id: "A1", message: "🚨 W3 Water +40% Surge", type: "crisis", filter: "W3" },
      { id: "A2", message: "⚠️ Heavy Rain Alert: Zone 4", type: "warning", filter: "Z4" }
    ]);
  });

  app.post("/api/appeal/:id", async (req, res) => {
    try {
      const { id } = req.params;
      if (isUsingMongoDB) {
        const complaint = await Complaint.findOne({ id });
        if (!complaint) return res.status(404).json({ error: "Not found" });
        complaint.appealTimeline.push({ status: "Appeal Filed", date: new Date(), note: "Citizen appealed the resolution." });
        complaint.status = 'Pending';
        complaint.isAppealed = true;
        complaint.lastUpdated = new Date();
        await complaint.save();
      } else if (sqliteDb) {
        const complaint = sqliteDb.prepare("SELECT * FROM complaints WHERE id = ?").get(id) as any;
        if (!complaint) return res.status(404).json({ error: "Not found" });
        const appealTimeline = JSON.parse(complaint.appealTimeline || "[]");
        appealTimeline.push({ status: "Appeal Filed", date: new Date().toISOString(), note: "Citizen appealed the resolution." });
        sqliteDb.prepare(`
          UPDATE complaints 
          SET status = 'Pending', isAppealed = 1, appealTimeline = ?, lastUpdated = ?
          WHERE id = ?
        `).run(JSON.stringify(appealTimeline), new Date().toISOString(), id);
      }
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to process appeal" });
    }
  });

  app.post("/api/complaints/:id/feedback", async (req, res) => {
    try {
      const { id } = req.params;
      const { rating, comment } = req.body;
      if (isUsingMongoDB) {
        await Complaint.findOneAndUpdate({ id }, { feedback: { rating, comment }, lastUpdated: new Date() });
      } else if (sqliteDb) {
        sqliteDb.prepare("UPDATE complaints SET feedback = ?, lastUpdated = ? WHERE id = ?").run(JSON.stringify({ rating, comment }), new Date().toISOString(), id);
      }
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to submit feedback" });
    }
  });

  app.post("/api/complaints/:id/reopen", async (req, res) => {
    try {
      const { id } = req.params;
      if (isUsingMongoDB) {
        const complaint = await Complaint.findOne({ id });
        if (!complaint) return res.status(404).json({ error: "Not found" });
        complaint.timeline.push({ status: "Reopened", date: new Date(), note: "Complaint reopened by citizen." });
        complaint.status = 'Pending';
        complaint.lastUpdated = new Date();
        await complaint.save();
      } else if (sqliteDb) {
        const complaint = sqliteDb.prepare("SELECT * FROM complaints WHERE id = ?").get(id) as any;
        if (!complaint) return res.status(404).json({ error: "Not found" });
        const timeline = JSON.parse(complaint.timeline || "[]");
        timeline.push({ status: "Reopened", date: new Date().toISOString(), note: "Complaint reopened by citizen." });
        sqliteDb.prepare(`
          UPDATE complaints 
          SET status = 'Pending', timeline = ?, lastUpdated = ?
          WHERE id = ?
        `).run(JSON.stringify(timeline), new Date().toISOString(), id);
      }
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to reopen complaint" });
    }
  });

  app.post("/api/complaints/:id/photo", async (req, res) => {
    try {
      const { id } = req.params;
      const { afterImageUrl } = req.body;
      if (isUsingMongoDB) {
        await Complaint.findOneAndUpdate({ id }, { afterImageUrl, lastUpdated: new Date() });
      } else if (sqliteDb) {
        sqliteDb.prepare("UPDATE complaints SET afterImageUrl = ?, lastUpdated = ? WHERE id = ?").run(afterImageUrl, new Date().toISOString(), id);
      }
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to upload photo" });
    }
  });

  app.post("/api/complaints/:id/resolve", async (req, res) => {
    try {
      const { id } = req.params;
      if (isUsingMongoDB) {
        const complaint = await Complaint.findOne({ id });
        if (!complaint) return res.status(404).json({ error: "Not found" });
        complaint.timeline.push({ status: "Resolved", date: new Date(), note: "Complaint marked as resolved by officer." });
        complaint.officerLog.push({ action: "Complaint resolved via dashboard", date: new Date() });
        complaint.status = 'Resolved';
        complaint.lastUpdated = new Date();
        await complaint.save();
      } else if (sqliteDb) {
        const complaint = sqliteDb.prepare("SELECT * FROM complaints WHERE id = ?").get(id) as any;
        if (!complaint) return res.status(404).json({ error: "Not found" });
        const timeline = JSON.parse(complaint.timeline || "[]");
        timeline.push({ status: "Resolved", date: new Date().toISOString(), note: "Complaint marked as resolved by officer." });
        const officerLog = JSON.parse(complaint.officerLog || "[]");
        officerLog.push({ action: "Complaint resolved via dashboard", date: new Date().toISOString() });
        sqliteDb.prepare(`
          UPDATE complaints 
          SET status = 'Resolved', timeline = ?, officerLog = ?, lastUpdated = ?
          WHERE id = ?
        `).run(JSON.stringify(timeline), JSON.stringify(officerLog), new Date().toISOString(), id);
      }
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to resolve complaint" });
    }
  });

  app.post("/api/complaints/:id/assign-ai", async (req, res) => {
    try {
      const { id } = req.params;
      const assignedOfficer = {
        name: "Officer Ramesh Kumar",
        email: "ramesh.kumar@indore.gov.in",
        contact: "+91 98765 43210",
        address: "Zone 3 Municipal Office, Indore",
        department: "Public Works Department",
        assignedBy: "AI"
      };

      if (isUsingMongoDB) {
        const complaint = await Complaint.findOne({ id });
        if (!complaint) return res.status(404).json({ error: "Not found" });
        complaint.timeline.push({ status: "Assigned", date: new Date(), note: "AI automatically assigned an officer based on category (Demo)." });
        complaint.status = 'Assigned';
        complaint.assignedOfficer = assignedOfficer;
        complaint.lastUpdated = new Date();
        await complaint.save();
      } else if (sqliteDb) {
        const complaint = sqliteDb.prepare("SELECT * FROM complaints WHERE id = ?").get(id) as any;
        if (!complaint) return res.status(404).json({ error: "Not found" });
        const timeline = JSON.parse(complaint.timeline || "[]");
        timeline.push({ status: "Assigned", date: new Date().toISOString(), note: "AI automatically assigned an officer based on category (Demo)." });
        sqliteDb.prepare(`
          UPDATE complaints 
          SET status = 'Assigned', assignedOfficer = ?, timeline = ?, lastUpdated = ?
          WHERE id = ?
        `).run(JSON.stringify(assignedOfficer), JSON.stringify(timeline), new Date().toISOString(), id);
      }
      res.json({ success: true, officer: assignedOfficer });
    } catch (error) {
      res.status(500).json({ error: "Failed to assign officer" });
    }
  });

  app.post("/api/complaints", async (req, res) => {
    try {
      const { description, ward, gali, imageUrl } = req.body;
      const aiResult = await processComplaintWithAI(description);
      const newId = `CRM${Math.floor(10000 + Math.random() * 90000)}`;
      
      const newComplaint: any = {
        id: newId,
        ward,
        gali,
        category: aiResult.category || "General",
        priority: aiResult.priority || "Medium",
        status: "Assigned",
        description,
        lastUpdated: new Date(),
        timeline: [{ status: "Filed", date: new Date(), note: "Complaint registered via AI Triage." }],
        officerLog: [],
        feedback: null,
        imageUrl: imageUrl || null,
        afterImageUrl: null,
        slaDeadline: new Date(Date.now() + 3600000 * 24),
        isAppealed: false,
        appealTimeline: [],
        assignedOfficer: {
          name: "AI Assigned Officer",
          email: "ai.officer@indore.gov.in",
          contact: "+91 00000 00000",
          address: "Central Command Center",
          department: aiResult.department || "General Administration",
          assignedBy: "AI"
        }
      };

      if (isUsingMongoDB) {
        const created = await Complaint.create(newComplaint);
        res.json({ id: newId, complaint: created });
      } else if (sqliteDb) {
        sqliteDb.prepare(`
          INSERT INTO complaints (id, ward, gali, category, priority, status, description, lastUpdated, timeline, officerLog, feedback, imageUrl, afterImageUrl, slaDeadline, isAppealed, appealTimeline, assignedOfficer)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).run(
          newComplaint.id,
          newComplaint.ward,
          newComplaint.gali,
          newComplaint.category,
          newComplaint.priority,
          newComplaint.status,
          newComplaint.description,
          newComplaint.lastUpdated.toISOString(),
          JSON.stringify(newComplaint.timeline),
          JSON.stringify(newComplaint.officerLog),
          JSON.stringify(newComplaint.feedback),
          newComplaint.imageUrl,
          newComplaint.afterImageUrl,
          newComplaint.slaDeadline.toISOString(),
          0,
          JSON.stringify(newComplaint.appealTimeline),
          JSON.stringify(newComplaint.assignedOfficer)
        );
        res.json({ id: newId, complaint: { ...newComplaint, timeline: newComplaint.timeline, officerLog: [], appealTimeline: [] } });
      }
    } catch (error) {
      console.error("Submit Error:", error);
      res.status(500).json({ error: "Failed to submit complaint" });
    }
  });

  app.get("/api/complaints/:id", async (req, res) => {
    try {
      if (isUsingMongoDB) {
        const complaint = await Complaint.findOne({ id: req.params.id });
        if (complaint) return res.json(complaint);
      } else if (sqliteDb) {
        const row = sqliteDb.prepare("SELECT * FROM complaints WHERE id = ?").get(req.params.id) as any;
        if (row) {
          return res.json({
            ...row,
            timeline: JSON.parse(row.timeline),
            officerLog: JSON.parse(row.officerLog),
            feedback: row.feedback ? JSON.parse(row.feedback) : null,
            appealTimeline: row.appealTimeline ? JSON.parse(row.appealTimeline) : [],
            assignedOfficer: row.assignedOfficer ? JSON.parse(row.assignedOfficer) : null,
            isAppealed: row.isAppealed === 1
          });
        }
      }
      res.status(404).json({ error: "Complaint not found" });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch complaint details" });
    }
  });

  app.get("/api/complaints/:id/ai-insight", async (req, res) => {
    try {
      let complaint: any;
      if (isUsingMongoDB) {
        complaint = await Complaint.findOne({ id: req.params.id });
      } else if (sqliteDb) {
        complaint = sqliteDb.prepare("SELECT * FROM complaints WHERE id = ?").get(req.params.id) as any;
      }

      if (!complaint) return res.status(404).json({ error: "Not found" });

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `Provide a brief technical insight and suggested resolution steps for this municipal complaint.
        Category: ${complaint.category}
        Description: ${complaint.description}`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              insight: { type: Type.STRING },
              steps: { type: Type.ARRAY, items: { type: Type.STRING } },
              estimatedTime: { type: Type.STRING }
            },
            required: ["insight", "steps", "estimatedTime"]
          }
        }
      });
      res.json(JSON.parse(response.text || "{}"));
    } catch (error) {
      res.status(500).json({ error: "AI failed" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.join(__dirname, "dist", "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
