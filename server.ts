import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import { createServer as createViteServer } from "vite";
import fs from "fs";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import multer from "multer";
import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const JWT_SECRET = process.env.JWT_SECRET || "default_secret";

// Supabase Setup
const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = (supabaseUrl && supabaseServiceKey) 
  ? createClient(supabaseUrl, supabaseServiceKey) 
  : null;

if (!supabase) {
  console.warn("Supabase n'est pas configuré sur le serveur (SUPABASE_URL et SUPABASE_SERVICE_ROLE_KEY manquants).");
}

// Data paths
const DATA_DIR = path.join(__dirname, "data");
const USERS_FILE = path.join(DATA_DIR, "users.json");
const PRODUCTS_FILE = path.join(DATA_DIR, "products.json");
const ORDERS_FILE = path.join(DATA_DIR, "orders.json");
const UPLOADS_DIR = path.join(__dirname, "public", "uploads", "proofs");

// Ensure directories exist
[DATA_DIR, UPLOADS_DIR].forEach((dir) => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

// Helper for DB
const readDB = (file: string) => JSON.parse(fs.readFileSync(file, "utf-8") || "[]");
const writeDB = (file: string, data: any) => fs.writeFileSync(file, JSON.stringify(data, null, 2));

// Initialize files if they don't exist
if (!fs.existsSync(USERS_FILE)) writeDB(USERS_FILE, []);
if (!fs.existsSync(PRODUCTS_FILE)) writeDB(PRODUCTS_FILE, []);
if (!fs.existsSync(ORDERS_FILE)) writeDB(ORDERS_FILE, []);

// Seed Products helper (will be called if products is empty in local DB)
const seedProducts = async () => {
  const products = [
    // ... (products data)
    { id: "bf-1", name: "Baby-foot Classique 2 joueurs", category: "baby-foot", priceHT: 149, stock: 12, badge: "Bestseller", rating: 4.7, desc: "Barres métalliques chromées, terrain MDF, pieds antidérapants. Idéal pour débuter.", image: "/images/products/baby-foot-classique-2-joueurs.jpg" },
    { id: "bf-2", name: "Baby-foot Professionnel 4 joueurs", category: "baby-foot", priceHT: 289, stock: 6, badge: "Premium", rating: 4.9, desc: "Structure acier renforcé, billes liège incluses, plateau verre trempé.", image: "/images/products/baby-foot-professionnel-4-joueurs.jpg" },
    { id: "bf-3", name: "Baby-foot Compact Enfants", category: "baby-foot", priceHT: 89, stock: 18, badge: "Nouveau", rating: 4.5, desc: "Sécurisé, coins arrondis, couleurs vives, pieds stables (3-8 ans).", image: "/images/products/baby-foot-compact-enfants.jpg" },
    { id: "bf-4", name: "Baby-foot Pliable Extérieur", category: "baby-foot", priceHT: 199, stock: 8, badge: "Été", rating: 4.6, desc: "Résistant UV, pliable pour rangement facile, idéal terrasse/jardin.", image: "/images/products/baby-foot-pliable-exterieur.jpg" },
    { id: "bf-5", name: "Kit Accessoires Baby-foot", category: "baby-foot", priceHT: 24.9, stock: 35, badge: "Accessoire", rating: 4.8, desc: "12 billes, 2 poignées de rechange, kit entretien + lubrifiant barres.", image: "/images/products/kit-accessoires-baby-foot.jpg" },
    { id: "bf-6", name: "Baby-foot Vintage Bois", category: "baby-foot", priceHT: 349, stock: 4, badge: "Édition Limitée", rating: 5.0, desc: "Design rétro en bois massif verni, joueurs peints à la main.", image: "/images/products/baby-foot-vintage-bois.jpg" },
    { id: "tp-1", name: "Table de Tennis Intérieur Standard", category: "ping-pong", priceHT: 229, stock: 10, badge: "Bestseller", rating: 4.6, desc: "Plateau 15mm, filet réglable inclus, pliable en 2 moitiés, roulettes.", image: "/images/products/table-de-tennis-interieur-standard.jpg" },
    { id: "tp-2", name: "Table de Tennis Extérieur Premium", category: "ping-pong", priceHT: 349, stock: 5, badge: "Été", rating: 4.8, desc: "Plateau aluminium traité anti-UV, châssis galvanisé, résistante pluie.", image: "/images/products/table-de-tennis-exterieur-premium.jpg" },
    { id: "tp-3", name: "Table de Tennis Professionnelle ITTF", category: "ping-pong", priceHT: 599, stock: 3, badge: "Pro", rating: 5.0, desc: "Certifiée ITTF, plateau 25mm, structure acier, roulettes blocables.", image: "/images/products/table-de-tennis-professionnelle-ittf.jpg" },
    { id: "tp-4", name: "Mini Table de Tennis", category: "ping-pong", priceHT: 49, stock: 22, badge: "Nouveau", rating: 4.4, desc: "Format réduit, pose sur table existante, filet clipsable, raquettes incluses.", image: "/images/products/mini-table-de-tennis.jpg" },
    { id: "tp-5", name: "Set Complet Raquettes + Balles", category: "ping-pong", priceHT: 39.9, stock: 40, badge: "Pack Famille", rating: 4.7, desc: "4 raquettes bois/caoutchouc, 12 balles 3 étoiles, housse transport.", image: "/images/products/set-complet-raquettes-balles.jpg" },
    { id: "tp-6", name: "Robot d'Entraînement Ping-Pong", category: "ping-pong", priceHT: 179, stock: 7, badge: "High-Tech", rating: 4.9, desc: "Lancement automatique, 30 fréquences, réservoir 100 balles.", image: "/images/products/robot-dentrainement-ping-pong.jpg" },
    { id: "bi-1", name: "Table de Billard Américain 7 pieds", category: "billard", priceHT: 799, stock: 4, badge: "Bestseller", rating: 4.8, desc: "Tapis vert professionnel, billes résine complètes, 2 queues incluses.", image: "/images/products/table-de-billard-americain-7-pieds.jpg" },
    { id: "bi-2", name: "Table de Billard Anglais 6 pieds", category: "billard", priceHT: 649, stock: 3, badge: "Premium", rating: 4.7, desc: "Format compact, tapis bleu, pieds réglables, kit accessoires complet.", image: "/images/products/table-de-billard-anglais-6-pieds.jpg" },
    { id: "bi-3", name: "Table de Billard Mixte Pool/Snooker", category: "billard", priceHT: 999, stock: 2, badge: "Exclusif", rating: 5.0, desc: "Convertible, bandes caoutchouc K-66, livraison + montage inclus.", image: "/images/products/table-de-billard-mixte-pool-snooker.jpg" },
    { id: "bi-4", name: "Mini Billard de Salon 4 pieds", category: "billard", priceHT: 299, stock: 8, badge: "Nouveau", rating: 4.5, desc: "Idéal salon, design moderne, bois clair, tapis anthracite.", image: "/images/products/mini-billard-de-salon-4-pieds.jpg" },
    { id: "bi-5", name: "Kit Accessoires Billard Pro", category: "billard", priceHT: 69.9, stock: 20, badge: "Accessoire", rating: 4.6, desc: "2 queues 145cm, triangle, cendrier craie, 16 billes, housse queue.", image: "/images/products/kit-accessoires-billard-pro.jpg" },
    { id: "bi-6", name: "Éclairage Suspension Billard LED", category: "billard", priceHT: 129, stock: 15, badge: "Design", rating: 4.9, desc: "Rampe 3 spots LED réglables, style industriel, portée 140cm.", image: "/images/products/eclairage-suspension-billard-led.jpg" },
    { id: "tr-1", name: "Trampoline Jardin 244cm (8 pieds)", category: "trampoline", priceHT: 199, stock: 14, badge: "Bestseller", rating: 4.7, desc: "Filet de sécurité 180cm, coussinets protection, structure galvanisée.", image: "/images/products/trampoline-jardin-244cm-8-pieds.jpg" },
    { id: "tr-2", name: "Trampoline Jardin 366cm (12 pieds)", category: "trampoline", priceHT: 349, stock: 7, badge: "Famille", rating: 4.8, desc: "Haute capacité (150kg), double filet sécurité, bâche promotion.", image: "/images/products/trampoline-jardin-366cm-12-pieds.jpg" },
    { id: "tr-3", name: "Trampoline Enfant Intérieur 100cm", category: "trampoline", priceHT: 79, stock: 25, badge: "Nouveau", rating: 4.5, desc: "Idéal chambre/salon, barre stabilisatrice, charge max 50kg.", image: "/images/products/trampoline-enfant-interieur-100cm.jpg" },
    { id: "tr-4", name: "Trampoline Fitness Adulte", category: "trampoline", priceHT: 119, stock: 18, badge: "Sport", rating: 4.6, desc: "Diamètre 102cm, barre réglable, 8 ressorts renforcés.", image: "/images/products/trampoline-fitness-adulte.jpg" },
    { id: "tr-5", name: "Trampoline Semi-Enterré 430cm", category: "trampoline", priceHT: 1199, stock: 2, badge: "Premium", rating: 5.0, desc: "Filet affleurant sol, look premium, sécurité maximale.", image: "/images/products/trampoline-semi-enterre-430cm.jpg" },
    { id: "tr-6", name: "Kit Entretien Trampoline", category: "trampoline", priceHT: 49.9, stock: 30, badge: "Accessoire", rating: 4.8, desc: "Bâche hivernage, 8 ressorts rechange, réparation filet.", image: "/images/products/kit-entretien-trampoline.jpg" },
    { id: "ac-1", name: "Pack Accessoires Gaming Complet", category: "accessoires", priceHT: 149, stock: 20, badge: "Pack", rating: 4.8, desc: "Manette premium PS5/Xbox, casque sans fil, support console.", image: "/images/products/pack-accessoires-gaming-complet.jpg" },
    { id: "ac-2", name: "Casque Gaming Sans Fil 7.1 Surround", category: "accessoires", priceHT: 89, stock: 15, badge: "Bestseller", rating: 4.7, desc: "Son surround, micro rétractable, autonomie 20h.", image: "/images/products/casque-gaming-sans-fil-7-1-surround.jpg" },
    { id: "ac-3", name: "Manette Pro PS5 Dualsense Edge", category: "accessoires", priceHT: 109, stock: 12, badge: "Pro", rating: 4.9, desc: "Boutons arrière configurables, sticks interchangeables.", image: "/images/products/manette-pro-ps5-dualsense-edge.jpg" },
    { id: "ac-4", name: "Station de Recharge Double PS5/Xbox", category: "accessoires", priceHT: 34.9, stock: 28, badge: "Pratique", rating: 4.6, desc: "Charge 2 manettes simultanément, LED statut, compacte.", image: "/images/products/station-de-recharge-double-ps5-xbox.jpg" },
    { id: "ac-5", name: "Support Mural Console + Rangement Jeux", category: "accessoires", priceHT: 44.9, stock: 22, badge: "Design", rating: 4.5, desc: "Compatible PS5/Xbox/Switch, rangement 15 jeux.", image: "/images/products/support-mural-console-rangement-jeux.jpg" },
    { id: "ac-6", name: "Tapis de Sol Gaming Anti-Fatigue XL", category: "accessoires", priceHT: 59, stock: 16, badge: "Nouveau", rating: 4.7, desc: "120x60cm, mousse mémoire, impérméable.", image: "/images/products/tapis-de-sol-gaming-anti-fatigue-xl.jpg" },
    { id: "co-1", name: "PlayStation 4 Slim 500Go", category: "consoles", priceHT: 350, stock: 8, badge: "Classique", rating: 4.7, desc: "Console Sony PS4, noire, 1 manette DualShock 4.", image: "/images/products/playstation-4-slim-500go.jpg" },
    { id: "co-2", name: "PlayStation 5 Slim (Lecteur Disque)", category: "consoles", priceHT: 450, stock: 6, badge: "Nouveau", rating: 4.9, desc: "Édition standard 2025, 1To SSD, manette DualSense.", image: "/images/products/playstation-5-slim-lecteur-disque.jpg" },
    { id: "co-3", name: "PlayStation 5 Pro", category: "consoles", priceHT: 700, stock: 3, badge: "Premium", rating: 5.0, desc: "2To SSD, résolution 4K native améliorée, manette Pro.", image: "/images/products/playstation-5-pro.jpg" },
    { id: "co-4", name: "Nintendo Switch OLED", category: "consoles", priceHT: 320, stock: 10, badge: "Bestseller", rating: 4.8, desc: "Écran OLED 7 pouces, Joy-Con blanches, 64Go stockage.", image: "/images/products/nintendo-switch-oled.jpg" },
    { id: "co-5", name: "Nintendo Switch 2", category: "consoles", priceHT: 380, stock: 5, badge: "Nouveauté 2025", rating: 5.0, desc: "Nouvelle génération 2025, rétrocompatible, écran 8\".", image: "/images/products/nintendo-switch-2.jpg" },
    { id: "co-6", name: "Xbox Series X", category: "consoles", priceHT: 450, stock: 7, badge: "High-Tech", rating: 4.8, desc: "1To SSD, 4K/120fps, Game Pass compatible, noir mat.", image: "/images/products/xbox-series-x.jpg" },
  ];
  writeDB(PRODUCTS_FILE, products);
  
  if (supabase) {
    try {
      const { data: existing } = await supabase.from('products').select('id').limit(1);
      if (existing?.length === 0) {
        await supabase.from('products').insert(products.map(p => ({
          id: p.id,
          name: p.name,
          category: p.category,
          priceHT: p.priceHT,
          stock: p.stock,
          badge: p.badge,
          rating: p.rating,
          description: p.desc,
          image: p.image
        })));
        console.log("Supabase products seeded !");
      }
    } catch (err) {
      console.error("Supabase seed error:", err);
    }
  }
};

if (readDB(PRODUCTS_FILE).length === 0) {
  seedProducts().catch(console.error);
}

// Helper for Auth with Supabase
const getAuthUser = async (req: express.Request) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return null;
  const token = authHeader.split(" ")[1];
  if (!token || !supabase) return null;
  
  try {
    const { data: { user }, error } = await supabase.auth.getUser(token);
    if (error || !user) return null;
    
    return {
      id: user.id,
      email: user.email,
      isAdmin: user.email === "askipas62@gmail.com",
      metadata: user.user_metadata
    };
  } catch (e) {
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

  // API Routes
  
  // Auth Routes
  app.post("/api/auth/signup", async (req, res) => {
    const { email, password, firstName, lastName } = req.body;
    const users = readDB(USERS_FILE);
    if (users.find((u: any) => u.email === email)) {
      return res.status(400).json({ error: "Cet email est déjà utilisé." });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const isAdmin = email === "askipas62@gmail.com"; // Admin based on user email or owner
    const newUser = { id: Date.now().toString(), email, password: hashedPassword, firstName, lastName, isAdmin };
    users.push(newUser);
    writeDB(USERS_FILE, users);
    const token = jwt.sign({ userId: newUser.id, isAdmin }, JWT_SECRET);
    res.json({ token, user: { email, firstName, lastName, isAdmin } });
  });

  app.post("/api/auth/login", async (req, res) => {
    const { email, password } = req.body;
    const users = readDB(USERS_FILE);
    const user = users.find((u: any) => u.email === email);
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ error: "Email ou mot de passe incorrect." });
    }
    const token = jwt.sign({ userId: user.id, isAdmin: user.isAdmin }, JWT_SECRET);
    res.json({ token, user: { email: user.email, firstName: user.firstName, lastName: user.lastName, isAdmin: user.isAdmin } });
  });

  app.patch("/api/auth/me", async (req, res) => {
    const user = await getAuthUser(req);
    if (!user) return res.status(401).json({ error: "Non autorisé" });
    
    try {
      // Local DB sync if needed
      const users = readDB(USERS_FILE);
      const userIndex = users.findIndex((u: any) => u.email === user.email);
      
      const { firstName, lastName } = req.body;
      
      // Update metadata in Supabase too
      if (supabase) {
        await supabase.auth.updateUser({
          data: { firstName, lastName }
        });
      }

      if (userIndex !== -1) {
        if (firstName) users[userIndex].firstName = firstName;
        if (lastName) users[userIndex].lastName = lastName;
        writeDB(USERS_FILE, users);
      }

      res.json({ 
        user: { 
          email: user.email, 
          firstName: firstName || user.metadata?.firstName, 
          lastName: lastName || user.metadata?.lastName, 
          isAdmin: user.isAdmin 
        } 
      });
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
      const orders = readDB(ORDERS_FILE);
      const newOrder = {
        id: "ORD-" + Math.random().toString(36).substr(2, 9).toUpperCase(),
        userId: user.id,
        items: req.body.items,
        totalTTC: req.body.totalTTC,
        status: "En attente de virement",
        createdAt: new Date().toISOString(),
        proofUploaded: false
      };
      orders.push(newOrder);
      writeDB(ORDERS_FILE, orders);

      // Sync with Supabase table
      if (supabase) {
        await supabase.from('orders').insert({
          id: newOrder.id,
          user_id: user.id,
          items: newOrder.items,
          total_ttc: newOrder.totalTTC,
          status: newOrder.status
        });
      }

      res.json(newOrder);
    } catch (e) {
      res.status(500).json({ error: "Erreur serveur" });
    }
  });

  app.get("/api/orders/me", async (req, res) => {
    const user = await getAuthUser(req);
    if (!user) return res.status(401).json({ error: "Non autorisé" });
    
    try {
      const orders = readDB(ORDERS_FILE);
      res.json(orders.filter((o: any) => o.userId === user.id));
    } catch (e) {
      res.status(500).json({ error: "Erreur serveur" });
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

      // Sync Supabase status
      if (supabase) {
        await supabase.from('orders')
          .update({ status: "En cours de validation" })
          .eq('id', req.params.id);
      }

      // Send Email to Admin via Resend
      if (process.env.RESEND_API_KEY) {
        const resend = new Resend(process.env.RESEND_API_KEY);
        const adminEmail = process.env.ADMIN_EMAIL || "askipas62@gmail.com";
        const currentOrder = orders[orderIndex];
        const clientName = `${user.metadata?.firstName || ""} ${user.metadata?.lastName || ""}`.trim() || user.email || "Client inconnu";
        const publicProofUrl = req.file 
          ? `${process.env.APP_URL || 'https://ais-dev-chjxbmuc73ccrf33f2vuw2-443319972446.europe-west1.run.app'}${proofUrl}` 
          : null;

        await resend.emails.send({
          from: 'Loisirs Pro <onboarding@resend.dev>',
          to: adminEmail,
          subject: `📦 Nouvelle preuve de paiement - Commande ${currentOrder.id}`,
          attachments: req.file ? [
            {
              filename: req.file.originalname,
              content: fs.readFileSync(req.file.path),
            }
          ] : [],
          html: `
            <div style="font-family: sans-serif; padding: 20px; color: #333;">
              <h1 style="color: #f97316;">Nouvelle preuve de paiement reçue</h1>
              <p>Le client <strong>${clientName}</strong> (${user.email}) vient de téléverser une preuve de paiement pour sa commande.</p>
              
              <div style="background: #f3f4f6; padding: 15px; border-radius: 8px; margin: 20px 0;">
                <h3 style="margin-top: 0;">Détails de la commande</h3>
                <p><strong>Référence :</strong> ${currentOrder.id}</p>
                <p><strong>Montant Total :</strong> ${currentOrder.totalTTC.toLocaleString()} € TTC</p>
                <p><strong>Date :</strong> ${new Date(currentOrder.createdAt).toLocaleString('fr-FR')}</p>
              </div>

              ${publicProofUrl ? `
              <div style="margin: 20px 0; border: 1px solid #e5e7eb; padding: 10px; border-radius: 8px;">
                <h4 style="margin-top: 0;">Preuve de paiement :</h4>
                <img src="${publicProofUrl}" alt="Preuve de paiement" style="max-width: 100%; border-radius: 4px; display: block;" />
                <p style="font-size: 12px; color: #666; margin-top: 10px;">
                  Si l'image ne s'affiche pas, consultez-la en pièce jointe.
                </p>
              </div>
              ` : ''}

              <p>Vous pouvez consulter la preuve et valider la commande depuis votre tableau de bord administrateur.</p>
              <a href="${process.env.APP_URL || 'https://ais-dev-chjxbmuc73ccrf33f2vuw2-443319972446.europe-west1.run.app'}/admin" 
                 style="display: inline-block; background: #111827; color: white; padding: 12px 25px; border-radius: 9999px; text-decoration: none; font-weight: bold; font-size: 14px;">
                Accéder au Dashboard
              </a>
            </div>
          `
        });
      }

      res.json(orders[orderIndex]);
    } catch (e) {
      res.status(500).json({ error: "Erreur serveur" });
    }
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

      // Preparation Supabase sync
      if (supabase) {
        await supabase
          .from('orders')
          .update({ status })
          .eq('id', req.params.id);
      }

      res.json(orders[orderIndex]);
    } catch (e) {
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

  const PORT = 3000;
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running at http://localhost:${PORT}`);
  });
}

startServer();
