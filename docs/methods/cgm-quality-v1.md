# CGM observation support and missing-duration sensitivity

Method: `symphony-cgm-quality-v1`. Implemented 2026-11-19. This is descriptive analysis of one imported record, not a clinical validation study.

## Estimand and support convention

Readings are validated, sorted and deduplicated by instant, keeping the last valid value. Values are normalized to mmol/L. Let c be the **upper median** positive inter-reading gap among gaps ≤20 minutes; c defaults to 5 minutes if none exists. The audit records whether c was inferred. For each reading i, support is [tᵢ, min(tᵢ+c, tᵢ₊₁)); the final reading supports [tₙ, tₙ+c). Values are held constant only on that support. The full record window W is [t₁, tₙ+c). No longer gap is filled.

This is a declared approximation to sensor support, not measured device wear. Repeated missing samples can bias inferred cadence. The final interval and fallback cadence are assumptions. Changing either can change the support, summary, and bounds. The existing `symphony-cgm-v1` summary and the audit share the same exposure implementation.

## Day/hour audit

Support intervals are split at actual civil-hour and day boundaries in the **executing device's IANA time zone**, which is stored with the result. The original CSV offsets identify instants; they do not fix the analysis time zone. An identical file can therefore have different day/hour partitions on another device, while absolute-window totals remain unchanged.

For each day and hour, retain calendar duration, overlap with W, observed duration, observed in-range duration, and glucose × minutes. Mean glucose is glucose-minutes / observed minutes. Observed TIR is in-range minutes / observed minutes. Neither is defined without observations; null is exported. Hourly/window coverage is observed / overlap with W. Calendar-day completeness is observed / the entire civil-day duration. These denominators intentionally answer different questions.

Completely missing dates within W remain in the audit. Daylight-saving days use 23/25 hours as applicable. Repeated clock hours share their actual combined minutes in one column; skipped hours have zero minutes. Half-hour transitions are covered by reference cases. For bounded memory/UI work, detail covers the latest 366 calendar days and discloses truncation; full-upload totals and bounds still use every valid reading. UI pages show up to 14 days; CSV/JSON retain all available detail.

## Algebraic identification bounds

Let I be observed duration in the declared target range [3.9, 10.0] mmol/L, O total observed duration, and W elapsed record-window duration. Let M = W−O be unobserved duration. The target is the fraction of **the full W** in range, conditional on the sensor-support convention above.

Observed-only TIR = 100 I/O. Unknown in-range duration U can be any value in [0,M]. Thus full-window TIR = 100 (I+U)/W and its sharp bounds are:

```
lower = 100 I/W
upper = 100 (I+M)/W
width = 100 M/W = 100 − estimated coverage (%)
```

Example: W=120 min, O=60 min, I=30 min gives observed TIR 50% and full-window bounds 25–75%. With complete support the bounds collapse to observed TIR. They make no missing-at-random assumption and do not correct informative missingness. They are **not** confidence intervals, measurement-error intervals, future prediction intervals, or statements about time outside W. They can be broad, and narrow bounds do not establish physiological or clinical accuracy.

## Sources reviewed and implementation decisions

- [iglu repository](https://github.com/irinagain/iglu), DESCRIPTION version **4.5.4**, blob `49494bab8b6fff80f6ba07e4471897a35b55bb10`; [day-by-time visualization documentation](https://irinagain.github.io/iglu/articles/lasagna_plots.html), accessed 2026-11-19. Adopted the day/time grid as a way to expose gaps, with independent duration aggregation and a single copper scale. No source was copied; GPL code, interpolation, and clinical AGP equivalence are not part of this implementation.
- [Battelino et al., 2019 international consensus](https://doi.org/10.2337/dci19-0028), accessed 2026-11-19. Supports displaying collection duration, coverage and explicit ranges. The app's support-window coverage is an estimate and cannot demonstrate that a device was actually active. The new bounds are not a consensus-endorsed clinical metric.
- [Yu, Umpierrez and Peng, arXiv:2410.03091v1](https://arxiv.org/html/2410.03091v1), preprint, 2024-10-04, accessed 2026-11-19. Reviewed its estimand, missingness assumptions and IPW framework. It motivates making the missing-data denominator explicit. Its population-level inpatient estimator and asymptotic inference are **not** reproduced; our individual-record bounds are the elementary derivation above.
- [Hugging Face Gluformer model card](https://huggingface.co/anonymous-4FAD/Gluformer), accessed 2026-11-19, screened only. The card describes one-hour prediction and links [arXiv:2209.04526](https://arxiv.org/abs/2209.04526). The shared repo identifier and example-loading identifier differ. No checkpoint, remote code, clinical claim, or reported evaluation metric was adopted. Forecasting requires separate provenance, license and held-out-data evaluation. No biorxiv candidate was adopted for this deterministic missingness audit.

## Validation and limits

`tests/cgm-quality.test.ts` checks exact algebraic endpoints and all integer-minute completions, conservation against the summary support model, range thresholds, fully missing dates, midnight splitting, an independent minute-grid oracle for irregular/gapped sampling, New York's 23/25-hour days, Lord Howe's 23.5/24.5-hour days, detail truncation, null preservation, CSV and JSON provenance.

The browser review uses a deterministic **synthetic** 14-day fixture, desktop/mobile layouts and keyboard-operable inspection. These checks validate implementation properties, not clinical performance or equivalence to iglu. Independent package comparison, user-confirmed cadence and a report-level time-zone selector remain next work. No forecasting model is installed.
