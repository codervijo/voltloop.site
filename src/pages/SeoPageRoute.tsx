import { Navigate, Link, useLocation } from "react-router-dom";
import { useMemo } from "react";
import { Layout } from "@/components/Layout";
import { Seo } from "@/components/Seo";
import { Calculator } from "@/components/Calculator";
import { InternalLinks } from "@/components/InternalLinks";
import { SEO_PAGES, EV_PRESETS, STATE_RATES } from "@/lib/data";
import { calculateChargingCost, CHARGER_TYPES, formatCurrency } from "@/lib/charging";

/**
 * Single dynamic SEO page renderer for all programmatic pages.
 * Picks the matching SeoPage from data and renders the appropriate template.
 */
const SeoPageRoute = () => {
  const location = useLocation();
  const slug = location.pathname.replace(/^\/+/, "").replace(/\/+$/, "");
  const page = SEO_PAGES.find(p => p.slug === slug);

  if (!page) return <Navigate to="/404" replace />;

  // Defaults for the prefilled calculator (the "direct answer above the fold")
  const preset = page.preset ?? EV_PRESETS.find(p => p.slug === "tesla-model-3")!;
  const chargerType: keyof typeof CHARGER_TYPES =
    page.chargerType ?? (page.type === "model-state" ? "level2" : "level2");
  const rate = page.state?.ratePerKwh ?? CHARGER_TYPES[chargerType].defaultRate;

  const directAnswer = useMemo(() => calculateChargingCost({
    batterySize: preset.batteryKwh,
    currentPercent: 20,
    targetPercent: 80,
    ratePerKwh: rate,
    chargerType,
    rangeMiles: preset.rangeMiles,
  }), [preset, rate, chargerType]);

  const faqs = buildFaqs(page, directAnswer.cost, preset, rate, chargerType);
  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: faqs.map(f => ({
        "@type": "Question",
        name: f.q,
        acceptedAnswer: { "@type": "Answer", text: f.a },
      })),
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: "https://voltloop.site/" },
        { "@type": "ListItem", position: 2, name: page.h1, item: `https://voltloop.site/${page.slug}` },
      ],
    },
  ];

  // Related links: same model in other states or other models
  const related = buildRelated(page);

  return (
    <Layout>
      <Seo title={page.title} description={page.description} jsonLd={jsonLd} />

      <article className="container py-12 md:py-16">
        <div className="max-w-4xl mx-auto">
          <nav className="text-xs text-muted-foreground mb-4">
            <Link to="/" className="hover:text-foreground">Home</Link>
            <span className="mx-2">/</span>
            <span>{page.h1}</span>
          </nav>

          <h1 className="font-display text-3xl md:text-5xl font-semibold tracking-tight">
            {page.h1}
          </h1>

          {/* Direct answer */}
          <div className="mt-6 rounded-xl border border-primary/30 bg-primary/5 p-5 md:p-6">
            <p className="text-sm uppercase tracking-wide text-primary mb-1">Direct answer</p>
            <p className="text-lg md:text-xl text-foreground leading-relaxed">
              Charging a <strong>{preset.fullName}</strong> from 20% to 80%
              {page.state ? <> in <strong>{page.state.name}</strong></> : null}{" "}
              on a <strong>{CHARGER_TYPES[chargerType].short}</strong> charger costs about{" "}
              <span className="text-gradient font-display text-2xl md:text-3xl">{formatCurrency(directAnswer.cost)}</span>{" "}
              at ${rate.toFixed(2)}/kWh and takes around {directAnswer.timeEstimate}.
            </p>
          </div>

          {/* Calculator */}
          <div className="mt-8">
            <Calculator
              initialPresetSlug={preset.slug}
              initialChargerType={chargerType}
              initialStateSlug={page.state?.slug}
            />
          </div>

          {/* Explanation */}
          <section className="mt-12 prose-invert max-w-none">
            <h2 className="font-display text-2xl">How we calculated it</h2>
            <p className="text-muted-foreground mt-3 leading-relaxed">
              We use your battery size, current and target charge level, electricity rate,
              and a realistic charger efficiency factor (typically 85–95%) to estimate energy
              drawn from the grid and the resulting cost. Time is estimated using the charger's
              effective power output, including the typical taper above 80% on DC fast chargers.
            </p>

            <h2 className="font-display text-2xl mt-10">{secondHeading(page)}</h2>
            <p className="text-muted-foreground mt-3 leading-relaxed">
              {secondParagraph(page, preset, rate)}
            </p>
          </section>

          {/* FAQ */}
          <section className="mt-12">
            <h2 className="font-display text-2xl mb-4">Frequently asked questions</h2>
            <div className="space-y-3">
              {faqs.map(f => (
                <details key={f.q} className="surface-card rounded-xl p-5 group">
                  <summary className="cursor-pointer font-display text-foreground list-none flex items-center justify-between">
                    {f.q}
                    <span className="text-muted-foreground group-open:rotate-45 transition-transform">+</span>
                  </summary>
                  <p className="mt-3 text-sm text-muted-foreground leading-relaxed">{f.a}</p>
                </details>
              ))}
            </div>
          </section>

          {related.length > 0 && <InternalLinks items={related} />}
        </div>
      </article>
    </Layout>
  );
};

