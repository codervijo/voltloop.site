import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

type Item = { to: string; label: string; sub?: string };

export const InternalLinks = ({ items, title = "Related calculators" }: { items: Item[]; title?: string }) => (
  <section className="mt-16">
    <h2 className="font-display text-2xl mb-6">{title}</h2>
    <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
      {items.map(i => (
        <Link
          key={i.to}
          to={i.to}
          className="group surface-card rounded-xl p-4 flex items-center justify-between transition-all hover:border-primary/40 hover:shadow-glow"
        >
          <div>
            <p className="font-display text-foreground">{i.label}</p>
            {i.sub && <p className="text-xs text-muted-foreground mt-0.5">{i.sub}</p>}
          </div>
          <ArrowRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-1 group-hover:text-primary" />
        </Link>
      ))}
    </div>
  </section>
);
