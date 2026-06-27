import "dotenv/config";
import express from "express";
import cors from "cors";
import path from "path";
import fs from "fs";
import { createClient } from "@supabase/supabase-js";
import { Resend } from "resend";
import ws from "ws";

const APP_ROOT = process.cwd();
console.log(`[Startup] APP_ROOT: ${APP_ROOT}`);

// Helper to clean environment variables (extremely aggressive)
const cleanEnv = (val: string | undefined) => {
  if (!val) return "";
  let s = val.trim();
  
  // If it's a URL, find the first 'http' and take everything until a space or quote
  if (s.includes("http")) {
    const match = s.match(/https?:\/\/[^\s'"`]+/);
    if (match) return match[0];
  }
  
  // For keys or other values, remove all quotes, backticks, and whitespace
  return s.replace(/['"`\s\u200B-\u200D\uFEFF]+/g, '');
};

const BUILD_ID = "v3.7-perf-images"; // To verify deployment status

// Initialize Supabase
let supabaseUrl = cleanEnv(process.env.VITE_SUPABASE_URL);
if (supabaseUrl.endsWith("/")) supabaseUrl = supabaseUrl.slice(0, -1);
const supabaseServiceKey = cleanEnv(process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY);

let supabase: any = null;
let supabaseInitError: string | null = null;

if (supabaseUrl && supabaseUrl.startsWith("http")) {
  try {
    console.log(`[Startup] Attempting to initialize Supabase with URL: ${supabaseUrl.substring(0, 15)}...`);
    supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
        detectSessionInUrl: false
      },
      global: {
        fetch: (url, options) => fetch(url, options),
      },
      realtime: {
        transport: ws,
      }
    });
    
    if (supabase) {
      console.log("[Startup] Supabase object created successfully");
    } else {
      supabaseInitError = "createClient returned null";
      console.error("[Startup] createClient returned null");
    }
    
    // Masked logs for verification in Railway console
    const maskedUrl = supabaseUrl.substring(0, 15) + "...";
    const maskedKey = supabaseServiceKey.substring(0, 10) + "..." + supabaseServiceKey.substring(supabaseServiceKey.length - 5);
    console.log(`[Startup] Supabase initialized. URL: ${maskedUrl}, Key: ${maskedKey}`);
    
    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
      console.warn("[Startup] WARNING: SUPABASE_SERVICE_ROLE_KEY is missing. Using ANON_KEY for server-side auth. This may fail for getUser().");
    }
  } catch (err: any) {
    supabaseInitError = err.message;
    console.error("[Startup] Failed to initialize Supabase:", err);
  }
} else {
  supabaseInitError = "URL missing or doesn't start with http";
  console.error(`[Startup] CRITICAL: Supabase URL is invalid or missing. Starts with: "${supabaseUrl.substring(0, 10)}..."`);
}

// Initialize Resend
const resendApiKey = cleanEnv(process.env.RESEND_API_KEY);
const resend = resendApiKey ? new Resend(resendApiKey) : null;
if (!resendApiKey) console.warn("RESEND_API_KEY is missing. Emails will not be sent.");

const ADMIN_EMAIL = cleanEnv(process.env.ADMIN_EMAIL || "primeorbitmarkets@gmail.com").toLowerCase();
const ORDERS_RECIPIENT = "primeorbitmarkets@gmail.com"; // Specific email for receiving orders

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

