import "dotenv/config";
import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import { createServer as createViteServer } from "vite";
import fs from "fs";
import multer from "multer";
import { createClient } from "@supabase/supabase-js";
import { Resend } from "resend";

const APP_ROOT = process.cwd();
console.log(`[Startup] APP_ROOT: ${APP_ROOT}`);

// Supabase Server Client
const supabaseUrl = process.env.VITE_SUPABASE_URL || "";
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || "";

if (!supabaseUrl) console.warn("[Startup] VITE_SUPABASE_URL is missing!");
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Data paths
const DATA_DIR = path.join(APP_ROOT, "data");
const USERS_FILE = path.join(DATA_DIR, "users.json");
const PRODUCTS_FILE = path.join(DATA_DIR, "products.json");
const ORDERS_FILE = path.join(DATA_DIR, "orders.json");
const REVIEWS_FILE = path.join(DATA_DIR, "reviews.json");
const UPLOADS_DIR = path.join(APP_ROOT, "public", "uploads", "proofs");

// Helper for DB
const readDB = (file: string) => {
  try {
    if (!fs.existsSync(file)) return [];
    const data = fs.readFileSync(file, "utf-8");
    const parsed = JSON.parse(data || "[]");
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    console.error(`Error reading DB file ${file}:`, e);
    return [];
  }
};
const writeDB = (file: string, data: any) => {
  try {
    fs.writeFileSync(file, JSON.stringify(data, null, 2));
  } catch (e) {
    console.error(`Error writing DB file ${file}:`, e);
    throw e;
  }
};

// Ensure directories and files exist
try {
  [DATA_DIR, UPLOADS_DIR].forEach((dir) => {
    if (!fs.existsSync(dir)) {
      console.log(`[Startup] Creating directory: ${dir}`);
      fs.mkdirSync(dir, { recursive: true });
    }
  });

  const initFile = (file: string) => {
    if (!fs.existsSync(file)) {
      console.log(`[Startup] Initializing file: ${file}`);
      fs.writeFileSync(file, "[]");
    }
  };

  initFile(USERS_FILE);
  initFile(PRODUCTS_FILE);
  initFile(ORDERS_FILE);
  initFile(REVIEWS_FILE);
} catch (err: any) {
  console.error("[Startup] CRITICAL: Failed to initialize file system:", err.message);
}

// Initialize Resend
const resendApiKey = process.env.RESEND_API_KEY;
const resend = resendApiKey ? new Resend(resendApiKey) : null;
if (!resendApiKey) console.warn("RESEND_API_KEY is missing. Emails will not be sent.");

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "askipas62@gmail.com";

// Helper for Auth with Supabase
const getAuthUser = async (req: express.Request) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    console.warn("getAuthUser: No authorization header found");
    return null;
  }
  const token = authHeader.split(" ")[1];
  if (!token || token === "null" || token === "undefined") {
    console.warn(`getAuthUser: Invalid token found: ${token}`);
    return null;
  }
  
  try {
    const { data: { user }, error } = await supabase.auth.getUser(token);
    if (error) {
      console.error("getAuthUser: Supabase auth error:", error.message);
      return null;
    }
    if (!user) {
      console.warn("getAuthUser: Supabase returned no user for token");
      return null;
    }
    
    const adminEmail = process.env.ADMIN_EMAIL || "askipas62@gmail.com";
    const mappedUser = {
      id: user.id,
      email: user.email,
      isAdmin: user.email === adminEmail,
      firstName: user.user_metadata?.firstName || "",
      lastName: user.user_metadata?.lastName || ""
    };

    console.log(`getAuthUser: Successfully authenticated ${mappedUser.email} (Admin: ${mappedUser.isAdmin})`);
    return mappedUser;
  } catch (e: any) {
    console.error("getAuthUser: Unexpected exception during auth check:", e.message);
    return null;
  }
};

const app = express();

