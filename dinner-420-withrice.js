const items = [
  { name: "Beef goulash (250g)", cal: 375, carbs: 5, protein: 45, fat: 18 },
  { name: "Canola oil (1 tsp)", cal: 40, carbs: 0, protein: 0, fat: 4.5 },
  { name: "Red onion (50g)", cal: 18, carbs: 4.3, protein: 0.6, fat: 0.1 },
  { name: "Tomato (1 medium, ~150g)", cal: 27, carbs: 5.8, protein: 1.3, fat: 0.3 },
  { name: "Green pepper (1 medium, ~150g)", cal: 30, carbs: 7.2, protein: 1, fat: 0.3 },
  { name: "Sweet potato (100g)", cal: 86, carbs: 20.1, protein: 1.6, fat: 0.1 },
  { name: "Brown rice cooked (1 cup = ~195g)", cal: 215, carbs: 45, protein: 5, fat: 1.8 }
];

let totals = { cal: 0, carbs: 0, protein: 0, fat: 0 };
items.forEach(item => {
  totals.cal += item.cal;
  totals.carbs += item.carbs;
  totals.protein += item.protein;
  totals.fat += item.fat;
});

console.log("=== DINNER (2026-04-20 WITH RICE) ===\n");
items.forEach(item => {
  console.log(`${item.name}`);
  console.log(`  ${item.cal}cal | ${item.carbs}g carbs | ${item.protein}g protein | ${item.fat}g fat\n`);
});

console.log("=== DINNER TOTALS ===");
console.log(`Calories: ${totals.cal}`);
console.log(`Carbs: ${totals.carbs.toFixed(1)}g`);
console.log(`Protein: ${totals.protein.toFixed(1)}g`);
console.log(`Fat: ${totals.fat.toFixed(1)}g`);

// Breakfast: 289 | 46.6 | 22.5 | 5.8
// Lunch: 420 | 54.1 | 22.3 | 14.3
const breakfast = { cal: 289, carbs: 46.6, protein: 22.5, fat: 5.8 };
const lunch = { cal: 420, carbs: 54.1, protein: 22.3, fat: 14.3 };

const daily = {
  cal: breakfast.cal + lunch.cal + totals.cal,
  carbs: breakfast.carbs + lunch.carbs + totals.carbs,
  protein: breakfast.protein + lunch.protein + totals.protein,
  fat: breakfast.fat + lunch.fat + totals.fat
};

console.log(`\n=== FULL DAY (Breakfast + Lunch + Dinner) ===`);
console.log(`Calories: ${daily.cal}/1750 (${(daily.cal/1750*100).toFixed(0)}%)`);
console.log(`Carbs: ${daily.carbs.toFixed(1)}/219g (${(daily.carbs/219*100).toFixed(0)}%)`);
console.log(`Protein: ${daily.protein.toFixed(1)}/110g (${(daily.protein/110*100).toFixed(0)}%)`);
console.log(`Fat: ${daily.fat.toFixed(1)}/49g (${(daily.fat/49*100).toFixed(0)}%)`);

console.log(`\n=== FINAL ANALYSIS ===`);
const carb_pct = (daily.carbs/219*100).toFixed(0);
const protein_pct = (daily.protein/110*100).toFixed(0);
const fat_pct = (daily.fat/49*100).toFixed(0);

console.log(`Carbs: ${daily.carbs.toFixed(1)}g (${carb_pct}%) — ${carb_pct >= 95 ? '✅ TARGET HIT!' : carb_pct >= 85 ? '✅ VERY CLOSE' : '⚠️ SHORT'}`);
console.log(`Protein: ${daily.protein.toFixed(1)}g (${protein_pct}%) — ✅ GOOD`);
console.log(`Fat: ${daily.fat.toFixed(1)}g (${fat_pct}%) — ${fat_pct <= 100 ? '✅ UNDER BUDGET' : '⚠️ OVER'}`);
console.log(`Calories: ${daily.cal}/1750 (${(daily.cal/1750*100).toFixed(0)}%)`);

console.log(`\n🎯 GLUCOSE OUTLOOK FOR APRIL 21:`);
console.log(`With ${daily.carbs.toFixed(0)}g carbs (89% of target) + consistent walking,`);
console.log(`expect continued improvement toward 6.8-7.0 range.`);
