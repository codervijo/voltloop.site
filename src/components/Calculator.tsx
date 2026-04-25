import { useEffect, useMemo, useState } from "react";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  CHARGER_LIST, CHARGER_TYPES, calculateChargingCost, compareChargers,
  formatCurrency,
} from "@/lib/charging";
import { EV_PRESETS, STATE_RATES, type EvPreset } from "@/lib/data";
import { Zap, Clock, Gauge, TrendingDown } from "lucide-react";

type CalculatorProps = {
  initialPresetSlug?: string;
  initialChargerType?: keyof typeof CHARGER_TYPES;
  initialStateSlug?: string;
  showCompare?: boolean;
};

const STORAGE_KEY = "voltloop:last-inputs";

export const Calculator = ({
  initialPresetSlug = "tesla-model-3",
  initialChargerType = "level2",
  initialStateSlug,
  showCompare = true,
}: CalculatorProps) => {
  const initialPreset = EV_PRESETS.find(p => p.slug === initialPresetSlug) ?? EV_PRESETS[0];
  const initialState = STATE_RATES.find(s => s.slug === initialStateSlug);

  const [preset, setPreset] = useState<EvPreset>(initialPreset);
  const [batterySize, setBatterySize] = useState<number>(initialPreset.batteryKwh);
  const [rangeMiles, setRangeMiles] = useState<number>(initialPreset.rangeMiles);
  const [currentPercent, setCurrentPercent] = useState<number>(20);
  const [targetPercent, setTargetPercent] = useState<number>(80);
  const [chargerType, setChargerType] = useState<keyof typeof CHARGER_TYPES>(initialChargerType);
  const [ratePerKwh, setRatePerKwh] = useState<number>(
    initialState?.ratePerKwh ?? CHARGER_TYPES[initialChargerType].defaultRate
  );
  const [stateSlug, setStateSlug] = useState<string>(initialState?.slug ?? "custom");
  const [compareMode, setCompareMode] = useState<boolean>(false);

  // Restore last inputs on mount (non-destructive of route-driven defaults)
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const s = JSON.parse(raw);
      if (typeof s.currentPercent === "number") setCurrentPercent(s.currentPercent);
      if (typeof s.targetPercent === "number") setTargetPercent(s.targetPercent);
    } catch {
      // ignore
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ currentPercent, targetPercent, chargerType })
      );
    } catch { /* ignore */ }
  }, [currentPercent, targetPercent, chargerType]);

  const result = useMemo(
    () => calculateChargingCost({
      batterySize, currentPercent, targetPercent, ratePerKwh, chargerType, rangeMiles,
    }),
    [batterySize, currentPercent, targetPercent, ratePerKwh, chargerType, rangeMiles]
  );

  const comparison = useMemo(() => compareChargers({
    batterySize, currentPercent, targetPercent,
    homeRate: stateSlug === "custom" ? ratePerKwh : (STATE_RATES.find(s => s.slug === stateSlug)?.ratePerKwh ?? 0.16),
    publicRate: 0.43,
    superchargerRate: 0.36,
    rangeMiles,
  }), [batterySize, currentPercent, targetPercent, ratePerKwh, stateSlug, rangeMiles]);

  const handlePresetChange = (slug: string) => {
    const p = EV_PRESETS.find(x => x.slug === slug);
    if (!p) return;
    setPreset(p);
    setBatterySize(p.batteryKwh);
    setRangeMiles(p.rangeMiles);
  };

  const handleStateChange = (slug: string) => {
    setStateSlug(slug);
    if (slug === "custom") return;
    const s = STATE_RATES.find(x => x.slug === slug);
    if (s) setRatePerKwh(s.ratePerKwh);
  };

  const handleChargerChange = (id: string) => {
    const next = id as keyof typeof CHARGER_TYPES;
    setChargerType(next);
    // Bump rate to charger's default if user is on a "custom" rate matching nothing meaningful
    if (stateSlug === "custom") setRatePerKwh(CHARGER_TYPES[next].defaultRate);
  };

  return (
    <Card className="surface-card p-6 md:p-8 rounded-2xl">
      {/* Result hero */}
      <div className="relative mb-8 overflow-hidden rounded-xl border border-hairline bg-gradient-glow p-6 md:p-8">
        <div className="grid gap-6 md:grid-cols-4">
          <ResultStat
            icon={<Zap className="h-4 w-4" />}
            label="Cost to charge"
            value={formatCurrency(result.cost)}
            primary
          />
          <ResultStat
            icon={<Clock className="h-4 w-4" />}
            label="Time"
            value={result.timeEstimate}
          />
          <ResultStat
            icon={<Gauge className="h-4 w-4" />}
            label="Energy added"
            value={`${result.energyNeeded} kWh`}
          />
          <ResultStat
            icon={<TrendingDown className="h-4 w-4" />}
            label="Cost / mile"
            value={`$${result.costPerMile.toFixed(3)}`}
          />
        </div>
      </div>

      {/* Inputs */}
      <div className="grid gap-8 md:grid-cols-2">
        <div className="space-y-6">
          <div>
            <Label className="text-xs uppercase tracking-wide text-muted-foreground">Vehicle</Label>
            <Select value={preset.slug} onValueChange={handlePresetChange}>
              <SelectTrigger className="mt-2 h-11">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {EV_PRESETS.map(p => (
                  <SelectItem key={p.slug} value={p.slug}>{p.fullName}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-xs uppercase tracking-wide text-muted-foreground">Battery (kWh)</Label>
              <Input
                type="number"
                inputMode="decimal"
                className="mt-2 h-11"
                value={batterySize}
                onChange={e => setBatterySize(Number(e.target.value) || 0)}
                min={10}
                max={250}
              />
            </div>
            <div>
              <Label className="text-xs uppercase tracking-wide text-muted-foreground">Range (mi)</Label>
              <Input
                type="number"
                inputMode="numeric"
                className="mt-2 h-11"
                value={rangeMiles}
                onChange={e => setRangeMiles(Number(e.target.value) || 0)}
                min={50}
                max={600}
              />
            </div>
          </div>

          <div>
            <div className="flex items-baseline justify-between">
              <Label className="text-xs uppercase tracking-wide text-muted-foreground">Current charge</Label>
              <span className="font-display text-sm text-foreground">{currentPercent}%</span>
            </div>
            <Slider
              className="mt-3"
              value={[currentPercent]}
              max={100}
              step={1}
              onValueChange={v => setCurrentPercent(Math.min(v[0], targetPercent - 1))}
            />
          </div>

          <div>
            <div className="flex items-baseline justify-between">
              <Label className="text-xs uppercase tracking-wide text-muted-foreground">Target charge</Label>
              <span className="font-display text-sm text-foreground">{targetPercent}%</span>
            </div>
            <Slider
              className="mt-3"
              value={[targetPercent]}
              max={100}
              step={1}
              onValueChange={v => setTargetPercent(Math.max(v[0], currentPercent + 1))}
            />
          </div>
        </div>

        <div className="space-y-6">
          <div>
            <Label className="text-xs uppercase tracking-wide text-muted-foreground">Charger</Label>
            <Tabs value={chargerType} onValueChange={handleChargerChange} className="mt-2">
              <TabsList className="grid w-full grid-cols-2 gap-1 bg-surface p-1 h-auto">
                {CHARGER_LIST.map(c => (
                  <TabsTrigger
                    key={c.id}
                    value={c.id}
                    className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground text-xs h-9"
                  >
                    {c.short}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
          </div>

          <div>
            <Label className="text-xs uppercase tracking-wide text-muted-foreground">Electricity rate ($/kWh)</Label>
            <div className="mt-2 grid grid-cols-2 gap-3">
              <Input
                type="number"
                step="0.01"
                inputMode="decimal"
                className="h-11"
                value={ratePerKwh}
                onChange={e => { setRatePerKwh(Number(e.target.value) || 0); setStateSlug("custom"); }}
              />
              <Select value={stateSlug} onValueChange={handleStateChange}>
                <SelectTrigger className="h-11">
                  <SelectValue placeholder="State preset" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="custom">Custom rate</SelectItem>
                  {STATE_RATES.map(s => (
                    <SelectItem key={s.slug} value={s.slug}>
                      {s.name} — ${s.ratePerKwh.toFixed(2)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {showCompare && (
            <div className="flex items-center justify-between rounded-lg border border-hairline bg-surface/60 p-4">
              <div>
                <p className="font-display text-sm">Compare chargers</p>
                <p className="text-xs text-muted-foreground">See home vs Supercharger vs DC fast</p>
              </div>
              <Switch checked={compareMode} onCheckedChange={setCompareMode} />
            </div>
          )}
        </div>
      </div>

      {showCompare && compareMode && (
        <div className="mt-8 grid gap-3 md:grid-cols-3">
          <CompareCard
            label="Home (Level 2)"
            cost={comparison.home.cost}
            isCheapest={comparison.cheapest === comparison.home}
          />
          <CompareCard
            label="Tesla Supercharger"
            cost={comparison.supercharger.cost}
            isCheapest={comparison.cheapest === comparison.supercharger}
          />
          <CompareCard
            label="Public DC Fast"
            cost={comparison.dcfast.cost}
            isCheapest={comparison.cheapest === comparison.dcfast}
          />
          <div className="md:col-span-3 rounded-lg border border-primary/30 bg-primary/5 p-4 text-sm">
            <span className="text-muted-foreground">Charging at home saves </span>
            <span className="font-display text-primary">{formatCurrency(comparison.savings)}</span>
            <span className="text-muted-foreground"> per session vs the most expensive option.</span>
          </div>
        </div>
      )}
    </Card>
  );
};

const ResultStat = ({
  icon, label, value, primary,
}: { icon: React.ReactNode; label: string; value: string; primary?: boolean }) => (
  <div>
    <div className="flex items-center gap-1.5 text-xs uppercase tracking-wide text-muted-foreground">
      {icon}
      {label}
    </div>
    <div className={`mt-2 font-display ${primary ? "text-4xl md:text-5xl text-gradient" : "text-2xl md:text-3xl text-foreground"}`}>
      {value}
    </div>
  </div>
);

const CompareCard = ({ label, cost, isCheapest }: { label: string; cost: number; isCheapest: boolean }) => (
  <div className={`rounded-lg border p-4 transition-all ${isCheapest ? "border-primary bg-primary/5 shadow-glow" : "border-hairline bg-surface"}`}>
    <p className="text-xs uppercase tracking-wide text-muted-foreground">{label}</p>
    <p className="mt-1 font-display text-2xl text-foreground">{formatCurrency(cost)}</p>
    {isCheapest && <p className="mt-1 text-xs text-primary">Cheapest</p>}
  </div>
);
