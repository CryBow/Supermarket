document.addEventListener('DOMContentLoaded', () => {
    // Функция для загрузки категорий
    function loadCategories() {
        fetch('/api/categories')
            .then(response => response.json())
            .then(categories => {
                const categorySelect = document.querySelector('#category-select');
                
                // Добавляем опцию по умолчанию "Категории"
                const defaultOption = document.createElement('option');
                defaultOption.value = 'Не выбрано';
                defaultOption.textContent = 'Категории';
                categorySelect.appendChild(defaultOption); // Делаем "Категории" первым элементом

                categories.forEach(category => {
                    const option = document.createElement('option');
                    option.value = category;
                    option.textContent = category;
                    categorySelect.appendChild(option);
                });
            })
            .catch(err => console.error('Ошибка при загрузке категорий:', err));
    }

    // Загрузить категории при загрузке страницы
    loadCategories();

    // Функция для загрузки товаров с фильтрами
    function loadProducts(search = '', sort = 'none', category = 'none') {
        // Проверяем, если категория не выбрана, то исключаем её из параметров
        if (category === 'none') {
            category = ''; // Или установите пустую строку, если это необходимо
        }
    
        const url = `/api/products?search=${encodeURIComponent(search)}&sort=${encodeURIComponent(sort)}&category=${encodeURIComponent(category)}`;
        console.log('URL для запроса товаров:', url); // Отладка: выводим URL запроса
    
        fetch(url)
            .then(response => response.json())
            .then(products => {
                console.log('Полученные товары с сервера:', products);
          
                const container = document.querySelector('.product-grid');
                container.innerHTML = '';  // Очистка контейнера перед загрузкой товаров
          
                // Проверка наличия товаров
                if (products.length === 0) {
                    const noProductsMessage = document.createElement('p');
                    noProductsMessage.textContent = "Нет товаров для отображения.";
                    container.appendChild(noProductsMessage);
                }
          
                // Отображение товаров
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
    }
    

    // Загрузка товаров при первом открытии страницы
    loadProducts();

    // Обработчик для фильтров
    document.querySelector('.apply-filters-btn').addEventListener('click', () => {
        const search = document.querySelector('#search-input').value;
        const sort = document.querySelector('#sort-select').value;
        const category = document.querySelector('#category-select').value;

        console.log('Применение фильтров:', { search, sort, category }); // Отладка: выводим фильтры

        // Перезапрос товаров с фильтрами
        loadProducts(search, sort, category);
    });

    // Обработчик для сброса фильтров
    document.querySelector('.reset-filters-btn').addEventListener('click', () => {
        document.querySelector('#search-input').value = '';
        document.querySelector('#sort-select').value = 'none';  // Сбросить сортировку на "none"
        document.querySelector('#category-select').value = 'Не выбрано'; // Сбросить категорию на "none"

        // Перезапрос товаров без фильтров
        loadProducts();
    });
});