const getAuthUser = async (req: express.Request) => {
  if (!supabase) {
    (req as any).authError = "Supabase non initialisé sur le serveur";
    return null;
  }
  
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    (req as any).authError = "Header Authorization manquant";
    return null;
  }
  
  const token = authHeader.split(" ")[1];
  if (!token || token === "null" || token === "undefined") {
    (req as any).authError = `Token invalide ou vide: ${token}`;
    return null;
  }
  
  try {
    const { data: { user }, error } = await supabase.auth.getUser(token);
    
    if (error || !user) {
      console.error(`[Auth] getUser failed for ${req.method} ${req.url}:`, error?.message || "No user");
      (req as any).authError = error?.message || "Utilisateur introuvable pour ce token";
      return null;
    }
    
    const email = user.email?.toLowerCase().trim() || "";
    const adminEmails = [
      (process.env.ADMIN_EMAIL || "primeorbitmarkets@gmail.com").toLowerCase().trim(),
      "askipas62@gmail.com",
      "primeorbitmarkets@gmail.com",
      "admin@appiotti.com",
      "herve@appiotti.com"
    ];
    
    const isAdmin = adminEmails.includes(email);
    
    if (isAdmin) {
      console.log(`[Auth] SUCCESS: Admin verified: ${email}`);
    } else {
      console.log(`[Auth] SUCCESS: User verified: ${email}`);
      if (req.url.includes("/admin/")) {
        console.warn(`[Auth] 403: User ${email} is NOT in whitelist:`, adminEmails);
      }
    }
    
    return {
      id: user.id,
      email: user.email,
      isAdmin,
      firstName: user.user_metadata?.firstName || "",
      lastName: user.user_metadata?.lastName || ""
    };
  } catch (e: any) {
    console.error("[Auth] Exception during getUser:", e.message);
    (req as any).authError = `Erreur interne auth: ${e.message}`;
    return null;
  }
};

const app = express();

