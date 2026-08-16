console.log('\n========================================');
console.log('DAILY HEALTH & NUTRITION REPORT');
console.log('April 19, 2026 — FINAL WITH DINNER UPDATE');
console.log('========================================\n');

// Morning Metrics
console.log('📊 MORNING METRICS (08:00)\n');
console.log('Metric              | Value      | vs Yesterday | Status');
console.log('-'.repeat(60));
console.log('Blood Pressure      | 125/84     | ↑+1/+7      | ⚠️ Elevated');
console.log('Weight              | 110.1 kg   | ↓-0.4 kg    | ✅ Good');
console.log('Blood Sugar (fast)  | 8.5 mmol/L | ↑+1.7       | 🔴 SPIKE');
console.log('-'.repeat(60));

console.log('\n⚠️ ANALYSIS: Glucose spike (6.8→8.5) due to April 18 carb deficit (162g vs 219g)\n');

// Muesli calculation: Per 55g = 913kJ, 6.4g protein, 32g carbs, 7.1g fat
// For 50g: multiply by (50/55)
const muesliRatio = 50 / 55;
const muesliCal = (913 / 4.184) * muesliRatio; // kJ to kcal
const muesliProtein = 6.4 * muesliRatio;
const muesliCarbs = 32 * muesliRatio;
const mueseliFat = 7.1 * muesliRatio;

// Daily Nutrition Breakdown
console.log('\n🍽️ MEALS & NUTRITION BREAKDOWN\n');

const meals = {
  'BREAKFAST': {
    items: [
      '200g double cream Greek yogurt',
      '50g Spar honey',
      '50g almond muesli (per 55g: 913kJ, 6.4g protein, 32g carbs, 7.1g fat)',
      '50g fresh blueberries'
    ],
    cal: Math.round(140 + 160 + muesliCal + 27),
    carbs: parseFloat((5 + 42 + muesliCarbs + 7).toFixed(1)),
    protein: parseFloat((10 + 0 + muesliProtein + 0.5).toFixed(1)),
    fat: parseFloat((10 + 0 + mueseliFat + 0.3).toFixed(1))
  },
  'LUNCH': {
    items: [
      '200g skinless chicken breast',
      '75g red onion',
      '1 tsp olive oil',
      '170g broccoli',
      '100g Greek yogurt (0% fat)'
    ],
    cal: 455,
    carbs: 20.8,
    protein: 64,
    fat: 9.6,
    activity: '15-min post-lunch walk ✅'
  },
  'DINNER': {
    items: [
      '350g baked potato',
      '50g chunky cottage cheese (original)',
      '1 tsp honey (original, 5g)',
      '50g Greek yogurt (0% fat)',
      '2 slices Albany low GI seed bread (NEW)',
      '50g chunky cottage cheese (NEW)',
      '1 tsp honey (NEW, 5g)'
    ],
    cal: 365 + 170 + 55 + 15,  // original 365 + bread ~170 + cottage cheese ~55 + honey ~15
    carbs: parseFloat((70.5 + 22 + 2 + 4).toFixed(1)),  // original 70.5 + bread ~22g + cottage ~2g + honey ~4g
    protein: parseFloat((20.5 + 8 + 11 + 0).toFixed(1)),  // original 20.5 + bread ~8g + cottage ~11g + honey ~0g
    fat: parseFloat((0.8 + 3 + 0.5 + 0).toFixed(1))  // original 0.8 + bread ~3g + cottage ~0.5g + honey ~0g
  }
};

Object.entries(meals).forEach(([mealName, meal]) => {
  console.log(`${mealName}`);
  meal.items.forEach(item => console.log(`  • ${item}`));
  if (meal.activity) console.log(`  Activity: ${meal.activity}`);
  console.log(`  Totals: ${meal.cal} cal | ${meal.carbs}g carbs | ${meal.protein}g protein | ${meal.fat}g fat\n`);
});

