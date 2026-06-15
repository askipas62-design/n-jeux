import React, { useState, useRef, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { ShieldCheck, Loader2, ArrowLeft, RefreshCw, CheckCircle2 } from "lucide-react";
import { supabase } from "../lib/supabase";
import { useToast } from "../components/ui/Toast";


type CodeType = "signup" | "recovery";

export default function VerifyCode() {
  const [searchParams] = useSearchParams();
  const email = searchParams.get("email") || "";
  const type = (searchParams.get("type") || "signup") as CodeType;
  
  const [digits, setDigits] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [success, setSuccess] = useState(false);
  const [cooldown, setCooldown] = useState(60);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const { addToast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, []);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setTimeout(() => setCooldown(cooldown - 1), 1000);
    return () => clearTimeout(timer);
  }, [cooldown]);

  const handleDigitChange = (index: number, value: string) => {
    if (value.length > 1) {
      value = value.slice(-1);
    }
    if (!/^\d*$/.test(value)) return;

    const newDigits = [...digits];
    newDigits[index] = value;
    setDigits(newDigits);

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    if (newDigits.every(d => d !== "") && newDigits.join("").length === 6) {
      handleVerify(newDigits.join(""));
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (pasted.length === 6) {
      const newDigits = pasted.split("");
      setDigits(newDigits);
      inputRefs.current[5]?.focus();
      handleVerify(pasted);
    }
  };

  const handleVerify = async (code: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.verifyOtp({
        email,
        token: code,
        type,
      });

      if (error) {
        if (error.message.includes("Invalid") || error.message.includes("expired")) {
          throw new Error("Code invalide ou expiré. Vérifiez le code ou demandez-en un nouveau.");
        }
        throw error;
      }

      if (data.session) {
        localStorage.setItem("token", data.session.access_token);
      }

      setSuccess(true);
      addToast("Code vérifié avec succès !", "success");

      if (type === "signup") {
        addToast("Votre compte a été confirmé. Bienvenue dans l'univers Appiotti !", "success");
        setTimeout(() => navigate("/client/dashboard", { replace: true }), 1500);
      } else {
        setTimeout(() => navigate("/reset-password", { replace: true }), 1500);
      }
    } catch (err: any) {
      addToast(err.message || "Erreur de vérification", "error");
      setDigits(["", "", "", "", "", ""]);
      inputRefs.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setResending(true);
    try {
      if (type === "signup") {
        const { error } = await supabase.auth.signInWithOtp({ email });
        if (error) throw error;
      } else {
        const { error } = await supabase.auth.resetPasswordForEmail(email);
        if (error) throw error;
      }
      addToast("Nouveau code envoyé ! Vérifiez votre boîte de réception.", "success");
      setCooldown(60);
    } catch (err: any) {
      addToast(err.message || "Erreur lors de l'envoi", "error");
    } finally {
      setResending(false);
    }
  };

  if (!email) {
    return (
      <div className="min-h-[calc(100vh-80px)] flex items-center justify-center p-4 bg-[#FFF8F0]">
        <div className="w-full max-w-xl bg-white rounded-[24px] md:rounded-[48px] shadow-2xl p-6 md:p-16 text-center">
          <p className="text-gray-500 mb-6">Aucun email fourni pour la vérification.</p>
          <Link to="/connexion" className="text-[#FF6B35] font-bold hover:underline">
            Retour à la connexion
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-80px)] flex items-center justify-center p-4 bg-[#FFF8F0] relative overflow-hidden">
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-[#FF6B35] rounded-full blur-[200px] opacity-10 -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-[#FFD23F] rounded-full blur-[200px] opacity-10 translate-y-1/2 -translate-x-1/2" />

      <div className="w-full max-w-xl bg-white rounded-[24px] md:rounded-[48px] shadow-2xl overflow-hidden relative border border-gray-100 p-6 md:p-16 animate-fade-in-up"
      >
        <div className="text-center mb-6 md:mb-12">
          <Link to={type === "signup" ? "/inscription" : "/mot-de-passe-oublie"} className="inline-flex items-center gap-2 mb-6 md:mb-8">
            <div className="w-10 h-10 md:w-12 md:h-12 bg-[#FF6B35] rounded-2xl flex items-center justify-center font-bold text-lg md:text-xl text-white shadow-lg">A</div>
            <span className="text-lg md:text-2xl font-black font-display text-brand-dark uppercase tracking-tight">Appiotti <span className="text-brand-orange">Game Shop</span></span>
          </Link>
          <h1 className="text-2xl md:text-5xl font-black text-brand-dark mb-3 md:mb-4 font-display uppercase tracking-tighter">
            {success ? "Vérifié !" : "Entrez le code"}
          </h1>
          <p className="text-gray-500 font-medium">
            {success
              ? type === "signup" 
                ? "Votre compte a été confirmé."
                : "Identité confirmée."
              : type === "signup"
                ? "Un code de confirmation à 6 chiffres vous a été envoyé par email."
                : "Un code de réinitialisation à 6 chiffres vous a été envoyé par email."
            }
          </p>
        </div>

        {success ? (
          <div 
              key="success"
              className="text-center py-8"
            >
              <div className="flex justify-center mb-6">
                <div className="w-24 h-24 bg-green-100 text-green-600 rounded-full flex items-center justify-center">
                  <CheckCircle2 size={48} />
                </div>
              </div>
              <p className="text-gray-500 mb-4">Redirection en cours...</p>
              <button 
                onClick={() => navigate(type === "signup" ? "/client/dashboard" : "/reset-password", { replace: true })}
                className="text-[#FF6B35] font-black uppercase tracking-widest text-sm hover:underline"
              >
                Continuer
              </button>
            </div>
          ) : (
            <div
              key="code"
            >
              <div className="bg-orange-50 border border-orange-200 rounded-2xl p-4 mb-8 text-center">
                <p className="text-sm text-gray-600">
                  Code envoyé à : <span className="font-black text-[#FF6B35]">{email}</span>
                </p>
              </div>

              <form onSubmit={(e) => { e.preventDefault(); handleVerify(digits.join("")); }}>
                <div className="flex justify-center gap-3 mb-8">
                  {digits.map((digit, i) => (
                    <input
                      key={i}
                      ref={(el) => { inputRefs.current[i] = el; }}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleDigitChange(i, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(i, e)}
                      onPaste={handlePaste}
                      disabled={loading}
                      className="w-14 h-16 text-center text-2xl font-black bg-gray-50 border-2 border-gray-200 focus:border-[#FF6B35] focus:bg-white rounded-2xl transition-all outline-none disabled:opacity-50"
                    />
                  ))}
                </div>

                {loading && (
                  <div className="text-center mb-6">
                    <Loader2 className="animate-spin text-[#FF6B35] mx-auto" size={24} />
                    <p className="text-sm text-gray-400 mt-2">Vérification en cours...</p>
                  </div>
                )}

                <button 
                  disabled={loading || digits.join("").length !== 6}
                  type="submit"
                  className="w-full bg-gradient-to-r from-[#FF6B35] to-[#FFD23F] text-white py-5 rounded-full font-black text-xl shadow-2xl hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-3 mb-6"
                >
                  Vérifier le code
                </button>
              </form>

              <div className="text-center space-y-4">
                <p className="text-gray-400 text-sm">Vous n'avez pas reçu le code ?</p>
                {cooldown > 0 ? (
                  <p className="text-gray-400 font-bold text-sm">
                    Renvoyer dans {cooldown}s
                  </p>
                ) : (
                  <button 
                    onClick={handleResend}
                    disabled={resending}
                    className="text-[#FF6B35] font-bold hover:underline inline-flex items-center gap-2 text-sm disabled:opacity-50"
                  >
                    {resending ? <Loader2 className="animate-spin" size={16} /> : <RefreshCw size={16} />}
                    Renvoyer le code
                  </button>
                )}

                <Link 
                  to={type === "signup" ? "/inscription" : "/mot-de-passe-oublie"}
                  className="block text-gray-400 font-bold hover:text-[#FF6B35] text-sm inline-flex items-center gap-1 transition-colors"
                >
                  <ArrowLeft size={16} /> Changer d'email
                </Link>
              </div>
            </div>
          )}

        <div className="mt-12 text-center">
          <div className="flex items-center justify-center gap-2 text-[10px] text-gray-300 uppercase tracking-widest py-8 border-t border-gray-50">
            <ShieldCheck size={14} /> Sécurisé par Appiotti Game Shop
          </div>
        </div>
      </div>
    </div>
  );
}