async function startServer() {
  app.use(express.json({ limit: "10mb" }));
  
  // Robust CORS configuration
  app.use(cors({
    origin: true,
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
      VITE_SUPABASE_URL: cleanEnv(process.env.VITE_SUPABASE_URL),
      VITE_SUPABASE_ANON_KEY: cleanEnv(process.env.VITE_SUPABASE_ANON_KEY),
      NODE_ENV: process.env.NODE_ENV
    };
    res.setHeader("Content-Type", "application/javascript");
    res.send(`window.env = ${JSON.stringify(config)};`);
  });

  // Health check
  app.get("/api/health", (req, res) => {
    res.json({ 
      status: "ok", 
      version: BUILD_ID,
      time: new Date().toISOString(),
      env: process.env.NODE_ENV,
      hasSupabase: !!supabase,
      supabaseError: supabaseInitError,
      hasResend: !!resend,
      adminEmailConfig: ADMIN_EMAIL,
      configCheck: {
        urlStart: supabaseUrl.substring(0, 25),
        urlCodes: Array.from(supabaseUrl.substring(0, 5)).map(c => c.charCodeAt(0)),
        keyLength: supabaseServiceKey.length,
        isServiceKey: supabaseServiceKey.length > 100
      }
    });
  });

  app.get("/api/auth/me", async (req, res) => {
    try {
      const user = await getAuthUser(req);
      if (!user) {
        return res.status(401).json({ 
          authenticated: false, 
          error: "Non authentifié",
          debug: (req as any).authError
        });
      }
      res.json({ authenticated: true, user });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  // Orders Routes - SUPABASE VERSION
  app.post("/api/orders", async (req, res) => {
    console.log("[POST /api/orders] Processing order (Supabase mode)");
    
    try {
      const user = await getAuthUser(req);
      if (!user) {
        console.warn("[POST /api/orders] No user found for token");
        return res.status(401).json({ 
          error: "Authentification requise",
          debug: (req as any).authError 
        });
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

      // Compute derived values for emails
      const totalHT = orderData.items.reduce((sum: number, item: any) => sum + (item.priceHT || 0) * item.quantity, 0);
      const tva = orderData.total_ttc - totalHT;
      const now = new Date().toLocaleString("fr-FR", { timeZone: "Europe/Paris" });

      const emailBaseStyle = `font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; padding: 20px; max-width: 640px; margin: 0 auto; background: #ffffff;`;
      const emailHeaderStyle = `background: linear-gradient(135deg, #1B1B2F, #2a2a4a); color: #fff; padding: 24px; border-radius: 16px 16px 0 0; text-align: center;`;
      const tableStyle = `width: 100%; border-collapse: collapse; margin: 16px 0; font-size: 13px;`;
      const thStyle = `background: #f8f8f8; text-align: left; padding: 10px 12px; font-size: 11px; text-transform: uppercase; letter-spacing: 0.05em; color: #666; border-bottom: 2px solid #eee;`;
      const tdStyle = `padding: 10px 12px; border-bottom: 1px solid #f0f0f0;`;
      const totalRowStyle = `font-weight: 700; font-size: 14px;`;
      const grandTotalStyle = `font-weight: 900; font-size: 16px; color: #FF6B35;`;

      const itemsTable = `
        <table style="${tableStyle}">
          <thead>
            <tr>
              <th style="${thStyle}">Produit</th>
              <th style="${thStyle}">Catégorie</th>
              <th style="${thStyle}">Option</th>
              <th style="${thStyle}">Qté</th>
              <th style="${thStyle}">Prix HT</th>
              <th style="${thStyle}">Prix TTC</th>
              <th style="${thStyle}">Sous-total HT</th>
              <th style="${thStyle}">Sous-total TTC</th>
            </tr>
          </thead>
          <tbody>
            ${orderData.items.map((item: any) => {
              const itemPriceHT = item.priceHT || 0;
              const itemPriceTTC = itemPriceHT * 1.2;
              const subHT = itemPriceHT * item.quantity;
              const subTTC = itemPriceTTC * item.quantity;
              return `<tr>
                <td style="${tdStyle}"><strong>${item.name}</strong></td>
                <td style="${tdStyle}">${item.category || '-'}</td>
                <td style="${tdStyle}">${item.selectedOption || '-'}</td>
                <td style="${tdStyle}">x${item.quantity}</td>
                <td style="${tdStyle}">${itemPriceHT.toFixed(2)}€</td>
                <td style="${tdStyle}">${itemPriceTTC.toFixed(2)}€</td>
                <td style="${tdStyle}">${subHT.toFixed(2)}€</td>
                <td style="${tdStyle}">${subTTC.toFixed(2)}€</td>
              </tr>`;
            }).join('')}
          </tbody>
        </table>
        <div style="margin-top: 8px; text-align: right;">
          <p style="margin: 4px 0; font-size: 13px;">Total HT : <strong>${totalHT.toFixed(2)}€</strong></p>
          <p style="margin: 4px 0; font-size: 13px;">TVA (20%) : <strong>${tva.toFixed(2)}€</strong></p>
          <p style="${grandTotalStyle} margin: 8px 0 0; padding-top: 8px; border-top: 2px solid #eee;">Total TTC : <strong>${orderData.total_ttc.toFixed(2)}€</strong></p>
        </div>`;

      const clientBlock = `
        <div style="margin: 16px 0; padding: 16px; background: #f9f9f9; border-radius: 12px; font-size: 13px;">
          <p style="margin: 4px 0;"><strong>Client :</strong> ${user.firstName} ${user.lastName}</p>
          <p style="margin: 4px 0;"><strong>Email :</strong> ${user.email}</p>
          <p style="margin: 4px 0;"><strong>ID client :</strong> ${user.id}</p>
          <p style="margin: 4px 0;"><strong>Date :</strong> ${now}</p>
          <p style="margin: 4px 0;"><strong>Statut :</strong> ${orderData.status}</p>
        </div>`;

      if (resend) {
        console.log(`[POST /api/orders] Sending confirmation emails...`);
        try {
          // Email #1: Confirmation (customer + admin)
          await resend.emails.send({
            from: "Appiotti <onboarding@resend.dev>",
            to: [user.email, ORDERS_RECIPIENT],
            subject: `Confirmation de commande #${orderId}`,
            html: `
              <div style="${emailBaseStyle}">
                <div style="${emailHeaderStyle}">
                  <h1 style="margin: 0; font-size: 22px;">🛍️ Merci pour votre commande !</h1>
                  <p style="margin: 8px 0 0; opacity: 0.8;">Récapitulatif complet de votre commande</p>
                </div>
                <div style="padding: 20px;">
                  <p style="font-size: 13px; color: #555;">Bonjour <strong>${user.firstName}</strong>,</p>
                  <p style="font-size: 13px; color: #555;">Votre commande a bien été enregistrée. Vous trouverez ci-dessous tous les détails.</p>
                  ${clientBlock}
                  <h3 style="margin: 20px 0 8px; font-size: 15px;">Détail des articles</h3>
                  ${itemsTable}
                  <div style="margin: 24px 0; padding: 16px; background: #fff8f0; border: 2px solid #FF6B35; border-radius: 12px; text-align: center;">
                    <p style="margin: 0 0 8px; font-size: 13px; font-weight: 700;">📋 Instructions de paiement</p>
                    <p style="margin: 4px 0; font-size: 13px;">Effectuez votre virement de <strong style="color: #FF6B35;">${orderData.total_ttc.toFixed(2)}€</strong> avec le motif :</p>
                    <p style="margin: 8px 0; font-size: 20px; font-weight: 900; color: #FF6B35; letter-spacing: 2px;">#${orderId}</p>
                    <p style="margin: 4px 0; font-size: 12px; color: #888;">à l'ordre de <strong>MONSIEUR HERVÉ APPIOTTI</strong></p>
                    <p style="margin: 4px 0; font-size: 12px; color: #888;">IBAN : FR76 1234 5678 9012 3456 7890 123</p>
                    <p style="margin: 4px 0; font-size: 12px; color: #888;">BIC : APPIFR2X</p>
                  </div>
                  <p style="font-size: 12px; color: #999; text-align: center;">Une fois le virement effectué, téléchargez votre preuve depuis votre espace client.</p>
                </div>
              </div>
            `
          });

          // Email #2: Detailed notification to admin
          await resend.emails.send({
            from: "Alertes Appiotti <onboarding@resend.dev>",
            to: [ORDERS_RECIPIENT],
            subject: `NOUVELLE COMMANDE - ${orderId}`,
            html: `
              <div style="${emailBaseStyle}">
                <div style="${emailHeaderStyle}">
                  <h1 style="margin: 0; font-size: 22px;">🆕 Nouvelle commande reçue</h1>
                  <p style="margin: 8px 0 0; opacity: 0.8;">${orderId}</p>
                </div>
                <div style="padding: 20px;">
                  ${clientBlock}
                  <h3 style="margin: 20px 0 8px; font-size: 15px;">Détail des articles</h3>
                  ${itemsTable}
                  <div style="margin: 20px 0; padding: 12px; background: #fff0e6; border-radius: 8px; font-size: 13px; text-align: center;">
                    <strong>📌 Note :</strong> Cette commande est en attente de virement. Le client doit envoyer sa preuve de paiement.
                  </div>
                </div>
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
    try {
      const user = await getAuthUser(req);
      if (!user) {
        return res.status(401).json({ 
          error: "Authentification requise",
          debug: (req as any).authError 
        });
      }
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
    try {
      const user = await getAuthUser(req);
      if (!user?.isAdmin) {
        return res.status(403).json({ 
          error: "Accès refusé",
          debug: (req as any).authError || "L'utilisateur n'est pas un administrateur"
        });
      }
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

      // Send status update email to customer
      if (resend) {
        const { data: order } = await supabase
          .from("orders")
          .select("user_id, items, total_ttc")
          .eq("id", id)
          .single();

        if (order?.user_id) {
          const { data: { user: customer } } = await supabase.auth.admin.getUser(order.user_id);
          const customerEmail = customer?.email;

          if (customerEmail) {
            const statusLabels: Record<string, string> = {
              "Validee": "✅ Commande validée",
              "Expédiée": "📦 Commande expédiée",
              "Refusee": "❌ Commande refusée",
              "Livrée": "✅ Commande livrée",
            };
            const statusIcons: Record<string, string> = {
              "Validee": "✅",
              "Expédiée": "📦",
              "Refusee": "❌",
              "Livrée": "✅",
            };
            const statusMessages: Record<string, string> = {
              "Validee": "Votre commande a été validée. Nous préparons votre colis.",
              "Expédiée": "Votre commande a été expédiée ! Vous recevrez bientôt votre colis.",
              "Refusee": "Malheureusement, votre commande a été refusée. Contactez-nous pour plus d'informations.",
              "Livrée": "Votre commande a été livrée. Nous espérons que vous êtes satisfait !",
            };

            await resend.emails.send({
              from: "Appiotti <onboarding@resend.dev>",
              to: [customerEmail],
              subject: `${statusIcons[status] || '📋'} Mise à jour de votre commande #${id}`,
              html: `
                <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; padding: 20px; max-width: 640px; margin: 0 auto; background: #ffffff;">
                  <div style="background: linear-gradient(135deg, #1B1B2F, #2a2a4a); color: #fff; padding: 24px; border-radius: 16px 16px 0 0; text-align: center;">
                    <h1 style="margin: 0; font-size: 22px;">${statusLabels[status] || 'Mise à jour commande'}</h1>
                    <p style="margin: 8px 0 0; opacity: 0.8;">Commande <strong>#${id}</strong></p>
                  </div>
                  <div style="padding: 20px;">
                    <p style="font-size: 13px; color: #555;">Bonjour,</p>
                    <p style="font-size: 13px; color: #555;">${statusMessages[status] || `Le statut de votre commande a été mis à jour : ${status}`}</p>
                    <div style="margin: 24px 0; padding: 16px; background: #f9f9f9; border-radius: 12px; text-align: center; font-size: 13px;">
                      <p style="margin: 0;"><strong>Nouveau statut :</strong> <span style="color: #FF6B35;">${status}</span></p>
                    </div>
                    <p style="font-size: 12px; color: #999; text-align: center;">Suivez vos commandes depuis votre espace client.</p>
                  </div>
                </div>
              `
            });
          }
        }
      }

      res.json({ success: true });
    } catch (e: any) {
      console.error("Error updating order status in Supabase:", e);
      res.status(500).json({ error: "Erreur lors de la mise à jour du statut" });
    }
  });

  app.get("/api/admin/users", async (req, res) => {
    try {
      const user = await getAuthUser(req);
      if (!user?.isAdmin) {
        return res.status(403).json({ 
          error: "Accès refusé",
          debug: (req as any).authError || "L'utilisateur n'est pas un administrateur"
        });
      }
      
      if (!supabase) return res.json([]);
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
      let products = readProducts();
      const { category, q, minPrice, maxPrice } = req.query as Record<string, string | undefined>;

      if (category) {
        products = products.filter((p: any) => p.category === category);
      }
      if (q) {
        const query = q.toLowerCase();
        products = products.filter(
          (p: any) =>
            p.name?.toLowerCase().includes(query) ||
            p.desc?.toLowerCase().includes(query) ||
            p.category?.toLowerCase().includes(query)
        );
      }
      if (minPrice) {
        const min = parseFloat(minPrice);
        if (!isNaN(min)) {
          products = products.filter((p: any) => p.priceHT * 1.2 >= min);
        }
      }
      if (maxPrice) {
        const max = parseFloat(maxPrice);
        if (!isNaN(max)) {
          products = products.filter((p: any) => p.priceHT * 1.2 <= max);
        }
      }

      res.json(products);
    } catch (e: any) {
      console.error("[GET /api/products] Error:", e.message);
      res.status(500).json({ error: "Erreur lors de la lecture des produits" });
    }
  });

  app.get("/api/products/:id", async (req, res) => {
    try {
      const products = readProducts();
      const product = products.find((p: any) => p.id === req.params.id);
      if (!product) return res.status(404).json({ error: "Produit non trouvé" });
      res.json(product);
    } catch (e: any) {
      console.error("[GET /api/products/:id] Error:", e.message);
      res.status(500).json({ error: "Erreur lors de la lecture du produit" });
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

    const user = await getAuthUser(req);
    const clientInfo = user ? `${user.firstName} ${user.lastName} (${user.email})` : "Client inconnu";

    console.log(`[ProofUpload] Processing proof for order ${orderId} from ${clientInfo}`);

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
        console.log(`[ProofUpload] File saved locally at: ${proofUrl}`);
      } catch (e) {
        console.error("[ProofUpload] Error saving proof file:", e);
      }
    }

    // Update persistence
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
      console.log(`[ProofUpload] Supabase status updated for ${orderId}`);
    } catch (e) {
      console.error("[ProofUpload] Error updating proof status in Supabase:", e);
    }

    // Fetch full order data for the email
    let orderDataForEmail: any = null;
    try {
      const { data } = await supabase.from("orders").select("*").eq("id", orderId).single();
      orderDataForEmail = data;
    } catch (e) {
      console.error("[ProofUpload] Could not fetch order data:", e);
    }

    if (resend) {
      try {
        console.log(`[ProofUpload] Sending proof email to ${ORDERS_RECIPIENT} for order ${orderId}...`);

        // Build items table if order data is available
        let itemsTableHtml = '';
        if (orderDataForEmail?.items?.length) {
          const items = orderDataForEmail.items;
          const totalHT = items.reduce((sum: number, item: any) => sum + (item.priceHT || 0) * item.quantity, 0);
          const totalTTC = orderDataForEmail.total_ttc || totalHT * 1.2;
          const tva = totalTTC - totalHT;
          const tableStyle = `width: 100%; border-collapse: collapse; margin: 16px 0; font-size: 13px;`;
          const thStyle = `background: #f8f8f8; text-align: left; padding: 10px 12px; font-size: 11px; text-transform: uppercase; letter-spacing: 0.05em; color: #666; border-bottom: 2px solid #eee;`;
          const tdStyle = `padding: 10px 12px; border-bottom: 1px solid #f0f0f0;`;

          itemsTableHtml = `
            <table style="${tableStyle}">
              <thead>
                <tr>
                  <th style="${thStyle}">Produit</th>
                  <th style="${thStyle}">Option</th>
                  <th style="${thStyle}">Qté</th>
                  <th style="${thStyle}">Prix HT</th>
                  <th style="${thStyle}">Sous-total HT</th>
                  <th style="${thStyle}">Sous-total TTC</th>
                </tr>
              </thead>
              <tbody>
                ${items.map((item: any) => {
                  const itemPriceHT = item.priceHT || 0;
                  const subHT = itemPriceHT * item.quantity;
                  const subTTC = subHT * 1.2;
                  return `<tr>
                    <td style="${tdStyle}"><strong>${item.name}</strong></td>
                    <td style="${tdStyle}">${item.selectedOption || '-'}</td>
                    <td style="${tdStyle}">x${item.quantity}</td>
                    <td style="${tdStyle}">${itemPriceHT.toFixed(2)}€</td>
                    <td style="${tdStyle}">${subHT.toFixed(2)}€</td>
                    <td style="${tdStyle}">${subTTC.toFixed(2)}€</td>
                  </tr>`;
                }).join('')}
              </tbody>
            </table>
            <div style="margin-top: 8px; text-align: right;">
              <p style="margin: 4px 0; font-size: 13px;">Total HT : <strong>${totalHT.toFixed(2)}€</strong></p>
              <p style="margin: 4px 0; font-size: 13px;">TVA (20%) : <strong>${tva.toFixed(2)}€</strong></p>
              <p style="font-weight: 900; font-size: 16px; color: #FF6B35; margin: 8px 0 0; padding-top: 8px; border-top: 2px solid #eee;">Total TTC : <strong>${totalTTC.toFixed(2)}€</strong></p>
            </div>`;
        }

        // Email to admin with proof attachment
        await resend.emails.send({
          from: "Alertes Appiotti <onboarding@resend.dev>",
          to: [ORDERS_RECIPIENT],
          subject: `PREUVE DE VIREMENT - Commande ${orderId}`,
          html: `
            <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; padding: 20px; max-width: 640px; margin: 0 auto; background: #ffffff;">
              <div style="background: linear-gradient(135deg, #FF6B35, #ff8c42); color: #fff; padding: 24px; border-radius: 16px 16px 0 0; text-align: center;">
                <h1 style="margin: 0; font-size: 22px;">✅ Nouvelle preuve de virement</h1>
                <p style="margin: 8px 0 0; opacity: 0.9;">Commande <strong>#${orderId}</strong></p>
              </div>
              <div style="padding: 20px;">
                <div style="margin: 0 0 16px; padding: 16px; background: #f9f9f9; border-radius: 12px; font-size: 13px;">
                  <p style="margin: 4px 0;"><strong>Client :</strong> ${clientInfo}</p>
                  <p style="margin: 4px 0;"><strong>Date de soumission :</strong> ${new Date().toLocaleString("fr-FR", { timeZone: "Europe/Paris" })}</p>
                  <p style="margin: 4px 0;"><strong>Statut :</strong> Preuve soumise</p>
                  ${orderDataForEmail ? `<p style="margin: 4px 0;"><strong>Date de commande :</strong> ${new Date(orderDataForEmail.created_at || orderDataForEmail.createdAt).toLocaleString("fr-FR", { timeZone: "Europe/Paris" })}</p>` : ''}
                </div>
                ${itemsTableHtml ? `
                  <h3 style="margin: 20px 0 8px; font-size: 15px;">Détail de la commande</h3>
                  ${itemsTableHtml}
                ` : `
                  <p style="font-size: 13px; color: #666;">Détails de la commande non disponibles.</p>
                `}
                <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;"/>
                <p style="font-size: 12px; color: #666;">La preuve de virement est jointe à cet email.</p>
              </div>
            </div>
          `,
          attachments: proofBase64 ? [
            {
              filename: fileName || "preuve.png",
              content: proofBase64,
            }
          ] : []
        });

        // Email to customer: acknowledgment of proof receipt
        await resend.emails.send({
          from: "Appiotti <onboarding@resend.dev>",
          to: [user?.email || ORDERS_RECIPIENT],
          subject: `Accusé de réception - Preuve de virement #${orderId}`,
          html: `
            <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; padding: 20px; max-width: 640px; margin: 0 auto; background: #ffffff;">
              <div style="background: linear-gradient(135deg, #1B1B2F, #2a2a4a); color: #fff; padding: 24px; border-radius: 16px 16px 0 0; text-align: center;">
                <h1 style="margin: 0; font-size: 22px;">📄 Preuve de virement reçue</h1>
                <p style="margin: 8px 0 0; opacity: 0.8;">Commande <strong>#${orderId}</strong></p>
              </div>
              <div style="padding: 20px;">
                <p style="font-size: 13px; color: #555;">Bonjour <strong>${user?.firstName || 'Client'}</strong>,</p>
                <p style="font-size: 13px; color: #555;">Nous confirmons la réception de votre preuve de virement pour la commande <strong>#${orderId}</strong>.</p>
                <p style="font-size: 13px; color: #555;">Notre équipe va vérifier votre paiement dans les plus brefs délais. Vous recevrez une notification dès que votre commande sera validée.</p>
                <div style="margin: 24px 0; padding: 16px; background: #f9f9f9; border-radius: 12px; font-size: 13px;">
                  <p style="margin: 4px 0;"><strong>Date de soumission :</strong> ${new Date().toLocaleString("fr-FR", { timeZone: "Europe/Paris" })}</p>
                  <p style="margin: 4px 0;"><strong>Statut :</strong> Preuve soumise - En attente de vérification</p>
                </div>
                <p style="font-size: 12px; color: #999; text-align: center;">Vous pouvez suivre l'évolution de votre commande depuis votre espace client.</p>
              </div>
            </div>
          `
        });

        console.log(`[ProofUpload] Emails sent successfully for order ${orderId}`);
        res.json({ success: true, proofUrl });
      } catch (err: any) {
        console.error("[ProofUpload] Resend error:", err.message);
        res.status(500).json({ error: "Erreur lors de l'envoi de l'email avec la preuve" });
      }
    } else {
      console.warn("[ProofUpload] Resend not configured");
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

    // Cache hashed assets for 1 year (files with hash in name)
    app.use(/\/assets\/.+\.[a-zA-Z0-9]{8}\./, express.static(distPath, {
      maxAge: "365d",
      immutable: true,
      setHeaders: (res) => {
        res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
      }
    }));

    // Cache images for 1 week
    app.use("/images", express.static(path.join(distPath, "images"), {
      maxAge: "7d",
      setHeaders: (res) => {
        res.setHeader("Cache-Control", "public, max-age=604800");
      }
    }));

    // Default static serving with shorter cache
    app.use(express.static(distPath, {
      maxAge: "1h",
      setHeaders: (res, filePath) => {
        if (filePath.endsWith(".html")) {
          res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
        } else if (filePath.endsWith(".js") || filePath.endsWith(".css")) {
          res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
        }
      }
    }));

    // SPA fallback - serve index.html for all other routes
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"), {
        headers: { "Cache-Control": "no-cache, no-store, must-revalidate" }
      });
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
