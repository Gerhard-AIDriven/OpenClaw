console.log('\n========================================');
console.log('DAILY HEALTH & NUTRITION REPORT');
console.log('April 19, 2026');
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
      '2 rashers bacon',
      '2 eggs fried in butter',
      '3 slices Spar cheddar (50g)',
      '2 slices Albany low GI seed bread',
      '1 tbsp Melrose cheese spread'
    ],
    cal: 655,
    carbs: 28,
    protein: 43,
    fat: 41.5
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
console.log(`Carbs     | ${daily.carbs.toFixed(1)}g        | 219g    | ${(daily.carbs/219*100).toFixed(1)}%    | 🔴 SHORT by ${(219-daily.carbs).toFixed(1)}g`);
console.log(`Protein   | ${daily.protein.toFixed(1)}g        | 110g    | ${(daily.protein/110*100).toFixed(1)}%    | ${daily.protein > 115 ? '⚠️ OVER' : '✅ OK'}`);
console.log(`Fat       | ${daily.fat.toFixed(1)}g        | 49g     | ${(daily.fat/49*100).toFixed(1)}%    | ✅ OK`);
console.log('-'.repeat(60));

console.log('\n\n🚨 CRITICAL ALERT\n');
console.log('You are 99.7g SHORT on carbs (only 54.5% of target)!');
console.log('');
console.log('GLUCOSE SPIKE RISK: Without immediate carb addition,');
console.log('expect fasting glucose 8.5-9.0+ tomorrow morning.');
console.log('');
console.log('URGENT ACTION REQUIRED:');
console.log('Add ~100g carbs before bed tonight. Options:');
console.log('  1. 2 bananas + 1 slice toast + honey = +84g carbs');
console.log('  2. Bowl of rice + milk = +72g carbs');
console.log('  3. 200g pasta + oil/garlic = +53g carbs (still short)');
console.log('');
console.log('⚡ TONIGHT\'S GOAL: Reach 219g carbs total to prevent spike\n');

console.log('\n📈 GLUCOSE PREDICTION\n');
console.log('IF you add 100g carbs now:');
console.log('  ✅ Expected fasting glucose tomorrow: 6.8-7.0 mmol/L');
console.log('  ✅ Weight likely stable or slight loss');
console.log('');
console.log('IF you skip carbs:');
console.log('  🔴 Expected fasting glucose tomorrow: 8.5-9.0+ mmol/L');
console.log('  🔴 Continued insulin resistance pattern\n');

console.log('========================================\n');
