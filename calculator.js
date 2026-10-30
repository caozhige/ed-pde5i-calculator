/* Locked-model calculation. No network, storage, or analytics. */
(function (root) {
  'use strict';
  const derived = ['bmi', 'nlr', 'lmr', 'plr', 'mhr'];
  const components = ['height_cm', 'weight_kg', 'neutrophil_10e9_L', 'lymphocyte_10e9_L', 'monocyte_10e9_L', 'platelet_10e9_L'];
  const integer = ['age_years', 'ed_duration_months', 'baseline_iief5', 'gad7', 'phq9', 'platelet_10e9_L'];
  const rawRequired = root.ED_MODEL.predictors.filter(n => !derived.includes(n)).concat(components);
  const blank = x => x === '' || x === null || x === undefined;
  // Round the scaled value to nearest, ties to even, matching stored study indices.
  function roundEven(value, digits) {
    const scale = 10 ** digits, scaled = Math.abs(value) * scale;
    const lower = Math.floor(scaled), fraction = scaled - lower;
    const nearest = fraction < .5 ? lower : fraction > .5 ? lower + 1 : lower % 2 === 0 ? lower : lower + 1;
    return Math.sign(value) * nearest / scale;
  }
  function derive(raw) {
    const x = { ...raw };
    const ratio = (name, a, b, digits, multiplier = 1) => {
      x[name] = blank(x[a]) || blank(x[b]) || !(Number(x[b]) > 0) ? null : roundEven(Number(x[a]) / (Number(x[b]) * multiplier), digits);
    };
    x.bmi = blank(x.height_cm) || blank(x.weight_kg) || !(Number(x.height_cm) > 0) ? null : roundEven(Number(x.weight_kg) / (Number(x.height_cm) / 100) ** 2, 1);
    ratio('nlr', 'neutrophil_10e9_L', 'lymphocyte_10e9_L', 2);
    ratio('lmr', 'lymphocyte_10e9_L', 'monocyte_10e9_L', 2);
    ratio('plr', 'platelet_10e9_L', 'lymphocyte_10e9_L', 2);
    ratio('mhr', 'monocyte_10e9_L', 'hdlc_mmol_L', 3);
    x.non_hdl_mmol_L = blank(x.tc_mmol_L) || blank(x.hdlc_mmol_L) ? null : roundEven(Number(x.tc_mmol_L) - Number(x.hdlc_mmol_L), 2);
    return x;
  }
  function validateRaw(raw) {
    const missing = rawRequired.filter(n => blank(raw[n]));
    const invalid = [];
    for (const n of rawRequired.concat(['tc_mmol_L', 'vldl_mmol_L'])) {
      if (blank(raw[n])) continue;
      const v = Number(raw[n]);
      if (root.ED_MODEL.binary.includes(n)) { if (![0, 1].includes(v)) invalid.push(n); continue; }
      if (!Number.isFinite(v) || v < 0 || (integer.includes(n) && !Number.isInteger(v))) { invalid.push(n); continue; }
      if (['height_cm', 'weight_kg', 'lymphocyte_10e9_L', 'monocyte_10e9_L', 'hdlc_mmol_L'].includes(n) && v <= 0) invalid.push(n);
      if (n === 'age_years' && v < 18) invalid.push(n);
      if (n === 'baseline_iief5' && (v < 5 || v > 21)) invalid.push(n);
      if (n === 'gad7' && v > 21) invalid.push(n);
      if (n === 'phq9' && v > 27) invalid.push(n);
    }
    return { missing, invalid: [...new Set(invalid)] };
  }
  function score(input) {
    const model = root.ED_MODEL, x = {}, imputed = [];
    for (const n of model.predictors) {
      let value = input[n];
      if (blank(value)) { value = model.imputation[n]; imputed.push(n); }
      if (model.binary.includes(n)) {
        if (value === 'Yes' || value === true || value === 1 || value === '1') value = 1;
        else if (value === 'No' || value === false || value === 0 || value === '0') value = 0;
        else throw new Error('Invalid category: ' + n);
      } else { value = Number(value); if (!Number.isFinite(value)) throw new Error('Invalid number: ' + n); }
      x[n] = value;
    }
    let lp = model.intercept;
    for (const [term, coefficient] of Object.entries(model.coefficients)) {
      const n = term.endsWith('_Yes') ? term.slice(0, -4) : term;
      lp += coefficient * x[n];
    }
    const probability = lp >= 0 ? 1 / (1 + Math.exp(-lp)) : Math.exp(lp) / (1 + Math.exp(lp));
    const warnings = model.predictors.filter(n => { const r = model.clinical_ranges[n]; return r && (x[n] < r[0] || x[n] > r[1]); });
    return { probability, lp, warnings, imputed, inputs: x };
  }
  root.EDCalculator = { rawRequired, derive, validateRaw, score, roundEven };
})(globalThis);
