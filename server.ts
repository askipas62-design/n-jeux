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

// Supabase Server Client (Only for Auth if needed)
const supabaseUrl = process.env.VITE_SUPABASE_URL || "";
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || "";

if (!supabaseUrl) console.warn("[Startup] VITE_SUPABASE_URL is missing!");
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Initialize Resend
const resendApiKey = process.env.RESEND_API_KEY;
const resend = resendApiKey ? new Resend(resendApiKey) : null;
if (!resendApiKey) console.warn("RESEND_API_KEY is missing. Emails will not be sent.");

const ADMIN_EMAIL = "zakaz@forumles.ru";

// Helper for Auth with Supabase
const getAuthUser = async (req: express.Request) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return null;
  const token = authHeader.split(" ")[1];
  if (!token || token === "null" || token === "undefined") return null;
  
  try {
    const { data: { user }, error } = await supabase.auth.getUser(token);
    if (error || !user) return null;
    
    return {
      id: user.id,
      email: user.email,
      isAdmin: user.email === ADMIN_EMAIL,
      firstName: user.user_metadata?.firstName || "",
      lastName: user.user_metadata?.lastName || ""
    };
  } catch (e) {
    return null;
  }
};

const app = express();

async function configureApp() {
  app.use(express.json({ limit: "10mb" }));
  app.use(cors());

  // Health check
  app.get("/api/health", (req, res) => {
    res.json({ 
      status: "ok", 
      time: new Date().toISOString(),
      env: {
        hasResendKey: !!process.env.RESEND_API_KEY
      }
    });
  });

  // Orders Routes - STATLESS VERSION: Only sends email
  app.post("/api/orders", async (req, res) => {
    console.log("[POST /api/orders] Processing order (Stateless mode)");
    
    try {
      const user = await getAuthUser(req);
      const { items, totalTTC, id: customId } = req.body;
      const orderId = customId || ("ORD-" + Math.random().toString(36).substring(2, 11).toUpperCase());
      
      const orderData = {
        id: orderId,
        user_email: user?.email || "Visiteur",
        user_name: user ? `${user.firstName} ${user.lastName}` : "Anonyme",
        items: items || [],
        total_ttc: Number(totalTTC) || 0,
        created_at: new Date().toISOString()
      };

      // Send confirmation email (Stateless version)
      if (resend) {
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
        }).catch(err => console.error("Error sending order email:", err));
      }

      // Send notification email to admin
      if (resend) {
        await resend.emails.send({
          from: "Alertes Appiotti <onboarding@resend.dev>",
          to: [ADMIN_EMAIL],
          subject: `NOUVELLE COMMANDE - ${orderId}`,
          html: `
            <div style="font-family: sans-serif; padding: 20px;">
              <h1>Nouvelle commande reçue !</h1>
              <p>ID: <strong>${orderId}</strong></p>
              <p>Client: ${orderData.user_name} (${orderData.user_email})</p>
              <p>Total: ${orderData.total_ttc.toFixed(2)}€</p>
              <h3>Produits:</h3>
              <ul>
                ${orderData.items.map((item: any) => `<li>${item.name} x${item.quantity}</li>`).join('')}
              </ul>
            </div>
          `
        }).catch(err => console.error("Error sending admin email:", err));
      }

      // Return the order data so frontend can store it in localStorage
      res.json({
        ...orderData,
        status: "En attente de virement",
        proofUploaded: false,
        createdAt: orderData.created_at
      });
    } catch (e: any) {
      console.error("[POST /api/orders] Error:", e);
      res.status(500).json({ error: "Erreur lors du traitement de la commande" });
    }
  });

  // Proof upload route - Stateless: only sends email
  app.post("/api/orders/:id/proof-stateless", async (req, res) => {
    const user = await getAuthUser(req);
    const { proofBase64, fileName } = req.body;
    const orderId = req.params.id;

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
