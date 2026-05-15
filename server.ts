import "dotenv/config";
import express from "express";
import cors from "cors";
import path from "path";
import fs from "fs";
import { createClient } from "@supabase/supabase-js";
import { Resend } from "resend";

const APP_ROOT = process.cwd();
console.log(`[Startup] APP_ROOT: ${APP_ROOT}`);

// Supabase Server Client (Only for Auth if needed)
const supabaseUrl = process.env.VITE_SUPABASE_URL || "";
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || "";

let supabase: any = null;
if (supabaseUrl && supabaseUrl.startsWith("http")) {
  try {
    supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
        detectSessionInUrl: false // Add this for server-side
      }
    });
  } catch (err) {
    console.error("[Startup] Failed to initialize Supabase:", err);
  }
} else {
  console.warn("[Startup] Supabase URL is missing or invalid. Auth might not work.");
}

// Initialize Resend
const resendApiKey = process.env.RESEND_API_KEY;
const resend = resendApiKey ? new Resend(resendApiKey) : null;
if (!resendApiKey) console.warn("RESEND_API_KEY is missing. Emails will not be sent.");

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "zakaz@forumles.ru";

// Persistence Helpers
const ORDERS_FILE = path.join(process.cwd(), "data", "orders.json");
const REVIEWS_FILE = path.join(process.cwd(), "data", "reviews.json");
const PRODUCTS_FILE = path.join(process.cwd(), "data", "products.json");

const readOrders = () => {
  try {
    if (!fs.existsSync(ORDERS_FILE)) return [];
    const data = fs.readFileSync(ORDERS_FILE, "utf-8").trim();
    if (!data) return [];
    return JSON.parse(data);
  } catch (err) {
    console.error("Error reading orders file:", err);
    return [];
  }
};

const readReviews = () => {
  try {
    if (!fs.existsSync(REVIEWS_FILE)) return [];
    const data = fs.readFileSync(REVIEWS_FILE, "utf-8").trim();
    if (!data) return [];
    return JSON.parse(data);
  } catch (err) {
    console.error("Error reading reviews file:", err);
    return [];
  }
};

const readProducts = () => {
  try {
    if (!fs.existsSync(PRODUCTS_FILE)) return [];
    const data = fs.readFileSync(PRODUCTS_FILE, "utf-8").trim();
    if (!data) return [];
    return JSON.parse(data);
  } catch (err) {
    console.error("Error reading products file:", err);
    return [];
  }
};

const updateProduct = (id: string, updateData: any) => {
  try {
    const products = readProducts();
    const index = products.findIndex((p: any) => p.id === id);
    if (index !== -1) {
      products[index] = { ...products[index], ...updateData };
      fs.writeFileSync(PRODUCTS_FILE, JSON.stringify(products, null, 2));
      return true;
    }
    return false;
  } catch (err) {
    console.error("Error updating product:", err);
    return false;
  }
};

const saveOrder = (order: any) => {
  try {
    const orders = readOrders();
    orders.unshift(order); // Add to beginning
    fs.writeFileSync(ORDERS_FILE, JSON.stringify(orders, null, 2));
    return true;
  } catch (err) {
    console.error("Error saving order:", err);
    return false;
  }
};

const deleteReview = (id: string) => {
  try {
    const reviews = readReviews();
    const filtered = reviews.filter((r: any) => r.id !== id);
    fs.writeFileSync(REVIEWS_FILE, JSON.stringify(filtered, null, 2));
    return true;
  } catch (err) {
    console.error("Error deleting review:", err);
    return false;
  }
};

const updateOrderStatus = (id: string, status: string) => {
  try {
    const orders = readOrders();
    const index = orders.findIndex((o: any) => o.id === id);
    if (index !== -1) {
      orders[index].status = status;
      fs.writeFileSync(ORDERS_FILE, JSON.stringify(orders, null, 2));
      return true;
    }
    return false;
  } catch (err) {
    console.error("Error updating order status:", err);
    return false;
  }
};

