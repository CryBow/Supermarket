window.addEventListener('DOMContentLoaded', async () => {
  const cartContainer = document.getElementById('cart-items');
  const totalPriceDiv = document.getElementById('total-price');

  async function loadCart() {
    try {
      const response = await fetch('/get-cart');
      const cart = await response.json();
      console.log('Данные корзины:', cart);

      let total = 0;

      cartContainer.innerHTML = '';

      if (cart.length === 0) {
        const noProductsMessage = document.createElement('p');
        noProductsMessage.textContent = "Корзина пуста.";
        cartContainer.appendChild(noProductsMessage);
      }

      cart.forEach(item => {
        const itemTotal = item.price * item.quantity;
        total += itemTotal;

        const card = document.createElement('div');
        card.className = 'cart-item';

        card.innerHTML = `
            <img src="${item.image}" alt="${item.name}">
            <div class="info">
              <h2>${item.name}</h2>
              <p>Цена: ${item.price} ₽</p>
              <p>Количество: ${item.quantity}</p>
              <p>Итого: ${item.price * item.quantity} ₽</p>
            </div>
            <button class="remove-btn" data-id="${item.id}">&times;</button>
          `;

        // Добавляем обработчик для удаления товара
        card.querySelector('.remove-btn').addEventListener('click', async (e) => {
          const productId = e.target.getAttribute('data-id');
          console.log('Удаляем товар с ID:', productId);

          const delRes = await fetch('/remove-from-cart', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ productId })
          });

          if (!delRes.ok) {
            alert('Не удалось удалить товар');
            return;
          }

          // Перезагружаем корзину
          loadCart();
        });

        cartContainer.appendChild(card);
      });

      totalPriceDiv.innerHTML = `<h2>Общая стоимость: ${total} ₽</h2>`;
    } catch (err) {
      console.error('Ошибка при загрузке корзины:', err);
    }
  }

  loadCart();
});


function updateTotalPrice() {
  fetch('/get-cart')
    .then(res => res.json())
    .then(cart => {
      let total = 0;
      cart.forEach(item => {
        total += item.price * item.quantity;
      });
      document.getElementById('total-price').innerHTML = `<h2>Общая стоимость: ${total} ₽</h2>`;
    });
}


document.querySelector('.checkout-btn').addEventListener('click', () => {
  console.log('Нажата кнопка Оформить заказ');

  const cart = getCookie('cart');

  console.log('cart:', cart);

  if (!cart || JSON.parse(cart).length === 0) {
    alert('Корзина пуста');
    return;
  }

  // Проверяем авторизацию через сессию
  fetch('/api/check-auth')
    .then(response => response.json())
    .then(data => {
      if (!data.authenticated) {
        alert('Пожалуйста, авторизуйтесь');
        window.location.href = '/login';
        return;
      }
      localStorage.setItem('checkout_cart', cart);
      window.location.href = '/checkout.html';
    })
    .catch(error => {
      console.error('Ошибка при проверке авторизации:', error);
    });
});

// Вспомогательная функция чтения куки
function getCookie(name) {
  const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
  return match ? decodeURIComponent(match[2]) : null;
}