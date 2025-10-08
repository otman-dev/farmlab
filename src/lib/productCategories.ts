export const PLANT_CATEGORIES = [
  { value: 'plant_seeds', label: 'Plant Seeds' },
  { value: 'plant_seedlings', label: 'Plant Seedlings' },
  { value: 'plant_nutrition', label: 'Plant Nutrition' },
  { value: 'plant_medicine', label: 'Plant Medicine' },
];

export const PLANT_CATEGORY_VALUES = PLANT_CATEGORIES.map(c => c.value);

export const PLANT_CATEGORY_LABEL = (value: string) => {
  const found = PLANT_CATEGORIES.find(c => c.value === value);
  return found ? found.label : value;
};

export default PLANT_CATEGORIES;
