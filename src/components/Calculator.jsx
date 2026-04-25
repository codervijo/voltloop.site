import { useMemo, useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Divider,
  MenuItem,
  Slider,
  Stack,
  TextField,
  Typography
} from '@mui/material';
import { CHARGER_TYPES, calculateChargingCost } from '../lib/calc.js';

export default function Calculator({
  batterySize: initialBattery = 75,
  currentPercent: initialCurrent = 20,
  targetPercent: initialTarget = 80,
  ratePerKwh: initialRate = 0.16,
  chargerType: initialCharger = 'L2'
}) {
  const [batterySize, setBatterySize] = useState(initialBattery);
  const [currentPercent, setCurrentPercent] = useState(initialCurrent);
  const [targetPercent, setTargetPercent] = useState(initialTarget);
  const [ratePerKwh, setRatePerKwh] = useState(initialRate);
  const [chargerType, setChargerType] = useState(initialCharger);

  const result = useMemo(
    () =>
      calculateChargingCost({
        batterySize,
        currentPercent,
        targetPercent,
        ratePerKwh,
        chargerType
      }),
    [batterySize, currentPercent, targetPercent, ratePerKwh, chargerType]
  );

  function reset() {
    setBatterySize(initialBattery);
    setCurrentPercent(initialCurrent);
    setTargetPercent(initialTarget);
    setRatePerKwh(initialRate);
    setChargerType(initialCharger);
  }

  return (
    <Card variant="outlined" sx={{ borderRadius: 3, my: 3 }}>
      <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
        <Typography variant="h5" component="h2" sx={{ mb: 2, fontWeight: 600 }}>
          Charging Cost Calculator
        </Typography>

        <Stack spacing={3}>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <TextField
              label="Battery size (kWh)"
              type="number"
              value={batterySize}
              onChange={(e) => setBatterySize(Number(e.target.value))}
              inputProps={{ min: 1, max: 300, step: 1, inputMode: 'decimal' }}
              fullWidth
            />
            <TextField
              label="Electricity rate ($/kWh)"
              type="number"
              value={ratePerKwh}
              onChange={(e) => setRatePerKwh(Number(e.target.value))}
              inputProps={{ min: 0, step: 0.01, inputMode: 'decimal' }}
              fullWidth
            />
          </Stack>

          <Box>
            <Typography gutterBottom>Current charge: <strong>{currentPercent}%</strong></Typography>
            <Slider
              value={currentPercent}
              onChange={(_, v) => setCurrentPercent(Array.isArray(v) ? v[0] : v)}
              min={0}
              max={100}
              valueLabelDisplay="auto"
              aria-label="Current charge percent"
            />
          </Box>

          <Box>
            <Typography gutterBottom>Target charge: <strong>{targetPercent}%</strong></Typography>
            <Slider
              value={targetPercent}
              onChange={(_, v) => setTargetPercent(Array.isArray(v) ? v[0] : v)}
              min={0}
              max={100}
              valueLabelDisplay="auto"
              aria-label="Target charge percent"
            />
          </Box>

          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems={{ sm: 'center' }}>
            <TextField
              label="Charger type"
              select
              value={chargerType}
              onChange={(e) => setChargerType(e.target.value)}
              fullWidth
            >
              {Object.entries(CHARGER_TYPES).map(([key, info]) => (
                <MenuItem key={key} value={key}>
                  {info.label}
                </MenuItem>
              ))}
            </TextField>
            <Button variant="text" onClick={reset} sx={{ alignSelf: { xs: 'flex-start', sm: 'center' } }}>
              Reset
            </Button>
          </Stack>
        </Stack>

        <Divider sx={{ my: 3 }} />

        <Stack alignItems="center" spacing={0.5}>
          <Typography variant="overline" color="text.secondary">
            Estimated cost
          </Typography>
          <Typography
            component="p"
            sx={{
              fontWeight: 700,
              fontSize: { xs: '3rem', sm: '4rem' },
              lineHeight: 1.1,
              color: '#0b65d6'
            }}
          >
            ${result.cost.toFixed(2)}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {result.energyNeeded} kWh added • {result.timeEstimate} on {result.chargerLabel.split(' —')[0]} • ~${result.costPerMile.toFixed(3)}/mile
          </Typography>
        </Stack>
      </CardContent>
    </Card>
  );
}
