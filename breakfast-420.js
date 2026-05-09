const items = [
  { name: "Greek yogurt (150g, plain 0% fat)", cal: 88.5, carbs: 4.95, protein: 15, fat: 0.6 },
  { name: "Honey and almond muesli (80g)", cal: 320, carbs: 44.8, protein: 8, fat: 12 },
  { name: "Banana (1 medium, ~118g)", cal: 105, carbs: 27, protein: 1.3, fat: 0.3 }
];

let totals = { cal: 0, carbs: 0, protein: 0, fat: 0 };
items.forEach(item => {
  totals.cal += item.cal;
  totals.carbs += item.carbs;
  totals.protein += item.protein;
  totals.fat += item.fat;
});

console.log("=== BREAKFAST BREAKDOWN (2026-04-20) ===\n");
items.forEach(item => {
  console.log(`${item.name}`);
  console.log(`  ${item.cal}cal | ${item.carbs}g carbs | ${item.protein}g protein | ${item.fat}g fat\n`);
});

console.log("=== TOTALS ===");
console.log(`Calories: ${totals.cal.toFixed(0)}`);
console.log(`Carbs: ${totals.carbs.toFixed(1)}g`);
console.log(`Protein: ${totals.protein.toFixed(1)}g`);
console.log(`Fat: ${totals.fat.toFixed(1)}g`);

console.log(`\n=== VS DAILY TARGET ===`);
console.log(`Calories: ${totals.cal.toFixed(0)}/1750 (${(totals.cal/1750*100).toFixed(0)}%)`);
console.log(`Carbs: ${totals.carbs.toFixed(1)}/219g (${(totals.carbs/219*100).toFixed(0)}%)`);
console.log(`Protein: ${totals.protein.toFixed(1)}/110g (${(totals.protein/110*100).toFixed(0)}%)`);
console.log(`Fat: ${totals.fat.toFixed(1)}/49g (${(totals.fat/49*100).toFixed(0)}%)`);

console.log(`\n=== WHAT'S LEFT FOR DAY ===`);
console.log(`Calories: ${(1750 - totals.cal).toFixed(0)}`);
console.log(`Carbs: ${(219 - totals.carbs).toFixed(1)}g`);
console.log(`Protein: ${(110 - totals.protein).toFixed(1)}g`);
console.log(`Fat: ${(49 - totals.fat).toFixed(1)}g`);

console.log(`\n✅ GOOD BREAKFAST`);
console.log(`- Carbs: 76.75g (35% of target) — solid low-GI base`);
console.log(`- Protein: 24.3g (22% of target)`);
console.log(`- Fat: 12.9g (26% of budget) — leaves plenty room for lunch/dinner`);
console.log(`- Calories: 513.5 cal (29% of daily budget)`);
