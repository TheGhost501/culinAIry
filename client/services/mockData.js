export const seedRecipes = [
  {
    id: 'r1',
    title: 'Beginner Pasta Primavera',
    description: 'A quick veggie pasta with a simple garlic-lemon sauce.',
    image:
      'https://images.unsplash.com/photo-1523986371872-9d3ba2e2f642?auto=format&fit=crop&w=1400&q=60',
    servings: 2,
    ingredients: [
      { name: 'Pasta', quantity: 200, unit: 'g' },
      { name: 'Olive oil', quantity: 2, unit: 'tbsp' },
      { name: 'Garlic', quantity: 2, unit: 'cloves' },
      { name: 'Frozen mixed vegetables', quantity: 250, unit: 'g' },
      { name: 'Lemon', quantity: 0.5, unit: '' },
      { name: 'Salt', quantity: 1, unit: 'pinch' },
    ],
    instructions: [
      'Boil pasta in salted water until al dente.',
      'Sauté garlic in olive oil for 30 seconds.',
      'Add vegetables and cook until hot.',
      'Toss pasta with sauce and lemon juice.',
      'Taste and adjust salt, then serve.',
    ],
    createdAt: new Date().toISOString(),
  },
  {
    id: 'r2',
    title: 'Simple Overnight Oats',
    description: 'Mix, chill, and breakfast is done.',
    image:
      'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=1400&q=60',
    servings: 1,
    ingredients: [
      { name: 'Rolled oats', quantity: 60, unit: 'g' },
      { name: 'Milk', quantity: 180, unit: 'ml' },
      { name: 'Yogurt', quantity: 2, unit: 'tbsp' },
      { name: 'Honey', quantity: 1, unit: 'tsp' },
      { name: 'Berries', quantity: 80, unit: 'g' },
    ],
    instructions: [
      'Stir oats, milk, and yogurt in a jar.',
      'Refrigerate overnight.',
      'Top with honey and berries before eating.',
    ],
    createdAt: new Date().toISOString(),
  },
];
