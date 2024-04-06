const getRecipes = async () => {
  try {
    return (await fetch("api/recipes/")).json();
  } catch (error) {
    console.log(error);
  }
};

const showRecipes = async () => {
  let recipes = await getRecipes();
  let recipesDiv = document.getElementById("recipe-list");
  recipesDiv.innerHTML = "";
  recipes.forEach((recipe) => {
    const section = document.createElement("section");
    section.classList.add("recipe");
    recipesDiv.append(section);

    const a = document.createElement("a");
    a.href = "#";
    section.append(a);

    const h3 = document.createElement("h3");
    h3.innerHTML = recipe.name;
    a.append(h3);

    const img = document.createElement("img");
    img.src = recipe.img;
    a.append(img);

    a.onclick = (e) => {
      e.preventDefault();
      displayDetails(recipe);
    };
  });
};

const displayDetails = (recipe) => {
  openDialog("recipe-details");
  const recipeDetails = document.getElementById("recipe-details");
  recipeDetails.innerHTML = "";
  recipeDetails.classList.remove("hidden");

  const h3 = document.createElement("h3");
  h3.innerHTML = recipe.name;
  recipeDetails.append(h3);

  const dLink = document.createElement("a");
  dLink.innerHTML = "	&#9249;";
  recipeDetails.append(dLink);
  dLink.id = "delete-link";

  const eLink = document.createElement("a");
  eLink.innerHTML = "&#9998;";
  recipeDetails.append(eLink);
  eLink.id = "edit-link";

  const p = document.createElement("p");
  recipeDetails.append(p);
  p.innerHTML = recipe.description;

  const ul = document.createElement("ul");
  recipeDetails.append(ul);
  console.log(recipe.ingredients);
  recipe.ingredients.forEach((ingredient) => {
    const li = document.createElement("li");
    ul.append(li);
    li.innerHTML = ingredient;
  });

  const spoon = document.createElement("section");
  spoon.classList.add("spoon");
  recipeDetails.append(spoon);

  eLink.onclick = showRecipeForm;
  dLink.onclick = deleteRecipe.bind(this, recipe);

  populateEditForm(recipe);
};

const populateEditForm = (recipe) => {
  const form = document.getElementById("recipe-form");
  form._id.value = recipe._id;
  form.name.value = recipe.name;
  form.description.value = recipe.description;
  document.getElementById("img-prev").src = recipe.img;
  populateIngredients(recipe.ingredients);
}

const populateIngredients = (ingredients) => {
  const section = document.getElementById("ingredient-boxes");
  ingredients.forEach((ingredient)=>{
    const input = document.createElement("input");
    input.type = "text"
    input.value = ingredient;
    section.append(input);
  });
}

const addEditRecipe = async (e) => {
  e.preventDefault();
  const form = document.getElementById("recipe-form");
  const formData = new FormData(form);
  let response;
  formData.append("ingredients", getIngredients());

  console.log(...formData);

  //add request
  if (form._id.value.trim() == "") {
    console.log("in post");
    response = await fetch("/api/recipes", {
      method: "POST",
      body: formData,
    });
  } else {
    //put request
    console.log("in put");
    response = await fetch(`/api/recipes/${form._id.value}`, {
      method: "PUT",
      body: formData,
    });
  }

  //successfully got data from server
  if (response.status != 200) {
    console.log("Error adding / editing data");
  }

  await response.json();
  resetForm();
  document.getElementById("dialog").style.display = "none";
  showRecipes();
};

const deleteRecipe = async(recipe) => {
  //console.log("deleting recipe " + recipe._id);
  let response = await fetch(`/api/recipes/${recipe._id}`,{
    method:"DELETE",
    headers:{
      "Content-Type":"application/json;charset=utf-8"
    }
  });

  if(response.status !=200){
    console.log("Error deleting");
    return;
  }
  let result = await response.json();
    resetForm();
    showRecipes();
    document.getElementById("dialog").style.display = "none";

}

const getIngredients = () => {
  const inputs = document.querySelectorAll("#ingredient-boxes input");
  let ingredients = [];

  inputs.forEach((input) => {
    ingredients.push(input.value);
  });

  return ingredients;
};

const resetForm = () => {
  const form = document.getElementById("recipe-form");
  form.reset();
  form._id.value = "";
  document.getElementById("ingredient-boxes").innerHTML = "";
  document.getElementById("img-prev").src = "";
};

const showRecipeForm = (e) => {
  openDialog("recipe-form");
  console.log(e.target);
  if (e.target.getAttribute("id") != "edit-link") {
    resetForm();
  }
};

const addIngredient = (e) => {
  e.preventDefault();
  const section = document.getElementById("ingredient-boxes");
  const input = document.createElement("input");
  input.type = "text";
  section.append(input);
};

const openDialog = (id) => {
  document.getElementById("dialog").style.display = "block";
  document.querySelectorAll("#dialog-details > *").forEach((item) => {
    item.classList.add("hidden");
  });
  document.getElementById(id).classList.remove("hidden");
};

//initial code
showRecipes();
document.getElementById("recipe-form").onsubmit = addEditRecipe;
document.getElementById("add-link").onclick = showRecipeForm;
document.getElementById("add-ingredient").onclick = addIngredient;

document.getElementById("img").onchange = (e) => {
  if (!e.target.files.length) {
    document.getElementById("img-prev").src = "";
    return;
  }
  document.getElementById("img-prev").src = URL.createObjectURL(
    e.target.files.item(0)
  );
};
