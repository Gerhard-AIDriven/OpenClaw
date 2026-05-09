// Breakfast macro calculation - 2026-04-19
const items = [
  { name: "Greek yogurt (200g, plain 0% fat)", cal: 118, carbs: 6.6, protein: 20, fat: 0.8 },
  { name: "Spar honey and almond muesli (50g)", cal: 200, carbs: 28, protein: 5, fat: 7.5 },
  { name: "Fresh blueberries (50g)", cal: 30, carbs: 7.5, protein: 0.4, fat: 0.2 }
];

let totals = { cal: 0, carbs: 0, protein: 0, fat: 0 };
items.forEach(item => {
  totals.cal += item.cal;
  totals.carbs += item.carbs;
  totals.protein += item.protein;
  totals.fat += item.fat;
});

console.log("=== BREAKFAST BREAKDOWN (2026-04-19) ===\n");
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

console.log(`\n=== WHAT'S LEFT FOR DAY ===`);
console.log(`Calories: ${1750 - totals.cal}`);
console.log(`Carbs: ${(219 - totals.carbs).toFixed(1)}g`);
console.log(`Protein: ${(110 - totals.protein).toFixed(1)}g`);
console.log(`Fat: ${(49 - totals.fat).toFixed(1)}g`);

console.log(`\n✅ SMART BREAKFAST`);
console.log(`- Low fat (8.5g total = 17% of daily budget)`);
console.log(`- Good carbs (42.1g from yogurt + muesli + berries)`);
console.log(`- Clean protein (25.4g)`);
console.log(`- Perfect for blood sugar stability`);
