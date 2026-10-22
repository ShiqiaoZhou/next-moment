(function (root, factory) {
  'use strict';
  if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.ForecastEngine = factory();
  }
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';

  var BASELINE_IDS = ['persistence', 'movingAverage', 'seasonal'];
  var TIE_TOLERANCE = 1e-9;

  function validateHorizon(horizon) {
    if (horizon === undefined) return 24;
    if (!Number.isSafeInteger(horizon) || horizon < 1 || horizon > 10000) {
      throw new RangeError('horizon must be an integer from 1 to 10000.');
    }
    return horizon;
  }

  function validateSeries(series, name, minimumLength) {
    if (!Array.isArray(series) || series.length < minimumLength) {
      throw new TypeError(name + ' must be an array with at least ' + minimumLength + ' value(s).');
    }
    for (var i = 0; i < series.length; i += 1) {
      if (typeof series[i] !== 'number' || !Number.isFinite(series[i])) {
        throw new TypeError(name + ' must contain finite numbers only.');
      }
    }
  }

  function normalizePoints(points, horizon) {
    if (!Array.isArray(points)) throw new TypeError('points must be an array.');
    var byX = new Map();
    points.forEach(function (point) {
      if (!point || typeof point.x !== 'number' || typeof point.y !== 'number' ||
          !Number.isFinite(point.x) || !Number.isFinite(point.y)) {
        throw new TypeError('Each point must have finite numeric x and y values.');
      }
      if (point.x < 0 || point.x > horizon - 1) {
        throw new RangeError('Point x must be between 0 and horizon - 1.');
      }
      // A later stroke can replace an existing sample without mutating the input.
      byX.set(point.x, point.y);
    });
    return Array.from(byX, function (entry) {
      return { x: entry[0], y: entry[1] };
    }).sort(function (a, b) { return a.x - b.x; });
  }

  function predict(history, horizon) {
    horizon = validateHorizon(horizon);
    validateSeries(history, 'history', 24);
    var last = history[history.length - 1];
    var average = 0;
    for (var i = history.length - 6; i < history.length; i += 1) {
      average += history[i] / 6;
    }
    var result = { persistence: [], movingAverage: [], seasonal: [] };
    for (var step = 0; step < horizon; step += 1) {
      result.persistence.push(last);
      result.movingAverage.push(average);
      result.seasonal.push(history[history.length - 24 + (step % 24)]);
    }
    return result;
  }

  function score(prediction, actual) {
    validateSeries(prediction, 'prediction', 1);
    validateSeries(actual, 'actual', 1);
    if (prediction.length !== actual.length) {
      throw new RangeError('prediction and actual must have equal lengths.');
    }
    var mae = 0;
    var meanSquare = 0;
    for (var i = 0; i < actual.length; i += 1) {
      var error = prediction[i] - actual[i];
      mae += Math.abs(error) / actual.length;
      meanSquare += error * error / actual.length;
    }
    return { mae: mae, rmse: Math.sqrt(meanSquare) };
  }

  function nearlyEqual(a, b) {
    return Math.abs(a - b) <= TIE_TOLERANCE * Math.max(1, Math.abs(a), Math.abs(b));
  }

  function rank(userPrediction, baselineMap, actual) {
    if (!baselineMap || typeof baselineMap !== 'object') {
      throw new TypeError('baselineMap must contain the three baseline predictions.');
    }
    var entries = [{ id: 'you', prediction: userPrediction }];
    BASELINE_IDS.forEach(function (id) {
      entries.push({ id: id, prediction: baselineMap[id] });
    });
    var results = entries.map(function (entry, index) {
      var errors = score(entry.prediction, actual);
      return { id: entry.id, mae: errors.mae, rmse: errors.rmse, order: index };
    });
    results.sort(function (a, b) { return a.mae - b.mae || a.order - b.order; });
    // Competition ranks: equal MAE receives 1, 1, 3 rather than 1, 2, 3.
    // Compare each group with its first entry to avoid chained near-equal ties.
    var groupError = results[0].mae;
    var groupRank = 1;
    return results.map(function (entry, index) {
      if (!nearlyEqual(entry.mae, groupError)) {
        groupError = entry.mae;
        groupRank = index + 1;
      }
      return { id: entry.id, mae: entry.mae, rmse: entry.rmse, rank: groupRank };
    });
  }

  function resample(points, horizon) {
    horizon = validateHorizon(horizon);
    var sorted = normalizePoints(points, horizon);
    if (!sorted.length) throw new RangeError('At least one drawing point is required.');
    var values = [];
    var right = 0;
    for (var x = 0; x < horizon; x += 1) {
      while (right < sorted.length && sorted[right].x < x) right += 1;
      if (right === 0) {
        values.push(sorted[0].y);
      } else if (right === sorted.length) {
        values.push(sorted[sorted.length - 1].y);
      } else {
        var a = sorted[right - 1];
        var b = sorted[right];
        var ratio = (x - a.x) / (b.x - a.x);
        values.push(a.y + (b.y - a.y) * ratio);
      }
    }
    return values;
  }

  function coverage(points, horizon) {
    horizon = validateHorizon(horizon);
    var sorted = normalizePoints(points, horizon);
    if (!sorted.length) return 0;
    if (horizon === 1) return 1;
    return (sorted[sorted.length - 1].x - sorted[0].x) / (horizon - 1);
  }

  function yDomain(history) {
    validateSeries(history, 'history', 1);
    var maximum = history[0];
    var minimum = history[0];
    for (var i = 1; i < history.length; i += 1) {
      maximum = Math.max(maximum, history[i]);
      minimum = Math.min(minimum, history[i]);
    }
    // The graph scale is derived exclusively from the visible history.
    // The lower-bound extension also keeps the utility valid for net export data.
    return [Math.min(0, minimum * 1.6), Math.max(1, maximum * 1.6)];
  }

  return {
    predict: predict,
    score: score,
    rank: rank,
    resample: resample,
    coverage: coverage,
    yDomain: yDomain
  };
});
