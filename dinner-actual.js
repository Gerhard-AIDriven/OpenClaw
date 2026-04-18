// Actual dinner - no cooking
const items = [
  { name: "Bread (2 slices)", cal: 160, carbs: 26, protein: 8, fat: 3 },
  { name: "Honey (49g)", cal: 157, carbs: 42.5, protein: 0.1, fat: 0 },
  { name: "Granola snack bar (typical 35g)", cal: 160, carbs: 20, protein: 3, fat: 7 },
  { name: "Apple (medium, ~180g)", cal: 95, carbs: 25, protein: 0.5, fat: 0.3 }
];

let totals = { cal: 0, carbs: 0, protein: 0, fat: 0 };
items.forEach(item => {
  totals.cal += item.cal;
  totals.carbs += item.carbs;
  totals.protein += item.protein;
  totals.fat += item.fat;
});

console.log("=== ACTUAL DINNER ===\n");
items.forEach(item => {
  console.log(`${item.name}`);
  console.log(`  ${item.cal}cal | ${item.carbs}g carbs | ${item.protein}g protein | ${item.fat}g fat\n`);
});

console.log("=== TOTALS ===");
console.log(`Calories: ${totals.cal}`);
console.log(`Carbs: ${totals.carbs.toFixed(1)}g`);
console.log(`Protein: ${totals.protein.toFixed(1)}g`);
console.log(`Fat: ${totals.fat.toFixed(1)}g`);

// Cumulative: Breakfast (655 | 28 | 43 | 41.5) + Lunch (512 | 20.8 | 81.5 | 9.6)
const breakfast = { cal: 655, carbs: 28, protein: 43, fat: 41.5 };
const lunch = { cal: 512, carbs: 20.8, protein: 81.5, fat: 9.6 };
const daily = {
  cal: breakfast.cal + lunch.cal + totals.cal,
  carbs: breakfast.carbs + lunch.carbs + totals.carbs,
  protein: breakfast.protein + lunch.protein + totals.protein,
  fat: breakfast.fat + lunch.fat + totals.fat
};

console.log(`\n=== FULL DAY (Breakfast + Lunch + Actual Dinner) ===`);
console.log(`Calories: ${daily.cal}/1750 (${(daily.cal/1750*100).toFixed(0)}%)`);
console.log(`Carbs: ${daily.carbs.toFixed(1)}/219g (${(daily.carbs/219*100).toFixed(0)}%)`);
console.log(`Protein: ${daily.protein.toFixed(1)}/110g (${(daily.protein/110*100).toFixed(0)}%)`);
console.log(`Fat: ${daily.fat.toFixed(1)}/49g (${(daily.fat/49*100).toFixed(0)}%)`);

console.log(`\n=== DAILY BREAKDOWN ===`);
console.log(`Breakfast (655 | 28g | 43g | 41.5g)`);
console.log(`Lunch (512 | 20.8g | 81.5g | 9.6g)`);
console.log(`Dinner (${totals.cal} | ${totals.carbs.toFixed(1)}g | ${totals.protein.toFixed(1)}g | ${totals.fat.toFixed(1)}g)`);

console.log(`\n=== ANALYSIS ===`);
const carb_vs_target = daily.carbs / 219;
const protein_vs_target = daily.protein / 110;
const fat_vs_target = daily.fat / 49;

console.log(`Carbs: ${(carb_vs_target * 100).toFixed(0)}% of target (${daily.carbs > 219 ? '+' : ''}${(daily.carbs - 219).toFixed(1)}g)`);
console.log(`Protein: ${(protein_vs_target * 100).toFixed(0)}% of target (${daily.protein > 110 ? '+' : ''}${(daily.protein - 110).toFixed(1)}g)`);
console.log(`Fat: ${(fat_vs_target * 100).toFixed(0)}% of target (${daily.fat > 49 ? '+' : ''}${(daily.fat - 49).toFixed(1)}g)`);
