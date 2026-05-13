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
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || "";
const supabase = createClient(supabaseUrl, supabaseAnonKey);

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
  
  if (!supabaseUrl || !supabaseAnonKey) {
    console.error("getAuthUser: Supabase URL or Anon Key is missing in environment variables!");
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

// Start Server Logic
async function startServer() {
  const app = express();
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
  app.patch("/api/auth/me", async (req, res) => {
    const authUser = await getAuthUser(req);
    if (!authUser) return res.status(401).json({ error: "Non autorisé" });
    
    try {
      const users = readDB(USERS_FILE);
      const userIndex = users.findIndex((u: any) => u.id === authUser.id);
      
      const { firstName, lastName } = req.body;

      if (userIndex !== -1) {
        users[userIndex].firstName = firstName;
        users[userIndex].lastName = lastName;
        writeDB(USERS_FILE, users);
      } else {
        users.push({
          id: authUser.id,
          email: authUser.email,
          firstName,
          lastName,
          isAdmin: authUser.isAdmin
        });
        writeDB(USERS_FILE, users);
      }

      res.json({ success: true });
    } catch (e) {
      res.status(500).json({ error: "Erreur serveur" });
    }
  });

  // Product Routes
  app.get("/api/products", (req, res) => {
    let products = readDB(PRODUCTS_FILE);
    const { category, minPrice, maxPrice, q } = req.query;
    if (category) products = products.filter((p: any) => p.category === category);
    if (minPrice) products = products.filter((p: any) => p.priceHT * 1.2 >= Number(minPrice));
    if (maxPrice) products = products.filter((p: any) => p.priceHT * 1.2 <= Number(maxPrice));
    if (q) products = products.filter((p: any) => p.name.toLowerCase().includes(String(q).toLowerCase()));
    res.json(products);
  });

  app.get("/api/products/:id", (req, res) => {
    const products = readDB(PRODUCTS_FILE);
    const product = products.find((p: any) => p.id === req.params.id);
    if (!product) return res.status(404).json({ error: "Produit non trouvé" });
    res.json(product);
  });

  // Orders Routes
  app.post("/api/orders", async (req, res) => {
    const user = await getAuthUser(req);
    if (!user) return res.status(401).json({ error: "Non autorisé" });
    
    try {
      console.log("POST /api/orders: starting for user", user.id);
      const orders = readDB(ORDERS_FILE);
      const newOrder = {
        id: req.body.id || ("ORD-" + Math.random().toString(36).substr(2, 9).toUpperCase()),
        userId: user.id,
        items: req.body.items || [],
        totalTTC: req.body.totalTTC || 0,
        status: "En attente de virement",
        createdAt: new Date().toISOString(),
        proofUploaded: false
      };
      
      if (newOrder.items.length === 0) {
        console.warn("POST /api/orders: Order with no items received");
      }

      orders.push(newOrder);
      writeDB(ORDERS_FILE, orders);
      console.log("POST /api/orders: Order saved", newOrder.id);

      // Send confirmation email
      if (resend && user.email) {
        try {
          console.log("POST /api/orders: Attempting email to", user.email);
          const { data, error } = await resend.emails.send({
            from: "Shop <onboarding@resend.dev>",
            to: [user.email],
            subject: `Confirmation de commande ${newOrder.id}`,
            html: `<h1>Merci pour votre commande ${newOrder.id}</h1><p>Total: ${(newOrder.totalTTC || 0).toFixed(2)}€</p><p>Veuillez effectuer le virement pour valider.</p>`
          });
          if (error) console.error("Resend API error:", error);
          else console.log("Email sent successfully:", data?.id);
        } catch (mailErr) {
          console.error("Email send critical error:", mailErr);
        }
      } else {
        console.warn("Resend skipped: no client or no user email", { hasResend: !!resend, email: user.email });
      }

      res.json(newOrder);
    } catch (e: any) {
      console.error("POST /api/orders error:", e);
      res.status(500).json({ 
        error: "Erreur serveur: " + (e.message || "Inconnue"),
        details: e.toString(),
        stack: process.env.NODE_ENV === 'development' ? e.stack : undefined
      });
    }
  });

  app.get("/api/orders/me", async (req, res) => {
    const user = await getAuthUser(req);
    if (!user) return res.status(401).json({ error: "Non autorisé" });
    
    try {
      const orders = readDB(ORDERS_FILE);
      res.json(orders.filter((o: any) => o.userId === user.id));
    } catch (e: any) {
      console.error("GET /api/orders/me error:", e);
      res.status(500).json({ error: "Erreur lors du chargement de vos commandes" });
    }
  });

  app.post("/api/orders/:id/proof", upload.single("proof"), async (req, res) => {
    const user = await getAuthUser(req);
    if (!user) return res.status(401).json({ error: "Non autorisé" });
    
    try {
      const orders = readDB(ORDERS_FILE);
      const orderIndex = orders.findIndex((o: any) => o.id === req.params.id && o.userId === user.id);
      if (orderIndex === -1) return res.status(404).json({ error: "Commande non trouvée" });
      
      const proofUrl = req.file ? `/uploads/proofs/${req.file.filename}` : null;
      orders[orderIndex].proofUploaded = true;
      orders[orderIndex].status = "En cours de validation";
      orders[orderIndex].proofUrl = proofUrl;
      writeDB(ORDERS_FILE, orders);

      // Notify Admin and User
      if (resend) {
        const order = orders[orderIndex];
        try {
          // To User
          if (user.email) {
            await resend.emails.send({
              from: "Appiotti Game Shop <onboarding@resend.dev>",
              to: [user.email],
              subject: `Preuve de virement reçue - Commande ${order.id}`,
              html: `
                <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                  <h2 style="color: #06D6A0;">Preuve bien reçue !</h2>
                  <p>Bonjour ${user.firstName},</p>
                  <p>Nous avons bien reçu votre preuve de virement pour la commande <strong>${order.id}</strong>.</p>
                  <p>Hervé va maintenant vérifier la transaction et préparer votre colis. Vous recevrez un mail dès que le colis sera expédié.</p>
                  <p>Merci de votre patience et de votre confiance.</p>
                </div>
              `
            });
          }

          // To Admin
          await resend.emails.send({
            from: "Appiotti Game Shop Alerts <onboarding@resend.dev>",
            to: [ADMIN_EMAIL],
            subject: `NOUVELLE PREUVE - Commande ${order.id}`,
            html: `
              <div style="font-family: sans-serif; border: 2px solid #FF6B35; padding: 20px; border-radius: 10px;">
                <h1 style="color: #FF6B35;">Alerte Preuve de Virement</h1>
                <p>Client : <strong>${user.firstName} ${user.lastName}</strong> (${user.email})</p>
                <p>Commande : <strong>${order.id}</strong></p>
                <p>Montant : <strong>${order.totalTTC.toFixed(2)}€</strong></p>
                <p>Action requise : Vérifier le virement et valider la commande dans le dashboard admin.</p>
                ${proofUrl ? `<p><a href="${process.env.VITE_APP_URL || ''}${proofUrl}" style="background: #FF6B35; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">Voir la preuve de virement</a></p>` : ''}
              </div>
            `
          });
        } catch (mailErr) {
          console.error("Admin notification mail error:", mailErr);
        }
      }

      res.json(orders[orderIndex]);
    } catch (e) {
      res.status(500).json({ error: "Erreur serveur" });
    }
  });

  // Debug endpoint (restricted to admin)
  app.get("/api/debug/server", async (req, res) => {
    const user = await getAuthUser(req);
    if (!user || !user.isAdmin) return res.status(403).json({ error: "Accès refusé" });
    
    res.json({
      env: {
        hasSupabaseUrl: !!process.env.VITE_SUPABASE_URL,
        hasSupabaseKey: !!process.env.VITE_SUPABASE_ANON_KEY,
        hasResendKey: !!process.env.RESEND_API_KEY,
        adminEmail: process.env.ADMIN_EMAIL || "askipas62@gmail.com",
        nodeEnv: process.env.NODE_ENV
      },
      user,
      files: {
        ordersExist: fs.existsSync(ORDERS_FILE),
        usersExist: fs.existsSync(USERS_FILE)
      }
    });
  });

  // Admin Routes
  app.get("/api/admin/orders", async (req, res) => {
    const user = await getAuthUser(req);
    if (!user || !user.isAdmin) return res.status(403).json({ error: "Accès refusé" });
    
    try {
      const orders = readDB(ORDERS_FILE);
      res.json(orders);
    } catch (e) {
      res.status(500).json({ error: "Erreur serveur" });
    }
  });

  app.patch("/api/admin/orders/:id", async (req, res) => {
    const user = await getAuthUser(req);
    if (!user || !user.isAdmin) return res.status(403).json({ error: "Accès refusé" });
    
    try {
      const orders = readDB(ORDERS_FILE);
      const orderIndex = orders.findIndex((o: any) => o.id === req.params.id);
      if (orderIndex === -1) return res.status(404).json({ error: "Commande non trouvée" });
      
      const { status } = req.body;
      orders[orderIndex].status = status;
      writeDB(ORDERS_FILE, orders);

      // Send status update email to user
      if (resend) {
        const order = orders[orderIndex];
        const users = readDB(USERS_FILE);
        const orderUser = users.find((u: any) => u.id === order.userId);
        
        if (orderUser && orderUser.email) {
          try {
            await resend.emails.send({
              from: "Appiotti Game Shop <onboarding@resend.dev>",
              to: [orderUser.email],
              subject: `Mise à jour de votre commande ${order.id}`,
              html: `
                <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                  <h2 style="color: #FF6B35;">Le statut de votre commande a changé</h2>
                  <p>Bonjour ${orderUser.firstName},</p>
                  <p>Votre commande <strong>${order.id}</strong> est désormais : <strong style="color: #FF6B35; text-transform: uppercase;">${status}</strong></p>
                  ${status === "Expédiée" ? `<p>Votre colis est en route ! Bonne réception.</p>` : ''}
                  ${status === "Validée" ? `<p>Votre virement a été confirmé. Nous préparons votre colis.</p>` : ''}
                  <p>Retrouvez tous les détails dans votre espace client.</p>
                  <p>L'équipe Appiotti Game Shop</p>
                </div>
              `
            });
          } catch (mailErr) {
            console.error("Status update mail error:", mailErr);
          }
        }
      }

      res.json(orders[orderIndex]);
    } catch (e) {
      res.status(500).json({ error: "Erreur serveur" });
    }
  });

  app.get("/api/admin/users", async (req, res) => {
    const user = await getAuthUser(req);
    if (!user || !user.isAdmin) return res.status(403).json({ error: "Accès refusé" });
    
    try {
      const users = readDB(USERS_FILE);
      res.json(users);
    } catch (e) {
      res.status(500).json({ error: "Erreur serveur" });
    }
  });

  app.get("/api/admin/products", async (req, res) => {
    const user = await getAuthUser(req);
    if (!user || !user.isAdmin) return res.status(403).json({ error: "Accès refusé" });
    
    try {
      const products = readDB(PRODUCTS_FILE);
      res.json(products);
    } catch (e) {
      res.status(500).json({ error: "Erreur serveur" });
    }
  });

  app.patch("/api/admin/products/:id", async (req, res) => {
    const user = await getAuthUser(req);
    if (!user || !user.isAdmin) return res.status(403).json({ error: "Accès refusé" });
    
    try {
      const products = readDB(PRODUCTS_FILE);
      const index = products.findIndex((p: any) => p.id === req.params.id);
      if (index === -1) return res.status(404).json({ error: "Produit non trouvé" });
      
      products[index] = { ...products[index], ...req.body };
      writeDB(PRODUCTS_FILE, products);
      res.json(products[index]);
    } catch (e) {
      res.status(500).json({ error: "Erreur serveur" });
    }
  });

  app.delete("/api/admin/products/:id", async (req, res) => {
    const user = await getAuthUser(req);
    if (!user || !user.isAdmin) return res.status(403).json({ error: "Accès refusé" });
    
    try {
      const products = readDB(PRODUCTS_FILE);
      const filtered = products.filter((p: any) => p.id !== req.params.id);
      writeDB(PRODUCTS_FILE, filtered);
      res.json({ success: true });
    } catch (e) {
      res.status(500).json({ error: "Erreur serveur" });
    }
  });

  // Reviews Routes
  app.get("/api/reviews", (req, res) => {
    let reviews = readDB(REVIEWS_FILE);
    const { productId } = req.query;
    if (productId) {
      reviews = reviews.filter((r: any) => r.productId === productId);
    }
    res.json(reviews);
  });

  app.post("/api/reviews", async (req, res) => {
    const user = await getAuthUser(req);
    if (!user) return res.status(401).json({ error: "Non autorisé" });

    const { rating, comment, userName, productId } = req.body;
    const reviews = readDB(REVIEWS_FILE);
    const newReview = {
      id: Date.now().toString(),
      userId: user.id,
      productId: productId || null, // Allow global reviews if no productId
      userName: userName || `${user.firstName} ${user.lastName}`,
      userEmail: user.email,
      rating,
      comment,
      createdAt: new Date().toISOString()
    };
    reviews.push(newReview);
    writeDB(REVIEWS_FILE, reviews);
    res.json(newReview);
  });

  app.delete("/api/reviews/:id", async (req, res) => {
    const user = await getAuthUser(req);
    if (!user || !user.isAdmin) return res.status(403).json({ error: "Accès refusé" });

    const reviews = readDB(REVIEWS_FILE);
    const filteredReviews = reviews.filter((r: any) => r.id !== req.params.id);
    writeDB(REVIEWS_FILE, filteredReviews);
    res.json({ success: true });
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

  const PORT = 3000;
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running at http://localhost:${PORT}`);
  });
}

startServer();
