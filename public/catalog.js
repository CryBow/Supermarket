document.addEventListener('DOMContentLoaded', () => {
    // Функция для загрузки категорий
    function loadCategories() {
        fetch('/api/categories')
            .then(response => response.json())
            .then(categories => {
                const categorySelect = document.querySelector('#category-select');
                const defaultOption = document.createElement('option');
                defaultOption.value = '';
                defaultOption.textContent = 'Категории';
                categorySelect.appendChild(defaultOption);

                categories.forEach(category => {
                    const option = document.createElement('option');
                    option.value = category;
                    option.textContent = category;
                    categorySelect.appendChild(option);
                });
            })
            .catch(err => console.error('Ошибка при загрузке категорий:', err));
    }

    // Загружаем категории
    loadCategories();

    // Функция для загрузки товаров с фильтрами
    function loadProducts(search = '', sort = 'none', category = 'none') {
        if (category === 'none') {
            category = '';
        }
    
        const url = `/api/products?search=${encodeURIComponent(search)}&sort=${encodeURIComponent(sort)}&category=${encodeURIComponent(category)}`;
        console.log('URL для запроса товаров:', url);
    
        fetch(url)
            .then(response => response.json())
            .then(products => {
                console.log('Полученные товары с сервера:', products);
                const container = document.querySelector('.product-grid');
                container.innerHTML = '';
                if (products.length === 0) {
                    const noProductsMessage = document.createElement('p');
                    noProductsMessage.textContent = "Нет товаров для отображения.";
                    container.appendChild(noProductsMessage);
                }
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
                        // Формируем объект товара с нужными ключами
                        const productData = {
                            id: product['id_Товара'],
                            name: product['Название_товара'],
                            price: product['Цена'],
                            image: product['Изображение'],
                            category: product['Категория']
                        };
                        fetch('/add-to-cart', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ product: productData })
                        })
                        .then(response => {
                            button.classList.remove('loading');
                            if (!response.ok) {
                                return response.text().then(text => { throw new Error(text); });
                            }
                            return response.json();
                        })
                        .then(data => {
                            console.log('Товар добавлен в корзину:', data);
                            alert('Товар добавлен в корзину!');
                        })
                        .catch(err => {
                            console.error('Ошибка при добавлении в корзину:', err);
                            alert('Не удалось добавить товар в корзину.');
                        });
                    });
    
                    container.appendChild(card);
                });
            })
            .catch(err => console.error('Ошибка при загрузке товаров:', err));
    }
    
    loadProducts();
    
    // Обработчик для фильтров
    document.querySelector('.apply-filters-btn').addEventListener('click', () => {
        const search = document.querySelector('#search-input').value;
        const sort = document.querySelector('#sort-select').value;
        const category = document.querySelector('#category-select').value;
    
        console.log('Применение фильтров:', { search, sort, category });
        loadProducts(search, sort, category);
    });
    
    // Обработчик для сброса фильтров
    document.querySelector('.reset-filters-btn').addEventListener('click', () => {
        document.querySelector('#search-input').value = '';
        document.querySelector('#sort-select').value = 'none';
        document.querySelector('#category-select').value = '';
        loadProducts();
    });
});
