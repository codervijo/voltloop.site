import { Link } from "react-router-dom";
import { Calculator } from "@/components/Calculator";
import { Layout } from "@/components/Layout";
import { Seo } from "@/components/Seo";
import { InternalLinks } from "@/components/InternalLinks";
import { Button } from "@/components/ui/button";
import { ArrowRight, Zap, Home, Gauge } from "lucide-react";
import { EV_PRESETS } from "@/lib/data";

const Index = () => {
  return (
    <Layout>
      <Seo
        title="Voltloop — EV Charging Cost Calculator (2026)"
        description="Calculate exactly what it costs to charge your EV at home, Tesla Superchargers, or public DC fast chargers. Free, instant, accurate."
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "WebSite",
          name: "Voltloop",
          url: "https://voltloop.app",
          potentialAction: {
            "@type": "SearchAction",
            target: "https://voltloop.app/{search_term_string}",
            "query-input": "required name=search_term_string",
          },
        }}
      />

      {/* Hero */}
      <section className="container pt-16 md:pt-24 pb-10">
        <div className="max-w-3xl mx-auto text-center animate-fade-up">
          <div className="inline-flex items-center gap-2 rounded-full border border-hairline bg-surface/60 px-3 py-1 text-xs text-muted-foreground mb-6">
            <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse-glow" />
            Free EV charging cost calculator
          </div>
          <h1 className="font-display text-4xl md:text-6xl font-semibold tracking-tight">
            Know what charging your EV <span className="text-gradient">actually costs.</span>
          </h1>
          <p className="mt-5 text-lg text-muted-foreground max-w-2xl mx-auto">
            Compare home, Tesla Supercharger, and public DC fast charging in seconds.
            Built for drivers who want a real answer — not a guess.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Button asChild size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-glow">
              <a href="#calculator">
                Try the calculator <ArrowRight className="ml-1 h-4 w-4" />
              </a>
            </Button>
            <Button asChild size="lg" variant="outline" className="border-hairline">
              <Link to="/how-much-does-it-cost-to-charge-an-ev">Read the guide</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Calculator */}
      <section id="calculator" className="container pb-16 scroll-mt-20">
        <div className="max-w-4xl mx-auto animate-fade-up">
          <Calculator />
        </div>
      </section>

      {/* Feature trio */}
      <section className="container pb-20">
        <div className="max-w-5xl mx-auto grid gap-4 md:grid-cols-3">
          <FeatureCard
            icon={<Home className="h-5 w-5" />}
            title="Home charging"
            body="Find your true cost per kWh and per mile when charging overnight."
            to="/home-ev-charging-cost"
          />
          <FeatureCard
            icon={<Zap className="h-5 w-5" />}
            title="Tesla Supercharger"
            body="See Supercharger session prices and where home actually wins."
            to="/tesla-supercharger-cost"
          />
          <FeatureCard
            icon={<Gauge className="h-5 w-5" />}
            title="Public DC fast"
            body="Estimate Electrify America, EVgo and ChargePoint costs in seconds."
            to="/public-dc-fast-charging-cost"
          />
        </div>
      </section>

      {/* Popular calculators */}
      <section className="container pb-24">
        <div className="max-w-5xl mx-auto">
          <InternalLinks
            title="Popular EV calculators"
            items={EV_PRESETS.filter(p => p.slug !== "generic-ev").slice(0, 9).map(p => ({
              to: `/${p.slug}-charging-cost`,
              label: `${p.fullName} charging cost`,
              sub: `${p.batteryKwh} kWh • ${p.rangeMiles} mi range`,
            }))}
          />
        </div>
      </section>
    </Layout>
  );
};

const FeatureCard = ({ icon, title, body, to }: { icon: React.ReactNode; title: string; body: string; to: string }) => (
  <Link to={to} className="surface-card rounded-xl p-6 transition-all hover:border-primary/40 hover:shadow-glow group">
    <div className="grid h-10 w-10 place-items-center rounded-lg bg-primary/10 text-primary mb-4">{icon}</div>
    <h3 className="font-display text-lg">{title}</h3>
    <p className="mt-1.5 text-sm text-muted-foreground">{body}</p>
    <p className="mt-4 inline-flex items-center text-sm text-primary">
      Open <ArrowRight className="ml-1 h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
    </p>
  </Link>
);

export default Index;
