const items = [
  { name: "Double fat Greek yogurt (157g)", cal: 123, carbs: 8.2, protein: 19.6, fat: 4.7 },
  { name: "Alpen no sugar added muesli (8g)", cal: 30, carbs: 4.8, protein: 0.8, fat: 0.6 },
  { name: "Banana (1 medium, ~118g)", cal: 105, carbs: 27, protein: 1.3, fat: 0.3 },
  { name: "Honey (1 tsp, ~7g)", cal: 22, carbs: 5.8, protein: 0, fat: 0 },
  { name: "Low fat milk (25ml)", cal: 9, carbs: 0.8, protein: 0.8, fat: 0.2 }
];

let totals = { cal: 0, carbs: 0, protein: 0, fat: 0 };
items.forEach(item => {
  totals.cal += item.cal;
  totals.carbs += item.carbs;
  totals.protein += item.protein;
  totals.fat += item.fat;
});

console.log("=== BREAKFAST ACTUAL (2026-04-20) ===\n");
items.forEach(item => {
  console.log(`${item.name}`);
  console.log(`  ${item.cal}cal | ${item.carbs}g carbs | ${item.protein}g protein | ${item.fat}g fat\n`);
});

console.log("=== TOTALS ===");
console.log(`Calories: ${totals.cal}`);
console.log(`Carbs: ${totals.carbs.toFixed(1)}g`);
console.log(`Protein: ${totals.protein.toFixed(1)}g`);
console.log(`Fat: ${totals.fat.toFixed(1)}g`);

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

console.log(`\n✅ EXCELLENT BREAKFAST`);
console.log(`- Very light (289 cal total)`);
console.log(`- Carbs: 46.6g (21% of target) — leaves 172.4g for lunch/dinner`);
console.log(`- Protein: 22.5g (20% of target)`);
console.log(`- Fat: ONLY 5.8g (12% of budget) — huge room for rest of day`);
