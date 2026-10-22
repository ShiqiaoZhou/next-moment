# Third-party data

## Individual Household Electric Power Consumption

- **Creators:** Georges Hébrail and Alice Bérard (2006).
- **Repository:** UCI Machine Learning Repository.
- **Dataset:** [Individual Household Electric Power Consumption](https://archive.ics.uci.edu/dataset/235/individual+household+electric+power+consumption).
- **DOI:** [10.24432/C58K54](https://doi.org/10.24432/C58K54).
- **License:** [Creative Commons Attribution 4.0 International (CC BY 4.0)](https://creativecommons.org/licenses/by/4.0/).
- **Retrieved:** 2026-10-22.
- **Included in:** `src/data/energy-data.js`, embedded into `index.html` by the build.

Suggested attribution: Hébrail, G. & Bérard, A. (2006). *Individual Household Electric Power Consumption*. UCI Machine Learning Repository. https://doi.org/10.24432/C58K54. Licensed under CC BY 4.0. Hourly aggregation and window selection by the Next Moment project.

### Changes to the source data

The original records describe one household in Sceaux, France. This project uses the `Global_active_power` field (kW). Minute records are grouped by clock hour and averaged only when all 60 minute values are valid. Missing or incomplete hours are excluded, with no interpolation. Hourly values are rounded to six decimal places. Timestamps retain the original local clock values; no additional timezone is inferred.

Eighteen continuous windows were selected for gameplay, covering regular patterns, low variation, volatility, and baseline failures. Each contains 48 hours of history and 24 future hours. Selection is deliberate and does not establish overall model performance. The historical records do not include the weather or schedule clues used in the separate simulated lessons.

The CC BY 4.0 notice concerns these third-party data and their derivatives. It does not set a license for the project's source code, visual assets, or simulated teaching scenarios.
