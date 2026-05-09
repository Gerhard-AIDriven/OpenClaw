const items = [
  { name: "Low GI seed bread (2 slices)", cal: 160, carbs: 26, protein: 8, fat: 3 },
  { name: "Boiled eggs (2)", cal: 155, carbs: 1.1, protein: 13, fat: 11 },
  { name: "Nolan light mayonnaise (2 tbsp)", cal: 180, carbs: 0, protein: 0, fat: 20 },
  { name: "Banana (1 medium, ~118g)", cal: 105, carbs: 27, protein: 1.3, fat: 0.3 }
];

let totals = { cal: 0, carbs: 0, protein: 0, fat: 0 };
items.forEach(item => {
  totals.cal += item.cal;
  totals.carbs += item.carbs;
  totals.protein += item.protein;
  totals.fat += item.fat;
});

console.log("=== LUNCH PLAN (2026-04-20) ===\n");
items.forEach(item => {
  console.log(`${item.name}`);
  console.log(`  ${item.cal}cal | ${item.carbs}g carbs | ${item.protein}g protein | ${item.fat}g fat\n`);
});

console.log("=== TOTALS ===");
console.log(`Calories: ${totals.cal}`);
console.log(`Carbs: ${totals.carbs.toFixed(1)}g`);
console.log(`Protein: ${totals.protein.toFixed(1)}g`);
console.log(`Fat: ${totals.fat.toFixed(1)}g`);

// Breakfast: 289 | 46.6 | 22.5 | 5.8
const breakfast = { cal: 289, carbs: 46.6, protein: 22.5, fat: 5.8 };
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

console.log(`\n⚠️ ALERT`);
console.log(`Fat: 34g already used (69% of 49g budget)`);
console.log(`Mayonnaise is the culprit: 20g fat in 2 tbsp`);
console.log(`Recommendation: Reduce to 1 tbsp mayo (-10g fat) or skip entirely`);
console.log(`This would free up 10g fat for dinner`);
