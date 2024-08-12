document.addEventListener("DOMContentLoaded", async function () {
    async function loadHTML(url, containerId) {
      try {
        const response = await fetch(url);
        if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
        const html = await response.text();
        document.getElementById(containerId).innerHTML = html;
  
        if (containerId === 'header-container') {
          await loadCategories('category-list-header');
        }
      } catch (error) {
        console.error('Erro ao carregar HTML:', error);
      }
    }
  
    async function loadCategories(listId) {
        const categoryList = document.getElementById(listId);
        if (categoryList) {
            try {
                const response = await fetch('http://localhost:8888/api/V1/categories/list');
                if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
                
                const data = await response.json();
                const categories = data.items;
                
                categoryList.innerHTML = '';
    
                const homeItem = document.createElement('li');
                const homeLink = document.createElement('a');
                homeLink.href = 'index.html';
                homeLink.textContent = 'Página Inicial';
                homeItem.appendChild(homeLink);
                categoryList.appendChild(homeItem);
                categories.forEach(category => {
                    const li = document.createElement('li');
                    const a = document.createElement('a');
                    a.href = `category.html?categoryId=${category.id}`;
                    a.textContent = category.name;
                    li.appendChild(a);
                    categoryList.appendChild(li);
                });
    
                const contactItem = document.createElement('li');
                const contactLink = document.createElement('a');
                contactLink.href = '#';
                contactLink.textContent = 'Contato';
                contactItem.appendChild(contactLink);
                categoryList.appendChild(contactItem);
    
            } catch (error) {
                console.error('Erro ao buscar categorias:', error);
            }
        } else {
            console.error(`Elemento com ID "${listId}" não encontrado.`);
        }
    }
    

    async function loadPageDetails() {
      const params = new URLSearchParams(window.location.search);
      const categoryId = params.get('categoryId');
      const path = params.get('path');
  
      try {
        const response = await fetch('http://localhost:8888/api/V1/categories/list');
        if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
        const data = await response.json();
        const categories = data.items;
  
        let category = null;
        if (categoryId) {
          category = categories.find(cat => cat.id == categoryId);
        } else if (path) {
          category = categories.find(cat => cat.path === path);
        }
  
        const categoryNameElement = document.getElementById('category-name');
        if (categoryNameElement) {
          if (category) {
            categoryNameElement.textContent = category.name;
            createBreadcrumb(category.name, category.id);
          } else {
            categoryNameElement.textContent = 'Categoria não encontrada';
            createBreadcrumb('Página Inicial', null);
          }
        } else {
          console.error('Elemento com ID "category-name" não encontrado.');
        }
      } catch (error) {
        console.error('Erro ao buscar detalhes da categoria:', error);
        createBreadcrumb('Página Inicial', null);
      }
    }
  
    function createBreadcrumb(categoryName, categoryId) {
      const breadcrumbContainer = document.getElementById('breadcrumb');
      if (breadcrumbContainer) {
        breadcrumbContainer.innerHTML = '';
  
        const homeLink = document.createElement('a');
        homeLink.href = 'index.html';
        homeLink.textContent = 'Página Inicial';
        homeLink.classList.add('breadcrumb-home');
  
        breadcrumbContainer.appendChild(homeLink);
        if (categoryId) {
          const separator = document.createTextNode(' > ');
          const categoryLink = document.createElement('a');
          categoryLink.href = `category.html?categoryId=${categoryId}`;
          categoryLink.textContent = categoryName;
          categoryLink.classList.add('breadcrumb-category');
          
          breadcrumbContainer.appendChild(separator);
          breadcrumbContainer.appendChild(categoryLink);
        }
      } else {
        console.error('Elemento com ID "breadcrumb" não encontrado.');
      }
    }
  
    await loadHTML('../templates/header.html', 'header-container');
    await loadHTML('../templates/footer.html', 'footer-container');
  
    if (document.body.classList.contains('home')) {
      await loadCategories('category-list-home');
    }
  
    await loadPageDetails();
  });
  