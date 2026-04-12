import { useState } from "react";
import { motion } from "framer-motion";
import { Mail, MapPin, MessageCircle, Send } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const Contact = () => {
  const [form, setForm] = useState({ name: "", email: "", subject: "Technical Support", message: "" });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert("Message sent (demo)");
    setForm({ name: "", email: "", subject: "Technical Support", message: "" });
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <section className="pt-32 pb-12">
        <div className="container mx-auto px-4 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <p className="text-primary text-sm font-semibold uppercase tracking-wider mb-4">Connect With Us</p>
            <h1 className="font-heading text-4xl md:text-5xl font-bold">
              Get in <span className="text-gradient-primary">Touch</span> with Our Team
            </h1>
            <p className="mt-4 text-muted-foreground max-w-lg mx-auto">
              Have a question about DataVault or need technical assistance? We're here to help you secure and organize your digital life.
            </p>
          </motion.div>
        </div>
      </section>

      <section className="pb-24">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-5xl mx-auto">
            {/* Left - Contact Details */}
            <motion.div
              className="space-y-6"
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <h2 className="font-heading text-2xl font-bold">Contact Details</h2>
              <div className="w-12 h-1 bg-primary rounded-full" />

              {[
                { icon: Mail, title: "Email Support", desc: "Our team typically responds within 2 hours.", link: "support@datavault.app" },
                { icon: MapPin, title: "Global Presence", desc: "Securing data across continents.", link: "Pakistan Office - Tech Hub" },
                { icon: MessageCircle, title: "Live Chat", desc: "Available for Premium users 24/7.", link: "Start Conversation →" },
              ].map((item) => (
                <div key={item.title} className="glass-card rounded-xl p-5 flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    <item.icon size={20} className="text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">{item.title}</h3>
                    <p className="text-sm text-muted-foreground">{item.desc}</p>
                    <p className="text-sm text-primary mt-1 cursor-pointer hover:underline">{item.link}</p>
                  </div>
                </div>
              ))}
            </motion.div>

            {/* Right - Form */}
            <motion.form
              onSubmit={handleSubmit}
              className="glass-card rounded-2xl p-8 space-y-5"
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1 block">Full Name</label>
                  <input
                    type="text"
                    placeholder="John Doe"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="w-full bg-muted/50 border border-border rounded-lg px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1 block">Email Address</label>
                  <input
                    type="email"
                    placeholder="john@company.com"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className="w-full bg-muted/50 border border-border rounded-lg px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1 block">Subject</label>
                <select
                  value={form.subject}
                  onChange={(e) => setForm({ ...form, subject: e.target.value })}
                  className="w-full bg-muted/50 border border-border rounded-lg px-4 py-3 text-sm text-foreground focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors"
                >
                  <option>Technical Support</option>
                  <option>Billing</option>
                  <option>Feature Request</option>
                  <option>General Inquiry</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1 block">Message</label>
                <textarea
                  placeholder="How can we help you today?"
                  rows={5}
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                  className="w-full bg-muted/50 border border-border rounded-lg px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors resize-none"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-primary text-primary-foreground py-3 rounded-xl font-semibold hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
              >
                Send Message <Send size={16} />
              </button>

              <p className="text-center text-sm text-muted-foreground">
                Looking for faster answers?{" "}
                <span className="text-primary font-medium cursor-pointer hover:underline">Browse Documentation</span>
              </p>
            </motion.form>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Contact;
