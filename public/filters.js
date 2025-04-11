document.addEventListener('DOMContentLoaded', () => {
  const searchInput = document.getElementById('searchInput');
  const sortSelect = document.getElementById('sortSelect');
  const categorySelect = document.getElementById('categorySelect');
  const applyFiltersButton = document.getElementById('applyFilters');
  const resetFiltersButton = document.getElementById('resetFilters');

  // Загрузка доступных категорий для фильтрации
  fetch('/api/categories')
    .then(response => response.json())
    .then(categories => {
      const defaultOption = document.createElement('option');
      defaultOption.value = '';
      defaultOption.textContent = 'Не выбрано';
      categorySelect.appendChild(defaultOption);

      categories.forEach(category => {
        const option = document.createElement('option');
        option.value = category.name;
        option.textContent = category.name;
        categorySelect.appendChild(option);
      });
    })
    .catch(err => console.error('Ошибка при загрузке категорий:', err));

  // Обработчик для кнопки "Применить фильтры"
  applyFiltersButton.addEventListener('click', () => {
    const filters = {
      search: searchInput.value.trim(),
      sort: sortSelect.value,
      category: categorySelect.value
    };

    // Запрашиваем отфильтрованные товары с сервера
    const queryString = new URLSearchParams(filters).toString();
    fetch(`/api/products?${queryString}`)
      .then(response => response.json())
      .then(products => {
        const container = document.querySelector('.product-grid');
        container.innerHTML = ''; // Очищаем контейнер

        products.forEach(product => {
          const card = document.createElement('div');
          card.className = 'product-card';
          card.innerHTML = `
            <img src="${product['Изображение']}" alt="${product['Название_товара']}">
            <h3>${product['Название_товара']}</h3>
            <p>${product['Категория']}</p>
            <p><strong>${product['Цена']} ₽</strong></p>
            <button class="add-to-cart-btn">Добавить в корзину</button>
          `;

          // При клике на карточку переходим на страницу товара
          card.addEventListener('click', e => {
            if (!e.target.classList.contains('add-to-cart-btn')) {
              window.location.href = `/product/${product['id_Товара']}`;
            }
          });

          // Обработчик для кнопки "Добавить в корзину"
          const button = card.querySelector('.add-to-cart-btn');
          button.addEventListener('click', e => {
            e.stopPropagation();
            button.classList.add('loading');
            setTimeout(() => {
              button.classList.remove('loading');
              fetch('/api/cart', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ productId: product['id_Товара'] })
              });
            }, 1000);
          });

          container.appendChild(card);
        });
      })
      .catch(err => console.error('Ошибка при загрузке товаров:', err));
  });

  // Обработчик для кнопки "Сбросить фильтры"
  resetFiltersButton.addEventListener('click', () => {
    searchInput.value = '';
    sortSelect.value = 'asc';
    categorySelect.value = ''; // Сброс категории на "Не выбрано"

    // Загружаем все товары без фильтров
    fetch('/api/products')
      .then(response => response.json())
      .then(products => {
        const container = document.querySelector('.product-grid');
        container.innerHTML = '';

        products.forEach(product => {
          const card = document.createElement('div');
          card.className = 'product-card';
          card.innerHTML = `
            <img src="${product['Изображение']}" alt="${product['Название_товара']}">
            <h3>${product['Название_товара']}</h3>
            <p>${product['Категория']}</p>
            <p><strong>${product['Цена']} ₽</strong></p>
            <button class="add-to-cart-btn">Добавить в корзину</button>
          `;

          card.addEventListener('click', e => {
            if (!e.target.classList.contains('add-to-cart-btn')) {
              window.location.href = `/product/${product['id_Товара']}`;
            }
          });

          const button = card.querySelector('.add-to-cart-btn');
          button.addEventListener('click', e => {
            e.stopPropagation();
            button.classList.add('loading');
            setTimeout(() => {
              button.classList.remove('loading');
              fetch('/api/cart', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ productId: product['id_Товара'] })
              });
            }, 1000);
          });

          container.appendChild(card);
        });
      })
      .catch(err => console.error('Ошибка при загрузке товаров:', err));
  });

});
