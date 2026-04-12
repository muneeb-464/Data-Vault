import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { FolderOpen, PenLine, Bot, Shield, ArrowRight, CheckCircle2 } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Hero3D from "@/components/Hero3D";

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.15 } },
};

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
};

const features = [
  { icon: FolderOpen, title: "Smart Category Management", desc: "Create custom categories to organize your data exactly the way you want. Flexible, intuitive, and powerful." },
  { icon: PenLine, title: "Powerful Data Storage", desc: "Add, edit, and manage notes with rich formatting. See edits in real-time built for productivity." },
  { icon: Bot, title: "AI-Powered Organization", desc: "Transform raw data into structured knowledge. Our AI auto-categorizes and connects your information." },
  { icon: Shield, title: "Secure & Private", desc: "Your data belongs only to you. End-to-end encryption ensures complete privacy and security." },
];

const steps = [
  { num: "01", title: "Create Your Account", desc: "Sign up in seconds and set up your personal vault." },
  { num: "02", title: "Build Your Categories", desc: "Create custom categories to organize your data." },
  { num: "03", title: "Add Your Data", desc: "Import or create entries with rich content support." },
  { num: "04", title: "Use AI to Organize", desc: "Let our AI sort, tag, and connect your information." },
];

const whyUs = [
  "Simple & Intuitive Interface — No learning curve. Start organizing in minutes.",
  "Clean & Modern Design — A beautiful workspace that inspires productivity.",
  "AI-Powered Productivity — Smart suggestions save you hours every week.",
  "Built for Everyone — Developers, students, and professionals love DataVault.",
];

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero */}
      <section className="relative pt-32 pb-20 overflow-hidden" style={{ background: "var(--gradient-hero)" }}>
        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row items-center gap-12">
            <motion.div
              className="flex-1 max-w-xl"
              variants={stagger}
              initial="hidden"
              animate="visible"
            >
              <motion.h1 variants={fadeUp} className="font-heading text-4xl md:text-6xl font-bold leading-tight">
                Organize Your Data{" "}
                <span className="text-gradient-primary">Smarter</span> with AI
              </motion.h1>
              <motion.p variants={fadeUp} className="mt-6 text-muted-foreground text-lg leading-relaxed">
                A powerful, user-friendly platform to manage your personal data, ideas, and notes — all in one place.
              </motion.p>
              <motion.div variants={fadeUp} className="mt-8 flex flex-wrap gap-4">
                <Link
                  to="/pricing"
                  className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-xl font-semibold hover:opacity-90 transition-opacity animate-pulse-glow"
                >
                  Get Started Free <ArrowRight size={18} />
                </Link>
                <a
                  href="#features"
                  className="inline-flex items-center gap-2 text-foreground hover:text-primary px-6 py-3 rounded-xl font-medium transition-colors"
                >
                  Explore Features
                </a>
              </motion.div>
              <motion.p variants={fadeUp} className="mt-6 text-sm text-muted-foreground flex items-center gap-2">
                <span className="flex -space-x-2">
                  {["bg-primary", "bg-secondary", "bg-accent"].map((c, i) => (
                    <span key={i} className={`w-6 h-6 rounded-full ${c} border-2 border-background`} />
                  ))}
                </span>
                Join 500+ users organizing smarter
              </motion.p>
            </motion.div>

            <motion.div
              className="flex-1 flex justify-center"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.3 }}
            >
              <Hero3D />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-24">
        <div className="container mx-auto px-4">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="font-heading text-3xl md:text-4xl font-bold">
              <span className="text-gradient-primary">Core</span> Intelligence
            </h2>
            <p className="mt-4 text-muted-foreground max-w-md mx-auto">
              Powerful features designed for the future of data management.
            </p>
          </motion.div>

          <motion.div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
            variants={stagger}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {features.map((f) => (
              <motion.div
                key={f.title}
                variants={fadeUp}
                className="glass-card rounded-xl p-6 group hover:scale-[1.03] transition-transform duration-300 hover:glow-border"
              >
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                  <f.icon size={24} className="text-primary" />
                </div>
                <h3 className="font-heading font-semibold text-foreground mb-2">{f.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-24 bg-muted/30">
        <div className="container mx-auto px-4">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="font-heading text-3xl md:text-4xl font-bold">
              The <span className="text-gradient-primary">Deployment</span> Cycle
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 relative">
            <div className="hidden md:block absolute top-8 left-[12.5%] right-[12.5%] h-0.5 bg-gradient-to-r from-primary/50 via-accent/50 to-primary/50" />
            {steps.map((s, i) => (
              <motion.div
                key={s.num}
                className="text-center relative"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
              >
                <div className="w-16 h-16 rounded-full bg-primary/10 border-2 border-primary/30 flex items-center justify-center mx-auto mb-4 font-heading font-bold text-primary text-lg">
                  {s.num}
                </div>
                <h3 className="font-heading font-semibold mb-2">{s.title}</h3>
                <p className="text-sm text-muted-foreground">{s.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row items-center gap-16">
            <motion.div
              className="flex-1"
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="font-heading text-3xl md:text-4xl font-bold mb-8">
                Engineered for <span className="text-gradient-primary">Reliability</span>.
              </h2>
              <div className="space-y-5">
                {whyUs.map((item, i) => (
                  <motion.div
                    key={i}
                    className="flex items-start gap-3"
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                  >
                    <CheckCircle2 size={20} className="text-accent mt-0.5 shrink-0" />
                    <p className="text-muted-foreground text-sm">{item}</p>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            <motion.div
              className="flex-1 flex justify-center"
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
            >
              <div className="w-72 h-72 rounded-2xl bg-gradient-to-br from-primary/20 via-accent/10 to-secondary/20 flex items-center justify-center glow-border">
                <div className="w-48 h-48 rounded-xl bg-gradient-to-br from-primary/30 to-accent/30 animate-pulse-glow" />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <motion.div
            className="rounded-2xl p-12 md:p-16 text-center glow-border animate-pulse-glow"
            style={{ background: "var(--gradient-cta)" }}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="font-heading text-3xl md:text-4xl font-bold mb-4">
              Ready to organize your digital life?
            </h2>
            <p className="text-muted-foreground mb-8 max-w-md mx-auto">
              Start managing your data smarter today with our AI-powered platform.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Link
                to="/pricing"
                className="bg-primary text-primary-foreground px-8 py-3 rounded-xl font-semibold hover:opacity-90 transition-opacity"
              >
                Start Free Trial
              </Link>
              <Link
                to="/contact"
                className="border border-border text-foreground px-8 py-3 rounded-xl font-semibold hover:border-primary hover:text-primary transition-colors"
              >
                Book a Demo
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Index;
