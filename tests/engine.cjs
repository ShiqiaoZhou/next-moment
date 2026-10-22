'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const engine = require('../src/forecast-engine.js');

function close(actual, expected, message) {
  assert.ok(Math.abs(actual - expected) < 1e-10, message || `${actual} ~= ${expected}`);
}

// The errors are 0, 2 and -4: MAE = 2; RMSE = sqrt(20 / 3).
const errors = engine.score([2, 5, 1], [2, 3, 5]);
close(errors.mae, 2);
close(errors.rmse, Math.sqrt(20 / 3));
assert.throws(() => engine.score([1], [1, 2]), RangeError);
assert.throws(() => engine.score([NaN], [1]), TypeError);

const history = Array.from({ length: 72 }, (_, i) => i + 1);
const historyCopy = history.slice();
const baselines = engine.predict(history, 26);
assert.deepEqual(baselines.seasonal, history.slice(48).concat(history.slice(48, 50)));
assert.equal(baselines.persistence.length, 26);
assert.ok(baselines.persistence.every(value => value === 72));
assert.ok(baselines.movingAverage.every(value => Math.abs(value - 69.5) < 1e-10));
assert.deepEqual(history, historyCopy);
assert.throws(() => engine.predict([1, 2, 3]), TypeError);

const tied = engine.rank([1, 1], {
  persistence: [1 + 1e-11, 1 + 1e-11],
  movingAverage: [2, 2],
  seasonal: [3, 3]
}, [0, 0]);
assert.deepEqual(tied.map(entry => [entry.id, entry.rank]), [
  ['you', 1], ['persistence', 1], ['movingAverage', 3], ['seasonal', 4]
]);
const allEqual = engine.rank([4], {
  persistence: [4], movingAverage: [4], seasonal: [4]
}, [4]);
assert.ok(allEqual.every(entry => entry.rank === 1 && entry.mae === 0));

// Unordered samples, last duplicate wins, interpolation and constant edges.
const points = [{ x: 4, y: 50 }, { x: 1, y: 10 }, { x: 4, y: 40 }];
const pointsCopy = JSON.stringify(points);
assert.deepEqual(engine.resample(points, 7), [10, 10, 20, 30, 40, 40, 40]);
assert.equal(JSON.stringify(points), pointsCopy);
assert.deepEqual(engine.resample([{ x: 1.5, y: 7 }], 4), [7, 7, 7, 7]);
assert.deepEqual(engine.resample([{ x: 0.5, y: 10 }, { x: 2.5, y: 30 }], 4), [10, 15, 25, 30]);
close(engine.coverage(points, 7), 0.5);
assert.equal(engine.coverage([], 7), 0);
assert.equal(engine.coverage([{ x: 0, y: 2 }, { x: 6, y: 3 }], 7), 1);
assert.throws(() => engine.resample([], 24), RangeError);
assert.throws(() => engine.resample([{ x: 24, y: 1 }], 24), RangeError);

// Unseen future values cannot influence either predictions or the plot range.
const fullSeries = history.concat(Array(24).fill(999999));
const visible = fullSeries.slice(0, 72);
const beforePredictions = engine.predict(visible);
const beforeDomain = engine.yDomain(visible);
fullSeries.fill(-999999, 72);
assert.deepEqual(engine.predict(fullSeries.slice(0, 72)), beforePredictions);
assert.deepEqual(engine.yDomain(fullSeries.slice(0, 72)), beforeDomain);
assert.deepEqual(beforeDomain, [0, 115.2]);
assert.deepEqual(engine.yDomain([0, 0, 0]), [0, 1]);

// The same source also exposes its API in a plain browser without a bundler.
const browserContext = {};
vm.createContext(browserContext);
vm.runInContext(fs.readFileSync(path.join(__dirname, '../src/forecast-engine.js'), 'utf8'), browserContext);
assert.equal(typeof browserContext.ForecastEngine.predict, 'function');
assert.equal(browserContext.ForecastEngine.score([1], [1]).mae, 0);

console.log('Forecast engine: all checks passed.');
