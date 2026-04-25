// EV presets, US state electricity rates, and programmatic SEO data.

export type EvPreset = {
  slug: string;
  brand: string;
  model: string;
  fullName: string;
  batteryKwh: number;
  rangeMiles: number;
  supportsSupercharger: boolean;
};

export const EV_PRESETS: EvPreset[] = [
  { slug: "tesla-model-3", brand: "Tesla", model: "Model 3", fullName: "Tesla Model 3", batteryKwh: 75, rangeMiles: 333, supportsSupercharger: true },
  { slug: "tesla-model-y", brand: "Tesla", model: "Model Y", fullName: "Tesla Model Y", batteryKwh: 75, rangeMiles: 330, supportsSupercharger: true },
  { slug: "tesla-model-s", brand: "Tesla", model: "Model S", fullName: "Tesla Model S", batteryKwh: 100, rangeMiles: 405, supportsSupercharger: true },
  { slug: "tesla-model-x", brand: "Tesla", model: "Model X", fullName: "Tesla Model X", batteryKwh: 100, rangeMiles: 348, supportsSupercharger: true },
  { slug: "ford-f-150-lightning", brand: "Ford", model: "F-150 Lightning", fullName: "Ford F-150 Lightning", batteryKwh: 131, rangeMiles: 320, supportsSupercharger: true },
  { slug: "ford-mustang-mach-e", brand: "Ford", model: "Mustang Mach-E", fullName: "Ford Mustang Mach-E", batteryKwh: 91, rangeMiles: 312, supportsSupercharger: true },
  { slug: "chevy-bolt", brand: "Chevy", model: "Bolt EV", fullName: "Chevy Bolt EV", batteryKwh: 65, rangeMiles: 259, supportsSupercharger: false },
  { slug: "rivian-r1t", brand: "Rivian", model: "R1T", fullName: "Rivian R1T", batteryKwh: 135, rangeMiles: 314, supportsSupercharger: true },
  { slug: "hyundai-ioniq-5", brand: "Hyundai", model: "Ioniq 5", fullName: "Hyundai Ioniq 5", batteryKwh: 77, rangeMiles: 303, supportsSupercharger: true },
  { slug: "kia-ev6", brand: "Kia", model: "EV6", fullName: "Kia EV6", batteryKwh: 77, rangeMiles: 310, supportsSupercharger: true },
  { slug: "generic-ev", brand: "Generic", model: "EV", fullName: "Generic EV", batteryKwh: 70, rangeMiles: 280, supportsSupercharger: false },
];

export type StateRate = {
  slug: string;
  name: string;
  ratePerKwh: number; // residential avg $/kWh (approx 2024)
};

export const STATE_RATES: StateRate[] = [
  { slug: "california", name: "California", ratePerKwh: 0.32 },
  { slug: "texas", name: "Texas", ratePerKwh: 0.15 },
  { slug: "florida", name: "Florida", ratePerKwh: 0.16 },
  { slug: "new-york", name: "New York", ratePerKwh: 0.24 },
  { slug: "washington", name: "Washington", ratePerKwh: 0.11 },
  { slug: "oregon", name: "Oregon", ratePerKwh: 0.13 },
  { slug: "arizona", name: "Arizona", ratePerKwh: 0.15 },
  { slug: "nevada", name: "Nevada", ratePerKwh: 0.15 },
  { slug: "colorado", name: "Colorado", ratePerKwh: 0.15 },
  { slug: "illinois", name: "Illinois", ratePerKwh: 0.16 },
  { slug: "georgia", name: "Georgia", ratePerKwh: 0.14 },
  { slug: "north-carolina", name: "North Carolina", ratePerKwh: 0.13 },
  { slug: "virginia", name: "Virginia", ratePerKwh: 0.14 },
  { slug: "massachusetts", name: "Massachusetts", ratePerKwh: 0.30 },
  { slug: "new-jersey", name: "New Jersey", ratePerKwh: 0.18 },
];

// Programmatic SEO route generation.
export type SeoPage = {
  slug: string;
  type: "model" | "model-state" | "charger" | "guide";
  title: string;
  description: string;
  h1: string;
  preset?: EvPreset;
  state?: StateRate;
  chargerType?: "level1" | "level2" | "supercharger" | "dcfast";
};

export function buildSeoPages(): SeoPage[] {
  const pages: SeoPage[] = [];

  // Per-model charging cost pages
  EV_PRESETS.filter(p => p.slug !== "generic-ev").forEach(p => {
    pages.push({
      slug: `${p.slug}-charging-cost`,
      type: "model",
      preset: p,
      title: `${p.fullName} Charging Cost (2026 Calculator)`,
      description: `Calculate the exact cost to charge a ${p.fullName}. Compare home, Supercharger, and public DC fast charging prices.`,
      h1: `${p.fullName} Charging Cost`,
    });
  });

  // Per-charger-type pages
  pages.push({
    slug: "tesla-supercharger-cost",
    type: "charger",
    chargerType: "supercharger",
    title: "Tesla Supercharger Cost (2026 Calculator & Guide)",
    description: "How much does a Tesla Supercharger cost? Calculate the exact price per kWh and per session for any Tesla model.",
    h1: "Tesla Supercharger Cost",
  });
  pages.push({
    slug: "home-ev-charging-cost",
    type: "charger",
    chargerType: "level2",
    title: "Home EV Charging Cost Calculator (2026)",
    description: "Find out how much it costs to charge an EV at home with Level 1 or Level 2. Free, instant calculator.",
    h1: "Home EV Charging Cost",
  });
  pages.push({
    slug: "public-dc-fast-charging-cost",
    type: "charger",
    chargerType: "dcfast",
    title: "Public DC Fast Charging Cost (2026 Calculator)",
    description: "Calculate the cost to use public DC fast chargers like Electrify America, EVgo, and ChargePoint.",
    h1: "Public DC Fast Charging Cost",
  });
  pages.push({
    slug: "level-1-vs-level-2-charging-cost",
    type: "charger",
    chargerType: "level2",
    title: "Level 1 vs Level 2 Home Charging Cost (2026)",
    description: "Compare Level 1 and Level 2 home EV charging costs and time. See which is right for your daily driving.",
    h1: "Level 1 vs Level 2 Charging Cost",
  });

  // Model × State combos (top models × all states)
  const topModels = EV_PRESETS.filter(p => ["tesla-model-3", "tesla-model-y", "ford-f-150-lightning", "chevy-bolt"].includes(p.slug));
  topModels.forEach(p => {
    STATE_RATES.forEach(s => {
      pages.push({
        slug: `${p.slug}-charging-cost-${s.slug}`,
        type: "model-state",
        preset: p,
        state: s,
        title: `${p.fullName} Charging Cost in ${s.name} (2026)`,
        description: `Cost to charge a ${p.fullName} at home in ${s.name} based on the ${s.name} average electricity rate of $${s.ratePerKwh.toFixed(2)}/kWh.`,
        h1: `${p.fullName} Charging Cost in ${s.name}`,
      });
    });
  });

  // Guide page
  pages.push({
    slug: "how-much-does-it-cost-to-charge-an-ev",
    type: "guide",
    title: "How Much Does It Cost to Charge an EV? (2026 Guide)",
    description: "A complete breakdown of EV charging costs: home, Tesla Supercharger, and public DC fast charging — with a free calculator.",
    h1: "How Much Does It Cost to Charge an EV?",
  });

  return pages;
}

export const SEO_PAGES = buildSeoPages();
