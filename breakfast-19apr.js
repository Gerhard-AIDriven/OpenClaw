const breakfast = {
  'Greek yogurt (200g)': { cal: 200, carbs: 8, protein: 20, fat: 10 },
  'Honey Crunch muesli (75g)': { cal: 282, carbs: 48, protein: 7.5, fat: 5.6 },
  'Blueberries (50g)': { cal: 27, carbs: 7, protein: 0.3, fat: 0.1 },
  'Banana (medium)': { cal: 89, carbs: 23, protein: 1.1, fat: 0.2 }
};

let totals = { cal: 0, carbs: 0, protein: 0, fat: 0 };
Object.values(breakfast).forEach(item => {
  totals.cal += item.cal;
  totals.carbs += item.carbs;
  totals.protein += item.protein;
  totals.fat += item.fat;
});

console.log('BREAKFAST BREAKDOWN');
console.log('==================');
Object.entries(breakfast).forEach(([item, macros]) => {
  console.log(item.padEnd(35) + ' | ' + macros.cal.toFixed(0).padEnd(3) + ' cal | ' + macros.carbs.toFixed(1).padEnd(5) + 'g carbs');
});

console.log('\nTOTALS:');
console.log('Calories: ' + totals.cal.toFixed(0));
console.log('Carbs: ' + totals.carbs.toFixed(1) + 'g');
console.log('Protein: ' + totals.protein.toFixed(1) + 'g');
console.log('Fat: ' + totals.fat.toFixed(1) + 'g');

console.log('\nDAILY TARGETS AFTER BREAKFAST:');
console.log('Remaining carbs: ' + (219 - totals.carbs).toFixed(1) + 'g (eat this by lunch+dinner)');
console.log('Remaining cals: ' + (1750 - totals.cal));
console.log('Remaining protein: ' + (110 - totals.protein).toFixed(1) + 'g');
console.log('Remaining fat: ' + (49 - totals.fat).toFixed(1) + 'g');
