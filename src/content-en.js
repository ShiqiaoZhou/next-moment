// English text only. Data, timestamps and event order stay in the source files.
window.CONTENT_EN = {
  lessons: {
    'lesson-v2-01': {
      title: 'A day on repeat',
      difficulty: 'Beginner',
      hint: 'Find the peaks and dips that repeat on both days. Today follows exactly the same routine, so drawing yesterday\'s smooth curve again will get you close.',
      events: [
        { title: 'The same daily routine', detail: 'Today follows the same routine as the past two days: low use at night, higher use during the day, and one smooth daily peak.' }
      ],
      insight: 'This is an exactly repeating 24-hour cycle. Every hour matches the same hour yesterday. The Repeat yesterday baseline can score zero error here; matching the peaks and dips captures the pattern.'
    },
    'lesson-v2-02': {
      title: 'Morning and evening peaks',
      difficulty: 'Beginner',
      hint: 'There are two peaks each day. The evening peak is taller and wider. Keep the midday dip instead of drawing a high plateau all day.',
      events: [
        { title: 'Breakfast peak', detail: 'Breakfast and the family\'s morning routine happen around 07:30, just as on the past two days.' },
        { title: 'Evening peak', detail: 'Cooking, laundry and activities at home pick up around 19:00. The evening peak lasts longer than the morning peak. Today\'s routine is unchanged.' }
      ],
      insight: 'The timing, width and height of both peaks repeat each day. The evening peak is taller and wider, so it is not a copy of the morning peak. Repeat yesterday can reproduce the whole day exactly.'
    },
    'lesson-v2-03': {
      title: 'Same shape, higher level',
      difficulty: 'Beginner',
      hint: 'Compare the same hours on the two days: the entire second day sits higher by the same amount. Keep the shape and add that increase once more.',
      events: [
        { title: 'The daily increase continues', detail: 'Equipment use keeps increasing at the same daily rate as before. Peak times, low points and the daily routine stay the same.' }
      ],
      insight: 'Day 2 is 0.16 kW above day 1 at every hour. Day 3 adds another 0.16 kW. Copy yesterday\'s shape and shift it upward to account for the trend that Repeat yesterday misses.'
    },
    'lesson-v2-04': {
      title: 'A hotter afternoon',
      difficulty: 'Intermediate',
      hint: 'Both previous days were 26°C, with light air-conditioning use. Keep the old pattern in the morning, then gradually add cooling demand as temperatures rise.',
      events: [
        { title: '26°C → 32°C', detail: 'Scenario forecast: warming starts at 12:30, reaches 32°C at 13:30, and stays there until midnight. Air-conditioning use increases as the outdoor temperature rises.' }
      ],
      insight: 'Warming starts at 12:30 and takes 1 hour. Only the second half of 12:00–13:00 is affected; 13:00–14:00 gets almost the full increase. The heat and extra cooling demand then persist, so draw a sustained rise rather than a single spike.'
    },
    'lesson-v2-05': {
      title: 'Rain, then a warmer evening',
      difficulty: 'Intermediate',
      hint: 'Both previous days were 32°C. Today brings two weather changes: cooling first reduces air-conditioning use, then evening warmth brings some of it back. The household routine stays the same.',
      events: [
        { title: 'Rain brings cooler air', detail: 'Scenario forecast: rain starts at 10:15. The temperature gradually falls from 32°C to 24°C by 11:45, then stays there until 18:30.' },
        { title: 'Some warmth returns', detail: 'Scenario forecast: from 18:30–19:30, the temperature rises from 24°C to 28°C, then stays there until midnight. Cooling demand rises again, but stays below the past two days.' }
      ],
      insight: 'Cooling and warming both happen gradually during the forecast periods. Daily activities continue at midday, but electricity use is much lower than on hot yesterday. The evening warms to 28°C, restoring only part of the cooling demand.'
    },
    'lesson-v2-06': {
      title: 'An afternoon away',
      difficulty: 'Intermediate',
      hint: 'A planned outing changes today\'s pattern. Lower the afternoon curve, then return to the usual routine when everyone gets home. Half-hour changes are averaged into the hourly readings.',
      events: [
        { title: 'Everyone is out, 14:30–17:30', detail: 'At 14:30, everyone leaves. Air conditioning, lights and the main activity-related appliances are switched off; only essential standby equipment remains. The usual routine resumes at 17:30.' }
      ],
      insight: 'The home is empty throughout 15:00–17:00. Someone is home for half of 14:00–15:00 and half of 17:00–18:00, so the two middle hours are lowest and the edge hours are transitional averages. The drop starts at 14:30, not 14:00.'
    },
    'lesson-v2-07': {
      title: 'Rain may arrive late',
      difficulty: 'Hard',
      hint: 'The forecast gives a range for both timing and temperature. Focus on gradual afternoon cooling and draw a smooth turn. You do not need to guess the exact minute.',
      events: [
        { title: 'Around 13:00, give or take 30 minutes', detail: 'Scenario forecast: a rain band is expected at 13:00, up to 30 minutes early or late. Over roughly the next 90 minutes, the temperature falls from 31°C to 24–27°C and stays there until midnight.' }
      ],
      insight: 'In this simulation, the rain band arrives at 13:15 and the temperature reaches 25.5°C at 14:45, both within the forecast ranges. A gradual drop around the forecast\'s central estimate can beat copying yesterday. Some remaining error reflects uncertainty in the forecast itself.'
    },
    'lesson-v2-08': {
      title: 'Heat meets an outing',
      difficulty: 'Hard',
      hint: 'Combine both clues: heat pushes electricity use up, while the outing pushes it down. The heat is still there when everyone returns, so the curve should rejoin the daily pattern above yesterday\'s level.',
      events: [
        { title: 'Late-morning heat, with some uncertainty', detail: 'Scenario forecast: warming starts around 11:30, up to 30 minutes early or late. Over roughly 90 minutes, the temperature rises from 28°C to 31–33°C and stays there until midnight.' },
        { title: 'Away and saving energy, 14:30–17:30', detail: 'At 14:30, everyone leaves, turns off lights and activity-related appliances, and raises the air-conditioning setpoint from 24°C to 27°C. At 17:30, the household returns and restores the usual settings and activities.' }
      ],
      insight: 'In this simulation, warming starts at 11:45 and reaches 32.4°C at 13:15, within the forecast ranges. Cooling demand rises before noon, falls when everyone leaves at 14:30, and returns at 17:30. The heat persists, so use after returning is higher than at the same hours yesterday.'
    }
  },
  real: {
    'uci-01': { insight: 'The next 24 hours have a 0.92 correlation with the same hours yesterday. Repeat yesterday has a mean absolute error of 0.22 kW. The daily pattern carries over clearly in this window.' },
    'uci-02': { insight: 'The next 24 hours have a 0.91 correlation with the same hours yesterday. Repeat yesterday has a mean absolute error of 0.39 kW. The daily pattern carries over clearly in this window.' },
    'uci-03': { insight: 'The next 24 hours have a 0.89 correlation with the same hours yesterday. Repeat yesterday has a mean absolute error of 0.30 kW. The daily pattern carries over clearly in this window.' },
    'uci-04': { insight: 'The next 24 hours have a 0.88 correlation with the same hours yesterday. Repeat yesterday has a mean absolute error of 0.25 kW. The daily pattern carries over clearly in this window.' },
    'uci-05': { insight: 'The next 24 hours stay between 0.14–0.21 kW. When variation stays low, a simple average can be a strong baseline. You do not need to draw a turn for every small fluctuation.' },
    'uci-06': { insight: 'The next 24 hours stay between 0.17–0.25 kW. When variation stays low, a simple average can be a strong baseline. You do not need to draw a turn for every small fluctuation.' },
    'uci-07': { insight: 'The highest value, 6.33 kW, occurs in forecast hour 24; the lowest is 0.29 kW. In a volatile window, both the timing and size of peaks affect error. The curve alone cannot identify the appliances or causes.' },
    'uci-08': { insight: 'The highest value, 6.08 kW, occurs in forecast hour 3; the lowest is 0.26 kW. In a volatile window, both the timing and size of peaks affect error. The curve alone cannot identify the appliances or causes.' },
    'uci-09': { insight: 'The highest value, 5.76 kW, occurs in forecast hour 8; the lowest is 0.31 kW. In a volatile window, both the timing and size of peaks affect error. The curve alone cannot identify the appliances or causes.' },
    'uci-10': { insight: 'The highest value, 4.86 kW, occurs in forecast hour 16; the lowest is 0.28 kW. In a volatile window, both the timing and size of peaks affect error. The curve alone cannot identify the appliances or causes.' },
    'uci-11': { insight: 'The highest value, 5.14 kW, occurs in forecast hour 7; the lowest is 0.29 kW. In a volatile window, both the timing and size of peaks affect error. The curve alone cannot identify the appliances or causes.' },
    'uci-12': { insight: 'The highest value, 4.81 kW, occurs in forecast hour 11; the lowest is 0.28 kW. In a volatile window, both the timing and size of peaks affect error. The curve alone cannot identify the appliances or causes.' },
    'uci-13': { insight: 'Average power over the next 24 hours is 1.70 kW higher than over the previous 24 hours. Repeat yesterday has a mean absolute error of 1.87 kW. The earlier rhythm does not fully carry over, and the curve alone cannot explain why it changed.' },
    'uci-14': { insight: 'Average power over the next 24 hours is 1.54 kW lower than over the previous 24 hours. Repeat yesterday has a mean absolute error of 1.94 kW. The earlier rhythm does not fully carry over, and the curve alone cannot explain why it changed.' },
    'uci-15': { insight: 'Average power over the next 24 hours is 1.39 kW higher than over the previous 24 hours. Repeat yesterday has a mean absolute error of 1.60 kW. The earlier rhythm does not fully carry over, and the curve alone cannot explain why it changed.' },
    'uci-16': { insight: 'Average power over the next 24 hours is 1.13 kW higher than over the previous 24 hours. Repeat yesterday has a mean absolute error of 1.65 kW. The earlier rhythm does not fully carry over, and the curve alone cannot explain why it changed.' },
    'uci-17': { insight: 'Average power over the next 24 hours is 1.39 kW higher than over the previous 24 hours. Repeat yesterday has a mean absolute error of 1.66 kW. The earlier rhythm does not fully carry over, and the curve alone cannot explain why it changed.' },
    'uci-18': { insight: 'Average power over the next 24 hours is 0.98 kW lower than over the previous 24 hours. Repeat yesterday has a mean absolute error of 1.44 kW. The earlier rhythm does not fully carry over, and the curve alone cannot explain why it changed.' }
  }
};
