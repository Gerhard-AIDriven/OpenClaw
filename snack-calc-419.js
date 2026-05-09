// Snack macro calculation - 2026-04-19
const items = [
  { name: "Low GI bread (2 slices)", cal: 160, carbs: 26, protein: 8, fat: 3 },
  { name: "Cottage cheese (59g)", cal: 47, carbs: 1.9, protein: 8.6, fat: 0.8 },
  { name: "Honey (1 tsp = ~7g)", cal: 22, carbs: 5.8, protein: 0, fat: 0 }
];

let snack = { cal: 0, carbs: 0, protein: 0, fat: 0 };
items.forEach(item => {
  snack.cal += item.cal;
  snack.carbs += item.carbs;
  snack.protein += item.protein;
  snack.fat += item.fat;
});

console.log("=== SNACK BREAKDOWN ===\n");
items.forEach(item => {
  console.log(`${item.name}`);
  console.log(`  ${item.cal}cal | ${item.carbs}g carbs | ${item.protein}g protein | ${item.fat}g fat\n`);
});

console.log("=== SNACK TOTALS ===");
console.log(`Calories: ${snack.cal}`);
console.log(`Carbs: ${snack.carbs.toFixed(1)}g`);
console.log(`Protein: ${snack.protein.toFixed(1)}g`);
console.log(`Fat: ${snack.fat.toFixed(1)}g`);

// Full day calculation with snack
const breakfast = { cal: 348, carbs: 42.1, protein: 25.4, fat: 8.5 };
const lunch = { cal: 710, carbs: 66.5, protein: 82.0, fat: 11.3 };
const dinner = { cal: 361, carbs: 66.2, protein: 21.8, fat: 1.4 };

const daily = {
  cal: breakfast.cal + lunch.cal + dinner.cal + snack.cal,
  carbs: breakfast.carbs + lunch.carbs + dinner.carbs + snack.carbs,
  protein: breakfast.protein + lunch.protein + dinner.protein + snack.protein,
  fat: breakfast.fat + lunch.fat + dinner.fat + snack.fat
};

console.log(`\n=== FULL DAY (Breakfast + Lunch + Dinner + Snack) ===`);
console.log(`Calories: ${daily.cal}/1750 (${(daily.cal/1750*100).toFixed(0)}%)`);
console.log(`Carbs: ${daily.carbs.toFixed(1)}/219g (${(daily.carbs/219*100).toFixed(0)}%)`);
console.log(`Protein: ${daily.protein.toFixed(1)}/110g (${(daily.protein/110*100).toFixed(0)}%)`);
console.log(`Fat: ${daily.fat.toFixed(1)}/49g (${(daily.fat/49*100).toFixed(0)}%)`);

console.log(`\n=== DAILY BREAKDOWN ===`);
console.log(`Breakfast (348 | 42.1g | 25.4g | 8.5g)`);
console.log(`Lunch (710 | 66.5g | 82.0g | 11.3g)`);
console.log(`Dinner (361 | 66.2g | 21.8g | 1.4g)`);
console.log(`Snack (${snack.cal} | ${snack.carbs.toFixed(1)}g | ${snack.protein.toFixed(1)}g | ${snack.fat.toFixed(1)}g)`);

console.log(`\n✅ FINAL ANALYSIS`);
const carb_pct = (daily.carbs / 219 * 100).toFixed(0);
const protein_pct = (daily.protein / 110 * 100).toFixed(0);
const fat_pct = (daily.fat / 49 * 100).toFixed(0);

console.log(`Carbs: ${daily.carbs.toFixed(1)}/219g (${carb_pct}%) ${carb_pct >= 95 && carb_pct <= 105 ? '✅ TARGET HIT' : carb_pct < 95 ? '⚠️ SHORT by ' + (219 - daily.carbs).toFixed(1) + 'g' : '⚠️ OVER by ' + (daily.carbs - 219).toFixed(1) + 'g'}`);
console.log(`Protein: ${daily.protein.toFixed(1)}/110g (${protein_pct}%) ${protein_pct <= 115 ? '✅ OK' : '⚠️ OVER by ' + (daily.protein - 110).toFixed(1) + 'g'}`);
console.log(`Fat: ${daily.fat.toFixed(1)}/49g (${fat_pct}%) ✅ GOOD (under by ${(49 - daily.fat).toFixed(1)}g)`);
console.log(`Calories: ${daily.cal}/1750 (${(daily.cal/1750*100).toFixed(0)}%)`);

console.log(`\n🎯 GLUCOSE OUTLOOK FOR APRIL 20:`);
if (daily.carbs >= 210) {
  console.log(`Carbs at ${daily.carbs.toFixed(0)}g — expect glucose improvement (similar to April 18 result).`);
} else {
  console.log(`Carbs at ${daily.carbs.toFixed(0)}g — still ${(219 - daily.carbs).toFixed(1)}g short, but closer than yesterday.`);
}
