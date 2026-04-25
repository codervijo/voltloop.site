import { Link } from "react-router-dom";
import { Zap } from "lucide-react";

export const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="min-h-screen bg-background bg-gradient-hero">
      <header className="sticky top-0 z-40 border-b border-hairline/60 bg-background/80 backdrop-blur-xl">
        <div className="container flex h-16 items-center justify-between">
          <Link to="/" className="flex items-center gap-2 group">
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-gradient-primary shadow-glow transition-transform group-hover:scale-105">
              <Zap className="h-4 w-4 text-primary-foreground" strokeWidth={2.5} />
            </span>
            <span className="font-display text-lg font-semibold tracking-tight">Voltloop</span>
          </Link>
          <nav className="hidden md:flex items-center gap-6 text-sm text-muted-foreground">
            <Link to="/ev-charging-cost-calculator" className="hover:text-foreground transition-colors">Calculator</Link>
            <Link to="/tesla-supercharger-cost" className="hover:text-foreground transition-colors">Supercharger</Link>
            <Link to="/home-ev-charging-cost" className="hover:text-foreground transition-colors">Home charging</Link>
            <Link to="/how-much-does-it-cost-to-charge-an-ev" className="hover:text-foreground transition-colors">Guide</Link>
          </nav>
        </div>
      </header>
      <main>{children}</main>
      <footer className="mt-24 border-t border-hairline/60">
        <div className="container py-12 grid gap-8 md:grid-cols-4 text-sm">
          <div className="md:col-span-2">
            <div className="flex items-center gap-2">
              <span className="grid h-7 w-7 place-items-center rounded-md bg-gradient-primary">
                <Zap className="h-3.5 w-3.5 text-primary-foreground" strokeWidth={2.5} />
              </span>
              <span className="font-display font-semibold">Voltloop</span>
            </div>
            <p className="mt-3 max-w-md text-muted-foreground">
              The fastest way to know what charging an EV actually costs. Free calculators,
              honest comparisons, no ads.
            </p>
          </div>
          <div>
            <p className="font-display text-foreground mb-3">Calculators</p>
            <ul className="space-y-2 text-muted-foreground">
              <li><Link to="/tesla-model-3-charging-cost" className="hover:text-foreground">Tesla Model 3</Link></li>
              <li><Link to="/tesla-model-y-charging-cost" className="hover:text-foreground">Tesla Model Y</Link></li>
              <li><Link to="/ford-f-150-lightning-charging-cost" className="hover:text-foreground">F-150 Lightning</Link></li>
              <li><Link to="/chevy-bolt-charging-cost" className="hover:text-foreground">Chevy Bolt</Link></li>
            </ul>
          </div>
          <div>
            <p className="font-display text-foreground mb-3">Guides</p>
            <ul className="space-y-2 text-muted-foreground">
              <li><Link to="/tesla-supercharger-cost" className="hover:text-foreground">Tesla Supercharger</Link></li>
              <li><Link to="/home-ev-charging-cost" className="hover:text-foreground">Home charging</Link></li>
              <li><Link to="/public-dc-fast-charging-cost" className="hover:text-foreground">DC fast charging</Link></li>
              <li><Link to="/level-1-vs-level-2-charging-cost" className="hover:text-foreground">L1 vs L2</Link></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-hairline/60">
          <div className="container py-6 text-xs text-muted-foreground flex flex-col md:flex-row items-center justify-between gap-2">
            <p>© {new Date().getFullYear()} Voltloop. Estimates are guidance only.</p>
            <p>Built for EV drivers.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};