async function configureApp() {
  app.use(express.json({ limit: "10mb" }));
  app.use(cors());

  // Logging middleware
  app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
  });

  // Health check
  app.get("/api/health", (req, res) => {
    res.json({ 
      status: "ok", 
      time: new Date().toISOString(),
      appRoot: APP_ROOT,
      env: {
        hasSupabaseUrl: !!process.env.VITE_SUPABASE_URL,
        hasSupabaseKey: !!(process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY),
        hasResendKey: !!process.env.RESEND_API_KEY
      }
    });
  });

  // Multer config for proof uploads
  const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, UPLOADS_DIR),
    filename: (req, file, cb) => {
      const orderId = req.params.id;
      cb(null, `proof-${orderId}-${Date.now()}${path.extname(file.originalname)}`);
    }
  });
  const upload = multer({ storage });

  // Auth Sync (Legacy consistency, used for local storage logic if needed)
  // Auth Sync
  app.patch("/api/auth/me", async (req, res) => {
    const authUser = await getAuthUser(req);
    if (!authUser) return res.status(401).json({ error: "Non autorisé" });
    
    try {
      const { firstName, lastName } = req.body;

      const { error } = await supabase
        .from("profiles")
        .upsert({
          id: authUser.id,
          email: authUser.email,
          first_name: firstName,
          last_name: lastName,
          is_admin: authUser.isAdmin
        }, { onConflict: 'id' });

      if (error) throw error;
      res.json({ success: true });
    } catch (e: any) {
      console.error("Auth sync error:", e);
      res.status(500).json({ error: "Erreur serveur" });
    }
  });

  // Product Routes
  app.get("/api/products", async (req, res) => {
    try {
      let query = supabase.from("products").select("*");
      const { category, minPrice, maxPrice, q } = req.query;
      
      if (category) query = query.eq("category", category);
      if (minPrice) query = query.gte("price_ht", Number(minPrice) / 1.2);
      if (maxPrice) query = query.lte("price_ht", Number(maxPrice) / 1.2);
      if (q) query = query.ilike("name", `%${q}%`);
      
      const { data, error } = await query;
      if (error) throw error;
      
      // Map to frontend camelCase
      const mapped = data.map((p: any) => ({
        ...p,
        priceHT: p.price_ht,
      }));
      
      res.json(mapped);
    } catch (e) {
      console.error("GET /api/products error:", e);
      res.status(500).json({ error: "Erreur lors de la récupération des produits" });
    }
  });

  app.get("/api/products/:id", async (req, res) => {
    try {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("id", req.params.id)
        .maybeSingle();
      
      if (error) throw error;
      if (!data) return res.status(404).json({ error: "Produit non trouvé" });
      
      // Map to frontend camelCase
      const mapped = {
        ...data,
        priceHT: data.price_ht,
      };
      
      res.json(mapped);
    } catch (e) {
      console.error("GET /api/products/:id error:", e);
      res.status(500).json({ error: "Erreur serveur" });
    }
  });

  // Orders Routes
  app.post("/api/orders", async (req, res) => {
    console.log("[POST /api/orders] Starting request handling");
    console.log("[POST /api/orders] Body:", JSON.stringify(req.body, null, 2));
    
    try {
      const user = await getAuthUser(req);
      if (!user) {
        console.warn("[POST /api/orders] Auth failed");
        return res.status(401).json({ error: "Non autorisé" });
      }
      
      console.log(`[POST /api/orders] User identified: ${user.id} (${user.email})`);
      
      const { items, totalTTC, id: customId } = req.body;
      const orderId = customId || ("ORD-" + Math.random().toString(36).substring(2, 11).toUpperCase());
      
      console.log(`[POST /api/orders] Creating order ${orderId} with ${items?.length || 0} items`);
      
      const orders = readDB(ORDERS_FILE);
      if (!Array.isArray(orders)) {
        console.error("[POST /api/orders] CRITICAL: readDB(ORDERS_FILE) did not return an array despite safety check!");
        throw new Error("Erreur interne: la base de données des commandes est corrompue");
      }
      
      const newOrder = {
        id: orderId,
        user_id: user.id,
        items: items || [],
        total_ttc: Number(totalTTC) || 0,
        status: "En attente de virement",
        proof_uploaded: false,
        proof_url: null,
        created_at: new Date().toISOString()
      };

      orders.push(newOrder);
      writeDB(ORDERS_FILE, orders);
      console.log(`[POST /api/orders] Order ${orderId} successfully written to ${ORDERS_FILE}`);

      // Send confirmation email
      if (resend && user.email) {
        try {
          console.log(`[POST /api/orders] Sending confirmation email to ${user.email} via Resend...`);
          const { data: emailData, error: emailError } = await resend.emails.send({
            from: "Appiotti <onboarding@resend.dev>",
            to: [user.email],
            subject: `Confirmation de commande ${orderId.split('-')[1] || orderId}`,
            html: `
              <div style="font-family: sans-serif; padding: 20px;">
                <h2>Merci pour votre commande !</h2>
                <p>Votre commande <strong>#${orderId.split('-')[1] || orderId}</strong> est bien enregistrée.</p>
                <p>Montant total : <strong>${Number(totalTTC).toFixed(2)}€</strong></p>
                <p>Veuillez effectuer le virement avec le motif <strong>#${orderId.split('-')[1] || orderId}</strong>.</p>
              </div>
            `
          });
          if (emailError) {
            console.error("[POST /api/orders] Resend API error:", emailError);
          } else {
            console.log("[POST /api/orders] Resend success:", emailData);
          }
        } catch (mailErr: any) {
          console.error("[POST /api/orders] Resend unexpected crash:", mailErr.message);
        }
      } else {
        console.log("[POST /api/orders] Email notification skipped (no resend client or user email)");
      }

      const responseBody = {
        ...newOrder,
        userId: newOrder.user_id,
        totalTTC: newOrder.total_ttc,
        proofUploaded: newOrder.proof_uploaded,
        proofUrl: newOrder.proof_url,
        createdAt: newOrder.created_at
      };
      
      console.log(`[POST /api/orders] Returning response for order ${orderId}`);
      res.json(responseBody);
    } catch (e: any) {
      console.error("[POST /api/orders] UNCAUGHT EXCEPTION:", e);
      res.status(500).json({ 
        error: "Erreur serveur lors de la création de la commande", 
        details: e.message,
        stack: process.env.NODE_ENV === "development" ? e.stack : undefined
      });
    }
  });

  app.get("/api/orders/me", async (req, res) => {
    const user = await getAuthUser(req);
    if (!user) return res.status(401).json({ error: "Non autorisé" });
    
    try {
      const orders = readDB(ORDERS_FILE);
      const userOrders = orders.filter((o: any) => o.user_id === user.id)
        .sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      
      const mapped = userOrders.map((o: any) => ({
        ...o,
        userId: o.user_id,
        totalTTC: o.total_ttc,
        proofUploaded: o.proof_uploaded,
        proofUrl: o.proof_url,
        createdAt: o.created_at
      }));
      res.json(mapped);
    } catch (e: any) {
      console.error("GET /api/orders/me error:", e);
      res.status(500).json({ error: "Erreur lors du chargement de vos commandes" });
    }
  });

  app.post("/api/orders/:id/proof", upload.single("proof"), async (req, res) => {
    const user = await getAuthUser(req);
    if (!user) return res.status(401).json({ error: "Non autorisé" });
    
    try {
      const proofUrl = req.file ? `/uploads/proofs/${req.file.filename}` : null;
      const orders = readDB(ORDERS_FILE);
      const orderIdx = orders.findIndex((o: any) => o.id === req.params.id && o.user_id === user.id);
      
      if (orderIdx === -1) return res.status(404).json({ error: "Commande non trouvée" });

      orders[orderIdx].proof_uploaded = true;
      orders[orderIdx].status = "En cours de validation";
      if (proofUrl) orders[orderIdx].proof_url = proofUrl;

      writeDB(ORDERS_FILE, orders);
      const data = orders[orderIdx];

      // Notify Admin and User
      if (resend) {
        try {
          if (user.email) {
            await resend.emails.send({
              from: "Appiotti Game Shop <onboarding@resend.dev>",
              to: [user.email],
              subject: `Preuve de virement reçue - Commande ${data.id}`,
              html: `<h2>Preuve bien reçue !</h2><p>Hervé va maintenant vérifier la transaction.</p>`
            });
          }

          const adminEmailConfig: any = {
            from: "Appiotti Game Shop Alerts <onboarding@resend.dev>",
            to: [ADMIN_EMAIL],
            subject: `NOUVELLE PREUVE - Commande ${data.id}`,
            html: `<h1>Alerte Preuve de Virement</h1><p>Client : ${user.firstName} ${user.lastName}</p>${proofUrl ? `<p><a href="${process.env.VITE_APP_URL || ''}${proofUrl}">Voir la preuve sur le site</a></p>` : ''}`
          };

          if (req.file) {
            const fileName = req.file.filename;
            const filePath = req.file.path;
            const fileContent = fs.readFileSync(filePath);
            
            adminEmailConfig.attachments = [
              {
                filename: fileName,
                content: fileContent,
              }
            ];
          }

          await resend.emails.send(adminEmailConfig);
        } catch (mailErr) {
          console.error("Notification mail error:", mailErr);
        }
      }

      res.json({
        ...data,
        userId: data.user_id,
        totalTTC: data.total_ttc,
        proofUploaded: data.proof_uploaded,
        proofUrl: data.proof_url,
        createdAt: data.created_at
      });
    } catch (e) {
      console.error("POST /api/orders/:id/proof error:", e);
      res.status(500).json({ error: "Erreur serveur" });
    }
  });

  // Admin Routes
  app.get("/api/admin/orders", async (req, res) => {
    const user = await getAuthUser(req);
    if (!user || !user.isAdmin) return res.status(403).json({ error: "Accès refusé" });
    
    try {
      const orders = readDB(ORDERS_FILE);
      const { data: profiles } = await supabase.from("profiles").select("*");
      
      const mapped = orders.sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        .map((o: any) => {
          const profile = (profiles || []).find((p: any) => p.id === o.user_id);
          return {
            ...o,
            userId: o.user_id,
            totalTTC: o.total_ttc,
            proofUploaded: o.proof_uploaded,
            proofUrl: o.proof_url,
            createdAt: o.created_at,
            userName: profile ? `${profile.first_name || ""} ${profile.last_name || ""}`.trim() : "Acheteur",
            userEmail: profile?.email || "N/A"
          };
        });
      res.json(mapped);
    } catch (e: any) {
      console.error("GET /api/admin/orders error:", e);
      res.status(500).json({ error: "Erreur serveur" });
    }
  });

  app.patch("/api/admin/orders/:id", async (req, res) => {
    const user = await getAuthUser(req);
    if (!user || !user.isAdmin) return res.status(403).json({ error: "Accès refusé" });
    
    try {
      const { status } = req.body;
      const orders = readDB(ORDERS_FILE);
      const orderIdx = orders.findIndex((o: any) => o.id === req.params.id);
      
      if (orderIdx === -1) return res.status(404).json({ error: "Commande non trouvée" });

      orders[orderIdx].status = status;
      writeDB(ORDERS_FILE, orders);
      const order = orders[orderIdx];

      // Fetch user profile for email notification
      const { data: profile } = await supabase
        .from("profiles")
        .select("email")
        .eq("id", order.user_id)
        .single();

      // Send status update email
      if (resend && profile?.email) {
        try {
          await resend.emails.send({
            from: "Appiotti Game Shop <onboarding@resend.dev>",
            to: [profile.email],
            subject: `Mise à jour de votre commande ${order.id}`,
            html: `<h2>Le statut de votre commande a changé</h2><p>Nouveau statut : ${status}</p>`
          });
        } catch (mailErr) {
          console.error("Status update mail error:", mailErr);
        }
      }

      const mapped = {
        ...order,
        userId: order.user_id,
        totalTTC: order.total_ttc,
        proofUploaded: order.proof_uploaded,
        proofUrl: order.proof_url,
        createdAt: order.created_at
      };
      res.json(mapped);
    } catch (e: any) {
      console.error("PATCH /api/admin/orders/:id error:", e);
      res.status(500).json({ error: "Erreur serveur: " + (e.message || "Unknown error") });
    }
  });

  app.get("/api/admin/users", async (req, res) => {
    const user = await getAuthUser(req);
    if (!user || !user.isAdmin) return res.status(403).json({ error: "Accès refusé" });
    
    try {
      const { data, error } = await supabase.from("profiles").select("*");
      if (error) throw error;
      
      const mapped = data.map((u: any) => ({
        ...u,
        firstName: u.first_name,
        lastName: u.last_name,
        isAdmin: u.is_admin
      }));
      
      res.json(mapped);
    } catch (e: any) {
      console.error("GET /api/admin/users error:", e);
      res.status(500).json({ error: "Erreur serveur" });
    }
  });

  app.get("/api/admin/products", async (req, res) => {
    const user = await getAuthUser(req);
    if (!user || !user.isAdmin) return res.status(403).json({ error: "Accès refusé" });
    
    try {
      const { data, error } = await supabase.from("products").select("*");
      if (error) throw error;
      
      const mapped = data.map((p: any) => ({
        ...p,
        priceHT: p.price_ht
      }));
      
      res.json(mapped);
    } catch (e: any) {
      console.error("GET /api/admin/products error:", e);
      res.status(500).json({ error: "Erreur serveur" });
    }
  });

  app.patch("/api/admin/products/:id", async (req, res) => {
    const user = await getAuthUser(req);
    if (!user || !user.isAdmin) return res.status(403).json({ error: "Accès refusé" });
    
    try {
      const { data, error } = await supabase
        .from("products")
        .update(req.body)
        .eq("id", req.params.id)
        .select()
        .single();
        
      if (error) throw error;
      res.json(data);
    } catch (e) {
      console.error("PATCH /api/admin/products/:id error:", e);
      res.status(500).json({ error: "Erreur serveur" });
    }
  });

  app.delete("/api/admin/products/:id", async (req, res) => {
    const user = await getAuthUser(req);
    if (!user || !user.isAdmin) return res.status(403).json({ error: "Accès refusé" });
    
    try {
      const { error } = await supabase
        .from("products")
        .delete()
        .eq("id", req.params.id);
        
      if (error) throw error;
      res.json({ success: true });
    } catch (e) {
      console.error("DELETE /api/admin/products/:id error:", e);
      res.status(500).json({ error: "Erreur serveur" });
    }
  });

  // Reviews Routes
  app.get("/api/reviews", async (req, res) => {
    try {
      let query = supabase.from("reviews").select("*");
      const { productId } = req.query;
      if (productId) query = query.eq("product_id", productId);
      
      const { data, error } = await query;
      if (error) throw error;
      
      // Map to frontend camelCase
      const mapped = (data || []).map((r: any) => ({
        ...r,
        id: r.id || "N/A",
        productId: r.product_id,
        userId: r.user_id,
        userName: r.user_name || "Anonyme",
        rating: r.rating || 5,
        comment: r.comment || "",
        createdAt: r.created_at || new Date().toISOString()
      }));
      
      res.json(mapped);
    } catch (e: any) {
      console.error("GET /api/reviews error:", e);
      res.status(500).json({ error: "Erreur serveur: " + (e.message || "Unknown error") });
    }
  });

  app.post("/api/reviews", async (req, res) => {
    const authHeader = req.headers.authorization;
    const token = authHeader?.split(" ")[1];
    const user = await getAuthUser(req);
    if (!user || !token) return res.status(401).json({ error: "Non autorisé" });

    try {
      const { rating, comment, userName, productId } = req.body;
      if (!rating || !comment) {
        return res.status(400).json({ error: "Note et commentaire requis" });
      }

      const client = createClient(supabaseUrl, supabaseServiceKey, {
        global: { headers: { Authorization: `Bearer ${token}` } }
      });

      const { data, error } = await client
        .from("reviews")
        .insert({
          user_id: user.id,
          product_id: productId || null,
          user_name: userName || `${user.firstName} ${user.lastName}`,
          rating: Number(rating),
          comment: comment.toString(),
          created_at: new Date().toISOString()
        })
        .select()
        .single();
 
      if (error) {
        console.error("Supabase review insert error:", error);
        return res.status(400).json({ error: `Erreur base de données: ${error.message}` });
      }
      res.json(data);
    } catch (e: any) {
      console.error("POST /api/reviews error:", e);
      res.status(500).json({ error: "Erreur serveur: " + (e.message || "Unknown error") });
    }
  });

  app.delete("/api/reviews/:id", async (req, res) => {
    const user = await getAuthUser(req);
    if (!user || !user.isAdmin) return res.status(403).json({ error: "Accès refusé" });

    try {
      const { error } = await supabase
        .from("reviews")
        .delete()
        .eq("id", req.params.id);
        
      if (error) throw error;
      res.json({ success: true });
    } catch (e) {
      console.error("DELETE /api/reviews/:id error:", e);
      res.status(500).json({ error: "Erreur serveur" });
    }
  });

  // Static files for uploads
  app.use("/uploads", express.static(path.join(APP_ROOT, "public", "uploads")));

  // Global Error Handler
  app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error("[GLOBAL ERROR HANDLER]:", err);
    res.status(500).json({ 
      error: "Erreur serveur critique", 
      details: err.message,
      stack: process.env.NODE_ENV === "development" ? err.stack : undefined
    });
  });

  // Vite middleware
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  return app;
}

const appPromise = configureApp();

if (process.env.NODE_ENV !== "production" || !process.env.VERCEL) {
  appPromise.then(() => {
    const PORT = 3000;
    app.listen(PORT, "0.0.0.0", () => {
      console.log(`Server running at http://localhost:${PORT}`);
    });
  });
}

export default app;
