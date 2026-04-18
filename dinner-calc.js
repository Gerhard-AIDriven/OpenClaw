// Dinner macro calculation - brown rice with tomato onion sauce
const items = [
  { name: "Brown rice (100g uncooked = ~300g cooked)", cal: 360, carbs: 76, protein: 8, fat: 2.7 },
  { name: "Red onion (100g)", cal: 37, carbs: 8.6, protein: 1.2, fat: 0.1 },
  { name: "Canned tomatoes (130g)", cal: 26, carbs: 5.2, protein: 1.3, fat: 0.2 },
  { name: "Crushed garlic (1 tsp)", cal: 5, carbs: 1.0, protein: 0.2, fat: 0 },
  { name: "Fresh tomato (130g)", cal: 24, carbs: 5.2, protein: 1.2, fat: 0.2 }
];

let totals = { cal: 0, carbs: 0, protein: 0, fat: 0 };
items.forEach(item => {
  totals.cal += item.cal;
  totals.carbs += item.carbs;
  totals.protein += item.protein;
  totals.fat += item.fat;
});

console.log("=== DINNER BREAKDOWN ===\n");
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

// Cumulative: Breakfast (655 | 28 | 43 | 41.5) + Lunch (512 | 20.8 | 81.5 | 9.6)
const breakfast = { cal: 655, carbs: 28, protein: 43, fat: 41.5 };
const lunch = { cal: 512, carbs: 20.8, protein: 81.5, fat: 9.6 };
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

console.log(`\n=== DAILY BREAKDOWN ===`);
console.log(`Breakfast (655 | 28g | 43g | 41.5g)`);
console.log(`Lunch (512 | 20.8g | 81.5g | 9.6g)`);
console.log(`Dinner (${totals.cal} | ${totals.carbs.toFixed(1)}g | ${totals.protein.toFixed(1)}g | ${totals.fat.toFixed(1)}g)`);
