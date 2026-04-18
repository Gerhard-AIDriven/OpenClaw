// Breakfast macro calculation - corrected (no added oil)
const items = [
  { name: "Bacon (2 rashers)", cal: 90, carbs: 0.1, protein: 6, fat: 7 },
  { name: "Eggs fried in pan (2 eggs, minimal residual fat)", cal: 155, carbs: 1.1, protein: 12, fat: 11 },
  { name: "Spar cheddar cheese (3 slices, 50g)", cal: 200, carbs: 0.5, protein: 12, fat: 17 },
  { name: "Albany low GI seed bread (2 slices)", cal: 160, carbs: 26, protein: 8, fat: 3 },
  { name: "Melrose high protein cheese spread (1 tbs)", cal: 50, carbs: 0.3, protein: 5, fat: 3.5 }
];

let totals = { cal: 0, carbs: 0, protein: 0, fat: 0 };
items.forEach(item => {
  totals.cal += item.cal;
  totals.carbs += item.carbs;
  totals.protein += item.protein;
  totals.fat += item.fat;
});

console.log("=== BREAKFAST BREAKDOWN ===\n");
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
console.log(`\n=== VS DAILY TARGET (1750 cal | 219g carbs | 110g protein | 49g fat) ===`);
console.log(`Calories: ${totals.cal}/1750 (${(totals.cal/1750*100).toFixed(0)}%)`);
console.log(`Carbs: ${totals.carbs.toFixed(1)}/219g (${(totals.carbs/219*100).toFixed(0)}%)`);
console.log(`Protein: ${totals.protein.toFixed(1)}/110g (${(totals.protein/110*100).toFixed(0)}%)`);
console.log(`Fat: ${totals.fat.toFixed(1)}/49g (${(totals.fat/49*100).toFixed(0)}%)`);

console.log(`\n=== REMAINING FOR REST OF DAY ===`);
console.log(`Calories: ${1750 - totals.cal}`);
console.log(`Carbs: ${(219 - totals.carbs).toFixed(1)}g`);
console.log(`Protein: ${(110 - totals.protein).toFixed(1)}g`);
console.log(`Fat: ${(49 - totals.fat).toFixed(1)}g`);
