# Next Moment

**Will tomorrow repeat?**

Two days of household energy use. Use the pattern to draw day three. Reveal the next 24 hours and see how close you came.

[Play Next Moment](https://shiqiaozhou.github.io/apps/next-moment/) · [GitHub](https://github.com/ShiqiaoZhou/next-moment)

![Twenty-four green columns rise and fall. One pale column steps forward.](assets/interval.webp)

## Play

1. Start with a repeating pattern and work through eight increasingly tricky levels.
2. Read the clues, including timed weather forecasts and household plans.
3. Draw with a mouse or finger, reveal the future, and compare errors. Lower is better.
4. Try 18 selected real household energy windows when you are ready.

English opens by default, with a Chinese switch. Drawings stay in your browser; language, progress, and scores are saved locally. The three baselines repeat the last value, the last six-hour average, or the previous day's hourly values. Rankings use mean absolute error (MAE, in kW).

## Run locally

Download `index.html` and open it directly in a modern browser. The cover and game are both inside this one file, so you can play offline.

To edit and rebuild, use Node.js 18 or newer:

```sh
npm run build
npm test
```

The build uses Node.js without additional dependencies. It embeds the cover, styles, scripts and data into `index.html`. Commit the rebuilt file when changing source.

## Source

| Path | Purpose |
| --- | --- |
| `src/page-template.html` | Layout, styles, drawing interactions, and reveal flow |
| `src/interval.css` | Interval typography, colours and responsive layout |
| `assets/interval.webp` | Cover artwork |
| `src/forecast-engine.js` | Baseline forecasts, interpolation, scoring, and chart range |
| `src/lesson-data.js` | Eight deterministic teaching scenarios |
| `src/data/energy-data.js` | Selected and aggregated real energy records |
| `src/journey-ui.js` | Level progression and event clues |
| `src/i18n-ui.js`, `src/content-en.js`, `src/ui-en.json` | English and Chinese interface text |
| `scripts/build.cjs` | Dependency-free standalone HTML build |
| `tests/` | Forecast math, reproducibility, and event-timing checks |

## Data and attribution

The eight teaching levels are **simulations**, including their weather and schedule clues. Their minute-level scenarios are averaged into hourly power values; a change at 14:30 affects only half of the 14:00–15:00 hour.

The 18 real challenges use **Individual Household Electric Power Consumption**, by Georges Hébrail and Alice Bérard (2006), UCI Machine Learning Repository, [DOI: 10.24432/C58K54](https://doi.org/10.24432/C58K54), licensed under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/).

We aggregate `Global_active_power` into hourly means, exclude incomplete hours, and select 48-hour history / 24-hour future windows. These are curated examples, not a representative benchmark. The real records have no accompanying weather observations; the game does not invent weather explanations for them. See [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md) for the source and processing details. The dataset's license applies to the derived data and does not designate a license for the project code.
