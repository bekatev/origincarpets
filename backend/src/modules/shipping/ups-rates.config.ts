import type { UpsRateZone } from './ups-zones';

/**
 * UPS Express Saver — Origin Carpets (USD).
 * Weight brackets are 0.5 kg steps from 0.5 → 10.0.
 * Chargeable weight is rounded UP to the next 0.5 kg bracket.
 */
export const UPS_WEIGHT_STEPS_KG = [
  0.5, 1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5, 5.5, 6, 6.5, 7, 7.5, 8, 8.5, 9, 9.5, 10
] as const;

export type UpsWeightStepKg = (typeof UPS_WEIGHT_STEPS_KG)[number];

/** Fixed USD price per weight bracket for each international zone. */
export const UPS_EXPRESS_SAVER_USD: Record<
  Exclude<UpsRateZone, 'GE_DOMESTIC'>,
  Record<UpsWeightStepKg, number>
> = {
  ZONE_1: {
    0.5: 64,
    1: 73,
    1.5: 79,
    2: 88,
    2.5: 92,
    3: 99,
    3.5: 106,
    4: 114,
    4.5: 121,
    5: 127,
    5.5: 137,
    6: 147,
    6.5: 157,
    7: 167,
    7.5: 177,
    8: 187,
    8.5: 197,
    9: 207,
    9.5: 217,
    10: 227
  },
  ZONE_2_3: {
    0.5: 54,
    1: 63,
    1.5: 69,
    2: 78,
    2.5: 87,
    3: 94,
    3.5: 101,
    4: 109,
    4.5: 116,
    5: 122,
    5.5: 130,
    6: 138,
    6.5: 146,
    7: 154,
    7.5: 162,
    8: 170,
    8.5: 178,
    9: 186,
    9.5: 194,
    10: 202
  },
  ZONE_4: {
    0.5: 54,
    1: 63,
    1.5: 69,
    2: 78,
    2.5: 87,
    3: 94,
    3.5: 101,
    4: 109,
    4.5: 116,
    5: 122,
    5.5: 128,
    6: 134,
    6.5: 140,
    7: 146,
    7.5: 152,
    8: 158,
    8.5: 164,
    9: 170,
    9.5: 176,
    10: 182
  },
  ZONE_5: {
    0.5: 64,
    1: 73,
    1.5: 79,
    2: 88,
    2.5: 97,
    3: 104,
    3.5: 111,
    4: 119,
    4.5: 126,
    5: 132,
    5.5: 138,
    6: 144,
    6.5: 150,
    7: 156,
    7.5: 162,
    8: 168,
    8.5: 174,
    9: 180,
    9.5: 186,
    10: 192
  },
  ZONE_6: {
    0.5: 64,
    1: 73,
    1.5: 79,
    2: 88,
    2.5: 97,
    3: 104,
    3.5: 111,
    4: 119,
    4.5: 126,
    5: 132,
    5.5: 138,
    6: 144,
    6.5: 150,
    7: 156,
    7.5: 162,
    8: 168,
    8.5: 174,
    9: 180,
    9.5: 186,
    10: 192
  }
};

/** USD step added per extra 0.5 kg above 10 kg (from 9.5 → 10.0 deltas). */
export const UPS_OVER_10KG_STEP_USD: Record<Exclude<UpsRateZone, 'GE_DOMESTIC'>, number> = {
  ZONE_1: 10,
  ZONE_2_3: 8,
  ZONE_4: 6,
  ZONE_5: 6,
  ZONE_6: 6
};

/** Kept for env/config compatibility; quotes no longer convert EUR. */
export const DEFAULT_USD_PER_EUR = 1 / 0.92;
