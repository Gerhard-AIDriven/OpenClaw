// Lunch macro calculation - 2026-04-19
const items = [
  { name: "Chicken breast cubes (250g)", cal: 300, carbs: 0, protein: 60, fat: 3.8 },
  { name: "Canola oil (1 tsp)", cal: 40, carbs: 0, protein: 0, fat: 4.5 },
  { name: "Red onion (75g)", cal: 28, carbs: 6.4, protein: 0.9, fat: 0.1 },
  { name: "Broccoli (150g)", cal: 48, carbs: 9.9, protein: 3.8, fat: 0.4 },
  { name: "Greek yogurt (120g, plain 0% fat)", cal: 71, carbs: 3.9, protein: 12, fat: 0.5 },
  { name: "Curry powder (1 tsp)", cal: 8, carbs: 1.3, protein: 0.3, fat: 0.2 },
  { name: "Salt & dried red chilli (negligible)", cal: 0, carbs: 0, protein: 0, fat: 0 }
];

let totals = { cal: 0, carbs: 0, protein: 0, fat: 0 };
items.forEach(item => {
  totals.cal += item.cal;
  totals.carbs += item.carbs;
  totals.protein += item.protein;
  totals.fat += item.fat;
});

console.log("=== LUNCH BREAKDOWN (2026-04-19) ===\n");
items.forEach(item => {
  console.log(`${item.name}`);
  console.log(`  ${item.cal}cal | ${item.carbs}g carbs | ${item.protein}g protein | ${item.fat}g fat\n`);
});

console.log("=== TOTALS ===");
console.log(`Calories: ${totals.cal}`);
console.log(`Carbs: ${totals.carbs.toFixed(1)}g`);
console.log(`Protein: ${totals.protein.toFixed(1)}g`);
console.log(`Fat: ${totals.fat.toFixed(1)}g`);

// Daily targets: 1750 cal | 219g carbs | 110g protein | 49g fat
console.log(`\n=== VS DAILY TARGET ===`);
console.log(`Calories: ${totals.cal}/1750 (${(totals.cal/1750*100).toFixed(0)}%)`);
console.log(`Carbs: ${totals.carbs.toFixed(1)}/219g (${(totals.carbs/219*100).toFixed(0)}%)`);
console.log(`Protein: ${totals.protein.toFixed(1)}/110g (${(totals.protein/110*100).toFixed(0)}%)`);
console.log(`Fat: ${totals.fat.toFixed(1)}/49g (${(totals.fat/49*100).toFixed(0)}%)`);

// Full day calculation
const breakfast = { cal: 348, carbs: 42.1, protein: 25.4, fat: 8.5 };
const dinner = { cal: 361, carbs: 66.2, protein: 21.8, fat: 1.4 };
const daily = {
  cal: breakfast.cal + totals.cal + dinner.cal,
  carbs: breakfast.carbs + totals.carbs + dinner.carbs,
  protein: breakfast.protein + totals.protein + dinner.protein,
  fat: breakfast.fat + totals.fat + dinner.fat
};

console.log(`\n=== FULL DAY (Breakfast + Lunch + Dinner) ===`);
console.log(`Calories: ${daily.cal}/1750 (${(daily.cal/1750*100).toFixed(0)}%)`);
console.log(`Carbs: ${daily.carbs.toFixed(1)}/219g (${(daily.carbs/219*100).toFixed(0)}%)`);
console.log(`Protein: ${daily.protein.toFixed(1)}/110g (${(daily.protein/110*100).toFixed(0)}%)`);
console.log(`Fat: ${daily.fat.toFixed(1)}/49g (${(daily.fat/49*100).toFixed(0)}%)`);

console.log(`\n=== DAILY BREAKDOWN ===`);
console.log(`Breakfast (348 | 42.1g | 25.4g | 8.5g)`);
console.log(`Lunch (${totals.cal} | ${totals.carbs.toFixed(1)}g | ${totals.protein.toFixed(1)}g | ${totals.fat.toFixed(1)}g)`);
console.log(`Dinner (361 | 66.2g | 21.8g | 1.4g)`);
