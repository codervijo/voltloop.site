// Voltloop core charging cost logic.
// Pure functions — easy to test, easy to extend (e.g. live electricity rates API).

export const CHARGER_TYPES = {
  level1: {
    id: "level1",
    label: "Home — Level 1 (120V)",
    short: "Level 1",
    powerKw: 1.4,
    efficiency: 0.85,
    defaultRate: 0.16,
  },
  level2: {
    id: "level2",
    label: "Home — Level 2 (240V)",
    short: "Level 2",
    powerKw: 7.6,
    efficiency: 0.9,
    defaultRate: 0.16,
  },
  supercharger: {
    id: "supercharger",
    label: "Tesla Supercharger",
    short: "Supercharger",
    powerKw: 150,
    efficiency: 0.95,
    defaultRate: 0.36,
  },
  dcfast: {
    id: "dcfast",
    label: "Public DC Fast",
    short: "DC Fast",
    powerKw: 100,
    efficiency: 0.94,
    defaultRate: 0.43,
  },
};

export const CHARGER_LIST = Object.values(CHARGER_TYPES);

/**
 * Calculate charging cost, energy, time, and cost per mile.
 */
export function calculateChargingCost({
  batterySize,
  currentPercent,
  targetPercent,
  ratePerKwh,
  chargerType = "level2",
  rangeMiles = 300,
}: {
  batterySize: number;
  currentPercent: number;
  targetPercent: number;
  ratePerKwh: number;
  chargerType?: keyof typeof CHARGER_TYPES;
  rangeMiles?: number;
}) {
  const charger = CHARGER_TYPES[chargerType] ?? CHARGER_TYPES.level2;
  const delta = Math.max(0, targetPercent - currentPercent) / 100;

  const energyDelivered = batterySize * delta; // kWh into battery
  const energyDrawn = energyDelivered / charger.efficiency; // kWh from grid
  const cost = energyDrawn * ratePerKwh;

  // DC fast tapers above 80%; approximate effective power
  let effectivePower = charger.powerKw;
  if (charger.id === "supercharger" || charger.id === "dcfast") {
    if (targetPercent > 80) effectivePower *= 0.65;
    else effectivePower *= 0.85;
  }
  const hours = energyDelivered / effectivePower;
  const milesAdded = (delta * rangeMiles);
  const costPerMile = milesAdded > 0 ? cost / milesAdded : 0;

  return {
    energyNeeded: round(energyDelivered, 2),
    energyDrawn: round(energyDrawn, 2),
    cost: round(cost, 2),
    timeHours: round(hours, 2),
    timeEstimate: formatDuration(hours),
    costPerMile: round(costPerMile, 3),
    milesAdded: round(milesAdded, 0),
  };
}

export function compareChargers({
  batterySize,
  currentPercent,
  targetPercent,
  homeRate,
  publicRate,
  superchargerRate,
  rangeMiles = 300,
}: {
  batterySize: number;
  currentPercent: number;
  targetPercent: number;
  homeRate: number;
  publicRate: number;
  superchargerRate: number;
  rangeMiles?: number;
}) {
  const home = calculateChargingCost({
    batterySize, currentPercent, targetPercent,
    ratePerKwh: homeRate, chargerType: "level2", rangeMiles,
  });
  const supercharger = calculateChargingCost({
    batterySize, currentPercent, targetPercent,
    ratePerKwh: superchargerRate, chargerType: "supercharger", rangeMiles,
  });
  const dcfast = calculateChargingCost({
    batterySize, currentPercent, targetPercent,
    ratePerKwh: publicRate, chargerType: "dcfast", rangeMiles,
  });
  const cheapest = [home, supercharger, dcfast].reduce((a, b) => (a.cost < b.cost ? a : b));
  const savings = round(Math.max(supercharger.cost, dcfast.cost) - home.cost, 2);
  return { home, supercharger, dcfast, cheapest, savings };
}

function round(n: number, p = 2) {
  const f = Math.pow(10, p);
  return Math.round(n * f) / f;
}

export function formatDuration(hours: number) {
  if (!isFinite(hours) || hours <= 0) return "—";
  if (hours < 1) {
    const m = Math.round(hours * 60);
    return `${m} min`;
  }
  const h = Math.floor(hours);
  const m = Math.round((hours - h) * 60);
  return m === 0 ? `${h} hr` : `${h} hr ${m} min`;
}

export function formatCurrency(n: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(n);
}
