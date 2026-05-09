// Dinner macro calculation - 2026-04-19
const items = [
  { name: "Baked potato (350g)", cal: 273, carbs: 62, protein: 6.3, fat: 0.35 },
  { name: "Chunky cottage cheese (59g)", cal: 47, carbs: 1.9, protein: 8.6, fat: 0.8 },
  { name: "Greek yogurt (69g, plain 0% fat)", cal: 41, carbs: 2.3, protein: 6.9, fat: 0.3 }
];

let totals = { cal: 0, carbs: 0, protein: 0, fat: 0 };
items.forEach(item => {
  totals.cal += item.cal;
  totals.carbs += item.carbs;
  totals.protein += item.protein;
  totals.fat += item.fat;
});

console.log("=== DINNER BREAKDOWN (2026-04-19) ===\n");
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

console.log(`\n✅ EXCELLENT MACRO BALANCE`);
console.log(`- Carbs: Perfect (62g from potato = blood sugar stable)`);
console.log(`- Protein: 21.8g (2 sources, minimal fat)`);
console.log(`- Fat: Only 1.45g (well under budget)`);
console.log(`- Calories: 361 (leaves 1389 for breakfast + lunch)`);
