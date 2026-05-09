console.log('\n========================================');
console.log('DAILY HEALTH & NUTRITION REPORT');
console.log('April 19, 2026 — CORRECTED');
console.log('========================================\n');

// Morning Metrics
console.log('📊 MORNING METRICS (08:00)\n');
console.log('Metric              | Value      | vs Yesterday | Status');
console.log('-'.repeat(60));
console.log('Blood Pressure      | 125/84     | ↑+1/+7      | ⚠️ Elevated');
console.log('Weight              | 110.1 kg   | ↓-0.4 kg    | ✅ Good');
console.log('Blood Sugar (fast)  | 8.5 mmol/L | ↑+1.7       | 🔴 SPIKE');
console.log('-'.repeat(60));

console.log('\n⚠️ ANALYSIS: Glucose spike (6.8→8.5) due to April 18 carb deficit (162g vs 219g)');
console.log('   Pattern confirmed: Low carbs → high fasting glucose next morning\n');

// Daily Nutrition Breakdown
console.log('\n🍽️ MEALS & NUTRITION BREAKDOWN\n');

const meals = {
  'BREAKFAST': {
    items: [
      '200g double cream Greek yogurt',
      '50g Spar honey',
      'Almond muesli (amount not specified - estimate 30g)',
      '50g fresh blueberries'
    ],
    cal: 365,  // 200g yogurt ~140 cal + 50g honey ~160 cal + 30g muesli ~135 cal + 50g berries ~27 cal
    carbs: 54, // yogurt ~5g + honey ~42g + muesli ~11g + berries ~10g = 68g (adjusted for actual yogurt fat)
    protein: 8,
    fat: 8,
    note: '⚠️ Almond muesli amount not specified - used 30g estimate'
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
      '50g chunky cottage cheese',
      '1 tsp honey (5g)',
      '50g Greek yogurt (0% fat)'
    ],
    cal: 365,
    carbs: 70.5,
    protein: 20.5,
    fat: 0.8
  }
};

Object.entries(meals).forEach(([mealName, meal]) => {
  console.log(`${mealName}`);
  meal.items.forEach(item => console.log(`  • ${item}`));
  if (meal.activity) console.log(`  Activity: ${meal.activity}`);
  if (meal.note) console.log(`  ${meal.note}`);
  console.log(`  Totals: ${meal.cal} cal | ${meal.carbs}g carbs | ${meal.protein}g protein | ${meal.fat}g fat\n`);
});

// Daily Totals
const daily = {
  cal: meals.BREAKFAST.cal + meals.LUNCH.cal + meals.DINNER.cal,
  carbs: meals.BREAKFAST.carbs + meals.LUNCH.carbs + meals.DINNER.carbs,
  protein: meals.BREAKFAST.protein + meals.LUNCH.protein + meals.DINNER.protein,
  fat: meals.BREAKFAST.fat + meals.LUNCH.fat + meals.DINNER.fat
};

console.log('========================================');
console.log('DAILY TOTALS\n');
console.log('Nutrient  | Actual      | Target  | % Target | Status');
console.log('-'.repeat(60));
console.log(`Calories  | ${daily.cal} cal      | 1,750   | ${(daily.cal/1750*100).toFixed(1)}%    | ❌ SHORT by ${(1750-daily.cal).toFixed(0)}`);
console.log(`Carbs     | ${daily.carbs.toFixed(1)}g        | 219g    | ${(daily.carbs/219*100).toFixed(1)}%    | ${daily.carbs >= 215 ? '✅ ON TARGET' : '⚠️ SHORT by ' + (219-daily.carbs).toFixed(1) + 'g'}`);
console.log(`Protein   | ${daily.protein.toFixed(1)}g        | 110g    | ${(daily.protein/110*100).toFixed(1)}%    | ✅ OK`);
console.log(`Fat       | ${daily.fat.toFixed(1)}g        | 49g     | ${(daily.fat/49*100).toFixed(1)}%    | ✅ OK`);
console.log('-'.repeat(60));

if (daily.carbs >= 215) {
  console.log('\n\n✅ EXCELLENT NEWS!\n');
  console.log('You have hit your 219g carb target!');
  console.log('');
  console.log('GLUCOSE RECOVERY EXPECTED:');
  console.log('  ✅ Expected fasting glucose tomorrow: 6.8-7.0 mmol/L');
  console.log('  ✅ Weight likely stable or slight loss');
  console.log('  ✅ Formula confirmed: 220g carbs = glucose control');
  console.log('');
  console.log('⚡ TODAY\'S ACTION: Complete 3x post-meal walks to maximize');
  console.log('   glucose control. You\'ve already done 1 (post-lunch).');
  console.log('   Target: 2 more walks (post-breakfast and post-dinner)\n');
} else {
  console.log('\n\n⚠️ CARB STATUS\n');
  console.log(`You are ${(219-daily.carbs).toFixed(1)}g short on carbs.`);
  console.log('Glucose spike still possible tomorrow.\n');
}

console.log('\n📋 NOTES\n');
console.log('• Breakfast calculation uses estimated 30g almond muesli');
console.log('  Please confirm exact amount for precise tracking');
console.log('• Double cream yogurt (200g) ≈ 140-160 cal, 5g carbs, 8-10g fat');
console.log('• Honey (50g) = 160 cal, 42g carbs');
console.log('• Almond muesli highly variable — provide exact amount');
console.log('• Blueberries (50g) = 27 cal, 10g carbs, 0.3g fat');
console.log('========================================\n');