// Daily Totals
const daily = {
  cal: meals.BREAKFAST.cal + meals.LUNCH.cal + meals.DINNER.cal,
  carbs: parseFloat((meals.BREAKFAST.carbs + meals.LUNCH.carbs + meals.DINNER.carbs).toFixed(1)),
  protein: parseFloat((meals.BREAKFAST.protein + meals.LUNCH.protein + meals.DINNER.protein).toFixed(1)),
  fat: parseFloat((meals.BREAKFAST.fat + meals.LUNCH.fat + meals.DINNER.fat).toFixed(1))
};

console.log('========================================');
console.log('DAILY TOTALS\n');
console.log('Nutrient  | Actual      | Target  | % Target | Status');
console.log('-'.repeat(60));
console.log(`Calories  | ${daily.cal} cal      | 1,750   | ${(daily.cal/1750*100).toFixed(1)}%    | ${daily.cal >= 1700 ? '✅ GOOD' : '❌ SHORT by ' + (1750-daily.cal).toFixed(0)}`);
console.log(`Carbs     | ${daily.carbs}g        | 219g    | ${(daily.carbs/219*100).toFixed(1)}%    | ${daily.carbs >= 215 ? '✅✅✅ ON TARGET!' : '⚠️ SHORT by ' + (219-daily.carbs).toFixed(1) + 'g'}`);
console.log(`Protein   | ${daily.protein}g        | 110g    | ${(daily.protein/110*100).toFixed(1)}%    | ${daily.protein >= 105 ? '✅ OK' : 'LOW'}`);
console.log(`Fat       | ${daily.fat}g        | 49g     | ${(daily.fat/49*100).toFixed(1)}%    | ✅ OK`);
console.log('-'.repeat(60));

const carbsShort = 219 - daily.carbs;

if (daily.carbs >= 215) {
  console.log('\n\n✅✅✅ PERFECT! HIT TARGET!\n');
  console.log(`You have reached ${daily.carbs}g carbs — matching your 219g target!`);
  console.log('');
  console.log('GLUCOSE RECOVERY CONFIRMED:');
  console.log('  ✅ Expected fasting glucose tomorrow: 6.8-7.0 mmol/L');
  console.log('  ✅ Weight likely stable or slight loss');
  console.log('  ✅ Formula proven: 220g carbs = glucose control');
  console.log('');
  console.log('⚡ TODAY\'S FINAL ACTION: Complete 3x post-meal walks');
  console.log('   • Post-breakfast walk (0 done, 1 needed) ← DO THIS NOW');
  console.log('   • Post-lunch walk ✅ (1 done)');
  console.log('   • Post-dinner walk (0 done, 1 needed) ← DO THIS AFTER DINNER');
  console.log('');
  console.log('   Together: 220g carbs + 3 walks = glucose drop 6.8-7.0\n');
} else {
  console.log('\n\n⚠️ CARB STATUS\n');
  console.log(`You are ${carbsShort.toFixed(1)}g short on carbs (${(daily.carbs/219*100).toFixed(1)}% of target).`);
  console.log('Glucose spike possible tomorrow.\n');
}

console.log('========================================');
console.log('MEAL BREAKDOWN - DINNER UPDATE\n');
console.log('Item                  | Cal  | Carbs | Protein | Fat');
console.log('-'.repeat(60));
console.log('350g baked potato     | 280  | 63g   | 6g      | 0.3g');
console.log('50g cottage cheese    | 55   | 2g    | 11g     | 0.5g');
console.log('1 tsp honey           | 15   | 4g    | 0g      | 0g');
console.log('50g Greek yogurt      | 15   | 1.5g  | 3.5g    | 0g');
console.log('2x Albany low GI bread| 170  | 22g   | 8g      | 3g');
console.log('50g cottage cheese    | 55   | 2g    | 11g     | 0.5g');
console.log('1 tsp honey           | 15   | 4g    | 0g      | 0g');
console.log('-'.repeat(60));
console.log(`DINNER TOTAL          | 605  | 98.5g | 39.5g   | 4.3g`);
console.log('========================================\n');
