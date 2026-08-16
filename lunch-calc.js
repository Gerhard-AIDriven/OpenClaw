// Lunch macro calculation - chicken stir fry with Greek yogurt
const items = [
  { name: "Skinless chicken breast (275g)", cal: 330, carbs: 0, protein: 66, fat: 4.1 },
  { name: "Red onion (75g)", cal: 28, carbs: 6.4, protein: 0.9, fat: 0.1 },
  { name: "Olive oil (1 tsp)", cal: 40, carbs: 0, protein: 0, fat: 4.5 },
  { name: "Broccoli (170g)", cal: 55, carbs: 11.1, protein: 4.6, fat: 0.5 },
  { name: "Greek yogurt (100g, plain 0% fat)", cal: 59, carbs: 3.3, protein: 10, fat: 0.4 }
];

let totals = { cal: 0, carbs: 0, protein: 0, fat: 0 };
items.forEach(item => {
  totals.cal += item.cal;
  totals.carbs += item.carbs;
  totals.protein += item.protein;
  totals.fat += item.fat;
});

console.log("=== LUNCH BREAKDOWN ===\n");
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

// Breakfast was: 655 cal | 28g carbs | 43g protein | 41.5g fat
const breakfast = { cal: 655, carbs: 28, protein: 43, fat: 41.5 };
const cumulative = {
  cal: breakfast.cal + totals.cal,
  carbs: breakfast.carbs + totals.carbs,
  protein: breakfast.protein + totals.protein,
  fat: breakfast.fat + totals.fat
};

console.log(`\n=== CUMULATIVE (Breakfast + Lunch) ===`);
console.log(`Calories: ${cumulative.cal}/1750 (${(cumulative.cal/1750*100).toFixed(0)}%)`);
console.log(`Carbs: ${cumulative.carbs.toFixed(1)}/219g (${(cumulative.carbs/219*100).toFixed(0)}%)`);
console.log(`Protein: ${cumulative.protein.toFixed(1)}/110g (${(cumulative.protein/110*100).toFixed(0)}%)`);
console.log(`Fat: ${cumulative.fat.toFixed(1)}/49g (${(cumulative.fat/49*100).toFixed(0)}%)`);

console.log(`\n=== REMAINING FOR DINNER ===`);
console.log(`Calories: ${1750 - cumulative.cal}`);
console.log(`Carbs: ${(219 - cumulative.carbs).toFixed(1)}g`);
console.log(`Protein: ${(110 - cumulative.protein).toFixed(1)}g`);
console.log(`Fat: ${(49 - cumulative.fat).toFixed(1)}g`);