// Helper for Auth with Supabase
const getAuthUser = async (req: express.Request) => {
  if (!supabase) {
    console.warn("[Auth] Supabase client not initialized. Check VITE_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.");
    return null;
  }
  
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    console.warn(`[Auth] No Authorization header for ${req.method} ${req.url}`);
    return null;
  }
  
  const token = authHeader.split(" ")[1];
  if (!token || token === "null" || token === "undefined") {
    console.warn(`[Auth] Invalid token format or empty token: "${token}"`);
    return null;
  }
  
  try {
    // console.log(`[Auth] Verifying token for ${req.method} ${req.url}...`);
    const { data: { user }, error } = await supabase.auth.getUser(token);
    
    if (error || !user) {
      console.error("[Auth] User verification failed:", error?.message || "No user returned from Supabase");
      return null;
    }
    
    const email = user.email?.toLowerCase().trim() || "";
    const adminEmails = [
      (process.env.ADMIN_EMAIL || "zakaz@forumles.ru").toLowerCase().trim(),
      "askipas62@gmail.com",
      "zakaz@forumles.ru",
      "admin@appiotti.com"
    ];
    
    const isAdmin = adminEmails.includes(email);
    
    if (req.url.includes("/admin/") && !isAdmin) {
      console.warn(`[Auth] Forbidden: User ${email} is not in admin whitelist:`, adminEmails);
    } else if (isAdmin) {
      console.log(`[Auth] Admin user verified: ${email}`);
    } else {
      console.log(`[Auth] Regular user verified: ${email}`);
    }
    
    return {
      id: user.id,
      email: user.email,
      isAdmin,
      firstName: user.user_metadata?.firstName || "",
      lastName: user.user_metadata?.lastName || ""
    };
  } catch (e: any) {
    console.error("[Auth] Unexpected error during verification:", e.message);
    return null;
  }
};

const app = express();

