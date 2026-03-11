import { useState, useEffect } from "react";
import type { Recipe, Ingredient } from "../types/recipe";
import { toTitleCase } from "../utils/formatters";

// Dish images come from the shared utility so the keys are always in sync
// with the detail page's lookup. One source of truth.
import { DISH_IMAGES } from "../utils/dishImages";
import iconPinroll from "../assets/Icons/Icon-Pinroll.png";

import { HandDrawnButton } from "./HandDrawButton";
import { TextField } from "./TextField";

// TYPE CONCEPT: Typing component props
interface RecipeFormProps {
  onAddRecipe: (recipe: Recipe) => void;
  onUpdateRecipe?: (recipe: Recipe) => void;
  editingRecipe?: Recipe | null;
  onCancelEdit?: () => void;
}

function RecipeForm({
  onAddRecipe,
  onUpdateRecipe,
  editingRecipe,
  onCancelEdit,
}: RecipeFormProps) {
  // TYPE CONCEPT: useState with explicit types
  const [title, setTitle] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  // Stored as strings so number inputs can be empty (backspace works!)
  const [prepTime, setPrepTime] = useState<string>("");
  const [cookTime, setCookTime] = useState<string>("");
  const [servings, setServings] = useState<string>("");
  const [calories, setCalories] = useState<string>("");
  // selectedImage stores the key of the chosen dish (e.g. "pasta"), or "" for none
  const [selectedImage, setSelectedImage] = useState<string>("");
  const [visibility, setVisibility] = useState<"public" | "private">("public");
  const [ingredients, setIngredients] = useState<Ingredient[]>([
    { name: "", amount: "", unit: "" },
  ]);
  const [instructions, setInstructions] = useState<string[]>([""]);

  // TYPE CONCEPT: useEffect — runs when editingRecipe changes.
  // If we're editing, populate all fields with the saved recipe's data.
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    if (editingRecipe) {
      setTitle(editingRecipe.title);
      setDescription(editingRecipe.description || "");
      setPrepTime(String(editingRecipe.prepTime));
      setCookTime(String(editingRecipe.cookTime));
      setServings(String(editingRecipe.servings));
      setCalories(editingRecipe.calories ? String(editingRecipe.calories) : "");
      setSelectedImage(editingRecipe.image || "");
      setVisibility(editingRecipe.visibility ?? "public");
      setIngredients(editingRecipe.ingredients);
      setInstructions(editingRecipe.instructions);
    }
  }, [editingRecipe]);
  /* eslint-enable react-hooks/set-state-in-effect */

  const addIngredient = (): void => {
    setIngredients([...ingredients, { name: "", amount: "", unit: "" }]);
  };

  const updateIngredient = (
    index: number,
    field: keyof Ingredient,
    value: string,
  ): void => {
    const newIngredients = [...ingredients];
    newIngredients[index] = { ...newIngredients[index], [field]: value };
    setIngredients(newIngredients);
  };

  const addInstruction = (): void => {
    setInstructions([...instructions, ""]);
  };

  const updateInstruction = (index: number, value: string): void => {
    const newInstructions = [...instructions];
    newInstructions[index] = value;
    setInstructions(newInstructions);
  };

  const handleSubmit = (e: React.SubmitEvent<HTMLFormElement>): void => {
    e.preventDefault();

    if (editingRecipe && onUpdateRecipe) {
      const updatedRecipe: Recipe = {
        ...editingRecipe,
        title: toTitleCase(title),
        description: description || undefined,
        ingredients: ingredients.filter((ing) => ing.name && ing.amount),
        instructions: instructions.filter((inst) => inst.trim() !== ""),
        prepTime: Number(prepTime) || 0,
        cookTime: Number(cookTime) || 0,
        servings: Number(servings) || 1,
        calories: Number(calories) || undefined,
        image: selectedImage || undefined,
        visibility,
      };
      onUpdateRecipe(updatedRecipe);
    } else {
      const newRecipe: Recipe = {
        id: crypto.randomUUID(),
        title: toTitleCase(title),
        description: description || undefined,
        ingredients: ingredients.filter((ing) => ing.name && ing.amount),
        instructions: instructions.filter((inst) => inst.trim() !== ""),
        prepTime: Number(prepTime) || 0,
        cookTime: Number(cookTime) || 0,
        servings: Number(servings) || 1,
        calories: Number(calories) || undefined,
        image: selectedImage || undefined,
        status: "draft",
        createdAt: new Date(),
        visibility,
      };
      onAddRecipe(newRecipe);
    }

    // Reset all fields to empty
    setTitle("");
    setDescription("");
    setPrepTime("");
    setCookTime("");
    setServings("");
    setCalories("");
    setSelectedImage("");
    setVisibility("public");
    setIngredients([{ name: "", amount: "", unit: "" }]);
    setInstructions([""]);
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2 className="form-title">
        {editingRecipe ? "Edit Recipe" : "Add New Recipe"}
      </h2>

      {/* Two-column grid — left for metadata, right for ingredients/instructions */}
      <div className="form-grid">
        {/* ── LEFT COLUMN ─────────────────────────────────────────────────── */}
        <div className="form-col-left">
          {/* Title */}
          <label className="form-label">
            Title
            <TextField
              typeOfElement="input"
              placeholder="e.g. Pasta Carbonara"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              width={500} // Custom width for title
              height={50}
            />
          </label>

          {/* ── Image Picker ─────────────────────────────────────────────── */}
          {/* TYPE CONCEPT: We map over an array of objects.
              Each object has `key`, `src`, and `label` — TypeScript infers the type
              from the array definition above. */}
          <div>
            <p className="dish-picker-label">Choose an Image</p>
            <div className="dish-picker-grid">
              {DISH_IMAGES.map((img) => (
                <button
                  key={img.key}
                  type="button"
                  // Clicking the already-selected image deselects it
                  onClick={() =>
                    setSelectedImage(img.key === selectedImage ? "" : img.key)
                  }
                  title={img.label}
                  className={`dish-btn${selectedImage === img.key ? " dish-btn--selected" : ""}`}
                >
                  <img src={img.src} alt={img.label} />
                </button>
              ))}
            </div>
          </div>

          {/* Visibility toggle */}
          <div className="visibility-field">
            <p className="form-label">Visibility</p>
            <div className="visibility-toggle">
              <button
                type="button"
                className={`visibility-btn ${visibility === "public" ? "visibility-btn--active" : ""}`}
                onClick={() => setVisibility("public")}
              >
                Public
              </button>
              <button
                type="button"
                className={`visibility-btn ${visibility === "private" ? "visibility-btn--active" : ""}`}
                onClick={() => setVisibility("private")}
              >
                Private
              </button>
            </div>
            <p className="visibility-hint">
              {visibility === "public"
                ? "Everyone can browse and view this recipe."
                : "Only you can see this recipe when logged in."}
            </p>
          </div>

          {/* Description */}
          <label className="form-label">
            Description
            <TextField
              typeOfElement="textarea"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              width={500}
              height={120}
            />
          </label>

          {/* Prep / Cook / Servings / Kcal — all four in one row */}
          <div className="form-stats-grid">
            <label className="form-label">
              Prep Time
              <TextField
                type="number"
                min="0"
                value={prepTime}
                placeholder="e.g. 15 min"
                onChange={(e) => setPrepTime(e.target.value)}
                width={100}
                height={50}
              />
            </label>

            <label className="form-label">
              Cook Time
              <TextField
                type="number"
                value={cookTime}
                placeholder="e.g. 10 min"
                onChange={(e) => setCookTime(e.target.value)}
                min="0"
                className="form-input"
                width={100}
                height={50}
              />
            </label>

            <label className="form-label">
              Servings
              <TextField
                type="number"
                value={servings}
                placeholder="e.g. 2"
                onChange={(e) => setServings(e.target.value)}
                min="1"
                className="form-input"
                width={100}
                height={50}
              />
            </label>

            <label className="form-label">
              Kcal x serv.
              <TextField
                type="number"
                value={calories}
                placeholder="e.g. 250"
                onChange={(e) => setCalories(e.target.value)}
                min="0"
                className="form-input"
                width={100}
                height={50}
              />
            </label>
          </div>
        </div>

        {/* ── RIGHT COLUMN ────────────────────────────────────────────────── */}
        <div className="form-col-right">
          {/* Ingredients */}
          <div>
            <h3 className="ingredients-section-title">Ingredients</h3>

            {/* Column headers */}
            <div className="ingredients-header">
              <span className="ingredient-col-label">Ingredients Name</span>
              <span className="ingredient-col-label">Amount</span>
              <span className="ingredient-col-label">Unit</span>
            </div>

            {/* Ingredient rows */}
            {ingredients.map((ingredient, index) => (
              <div key={index} className="ingredient-row">
                <TextField
                  type="text"
                  placeholder="e.g. Flour"
                  value={ingredient.name}
                  onChange={(e) =>
                    updateIngredient(index, "name", e.target.value)
                  }
                  className="form-input"
                  width={250}
                  height={50}
                />

                <TextField
                  type="text"
                  placeholder="e.g. 2"
                  value={ingredient.amount}
                  onChange={(e) =>
                    updateIngredient(index, "amount", e.target.value)
                  }
                  className="form-input"
                  width={120}
                  height={50}
                />

                <TextField
                  type="text"
                  placeholder="e.g. Cups"
                  value={ingredient.unit || ""}
                  onChange={(e) =>
                    updateIngredient(index, "unit", e.target.value)
                  }
                  className="form-input"
                  width={120}
                  height={50}
                />
              </div>
            ))}

            <HandDrawnButton
              type="button"
              actionBtn={addIngredient}
              iconImg={
                <img style={{ width: `50px` }} src={iconPinroll} alt="" />
              }
              label="Add Ingredient"
              width={180}
              height={40}
              color="#bfa27c"
              fillColor="#e4dec2"
            />
          </div>

          {/* Instructions */}
          <div>
            <div className="instructions-section-header">
              <h3 className="instructions-section-title">Instructions</h3>

              <HandDrawnButton
                type="button"
                actionBtn={addInstruction}
                iconImg={
                  <img style={{ width: `50px` }} src={iconPinroll} alt="" />
                }
                label="+ Add Step"
                width={150}
                height={40}
                color="#bfa27c"
                fillColor="#e4dec2"
              />
            </div>

            {instructions.map((instruction, index) => (
              <div key={index} className="instruction-item">
                <div className="instruction-step-label">Step {index + 1}</div>
                <TextField
                  typeOfElement="textarea"
                  value={instruction}
                  onChange={(e) => updateInstruction(index, e.target.value)}
                  className="form-input form-instruction"
                  width={500}
                  height={100}
                />
              </div>
            ))}
          </div>

          {/* ── Action buttons ──────────────────────────────────────────── */}
          {/* Pushed to the right with justifyContent: flex-end */}
          <div className="form-actions">
            {/* Cancel shows whenever onCancelEdit is provided
                (both on Add page and Edit page) */}
            {onCancelEdit && (
              <HandDrawnButton
                label="Cancel"
                iconImg={
                  <img style={{ width: `50px` }} src={iconPinroll} alt="" />
                }
                type="button"
                actionBtn={onCancelEdit}
                width={120}
                height={50}
                fillColor="#cf7f5a80"
                color="#cf7f5a"
              />
            )}
            <HandDrawnButton
              type="submit"
              iconImg={
                <img style={{ width: `50px` }} src={iconPinroll} alt="" />
              }
              label={editingRecipe ? "Update Recipe" : "Add Recipe"}
              width={150}
              height={50}
              color="#5e6b3e"
              fillColor="#CCC5A5"
            />
          </div>
        </div>
      </div>
    </form>
  );
}

export default RecipeForm;
