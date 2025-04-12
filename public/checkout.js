window.addEventListener('DOMContentLoaded', async () => {
    // Предзаполняем адрес из профиля пользователя
    try {
      const profileRes = await fetch('/api/profile');
      if (!profileRes.ok) {
        alert('Пользователь не авторизован! Перенаправляем на страницу входа.');
        window.location.href = '/login.html';
        return;
      }
      const user = await profileRes.json();
      console.log('Данные профиля:', user);
      document.getElementById('address').value = user['Адрес'] || user.address || '';
    } catch (err) {
      console.error('Ошибка при загрузке профиля:', err);
      alert('Ошибка при загрузке данных профиля');
      return;
    }
  
    // Загрузка товаров из localStorage для оформления заказа
    const cartContainer = document.getElementById('checkout-items');
    const totalPriceDiv = document.getElementById('total-price');
    const submitBtn = document.getElementById('confirm-order-btn');
  
    // Корзина сохраняется в localStorage под ключом 'checkout_cart'
    const cart = JSON.parse(localStorage.getItem('checkout_cart')) || [];
    console.log('Корзина для оформления заказа:', cart);
  
    let total = 0;
    cartContainer.innerHTML = '';
  
    if (cart.length === 0) {
      cartContainer.innerHTML = '<p>Корзина пуста.</p>';
    } else {
      cart.forEach(item => {
        const itemTotal = item.price * item.quantity;
        total += itemTotal;
  
        const card = document.createElement('div');
        card.className = 'checkout-item';
        card.innerHTML = `
          <img src="${item.image}" alt="${item.name}">
          <div class="info">
            <h2>${item.name}</h2>
            <p>Цена: ${item.price} ₽</p>
            <p>Количество: ${item.quantity}</p>
            <p>Итого: ${item.price * item.quantity} ₽</p>
          </div>
        `;
        cartContainer.appendChild(card);
      });
    }
  
    totalPriceDiv.innerHTML = `<h2>Общая стоимость: ${total.toFixed(2)} ₽</h2>`;
  
    // Обработчик кнопки "Оформить заказ"
    submitBtn.addEventListener('click', async () => {
      const address = document.getElementById('address').value.trim();
      if (!address) {
        alert('Адрес не найден в профиле. Пожалуйста, обновите адрес в профиле.');
        return;
      }
      if (cart.length === 0) {
        alert('Корзина пуста!');
        return;
      }
  
      try {
        const response = await fetch('/create-order', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ cart, address, total })
        });
        if (!response.ok) {
          const errMsg = await response.text();
          alert('Ошибка при оформлении заказа: ' + errMsg);
          return;
        }
        alert('Заказ успешно оформлен! Статус заказа: "Оформлен"');
        // Очищаем корзину: удаляем данные из localStorage и из куки
        localStorage.removeItem('checkout_cart');
        document.cookie = 'cart=; Max-Age=0; path=/;';
        window.location.href = '/profile';
      } catch (err) {
        console.error('Ошибка при создании заказа:', err);
        alert('Ошибка при оформлении заказа');
      }
    });
  });
  
  // Вспомогательная функция для чтения куки
  function getCookie(name) {
    const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
    return match ? decodeURIComponent(match[2]) : null;
  }
  