async function startServer() {
  app.use(express.json({ limit: "10mb" }));
  
  // Robust CORS configuration
  app.use(cors({
    origin: true, // Reflect request origin
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With", "Accept"]
  }));

  // Log all requests for debugging
  app.use((req, res, next) => {
    const authHeader = req.headers.authorization;
    const hasToken = !!authHeader && authHeader.startsWith("Bearer ");
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url} (Auth: ${hasToken ? 'YES' : 'NO'})`);
    next();
  });

  // Runtime environment config for frontend
  app.get("/env.js", (req, res) => {
    const config = {
      VITE_SUPABASE_URL: process.env.VITE_SUPABASE_URL,
      VITE_SUPABASE_ANON_KEY: process.env.VITE_SUPABASE_ANON_KEY,
      NODE_ENV: process.env.NODE_ENV
    };
    res.setHeader("Content-Type", "application/javascript");
    res.send(`window.env = ${JSON.stringify(config)};`);
  });

  // Health check
  app.get("/api/health", (req, res) => {
    res.json({ 
      status: "ok", 
      time: new Date().toISOString(),
      env: {
        hasResendKey: !!process.env.RESEND_API_KEY,
        hasSupabase: !!supabase
      }
    });
  });

  // Orders Routes - SUPABASE VERSION
  app.post("/api/orders", async (req, res) => {
    console.log("[POST /api/orders] Processing order (Supabase mode)");
    
    try {
      const user = await getAuthUser(req);
      if (!user) {
        console.warn("[POST /api/orders] No user found for token");
        return res.status(401).json({ error: "Authentification requise" });
      }

      const { items, totalTTC, id: customId } = req.body;
      const orderId = customId || ("ORD-" + Math.random().toString(36).substring(2, 11).toUpperCase());
      
      const orderData = {
        id: orderId,
        user_id: user.id,
        items: items || [],
        total_ttc: Number(totalTTC) || 0,
        status: "En attente de virement",
        proof_uploaded: false
      };

      console.log("[POST /api/orders] Inserting order into Supabase:", orderId);
      
      // Persistence: Save to Supabase
      const { data: insertedData, error: dbError } = await supabase
        .from("orders")
        .insert(orderData)
        .select();

      if (dbError) {
        console.error("[POST /api/orders] Supabase insert error:", dbError.message, dbError.details);
        return res.status(500).json({ 
          error: "Erreur lors de l'enregistrement en base de données",
          details: dbError.message 
        });
      }

      console.log("[POST /api/orders] Order inserted successfully:", orderId);

      // Send confirmation email (Stateless version)
      if (resend) {
        console.log("[POST /api/orders] Sending confirmation emails...");
        try {
          await resend.emails.send({
            from: "Appiotti <onboarding@resend.dev>",
            to: [ADMIN_EMAIL],
            subject: `Confirmation de commande ${orderId}`,
            html: `
              <div style="font-family: sans-serif; padding: 20px;">
                <h2>Merci pour votre commande !</h2>
                <p>Votre commande <strong>#${orderId}</strong> est en attente de virement.</p>
                <p>Montant total : <strong>${orderData.total_ttc.toFixed(2)}€</strong></p>
                <p>Veuillez effectuer le virement avec le motif <strong>#${orderId}</strong>.</p>
                <hr/>
                <p>Note: Cet email a été envoyé à l'administration (${ADMIN_EMAIL}) comme demandé.</p>
              </div>
            `
          });

          // Send notification email to admin
          await resend.emails.send({
            from: "Alertes Appiotti <onboarding@resend.dev>",
            to: [ADMIN_EMAIL],
            subject: `NOUVELLE COMMANDE - ${orderId}`,
            html: `
              <div style="font-family: sans-serif; padding: 20px;">
                <h1>Nouvelle commande reçue !</h1>
                <p>ID: <strong>${orderId}</strong></p>
                <p>Client: ${user.firstName} ${user.lastName} (${user.email})</p>
                <p>Total: ${orderData.total_ttc.toFixed(2)}€</p>
                <h3>Produits:</h3>
                <ul>
                  ${orderData.items.map((item: any) => `<li>${item.name} x${item.quantity}</li>`).join('')}
                </ul>
              </div>
            `
          });
          console.log("[POST /api/orders] Emails sent successfully");
        } catch (emailErr: any) {
          console.error("[POST /api/orders] Resend error:", emailErr.message);
          // Don't fail the order if email fails, but log it
        }
      }

      // Return the order data so frontend can store it in localStorage
      return res.json({
        ...orderData,
        totalTTC: orderData.total_ttc,
        proofUploaded: orderData.proof_uploaded,
        createdAt: new Date().toISOString()
      });
    } catch (e: any) {
      console.error("[POST /api/orders] Unexpected error:", e.message);
      return res.status(500).json({ error: "Erreur interne lors du traitement de la commande" });
    }
  });

  app.get("/api/orders/my", async (req, res) => {
    const user = await getAuthUser(req);
    if (!user) return res.status(401).json({ error: "Authentification requise" });
    
    try {
      const { data, error } = await supabase
        .from("orders")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      
      res.json(data.map((o: any) => ({
        ...o,
        totalTTC: o.total_ttc,
        proofUploaded: o.proof_uploaded,
        createdAt: o.created_at
      })));
    } catch (e: any) {
      console.error("Error fetching user orders from Supabase:", e);
      res.status(500).json({ error: "Erreur lors du chargement de vos commandes" });
    }
  });

  // Admin Routes
  app.get("/api/admin/orders", async (req, res) => {
    const user = await getAuthUser(req);
    if (!user?.isAdmin) return res.status(403).json({ error: "Accès refusé" });
    
    try {
      const { data, error } = await supabase
        .from("orders")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      
      // Map to frontend expected format
      res.json(data.map((o: any) => ({
        ...o,
        totalTTC: o.total_ttc,
        proofUploaded: o.proof_uploaded,
        createdAt: o.created_at
      })));
    } catch (e: any) {
      console.error("Error fetching orders from Supabase:", e);
      res.status(500).json({ error: "Erreur lors du chargement des commandes" });
    }
  });

  app.patch("/api/admin/orders/:id/status", async (req, res) => {
    const user = await getAuthUser(req);
    if (!user?.isAdmin) return res.status(403).json({ error: "Accès refusé" });
    
    const { status } = req.body;
    const { id } = req.params;
    
    try {
      const { error } = await supabase
        .from("orders")
        .update({ status })
        .eq("id", id);

      if (error) throw error;
      res.json({ success: true });
    } catch (e: any) {
      console.error("Error updating order status in Supabase:", e);
      res.status(500).json({ error: "Erreur lors de la mise à jour du statut" });
    }
  });

  app.get("/api/admin/users", async (req, res) => {
    const user = await getAuthUser(req);
    if (!user?.isAdmin) return res.status(403).json({ error: "Accès refusé" });
    
    if (!supabase) return res.json([]);
    
    try {
      const { data: { users }, error } = await supabase.auth.admin.listUsers();
      if (error) throw error;
      
      res.json(users.map((u: any) => ({
        id: u.id,
        email: u.email,
        firstName: u.user_metadata?.firstName || "",
        lastName: u.user_metadata?.lastName || "",
        createdAt: u.created_at,
        lastSignIn: u.last_sign_in_at
      })));
    } catch (e: any) {
      console.error("Error listing users:", e);
      res.status(500).json({ error: "Erreur lors du chargement des utilisateurs" });
    }
  });

  app.get("/api/reviews", async (req, res) => {
    res.json(readReviews());
  });

  app.delete("/api/admin/reviews/:id", async (req, res) => {
    const user = await getAuthUser(req);
    if (!user?.isAdmin) return res.status(403).json({ error: "Accès refusé" });
    
    const { id } = req.params;
    if (deleteReview(id)) {
      res.json({ success: true });
    } else {
      res.status(404).json({ error: "Avis non trouvé" });
    }
  });

  app.get("/api/products", async (req, res) => {
    try {
      res.json(readProducts());
    } catch (e: any) {
      console.error("[GET /api/products] Error:", e.message);
      res.status(500).json({ error: "Erreur lors de la lecture des produits" });
    }
  });

  app.get("/api/admin/products", async (req, res) => {
    const user = await getAuthUser(req);
    if (!user?.isAdmin) return res.status(403).json({ error: "Accès refusé" });
    res.json(readProducts());
  });

  app.patch("/api/admin/products/:id", async (req, res) => {
    const user = await getAuthUser(req);
    if (!user?.isAdmin) return res.status(403).json({ error: "Accès refusé" });
    
    const { id } = req.params;
    if (updateProduct(id, req.body)) {
      res.json({ success: true });
    } else {
      res.status(404).json({ error: "Produit non trouvé" });
    }
  });

  // Proof upload route - Stateless: only sends email
  app.post("/api/orders/:id/proof-stateless", async (req, res) => {
    const { proofBase64, fileName } = req.body;
    const orderId = req.params.id;
    let proofUrl = "";

    // Save proof to public/uploads/proofs if base64 is provided
    if (proofBase64) {
      try {
        const uploadDir = path.join(process.cwd(), "public", "uploads", "proofs");
        if (!fs.existsSync(uploadDir)) {
          fs.mkdirSync(uploadDir, { recursive: true });
        }
        
        const ext = fileName ? path.extname(fileName) : ".png";
        const newFileName = `proof-${orderId}-${Date.now()}${ext}`;
        const filePath = path.join(uploadDir, newFileName);
        
        fs.writeFileSync(filePath, Buffer.from(proofBase64, "base64"));
        proofUrl = `/uploads/proofs/${newFileName}`;
      } catch (e) {
        console.error("Error saving proof file:", e);
      }
    }

    // Also update persistence if possible
    try {
      const { error } = await supabase
        .from("orders")
        .update({
          proof_uploaded: true,
          proof_url: proofUrl,
          status: "Preuve soumise"
        })
        .eq("id", orderId);

      if (error) throw error;
    } catch (e) {
      console.error("Error updating proof status in Supabase:", e);
    }

    if (resend) {
      try {
        await resend.emails.send({
          from: "Alertes Appiotti <onboarding@resend.dev>",
          to: [ADMIN_EMAIL],
          subject: `PREUVE DE VIREMENT - Commande ${orderId}`,
          html: `<p>Une preuve de virement a été soumise pour la commande #${orderId}.</p>`,
          attachments: proofBase64 ? [
            {
              filename: fileName || "preuve.png",
              content: proofBase64,
            }
          ] : []
        });
        res.json({ success: true });
      } catch (err) {
        res.status(500).json({ error: "Erreur lors de l'envoi de la preuve" });
      }
    } else {
      res.status(500).json({ error: "Service d'email non configuré" });
    }
  });

  // Global Error Handler
  app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error("[GLOBAL ERROR HANDLER]:", err);
    res.status(500).json({ 
      error: "Erreur serveur critique", 
      details: err.message
    });
  });

  // Serve static files from public/uploads
  const uploadsPath = path.join(process.cwd(), "public", "uploads");
  if (!fs.existsSync(uploadsPath)) {
    fs.mkdirSync(uploadsPath, { recursive: true });
  }
  app.use("/uploads", express.static(uploadsPath));

  // Vite middleware
  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { 
        middlewareMode: true,
        watch: {
          ignored: ["**/data/*.json", "**/public/uploads/**", "**/server.ts"]
        }
      },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist", "public");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  const PORT = process.env.PORT || 3000;
  try {
    app.listen(Number(PORT), "0.0.0.0", () => {
      console.log(`[Startup] Server successfully started and listening on http://0.0.0.0:${PORT}`);
      console.log(`[Startup] NODE_ENV: ${process.env.NODE_ENV}`);
    });
  } catch (err) {
    console.error(`[Startup] Failed to listen on port ${PORT}:`, err);
    process.exit(1);
  }
}

console.log("[Startup] Calling startServer()...");
startServer().catch(err => {
  console.error("[Startup] UNHANDLED ERROR IN startServer():", err);
});

export default app;
