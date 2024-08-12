document.addEventListener("DOMContentLoaded", function () {
  const categoryList = document.getElementById("category-list");
  const breadcrumbNav = document.getElementById("breadcrumb");
  const gridProducts = document.querySelector(".grid-products");
  let allProducts = [];
  let activeFilters = {};

  async function fetchCategories() {
    try {
      const response = await fetch("http://localhost:8888/api/V1/categories/list");
      if (!response.ok) {
        throw new Error(`Erro na requisição: ${response.status}`);
      }
      const data = await response.json();
      const categories = data.items;
  
      categories.forEach((category) => {
        const li = document.createElement("li");
        const a = document.createElement("a");
        a.href = `category.html?categoryId=${category.id}`;
        a.textContent = category.name;
        li.appendChild(a);
        categoryList.insertBefore(li, categoryList.lastElementChild);
  
        a.addEventListener("click", function (event) {
          event.preventDefault();
          const categoryId = category.id;
          fetchCategoryProducts(categoryId);
          updateBreadcrumb(category.name);
          document.getElementById('category-name').textContent = category.name;
        });
      });
    } catch (error) {
      console.error("Erro ao buscar categorias:", error);
    }
  }
  
  if (categoryList) {
    fetchCategories();
  } else {
    console.error('Elemento com ID "category-list" não encontrado.');
  }
  

  async function fetchCategoryProducts(categoryId) {
    try {
      const response = await fetch(
        `http://localhost:8888/api/V1/categories/${categoryId}`
      );
      if (!response.ok) {
        throw new Error(`Erro na requisição: ${response.status}`);
      }
      const data = await response.json();
      allProducts = data.items;

      if (data.filters && data.filters.length > 0) {
        updateFilters(data.filters, data.items);
      } else {
        console.warn("Nenhum filtro encontrado.");
      }

      renderProducts(allProducts);
    } catch (error) {
      console.error("Erro ao buscar produtos da categoria:", error);
    }
  }

  function updateFilters(filters, items) {
    const filterContainer = document.querySelector(".all-filters");
    if (!filterContainer) return;

    filterContainer.innerHTML = "";

    const uniqueFilters = {};

    items.forEach((item) => {
      item.filter.forEach((filter) => {
        for (const [key, value] of Object.entries(filter)) {
          if (!uniqueFilters[key]) {
            uniqueFilters[key] = new Set();
          }
          uniqueFilters[key].add(value);
        }
      });
    });

    filters.forEach((filter) => {
      for (const [filterType, filterTitle] of Object.entries(filter)) {
        const div = document.createElement("div");
        div.className = "filter-group";

        if (filterTitle === "Cor") {
          div.classList.add("color-filter-group");
        }

        const title = document.createElement("h3");
        title.textContent = filterTitle;
        div.appendChild(title);

        if (uniqueFilters[filterType]) {
          const ul = document.createElement("ul");
          ul.className =
            filterTitle === "Cor" ? "color-filter-list" : "filter-list";

          uniqueFilters[filterType].forEach((value) => {
            const li = document.createElement("li");
            const a = document.createElement("a");
            a.href = "#"; 

            if (filterTitle === "Cor") {
              a.className = "color-box-container"; 
              const colorBox = document.createElement("div");
              colorBox.className = "color-box";
              const colorValue = normalizeColor(value);
              colorBox.style.backgroundColor = colorValue;
              a.appendChild(colorBox);
            } else {
              a.textContent = value; 
            }

            li.appendChild(a);
            ul.appendChild(li);

            a.addEventListener("click", function (event) {
              event.preventDefault();
              activeFilters[filterType] = value;
              filterProducts();
              showClearFilterButton(); 
            });
          });

          div.appendChild(ul);
        }

        filterContainer.appendChild(div);
      }
    });
  }

  function filterProducts() {
    const filteredProducts = allProducts.filter((product) =>
      Object.keys(activeFilters).every((filterType) =>
        product.filter.some((filter) => filter[filterType] === activeFilters[filterType])
      )
    );

    renderProducts(filteredProducts);
  }

  function showClearFilterButton() {
    let clearFilterButton = document.querySelector(".clear-filter-button");
    if (!clearFilterButton) {
      clearFilterButton = document.createElement("button");
      clearFilterButton.className = "clear-filter-button";
      clearFilterButton.textContent = "Limpar Filtros";
      clearFilterButton.addEventListener("click", clearFilters);
      
      const filterContainer = document.querySelector(".all-filters");
      filterContainer.appendChild(clearFilterButton);
    }
  }

  function clearFilters() {
    activeFilters = {};

    const clearFilterButton = document.querySelector(".clear-filter-button");
    if (clearFilterButton) {
      clearFilterButton.remove();
    }

    renderProducts(allProducts);
  }

  function renderProducts(products) {
    if (!gridProducts) return;

    gridProducts.innerHTML = "";

    products.forEach((product) => {
      const productElement = document.createElement("div");
      productElement.classList.add("product-item");

      productElement.innerHTML = `
        <img src="${product.image}" data-src="${product.image}" alt="${
        product.name
      }" class="product-image" />
        <div class="product-info">
          <h2 class="product-name">${product.name}</h2>
          <div class="price-container">
            <p class="product-price">${
              product.price ? `R$${product.price.toFixed(2)}` : ""
            }</p>
          </div>
        </div>
      `;

      const priceContainer = productElement.querySelector(".price-container");
      const productPrice = priceContainer.querySelector(".product-price");

      if (product.specialPrice) {
        productPrice.classList.add("old"); 

        const specialPrice = document.createElement("p");
        specialPrice.classList.add("product-special-price");
        specialPrice.textContent = `R$${product.specialPrice.toFixed(2)}`;

        priceContainer.appendChild(specialPrice);
      }

      const buyButton = document.createElement("button");
      buyButton.classList.add("buy-button");
      buyButton.textContent = "Comprar";
      const productInfo = productElement.querySelector(".product-info");
      productInfo.appendChild(buyButton);

      gridProducts.appendChild(productElement);
    });
  }

  const urlParams = new URLSearchParams(window.location.search);
  const categoryId = urlParams.get("categoryId");

  if (categoryId) {
    fetchCategoryProducts(categoryId);
    const categoryName = getCategoryNameById(categoryId);
    updateBreadcrumb(categoryName);
  }

  function getCategoryNameById(categoryId) {
    const categoryLink = categoryList.querySelector(
      `a[href="category.html?categoryId=${categoryId}"]`
    );
    return categoryLink ? categoryLink.textContent : "";
  }

  const sortSelect = document.getElementById("sort-select");
  const clearSortButton = document.getElementById("clear-sort");

  sortSelect.addEventListener("change", function () {
    const selectedValue = sortSelect.value;

    if (selectedValue) {
      sortProducts(selectedValue);
      clearSortButton.style.display = "inline-block";
    } else {
      renderProducts(allProducts);
      clearSortButton.style.display = "none";
    }
  });

  clearSortButton.addEventListener("click", function () {
    sortSelect.value = "";
    renderProducts(allProducts);
    clearSortButton.style.display = "none";
  });

  function sortProducts(criteria) {
    let sortedProducts = [...allProducts];

    if (criteria === "alphabetical") {
      sortedProducts.sort((a, b) => a.name.localeCompare(b.name));
    } else if (criteria === "price-asc") {
      sortedProducts.sort((a, b) => a.price - b.price);
    } else if (criteria === "price-desc") {
      sortedProducts.sort((a, b) => b.price - a.price);
    }

    renderProducts(sortedProducts);
  }
});

function normalizeColor(color) {
  const colors = {
    preta: "#000000",
    laranja: "#FFA500",
    amarela: "#FFFF00",
    cinza: "#808080",
    azul: "#0000FF",
    rosa: "#FFC0CB",
    bege: "#F5F5DC",
  };

  const lowerColor = color.toLowerCase();
  return colors[lowerColor] || "#CCCCCC";
}

function updateBreadcrumb(categoryName) {
  const breadcrumbNav = document.getElementById("breadcrumb");
  if (breadcrumbNav) {
    breadcrumbNav.innerHTML = `<a href="index.html">Página Inicial</a> > ${categoryName}`;
  }
}

