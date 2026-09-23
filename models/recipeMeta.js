export const cap = (s = "") => s.charAt(0).toUpperCase() + s.slice(1);


export const META_FIELDS = [
  {
    key: "duration",
    icon: "time-outline",
    show: (recipe) => recipe.duration != null,
    label: (recipe) => `${recipe.duration} min`,
  },
  {
    key: "complexity",
    icon: "speedometer-outline",
    show: (recipe) => Boolean(recipe.complexity),
    label: (recipe) => cap(recipe.complexity),
  },
  {
    key: "affordability",
    icon: "cash-outline",
    show: (recipe) => Boolean(recipe.affordability),
    label: (recipe) => cap(recipe.affordability),
  },
];
