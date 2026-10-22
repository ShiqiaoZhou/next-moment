(function () {
  'use strict';

  // Teaching scenarios, not measured UCI observations or historical forecasts.
  // All power values are hourly mean kW, integrated over 60 minute midpoints.
  // In particular, a 14:30 change affects only half of the 14:00–15:00 bin.
  // These generators contain no random source; identical inputs reproduce data.
  var DAY = 1440;

  function clamp01(value) { return Math.max(0, Math.min(1, value)); }
  function ramp(minute, start, end) { return clamp01((minute - start) / (end - start)); }
  function rounded(value) { return Math.round(value * 10000) / 10000; }
  function hours(powerAtMinute) {
    return Array.from({ length: 24 }, function (_, hour) {
      var total = 0;
      for (var minute = 0; minute < 60; minute += 1) {
        total += powerAtMinute(hour * 60 + minute + 0.5);
      }
      return rounded(total / 60);
    });
  }
  function historical(powerDayOne, powerDayTwo) {
    return hours(powerDayOne).concat(hours(powerDayTwo || powerDayOne));
  }
  function smoothDay(minute) {
    return 0.82 + 0.5 * Math.cos(2 * Math.PI * (minute - 14 * 60) / DAY);
  }
  function peak(minute, centerHour, widthHours) {
    var distance = Math.abs(minute / 60 - centerHour);
    distance = Math.min(distance, 24 - distance);
    return Math.exp(-0.5 * Math.pow(distance / widthHours, 2));
  }
  function doublePeak(minute) {
    return 0.30 + 0.85 * peak(minute, 7.5, 1.4) + 1.10 * peak(minute, 19, 2.0);
  }
  function cooling(temperature, setpoint) {
    return 0.09 * Math.max(0, temperature - (setpoint === undefined ? 24 : setpoint));
  }
  function weatherBase(minute) { return 0.85 * smoothDay(minute); }
  function fixedWeather(temperature) {
    return function (minute) { return weatherBase(minute) + cooling(temperature); };
  }
  function heatTemperature(minute) { return 26 + 6 * ramp(minute, 750, 810); }
  function rainTemperature(minute) {
    return 32 - 8 * ramp(minute, 615, 705) + 4 * ramp(minute, 1110, 1170);
  }
  function uncertainRainTemperature(minute) { return 31 - 5.5 * ramp(minute, 795, 885); }
  function uncertainHeatTemperature(minute) { return 28 + 4.4 * ramp(minute, 705, 795); }
  function away(minute) { return minute >= 870 && minute < 1050; }

  window.LESSON_DATA = {
    description: '8 关从规律到变化的情境模拟。曲线、天气预报与生活计划均为教学设定，并非真实天气记录；每个数据点表示该小时的平均功率（kW）。先看 48 小时，再预测第 3 天 00:00—24:00。',
    stages: [
      {
        id: 'lesson-v2-01', start: '2026-07-01T00:00:00',
        title: '01 · 今天像昨天', difficulty: '入门', kind: 'lesson', sourceType: 'simulation',
        history: historical(smoothDay), future: hours(smoothDay),
        hint: '先找两天重复出现的峰和谷。今天的作息完全相同，把昨天那条平缓的曲线再画一遍就很接近了。',
        events: [
          { hour: 0, minute: 0, type: 'pattern', title: '作息保持不变', detail: '今天延续前两天的固定作息：夜间低、白天高，每天只有一个平缓的主峰。' }
        ],
        insight: '这是完全重复的 24 小时周期。今天每个小时都与昨天同一小时一致；季节重复基线在这一关可以零误差，画对峰谷位置就已经掌握了规律。'
      },
      {
        id: 'lesson-v2-02', start: '2026-07-04T00:00:00',
        title: '02 · 早晚两次忙碌', difficulty: '入门', kind: 'lesson', sourceType: 'simulation',
        history: historical(doublePeak), future: hours(doublePeak),
        hint: '这一关一天有两个峰，晚上的峰更高、更宽。不要把中午的低谷连成一整天的高台。',
        events: [
          { hour: 7, minute: 30, type: 'schedule', title: '早餐高峰', detail: '全家照常在 07:30 前后做早餐和洗漱，早间忙碌的时段与前两天一致。' },
          { hour: 19, minute: 0, type: 'schedule', title: '晚间高峰', detail: '19:00 前后做饭、洗衣和居家活动，晚高峰比早高峰持续更久；今天作息没有变化。' }
        ],
        insight: '早晚双峰的时刻、宽度和高度都按天重复。晚峰更高、更宽，所以不能只复制早峰；季节重复基线仍然可以完整复现今天。'
      },
      {
        id: 'lesson-v2-03', start: '2026-07-07T00:00:00',
        title: '03 · 同样形状，整体抬高', difficulty: '入门', kind: 'lesson', sourceType: 'simulation',
        history: historical(smoothDay, function (minute) { return smoothDay(minute) + 0.16; }),
        future: hours(function (minute) { return smoothDay(minute) + 0.32; }),
        hint: '比较两天同一时刻的高度：第二天整条曲线都更高，增加的幅度也相同。保持形状，再沿用一次这个增量。',
        events: [
          { hour: 0, minute: 0, type: 'schedule', title: '每日增载继续', detail: '设备继续按照前两天相同的每日增载节奏运行；峰谷时刻与日内作息保持不变。' }
        ],
        insight: '第二天比第一天每小时高 0.16 kW，第三天继续增加同样的 0.16 kW。复制昨天的形状再整体上移，能补上季节重复基线遗漏的趋势。'
      },
      {
        id: 'lesson-v2-04', start: '2026-07-10T00:00:00',
        title: '04 · 午后的升温预报', difficulty: '进阶', kind: 'lesson', sourceType: 'simulation',
        history: historical(fixedWeather(26)),
        future: hours(function (minute) { return weatherBase(minute) + cooling(heatTemperature(minute)); }),
        hint: '前两天都是 26°C，空调负荷较轻。今天上午可以沿用旧规律；升温开始后，给曲线逐渐加上一层制冷用电。',
        events: [
          { hour: 12, minute: 30, type: 'weather', title: '26°C → 32°C', detail: '情境预报：12:30 开始升温，13:30 达到 32°C，之后保持至午夜。空调会随室外气温上升而增加用电。' }
        ],
        insight: '升温从 12:30 开始、持续 1 小时，因此 12:00—13:00 只有后半小时受影响，13:00—14:00 才接近完整增量。之后气温保持高位，额外制冷负荷也会持续，不能只画一个尖峰。'
      },
      {
        id: 'lesson-v2-05', start: '2026-07-13T00:00:00',
        title: '05 · 雨来降温，傍晚回暖', difficulty: '进阶', kind: 'lesson', sourceType: 'simulation',
        history: historical(fixedWeather(32)),
        future: hours(function (minute) { return weatherBase(minute) + cooling(rainTemperature(minute)); }),
        hint: '前两天都是 32°C。今天有两次天气变化：先降温减少制冷，傍晚再部分回升；生活作息仍照常。',
        events: [
          { hour: 10, minute: 15, type: 'weather', title: '阵雨带来降温', detail: '情境预报：10:15 开始下雨，气温在 11:45 前由 32°C 逐渐降至 24°C，并保持到 18:30。' },
          { hour: 18, minute: 30, type: 'weather', title: '雨停后部分回暖', detail: '情境预报：18:30—19:30 由 24°C 回升至 28°C，之后保持至午夜。空调负荷会回升，但不会回到前两天的水平。' }
        ],
        insight: '降温与回暖都按预报时段逐渐发生。中午虽然仍有日常活动，用电也明显低于炎热的昨天；傍晚回暖至 28°C，所以只恢复了一部分制冷负荷。'
      },
      {
        id: 'lesson-v2-06', start: '2026-07-16T00:00:00',
        title: '06 · 下午家里没有人', difficulty: '进阶', kind: 'lesson', sourceType: 'simulation',
        history: historical(smoothDay),
        future: hours(function (minute) { return away(minute) ? 0.22 : smoothDay(minute); }),
        hint: '这次变化来自已知的外出计划。把下午的高位压低，回家后接回原来的作息；半点发生的变化会分摊到相邻小时。',
        events: [
          { hour: 14, minute: 30, type: 'schedule', title: '14:30—17:30 全家外出', detail: '14:30 离家后，空调、照明和主要活动设备关闭，仅保留基础设备待机；17:30 到家后恢复平日作息。' }
        ],
        insight: '外出完整覆盖 15:00—17:00，而 14:00—15:00 与 17:00—18:00 各有半小时人在家。因此中间两小时最低，两端是过渡值，不能把 14:30 的变化提前成 14:00。'
      },
      {
        id: 'lesson-v2-07', start: '2026-07-19T00:00:00',
        title: '07 · 雨带可能晚一点', difficulty: '困难', kind: 'lesson', sourceType: 'simulation',
        history: historical(fixedWeather(31)),
        future: hours(function (minute) { return weatherBase(minute) + cooling(uncertainRainTemperature(minute)); }),
        hint: '预报给了时间和温度的范围。先抓住“午后逐渐降温”的方向，把转折画得平缓；不必赌准某一分钟。',
        events: [
          { hour: 13, minute: 0, type: 'weather', title: '13:00 左右，降温时间有误差', detail: '情境预报：雨带预计 13:00 到达，可能前后偏差 30 分钟；随后约 90 分钟内，气温由 31°C 降至 24—27°C，保持至午夜。' }
        ],
        insight: '这次模拟的雨带在 13:15 到达，14:45 降至 25.5°C，都在提前给出的预报范围内。按预报中心画缓慢下降，已能明显优于照抄昨天；剩下的小偏差来自预报本身的不确定性。'
      },
      {
        id: 'lesson-v2-08', start: '2026-07-22T00:00:00',
        title: '08 · 热浪遇上外出计划', difficulty: '困难', kind: 'lesson', sourceType: 'simulation',
        history: historical(fixedWeather(28)),
        future: hours(function (minute) {
          var temperature = uncertainHeatTemperature(minute);
          return away(minute)
            ? 0.22 + cooling(temperature, 27)
            : weatherBase(minute) + cooling(temperature);
        }),
        hint: '把两条消息叠起来考虑：升温会推高用电，外出会压低用电。回家时热浪还在，曲线应回到比昨天更高的位置。',
        events: [
          { hour: 11, minute: 30, type: 'weather', title: '午前升温，幅度略有不确定', detail: '情境预报：预计 11:30 前后 30 分钟开始升温，约 90 分钟内由 28°C 升至 31—33°C，之后保持至午夜。' },
          { hour: 14, minute: 30, type: 'schedule', title: '14:30—17:30 外出并节能', detail: '14:30 离家，关闭照明和活动设备，空调设定温度从 24°C 调至 27°C；17:30 到家后，设备与空调设定恢复平日状态。' }
        ],
        insight: '这次模拟在 11:45 开始升温，13:15 达到 32.4°C，均落在预报范围内。午前制冷负荷增加，14:30 外出后下降，17:30 回家再恢复；由于热浪持续，回家后的用电高于昨天同一时刻。'
      }
    ]
  };
})();
