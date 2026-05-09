console.log('📊 DINNER CALCULATION — April 19, 2026\n');

const meals = {
  'Baked Potato (350g)': { cal: 280, carbs: 63, protein: 6, fat: 0.3 },
  'Cottage Cheese (50g, chunky)': { cal: 55, carbs: 2, protein: 11, fat: 0.5 },
  'Honey (1 tsp, 5g)': { cal: 15, carbs: 4, protein: 0, fat: 0 },
  'Greek Yogurt (50g, 0% fat)': { cal: 15, carbs: 1.5, protein: 3.5, fat: 0 }
};

let dinnerTotals = { cal: 0, carbs: 0, protein: 0, fat: 0 };

console.log('Item                                | Cal | Carbs | Protein | Fat');
console.log('-'.repeat(75));

Object.entries(meals).forEach(([item, vals]) => {
  console.log(`${item.padEnd(33)} | ${vals.cal.toString().padStart(3)} | ${vals.carbs.toString().padStart(5)} | ${vals.protein.toString().padStart(7)} | ${vals.fat.toString().padStart(4)}`);
  dinnerTotals.cal += vals.cal;
  dinnerTotals.carbs += vals.carbs;
  dinnerTotals.protein += vals.protein;
  dinnerTotals.fat += vals.fat;
});

console.log('-'.repeat(75));
console.log(`DINNER TOTALS                       | ${dinnerTotals.cal.toString().padStart(3)} | ${dinnerTotals.carbs.toFixed(1).toString().padStart(5)} | ${dinnerTotals.protein.toFixed(1).toString().padStart(7)} | ${dinnerTotals.fat.toFixed(1).toString().padStart(4)}`);

console.log('\n');

// Daily totals
const breakfast = { cal: 655, carbs: 28, protein: 43, fat: 41.5 };
const lunch = { cal: 455, carbs: 20.8, protein: 64, fat: 9.6 };

const daily = {
  cal: breakfast.cal + lunch.cal + dinnerTotals.cal,
  carbs: breakfast.carbs + lunch.carbs + dinnerTotals.carbs,
  protein: breakfast.protein + lunch.protein + dinnerTotals.protein,
  fat: breakfast.fat + lunch.fat + dinnerTotals.fat
};

console.log('📈 DAILY TOTALS (Breakfast + Lunch + Dinner)\n');
console.log('Meal       | Calories | Carbs (g) | Protein (g) | Fat (g)');
console.log('-'.repeat(60));
console.log(`Breakfast  | ${breakfast.cal.toString().padStart(8)} | ${breakfast.carbs.toString().padStart(9)} | ${breakfast.protein.toString().padStart(11)} | ${breakfast.fat.toString().padStart(6)}`);
console.log(`Lunch      | ${lunch.cal.toString().padStart(8)} | ${lunch.carbs.toString().padStart(9)} | ${lunch.protein.toString().padStart(11)} | ${lunch.fat.toString().padStart(6)}`);
console.log(`Dinner     | ${dinnerTotals.cal.toString().padStart(8)} | ${dinnerTotals.carbs.toFixed(1).toString().padStart(9)} | ${dinnerTotals.protein.toFixed(1).toString().padStart(11)} | ${dinnerTotals.fat.toFixed(1).toString().padStart(6)}`);
console.log('-'.repeat(60));
console.log(`DAILY TOTAL| ${daily.cal.toString().padStart(8)} | ${daily.carbs.toFixed(1).toString().padStart(9)} | ${daily.protein.toFixed(1).toString().padStart(11)} | ${daily.fat.toFixed(1).toString().padStart(6)}`);

console.log('\n');

const targets = { cal: 1750, carbs: 219, protein: 110, fat: 49 };

console.log('✅ vs TARGETS\n');
const calPct = (daily.cal/targets.cal*100).toFixed(1);
const carbsPct = (daily.carbs/targets.carbs*100).toFixed(1);
const proteinPct = (daily.protein/targets.protein*100).toFixed(1);
const fatPct = (daily.fat/targets.fat*100).toFixed(1);

console.log(`Calories:  ${daily.cal}/${targets.cal} (${calPct}%)`);
console.log(`Carbs:     ${daily.carbs.toFixed(1)}/${targets.carbs} (${carbsPct}%) ${daily.carbs >= targets.carbs - 5 ? '✅ ON TARGET' : '❌ SHORT'}`);
console.log(`Protein:   ${daily.protein.toFixed(1)}/${targets.protein} (${proteinPct}%) ${daily.protein > targets.protein + 5 ? '⚠️ OVER' : '✅ OK'}`);
console.log(`Fat:       ${daily.fat.toFixed(1)}/${targets.fat} (${fatPct}%) ${daily.fat > targets.fat + 5 ? '⚠️ OVER' : '✅ OK'}`);

console.log('\n🎯 GLUCOSE IMPACT ASSESSMENT\n');
if (daily.carbs >= targets.carbs - 5) {
  console.log('✅✅✅ EXCELLENT! Hit 219g carb target.');
  console.log('Expected glucose response: Drop back to 6.8-7.0 mmol/L by tomorrow morning.');
  console.log('Action: Complete 3 post-meal walks today to maximize glucose control.');
} else {
  console.log('⚠️ Carbs short of target. May see glucose spike tomorrow.');
}
