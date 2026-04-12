import { useState } from "react";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { Check, FolderOpen, MessageSquare, Shield } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

const plans = [
  {
    name: "Standard",
    price: "$0",
    period: "/MO",
    icon: FolderOpen,
    features: ["5GB Obsidian Storage", "Basic AI Categorization", "Priority Search"],
    cta: "Get Started Free",
    popular: false,
    action: "redirect",
  },
  {
    name: "Pro",
    price: "$12",
    period: "/MO",
    icon: MessageSquare,
    features: ["100GB Obsidian Storage", "Unlimited AI Insights", "Priority Global Search", "Quantum Encryption"],
    cta: "Go Pro Now",
    popular: true,
    action: "popup",
  },
  {
    name: "Enterprise",
    price: "Custom",
    period: "",
    icon: Shield,
    features: ["Unlimited Data Storage", "Custom Team Permissions", "Full API Integration", "Dedicated Concierge"],
    cta: "Contact Sales",
    popular: false,
    action: "popup",
  },
];

const Pricing = () => {
  const navigate = useNavigate();
  const [showPopup, setShowPopup] = useState(false);

  const handlePlanClick = (action: string) => {
    if (action === "redirect") {
      navigate("/dashboard");
    } else {
      setShowPopup(true);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <section className="pt-32 pb-20">
        <div className="container mx-auto px-4">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h1 className="font-heading text-4xl md:text-6xl font-bold">
              <span className="text-gradient-primary">DataVault</span>: The Power to
              <br />Organize. Plans to <span className="text-gradient-primary">Scale</span>.
            </h1>
            <p className="mt-6 text-muted-foreground text-lg max-w-lg mx-auto">
              Unlock infinite categorization and quantum security tailored to your data needs.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {plans.map((plan, i) => (
              <motion.div
                key={plan.name}
                className={`relative glass-card rounded-2xl p-8 flex flex-col ${plan.popular ? "border-primary glow-border" : ""}`}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
              >
                {plan.popular && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-xs font-semibold px-4 py-1 rounded-full uppercase tracking-wider">
                    Most Popular
                  </span>
                )}
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <plan.icon size={24} className="text-primary" />
                </div>
                <h3 className="font-heading text-xl font-semibold">{plan.name}</h3>
                <div className="mt-2 mb-6">
                  <span className="font-heading text-4xl font-bold">{plan.price}</span>
                  <span className="text-muted-foreground text-sm">{plan.period}</span>
                </div>
                <ul className="space-y-3 flex-1">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Check size={16} className="text-accent shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
                <button
                  onClick={() => handlePlanClick(plan.action)}
                  className={`mt-8 w-full py-3 rounded-xl font-semibold transition-opacity hover:opacity-90 ${
                    plan.popular
                      ? "bg-primary text-primary-foreground"
                      : "border border-primary text-primary hover:bg-primary/10"
                  }`}
                >
                  {plan.cta}
                </button>
              </motion.div>
            ))}
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16 max-w-4xl mx-auto">
            {[
              { label: "SYSTEM STATUS", value: "99.99% Uptime" },
              { label: "OBJECTS INDEXED", value: "12M+" },
              { label: "ENCRYPTION", value: "256-bit" },
            ].map((stat) => (
              <div key={stat.label} className="glass-card rounded-xl p-6 text-center">
                <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">{stat.label}</p>
                <p className="font-heading text-2xl font-bold text-gradient-primary">{stat.value}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Dialog open={showPopup} onOpenChange={setShowPopup}>
        <DialogContent className="glass-card border-border">
          <DialogHeader>
            <DialogTitle className="font-heading text-xl">Development Phase</DialogTitle>
            <DialogDescription className="text-muted-foreground mt-2">
              Sorry for the inconvenience, but we are currently in the development phase. We are not monetizing anything yet. You can enjoy the trial version for a limited time.
            </DialogDescription>
          </DialogHeader>
          <div className="flex gap-3 mt-4">
            <button
              onClick={() => { setShowPopup(false); navigate("/dashboard"); }}
              className="flex-1 bg-primary text-primary-foreground py-2 rounded-xl font-semibold hover:opacity-90 transition-opacity"
            >
              Try Free Version
            </button>
            <button
              onClick={() => setShowPopup(false)}
              className="flex-1 border border-border text-foreground py-2 rounded-xl font-semibold hover:border-primary transition-colors"
            >
              Close
            </button>
          </div>
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
};

export default Pricing;
