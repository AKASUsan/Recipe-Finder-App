// The shared palette keeps every screen in the same warm, editorial style.
export const colors = {
  background: "#F7F6F0",
  surface: "#FFFFFF",
  surfaceAlt: "#EAF0E7",
  ink: "#17382F",
  muted: "#65766E",
  subtle: "#98A69D",
  accent: "#E86F44",
  accentSoft: "#FBE4D9",
  accentDeep: "#B94D2B",
  line: "#E1E7DE",
  forest: "#14392F",
  sage: "#C8DDC7",
  white: "#FFFFFF",
};

export const radius = { sm: 12, md: 18, lg: 26, pill: 999 };
export const spacing = { xs: 4, sm: 8, md: 16, lg: 24, xl: 32 };

const categoryTones = ["#F7D8C7", "#DBE8D5", "#F4E5BD", "#DCE7EE", "#E7DDED"];
export function categoryTone(category) {
  const id = String(category?.id ?? "");
  const number = Number(id.replace(/\D/g, ""));
  const index = Number.isFinite(number) && number > 0 ? number - 1 : [...id].reduce((sum, character) => sum + character.charCodeAt(0), 0);
  return categoryTones[index % categoryTones.length];
}
