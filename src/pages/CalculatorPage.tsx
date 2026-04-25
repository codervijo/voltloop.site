import { Layout } from "@/components/Layout";
import { Seo } from "@/components/Seo";
import { Calculator } from "@/components/Calculator";
import { InternalLinks } from "@/components/InternalLinks";
import { EV_PRESETS } from "@/lib/data";

const CalculatorPage = () => {
  return (
    <Layout>
      <Seo
        title="EV Charging Cost Calculator (2026) — Voltloop"
        description="Free EV charging cost calculator. Compare home, Tesla Supercharger, and public DC fast charging in seconds."
      />
      <section className="container py-12 md:py-16">
        <div className="max-w-4xl mx-auto">
          <h1 className="font-display text-3xl md:text-5xl font-semibold tracking-tight">
            EV Charging Cost Calculator
          </h1>
          <p className="mt-4 text-muted-foreground max-w-2xl">
            Plug in your EV, electricity rate, and charger type to see exactly what
            your next charge will cost — and how it compares across charger types.
          </p>
          <div className="mt-8">
            <Calculator />
          </div>
          <InternalLinks
            title="Popular calculators"
            items={EV_PRESETS.filter(p => p.slug !== "generic-ev").slice(0, 9).map(p => ({
              to: `/${p.slug}-charging-cost`,
              label: `${p.fullName} charging cost`,
              sub: `${p.batteryKwh} kWh • ${p.rangeMiles} mi`,
            }))}
          />
        </div>
      </section>
    </Layout>
  );
};

export default CalculatorPage;
