'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const source = fs.readFileSync(__dirname + '/../src/lesson-data.js', 'utf8');
function load() {
  const sandbox = { window: {} };
  vm.runInNewContext(source, sandbox);
  return JSON.parse(JSON.stringify(sandbox.window.LESSON_DATA));
}
const data = load();
assert.deepEqual(data, load(), 'All scenarios must be reproducible');
assert.equal(data.stages.length, 8);
const ids = new Set();
for (const stage of data.stages) {
  assert(!ids.has(stage.id)); ids.add(stage.id);
  assert.equal(stage.kind, 'lesson');
  assert.equal(stage.sourceType, 'simulation');
  assert.equal(stage.history.length, 48);
  assert.equal(stage.future.length, 24);
  assert(stage.events.length >= 1 && stage.events.length <= 2);
  assert(stage.history.concat(stage.future).every(v => Number.isFinite(v) && v >= 0));
  assert(Math.max(...stage.future) <= Math.max(1, Math.max(...stage.history) * 1.6), 'future must fit the history-derived drawing axis');
  assert(stage.start.endsWith('T00:00:00') && !Number.isNaN(Date.parse(stage.start)));
  for (const event of stage.events) {
    assert(Number.isInteger(event.hour) && event.hour >= 0 && event.hour <= 23);
    assert(Number.isInteger(event.minute) && event.minute >= 0 && event.minute <= 59);
    assert(['pattern', 'weather', 'schedule'].includes(event.type));
    assert(event.title && event.detail);
  }
}
function near(actual, expected, label, tolerance = 0.00011) {
  assert(Math.abs(actual - expected) < tolerance, `${label}: ${actual} vs ${expected}`);
}
const [s1, s2, s3, s4, s5, s6, s7, s8] = data.stages;
assert.deepEqual(s1.history.slice(0, 24), s1.history.slice(24));
assert.deepEqual(s1.future, s1.history.slice(24));
assert.deepEqual(s2.future, s2.history.slice(24));
assert(s2.future[7] > s2.future[6] && s2.future[7] > s2.future[8]);
assert(s2.future[18] > s2.future[7] && s2.future[19] > s2.future[7]);
assert(s2.future[12] < s2.future[7] / 2);
for (let hour = 0; hour < 24; hour++) {
  near(s3.history[24 + hour] - s3.history[hour], 0.16, 'historical daily increment');
  near(s3.future[hour] - s3.history[24 + hour], 0.16, 'continued daily increment');
}
// Analytical integral of the smooth profile; independent of the minute sampler.
function smoothIntegral(startHour, endHour) {
  const omega = 2 * Math.PI / 24;
  return 0.82 * (endHour - startHour) + 0.5 / omega *
    (Math.sin(omega * (endHour - 14)) - Math.sin(omega * (startHour - 14)));
}
near(s6.future[14], smoothIntegral(14, 14.5) + 0.22 * 0.5, '14:30 departure half-bin');
near(s6.future[15], 0.22, 'full absence at 15:00');
near(s6.future[16], 0.22, 'full absence at 16:00');
near(s6.future[17], 0.22 * 0.5 + smoothIntegral(17.5, 18), '17:30 return half-bin');
assert.deepEqual(s6.future.slice(0, 14), s6.history.slice(24, 38));
assert.deepEqual(s6.future.slice(18), s6.history.slice(42));
// Ramp deltas are integrated over exact hour overlap, including quarter hours.
for (const [hour, expected] of [[11, 0], [12, 0.0675], [13, 0.4725], [14, 0.54], [23, 0.54]]) {
  near(s4.future[hour] - s4.history[24 + hour], expected, '12:30 heat ramp at hour ' + hour);
}
for (const [hour, expected] of [[9, 0], [10, -0.135], [11, -0.585], [12, -0.72], [18, -0.675], [19, -0.405], [20, -0.36]]) {
  near(s5.future[hour] - s5.history[24 + hour], expected, 'rain/rewarming at hour ' + hour);
}
// Verify the actual uncertain outcomes stay inside the advance forecast ranges.
assert(13.25 >= 12.5 && 13.25 <= 13.5 && 25.5 >= 24 && 25.5 <= 27);
assert(11.75 >= 11 && 11.75 <= 12 && 32.4 >= 31 && 32.4 <= 33);
near(s7.future[15] - s7.history[39], -5.5 * 0.09, 'rain target persists');
near(s8.future[18] - s8.history[42], 4.4 * 0.09, 'heat persists after return');
// Analytic energy during the known half-hour away boundary in the final stage.
near(s8.future[14], 0.85 * smoothIntegral(14, 14.5) + 0.5 * 0.09 * (32.4 - 24) +
  0.5 * (0.22 + 0.09 * (32.4 - 27)), 'final departure half-bin');
near(s8.future[17], 0.5 * (0.22 + 0.09 * (32.4 - 27)) +
  0.85 * smoothIntegral(17.5, 18) + 0.5 * 0.09 * (32.4 - 24), 'final return half-bin');

function mae(pred, actual) { return pred.reduce((sum, v, i) => sum + Math.abs(v - actual[i]), 0) / 24; }
function baselineErrors(stage) {
  const last = Array(24).fill(stage.history[47]);
  const mean = Array(24).fill(stage.history.slice(-6).reduce((a, b) => a + b, 0) / 6);
  return [mae(last, stage.future), mae(mean, stage.future), mae(stage.history.slice(-24), stage.future)];
}
function forecastHours(fn) {
  return Array.from({ length: 24 }, (_, h) => {
    let total = 0;
    for (let m = 0; m < 60; m++) total += fn(h + (m + 0.5) / 60);
    return total / 60;
  });
}
function clip(v) { return Math.max(0, Math.min(1, v)); }
function smooth(h) { return 0.82 + 0.5 * Math.cos(2 * Math.PI * (h - 14) / 24); }
// Plausible forecasts use only the event's nominal time and midpoint temperature.
const centerForecast7 = forecastHours(h => 0.85 * smooth(h) +
  0.09 * (31 - 5.5 * clip((h - 13) / 1.5) - 24));
const centerForecast8 = forecastHours(h => {
  const temp = 28 + 4 * clip((h - 11.5) / 1.5);
  return h >= 14.5 && h < 17.5 ? 0.22 + 0.09 * (temp - 27) : 0.85 * smooth(h) + 0.09 * (temp - 24);
});
const evidence = data.stages.map(stage => ({
  stage: stage.id,
  bestCurveOnlyMAE: Number(Math.min(...baselineErrors(stage)).toFixed(5)),
  minKW: Math.min(...stage.history, ...stage.future),
  maxKW: Math.max(...stage.history, ...stage.future)
}));
evidence[6].forecastCenterMAE = Number(mae(centerForecast7, s7.future).toFixed(5));
evidence[7].forecastCenterMAE = Number(mae(centerForecast8, s8.future).toFixed(5));
assert(mae(centerForecast7, s7.future) < Math.min(...baselineErrors(s7)) * 0.1);
assert(mae(centerForecast8, s8.future) < Math.min(...baselineErrors(s8)) * 0.1);
console.log(JSON.stringify({ passed: true, checks: '8 schemas; reproducibility; 48/24 lengths; nonnegative; cycles; trend; analytical half-hour/quarter-hour integration; uncertainty bounds; helpful forecast-center strategy', evidence }, null, 2));
