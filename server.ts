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

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Supabase Server Client
const supabaseUrl = process.env.VITE_SUPABASE_URL || "";
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || "";
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Data paths
const DATA_DIR = path.join(__dirname, "data");
const USERS_FILE = path.join(DATA_DIR, "users.json");
const PRODUCTS_FILE = path.join(DATA_DIR, "products.json");
const ORDERS_FILE = path.join(DATA_DIR, "orders.json");
const REVIEWS_FILE = path.join(DATA_DIR, "reviews.json");
const UPLOADS_DIR = path.join(__dirname, "public", "uploads", "proofs");

// Ensure directories exist
[DATA_DIR, UPLOADS_DIR].forEach((dir) => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

// Helper for DB
const readDB = (file: string) => {
  try {
    const data = fs.readFileSync(file, "utf-8");
    return JSON.parse(data || "[]");
  } catch (e) {
    return [];
  }
};
const writeDB = (file: string, data: any) => fs.writeFileSync(file, JSON.stringify(data, null, 2));

// Initialize files if they don't exist
if (!fs.existsSync(USERS_FILE)) writeDB(USERS_FILE, []);
if (!fs.existsSync(PRODUCTS_FILE)) writeDB(PRODUCTS_FILE, []);
if (!fs.existsSync(ORDERS_FILE)) writeDB(ORDERS_FILE, []);
if (!fs.existsSync(REVIEWS_FILE)) writeDB(REVIEWS_FILE, []);

// Initialize Resend
const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "askipas62@gmail.com";

// Helper for Auth with Supabase
const getAuthUser = async (req: express.Request) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    console.warn("getAuthUser: No authorization header");
    return null;
  }
  const token = authHeader.split(" ")[1];
  if (!token) {
    console.warn("getAuthUser: No token found in header");
    return null;
  }
  
  try {
    const { data: { user }, error } = await supabase.auth.getUser(token);
    if (error) {
      console.error("getAuthUser: Supabase error", error);
      return null;
    }
    if (!user) {
      console.warn("getAuthUser: No user returned from Supabase");
      return null;
    }
    
    return {
      id: user.id,
      email: user.email,
      isAdmin: user.email === (process.env.ADMIN_EMAIL || "askipas62@gmail.com"),
      firstName: user.user_metadata?.firstName || "",
      lastName: user.user_metadata?.lastName || ""
    };
  } catch (e) {
    console.error("getAuthUser: unexpected error", e);
    return null;
  }
};

const app = express();

async function configureApp() {
  app.use(express.json());
  app.use(cors());

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
    const user = await getAuthUser(req);
    if (!user) return res.status(401).json({ error: "Non autorisé" });
    
    try {
      const { items, totalTTC, id: customId } = req.body;
      const orderId = customId || ("ORD-" + Math.random().toString(36).substr(2, 9).toUpperCase());
      
      const newOrder: any = {
        user_id: user.id,
        items: items || [],
        total_ttc: Number(totalTTC) || 0,
        status: "En attente de virement",
        proof_uploaded: false,
        created_at: new Date().toISOString()
      };

      // Only include ID if it's not a UUID-only table
      // If we're not sure, we can try to insert and see. 
      // But usuallyORD-XXX is a string ID.
      if (orderId) {
        newOrder.id = orderId;
      }
      
      const { data, error } = await supabase
        .from("orders")
        .insert(newOrder)
        .select()
        .single();

      if (error) {
        console.error("Supabase order insert error:", error);
        return res.status(400).json({ error: `Erreur base de données: ${error.message}` });
      }

      // Send confirmation email
      if (resend && user.email) {
        try {
          await resend.emails.send({
            from: "Shop <onboarding@resend.dev>",
            to: [user.email],
            subject: `Confirmation de commande ${orderId}`,
            html: `<h1>Merci pour votre commande ${orderId}</h1><p>Total: ${(newOrder.total_ttc || 0).toFixed(2)}€</p><p>Veuillez effectuer le virement pour valider.</p>`
          });
        } catch (mailErr) {
          console.error("Email send error:", mailErr);
        }
      }

      const mapped = {
        ...data,
        userId: data.user_id,
        totalTTC: data.total_ttc,
        proofUploaded: data.proof_uploaded,
        proofUrl: data.proof_url,
        createdAt: data.created_at
      };
      res.json(mapped);
    } catch (e: any) {
      console.error("POST /api/orders error:", e);
      res.status(500).json({ error: "Erreur serveur" });
    }
  });

  app.get("/api/orders/me", async (req, res) => {
    const user = await getAuthUser(req);
    if (!user) return res.status(401).json({ error: "Non autorisé" });
    
    try {
      const { data, error } = await supabase
        .from("orders")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      
      const mapped = data.map((o: any) => ({
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
      
      const { data, error } = await supabase
        .from("orders")
        .update({
          proof_uploaded: true,
          status: "En cours de validation",
          proof_url: proofUrl
        })
        .eq("id", req.params.id)
        .eq("user_id", user.id)
        .select()
        .single();

      if (error) throw error;

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

      const mapped = {
        ...data,
        userId: data.user_id,
        totalTTC: data.total_ttc,
        proofUploaded: data.proof_uploaded,
        proofUrl: data.proof_url,
        createdAt: data.created_at
      };
      res.json(mapped);
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
      // Safer fetching: fetch orders and profiles separately to avoid join errors if relations aren't perfectly set up
      const { data: orders, error: ordersError } = await supabase
        .from("orders")
        .select("*");
      
      if (ordersError) {
        console.error("Supabase orders fetch error:", ordersError);
        throw ordersError;
      }

      const { data: profiles, error: profilesError } = await supabase
        .from("profiles")
        .select("*");
      
      if (profilesError) {
        console.error("Supabase profiles fetch error:", profilesError);
      }

      // Sort manually if DB order fails or to be sure
      const sortedOrders = (orders || []).sort((a: any, b: any) => {
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      });
      
      const mapped = sortedOrders.map((o: any) => {
        const profile = (profiles || []).find((p: any) => p.id === o.user_id);
        return {
          ...o,
          id: o.id || "N/A",
          userId: o.user_id,
          totalTTC: o.total_ttc || 0,
          status: o.status || "Inconnu",
          proofUploaded: o.proof_uploaded || false,
          proofUrl: o.proof_url,
          createdAt: o.created_at || new Date().toISOString(),
          userName: profile ? `${profile.first_name || ""} ${profile.last_name || ""}`.trim() : "Acheteur",
          userEmail: profile?.email || "N/A"
        };
      });
      res.json(mapped);
    } catch (e: any) {
      console.error("GET /api/admin/orders error:", e);
      res.status(500).json({ error: "Erreur serveur: " + (e.message || "Unknown error") });
    }
  });

  app.patch("/api/admin/orders/:id", async (req, res) => {
    const user = await getAuthUser(req);
    if (!user || !user.isAdmin) return res.status(403).json({ error: "Accès refusé" });
    
    try {
      const { status } = req.body;
      const { data: order, error } = await supabase
        .from("orders")
        .update({ status })
        .eq("id", req.params.id)
        .select("*")
        .single();

      if (error) throw error;

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
    const user = await getAuthUser(req);
    if (!user) return res.status(401).json({ error: "Non autorisé" });

    try {
      const { rating, comment, userName, productId } = req.body;
      if (!rating || !comment) {
        return res.status(400).json({ error: "Note et commentaire requis" });
      }

      const { data, error } = await supabase
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
  app.use("/uploads", express.static(path.join(__dirname, "public", "uploads")));

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
