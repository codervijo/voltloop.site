export const CHARGER_TYPES = {
  L1: { label: 'Level 1 — 120V household outlet', powerKw: 1.4 },
  L2: { label: 'Level 2 — 240V home / public', powerKw: 7.2 },
  Supercharger: { label: 'DC Fast / Tesla Supercharger', powerKw: 150 }
};

const DEFAULT_EFFICIENCY_MI_PER_KWH = 3.5;

export function calculateChargingCost({
  batterySize,
  currentPercent,
  targetPercent,
  ratePerKwh,
  chargerType = 'L2',
  efficiencyMiPerKwh = DEFAULT_EFFICIENCY_MI_PER_KWH
}) {
  const battery = toNumber(batterySize);
  const start = clamp(toNumber(currentPercent), 0, 100);
  const end = clamp(toNumber(targetPercent), 0, 100);
  const rate = Math.max(toNumber(ratePerKwh), 0);

  const deltaPercent = Math.max(end - start, 0);
  const energyNeeded = (battery * deltaPercent) / 100;
  const cost = energyNeeded * rate;

  const charger = CHARGER_TYPES[chargerType] || CHARGER_TYPES.L2;
  const hours = charger.powerKw > 0 ? energyNeeded / charger.powerKw : 0;

  const efficiency = Math.max(toNumber(efficiencyMiPerKwh), 0.1);
  const costPerMile = rate / efficiency;

  return {
    energyNeeded: round(energyNeeded, 2),
    cost: round(cost, 2),
    hours: round(hours, 2),
    timeEstimate: formatHours(hours),
    costPerMile: round(costPerMile, 3),
    chargerLabel: charger.label,
    chargerPowerKw: charger.powerKw
  };
}

function toNumber(v) {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
}

function clamp(n, lo, hi) {
  return Math.min(Math.max(n, lo), hi);
}

function round(n, places = 2) {
  const f = 10 ** places;
  return Math.round(n * f) / f;
}

function formatHours(hours) {
  if (!hours || hours <= 0) return '0 min';
  const totalMinutes = Math.round(hours * 60);
  const h = Math.floor(totalMinutes / 60);
  const m = totalMinutes % 60;
  if (h <= 0) return `${m} min`;
  if (m === 0) return `${h} hr`;
  return `${h} hr ${m} min`;
}
