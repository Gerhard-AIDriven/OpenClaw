const breakfast = { cal: 598, carbs: 86, protein: 28.9, fat: 15.9 };
const lunch = { cal: 749, carbs: 60.8, protein: 73.2, fat: 16.6 };
const dinner = { 
  'Baked potato large (300g)': { cal: 246, carbs: 56, protein: 4.5, fat: 0.2 },
  'Greek yogurt (50g)': { cal: 50, carbs: 2, protein: 5, fat: 2.5 },
  'Cottage cheese (50g)': { cal: 55, carbs: 2, protein: 9.8, fat: 2.5 }
};

let dinnerTotals = { cal: 0, carbs: 0, protein: 0, fat: 0 };
Object.values(dinner).forEach(item => {
  dinnerTotals.cal += item.cal;
  dinnerTotals.carbs += item.carbs;
  dinnerTotals.protein += item.protein;
  dinnerTotals.fat += item.fat;
});

console.log('DINNER BREAKDOWN');
console.log('================');
Object.entries(dinner).forEach(([item, macros]) => {
  console.log(item.padEnd(40) + ' | ' + macros.cal.toString().padEnd(3) + ' cal | ' + macros.carbs.toString().padEnd(4) + 'g carbs');
});

console.log('\nDINNER TOTALS:');
console.log('Calories: ' + dinnerTotals.cal);
console.log('Carbs: ' + dinnerTotals.carbs + 'g');
console.log('Protein: ' + dinnerTotals.protein.toFixed(1) + 'g');
console.log('Fat: ' + dinnerTotals.fat.toFixed(1) + 'g');

const dayTotal = {
  cal: breakfast.cal + lunch.cal + dinnerTotals.cal,
  carbs: breakfast.carbs + lunch.carbs + dinnerTotals.carbs,
  protein: breakfast.protein + lunch.protein + dinnerTotals.protein,
  fat: breakfast.fat + lunch.fat + dinnerTotals.fat
};

console.log('\n=== FULL DAY TOTALS ===');
console.log('Calories: ' + dayTotal.cal + ' / 1750 (' + ((dayTotal.cal / 1750) * 100).toFixed(0) + '%)');
console.log('Carbs: ' + dayTotal.carbs.toFixed(1) + 'g / 219g (' + ((dayTotal.carbs / 219) * 100).toFixed(0) + '%)');

if (dayTotal.carbs >= 219) {
  console.log('STATUS: ✅ HIT CARB TARGET!');
} else {
  console.log('STATUS: ❌ SHORT by ' + (219 - dayTotal.carbs).toFixed(1) + 'g');
}

console.log('Protein: ' + dayTotal.protein.toFixed(1) + 'g / 110g (' + ((dayTotal.protein / 110) * 100).toFixed(0) + '%)');
console.log('Fat: ' + dayTotal.fat.toFixed(1) + 'g / 49g (' + ((dayTotal.fat / 49) * 100).toFixed(0) + '%)');