function secondHeading(page: typeof SEO_PAGES[number]) {
  if (page.type === "model-state") return `Charging in ${page.state?.name}`;
  if (page.type === "charger") return "When this charger makes sense";
  if (page.type === "guide") return "Home vs public charging";
  return "Home vs Supercharger";
}

function secondParagraph(
  page: typeof SEO_PAGES[number],
  preset: typeof EV_PRESETS[number],
  rate: number,
) {
  if (page.type === "model-state" && page.state) {
    return `${page.state.name}'s average residential rate of $${page.state.ratePerKwh.toFixed(2)}/kWh is the single biggest factor in your charging bill. A full charge from 10–100% on a ${preset.fullName} (${preset.batteryKwh} kWh) costs roughly ${formatCurrency((preset.batteryKwh * 0.9 / 0.9) * page.state.ratePerKwh)} at home — usually 2–4× cheaper than a Supercharger session.`;
  }
  if (page.type === "charger") {
    return `Your real cost per kWh and per minute depends on your provider, time of day, and battery state. Use the calculator above to plug in your exact rate and battery size for an accurate number.`;
  }
  return `Charging at home is almost always the cheapest option — usually $${rate.toFixed(2)}/kWh vs $0.36–$0.50/kWh at a public fast charger. Use the comparison toggle in the calculator to see the per-session difference for your ${preset.fullName}.`;
}

function buildFaqs(
  page: typeof SEO_PAGES[number],
  directCost: number,
  preset: typeof EV_PRESETS[number],
  rate: number,
  chargerType: keyof typeof CHARGER_TYPES,
) {
  const c = CHARGER_TYPES[chargerType];
  return [
    {
      q: `How much does it cost to charge a ${preset.fullName}?`,
      a: `Charging a ${preset.fullName} from 20% to 80% on a ${c.short} charger at $${rate.toFixed(2)}/kWh costs about ${formatCurrency(directCost)}. A full 0–100% charge costs roughly ${formatCurrency((preset.batteryKwh / c.efficiency) * rate)}.`,
    },
    {
      q: `Is it cheaper to charge at home or use a Tesla Supercharger?`,
      a: `Home charging is almost always cheaper. Residential electricity averages $0.16/kWh in the US, while Superchargers typically cost $0.30–$0.45/kWh — often 2–3× more per session.`,
    },
    {
      q: `How long does charging take?`,
      a: `On a Level 2 home charger, most EVs go from 20–80% in 4–8 hours. On a Tesla Supercharger or public DC fast charger, the same charge typically takes 20–40 minutes, with charging speed slowing significantly above 80%.`,
    },
    {
      q: `What affects EV charging cost the most?`,
      a: `Three things: your local electricity rate ($/kWh), your battery size (kWh), and how much you're adding (the gap between current and target %). Charger efficiency (85–95%) adds a small overhead on top.`,
    },
  ];
}

function buildRelated(page: typeof SEO_PAGES[number]) {
  if (page.type === "model" && page.preset) {
    return STATE_RATES.slice(0, 6).map(s => ({
      to: `/${page.preset!.slug}-charging-cost-${s.slug}`,
      label: `${page.preset!.fullName} in ${s.name}`,
      sub: `$${s.ratePerKwh.toFixed(2)}/kWh avg`,
    })).filter(l => SEO_PAGES.some(p => `/${p.slug}` === l.to));
  }
  if (page.type === "model-state") {
    return EV_PRESETS.filter(p => p.slug !== page.preset?.slug && p.slug !== "generic-ev").slice(0, 6).map(p => ({
      to: `/${p.slug}-charging-cost`,
      label: `${p.fullName} charging cost`,
      sub: `${p.batteryKwh} kWh`,
    }));
  }
  return EV_PRESETS.filter(p => p.slug !== "generic-ev").slice(0, 6).map(p => ({
    to: `/${p.slug}-charging-cost`,
    label: `${p.fullName} charging cost`,
    sub: `${p.batteryKwh} kWh • ${p.rangeMiles} mi`,
  }));
}

export default SeoPageRoute;
