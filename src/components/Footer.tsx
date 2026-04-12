import { Link } from "react-router-dom";
import { Github, Linkedin } from "lucide-react";

const Footer = () => (
  <footer className="border-t border-border/30 bg-background">
    <div className="container mx-auto px-4 py-16">
      <div className="grid grid-cols-1 md:grid-cols-5 gap-10">
        <div className="md:col-span-2">
          <span className="font-heading text-xl font-bold text-primary">
            DataVault
          </span>
          <p className="mt-3 text-sm text-muted-foreground leading-relaxed max-w-xs">
            DataVault is a modern data management platform designed to help you organize, store, and retrieve information effortlessly.
          </p>
        </div>

        <div>
          <h4 className="text-sm font-semibold text-foreground mb-4 uppercase tracking-wider">
            Quick Links
          </h4>
          <div className="flex flex-col gap-2">
            {[
              ["Home", "/"],
              ["Features", "/#features"],
              ["Dashboard", "/dashboard"],
              ["Login", "/account"],
              ["Sign Up", "/account"],
            ].map(([label, path]) => (
              <Link
                key={label}
                to={path}
                className="text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                {label}
              </Link>
            ))}
          </div>
        </div>

        <div>
          <h4 className="text-sm font-semibold text-foreground mb-4 uppercase tracking-wider">
            Contact
          </h4>

          <p className="text-sm text-muted-foreground">
            464muneeb@gmail.com
          </p>
          <p className="text-sm text-muted-foreground mt-1">
            Saumundri Punjab, Pakistan
          </p>

          <div className="flex gap-3 mt-4">
            {/* GitHub */}
            <a
              href="https://github.com/muneeb-464"
              target="_blank"
              rel="noopener noreferrer"
              className="w-9 h-9 rounded-lg bg-muted flex items-center justify-center text-muted-foreground hover:text-primary hover:bg-muted/80 transition-colors"
            >
              <Github size={16} />
            </a>

            {/* LinkedIn */}
            <a
              href="https://www.linkedin.com/in/munib-sajjad-9a986223b"
              target="_blank"
              rel="noopener noreferrer"
              className="w-9 h-9 rounded-lg bg-muted flex items-center justify-center text-muted-foreground hover:text-primary hover:bg-muted/80 transition-colors"
            >
              <Linkedin size={16} />
            </a>
          </div>
        </div>
      </div>
    </div>

    <div className="border-t border-border/30">
      <div className="container mx-auto px-4 py-4 flex flex-col sm:flex-row justify-between items-center text-xs text-muted-foreground">
        <span>© 2026 DataVault. All rights reserved.</span>
        <span>
          Built with <span className="text-destructive">❤</span> by Munib
        </span>
      </div>
    </div>
  </footer>
);

export default Footer;