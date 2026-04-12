import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Eye, EyeOff, Mail, Lock, User, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { auth } from "@/integrations/auth";
import { useAuth } from "@/contexts/AuthContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { toast } from "sonner";

const getStrength = (pw: string) => {
  let score = 0;
  if (pw.length >= 8) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  if (pw.length >= 12) score++;
  const levels = [
    { label: "WEAK", color: "bg-destructive" },
    { label: "FAIR", color: "bg-orange-400" },
    { label: "GOOD", color: "bg-primary" },
    { label: "STRONG", color: "bg-accent" },
  ];
  return { level: score, ...levels[Math.min(score, 3)] };
};

const Account = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(false);
  const [showPw, setShowPw] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", password: "", confirmPassword: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [shake, setShake] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showForgot, setShowForgot] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");

  const strength = getStrength(form.password);

  // Redirect if already logged in
  if (!authLoading && user) {
    navigate("/dashboard", { replace: true });
    return null;
  }

  const validate = () => {
    const e: Record<string, string> = {};
    if (!isLogin && !form.name.trim()) e.name = "Name is required";
    if (!form.email.includes("@") || !form.email.includes(".")) e.email = "Invalid email";
    if (form.password.length < 8) e.password = "Min 8 characters";
    if (!isLogin && form.password !== form.confirmPassword) e.confirmPassword = "Passwords don't match";
    return e;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) {
      setErrors(errs);
      setShake(true);
      setTimeout(() => setShake(false), 500);
      return;
    }
    setErrors({});
    setLoading(true);

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({
          email: form.email,
          password: form.password,
        });
        if (error) throw error;
        toast.success("Welcome back!");
        navigate("/dashboard");
      } else {
        const { error } = await supabase.auth.signUp({
          email: form.email,
          password: form.password,
          options: {
            data: { full_name: form.name },
            emailRedirectTo: window.location.origin + "/dashboard",
          },
        });
        if (error) throw error;
        toast.success("Account created! Please check your email to verify your account.");
      }
    } catch (err: any) {
      toast.error(err.message || "Authentication failed");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
  setLoading(true);
  try {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: window.location.origin + "/dashboard",
      },
    });
    if (error) throw error;
  } catch (err: any) {
    toast.error(err.message || "Google sign-in failed");
  } finally {
    setLoading(false);
  }
};

  const handleForgotPassword = async () => {
    if (!forgotEmail.includes("@")) {
      toast.error("Please enter a valid email");
      return;
    }
    setLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(forgotEmail, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (error) throw error;
      toast.success("Password reset link sent to your email!");
      setShowForgot(false);
    } catch (err: any) {
      toast.error(err.message || "Failed to send reset email");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-28 pb-20 flex items-center justify-center min-h-screen px-4">
        <motion.div
          className={`w-full max-w-md glass-card rounded-2xl p-8 ${shake ? "animate-[shake_0.5s]" : ""}`}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          style={shake ? { animation: "shake 0.4s ease-in-out" } : undefined}
        >
          <h2 className="font-heading text-2xl font-bold text-primary text-center mb-1">Data Vault</h2>

          {/* Forgot Password Modal */}
          <AnimatePresence>
            {showForgot && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <div className="space-y-4 mt-4">
                  <h3 className="font-heading text-xl font-semibold">Reset Password</h3>
                  <p className="text-sm text-muted-foreground">Enter your email and we'll send you a reset link.</p>
                  <div className="relative">
                    <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <input
                      type="email"
                      placeholder="name@company.com"
                      value={forgotEmail}
                      onChange={(e) => setForgotEmail(e.target.value)}
                      className="w-full bg-muted/50 border border-border rounded-lg pl-10 pr-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors"
                    />
                  </div>
                  <button
                    onClick={handleForgotPassword}
                    disabled={loading}
                    className="w-full bg-primary text-primary-foreground py-3 rounded-xl font-semibold hover:opacity-90 transition-opacity flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {loading && <Loader2 size={16} className="animate-spin" />}
                    Send Reset Link
                  </button>
                  <button onClick={() => setShowForgot(false)} className="w-full text-sm text-muted-foreground hover:text-foreground">
                    Back to login
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {!showForgot && (
            <>
              {/* Tabs */}
              <div className="flex mb-6 mt-4 bg-muted rounded-lg p-1">
                {["Login", "Sign Up"].map((tab, i) => (
                  <button
                    key={tab}
                    onClick={() => setIsLogin(i === 0)}
                    className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${
                      (i === 0) === isLogin
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              <AnimatePresence mode="wait">
                <motion.form
                  key={isLogin ? "login" : "signup"}
                  onSubmit={handleSubmit}
                  initial={{ opacity: 0, x: isLogin ? -20 : 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: isLogin ? 20 : -20 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-4"
                >
                  <h3 className="font-heading text-xl font-semibold">{isLogin ? "Welcome Back" : "Create Account"}</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    {isLogin ? "Login to access your vault" : "Join DataVault and start organizing smarter"}
                  </p>

                  {!isLogin && (
                    <div>
                      <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1 block">Full Name</label>
                      <div className="relative">
                        <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                        <input type="text" placeholder="John Doe" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                          className="w-full bg-muted/50 border border-border rounded-lg pl-10 pr-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors" />
                      </div>
                      {errors.name && <p className="text-destructive text-xs mt-1">{errors.name}</p>}
                    </div>
                  )}

                  <div>
                    <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1 block">Email</label>
                    <div className="relative">
                      <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                      <input type="email" placeholder="name@company.com" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
                        className="w-full bg-muted/50 border border-border rounded-lg pl-10 pr-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors" />
                    </div>
                    {errors.email && <p className="text-destructive text-xs mt-1">{errors.email}</p>}
                  </div>

                  <div>
                    <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1 block">Password</label>
                    <div className="relative">
                      <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                      <input type={showPw ? "text" : "password"} placeholder="••••••••" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })}
                        className="w-full bg-muted/50 border border-border rounded-lg pl-10 pr-10 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors" />
                      <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                        {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                    {form.password.length > 0 && (
                      <div className="mt-2">
                        <div className="flex gap-1">
                          {[0, 1, 2, 3].map((i) => (
                            <div key={i} className={`h-1 flex-1 rounded-full transition-colors ${i < strength.level ? strength.color : "bg-muted"}`} />
                          ))}
                        </div>
                        <span className={`text-xs font-medium mt-1 block ${strength.color.replace("bg-", "text-")}`}>{strength.label}</span>
                      </div>
                    )}
                    {errors.password && <p className="text-destructive text-xs mt-1">{errors.password}</p>}
                  </div>

                  {!isLogin && (
                    <div>
                      <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1 block">Confirm Password</label>
                      <div className="relative">
                        <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                        <input type="password" placeholder="••••••••" value={form.confirmPassword} onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                          className="w-full bg-muted/50 border border-border rounded-lg pl-10 pr-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors" />
                      </div>
                      
                      
                      {errors.confirmPassword && <p className="text-destructive text-xs mt-1">{errors.confirmPassword}</p>}
                    </div>
                  )}

                  {isLogin && (
                    <button type="button" onClick={() => setShowForgot(true)} className="text-sm text-primary hover:underline">
                      Forgot password?
                    </button>
                  )}

                  {!isLogin && (
                    <p className="text-xs text-muted-foreground">
                      By creating an account you agree to our{" "}
                      <span className="text-primary cursor-pointer">Terms</span> &{" "}
                      <span className="text-primary cursor-pointer">Privacy Policy</span>
                    </p>
                  )}

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-primary text-primary-foreground py-3 rounded-xl font-semibold hover:opacity-90 transition-opacity flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {loading && <Loader2 size={16} className="animate-spin" />}
                    {isLogin ? "Login" : "Create Account"}
                  </button>

                  <div className="text-center text-sm text-muted-foreground">OR CONTINUE WITH</div>

                  <button
                    type="button"
                    onClick={handleGoogleSignIn}
                    disabled={loading}
                    className="w-full bg-muted/50 border border-border text-foreground py-3 rounded-xl font-medium flex items-center justify-center gap-2 hover:bg-muted transition-colors disabled:opacity-50"
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
                    Google
                  </button>
                </motion.form>
              </AnimatePresence>

              <p className="text-center text-sm text-muted-foreground mt-6">
                {isLogin ? "Don't have an account? " : "Already have an account? "}
                <button onClick={() => setIsLogin(!isLogin)} className="text-primary font-medium hover:underline">
                  {isLogin ? "Sign up here" : "Login here"}
                </button>
              </p>
            </>
          )}
        </motion.div>
      </div>
      <Footer />
    </div>
  );
};

export default Account;
