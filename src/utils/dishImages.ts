// Centralised dish-image data.
// Both RecipeForm (picker) and the detail page (display) import from here
// so the keys stay in sync — no risk of one file saying "pasta" and the
// other saying "Pasta" and the image never showing up.

import imgBreakfast from "../assets/Dish Img/DishImg-Breakfast.png";
import imgCasserole from "../assets/Dish Img/DishImg-Casserole.png";
import imgChicken from "../assets/Dish Img/DishImg-Chicken.png";
import imgDesert from "../assets/Dish Img/DishImg-Desert.png";
import imgFish from "../assets/Dish Img/DishImg-Fish.png";
import imgMeat from "../assets/Dish Img/DishImg-Meat.png";
import imgPasta from "../assets/Dish Img/DishImg-Pasta.png";
import imgPie from "../assets/Dish Img/DishImg-Pie.png";
import imgPizza from "../assets/Dish Img/DishImg-Pizza.png";
import imgSalad from "../assets/Dish Img/DishImg-Salad.png";
import imgVeggies from "../assets/Dish Img/DishImg-Veggies.png";

// TYPE CONCEPT: Defining the shape of each item in the array.
// Every element MUST have these three fields — TypeScript enforces it.
export interface DishImage {
  key: string; // Stored in Recipe.image — the stable identifier
  src: string; // The Vite-resolved image URL (hashed at build time)
  label: string; // Human-readable name, shown as a tooltip in the picker
}

export const DISH_IMAGES: DishImage[] = [
  { key: "breakfast", src: imgBreakfast, label: "Breakfast" },
  { key: "casserole", src: imgCasserole, label: "Casserole" },
  { key: "chicken", src: imgChicken, label: "Chicken" },
  { key: "dessert", src: imgDesert, label: "Dessert" },
  { key: "fish", src: imgFish, label: "Fish" },
  { key: "meat", src: imgMeat, label: "Meat" },
  { key: "pasta", src: imgPasta, label: "Pasta" },
  { key: "pie", src: imgPie, label: "Pie" },
  { key: "pizza", src: imgPizza, label: "Pizza" },
  { key: "salad", src: imgSalad, label: "Salad" },
  { key: "veggies", src: imgVeggies, label: "Veggies" },
];

// TYPE CONCEPT: The return type is `string | undefined`.
// The `?` in the return is shorthand: if find() returns undefined, so does this.
export function getDishImageSrc(key: string): string | undefined {
  return DISH_IMAGES.find((img) => img.key === key)?.src;
}
