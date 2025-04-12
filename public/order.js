window.addEventListener('DOMContentLoaded', async () => {
    // Загружаем карточки заказов через API
    try {
      const res = await fetch('/api/orders'); 
      if (!res.ok) {
        alert('Ошибка при загрузке заказов, пользователь не авторизован');
        window.location.href = '/login';
        return;
      }
      const orders = await res.json();
      console.log('История заказов:', orders);
  
      const ordersContainer = document.getElementById('orders-container');
      ordersContainer.innerHTML = '';
  
      if (orders.length === 0) {
        ordersContainer.innerHTML = '<p>Заказов не найдено.</p>';
      } else {
        // Создаем карточки заказов.
        orders.forEach(order => {
          const orderCard = document.createElement('div');
          orderCard.className = 'order-card';
          const creationDate = new Date(order.Дата_создания).toLocaleString();
  
          orderCard.innerHTML = `
            <div class="order-summary">
              <p><strong>Номер заказа:</strong> ${order.id_Заказа}</p>
              <p><strong>Дата:</strong> ${creationDate}</p>
              <p><strong>Статус:</strong> ${order.Статус_заказа}</p>
              <p><strong>Сумма:</strong> ${order.Стоимость_заказа} ₽</p>
              <p><strong>Количество позиций:</strong> ${order.total_items}</p>
            </div>
          `;
  
          // При клике переходим на страницу деталей заказа 
          orderCard.addEventListener('click', () => {
            window.location.href = `/order-details/${order.id_Заказа}`;
          });
          ordersContainer.appendChild(orderCard);
        });
      }
    } catch (err) {
      console.error('Ошибка при загрузке истории заказов:', err);
      alert('Ошибка при загрузке истории заказов');
    }
  
    // Обработчик кнопки "Назад"
    const backBtn = document.getElementById('back-btn');
    if (backBtn) {
      backBtn.addEventListener('click', () => {
        window.history.back();
      });
    }
  });
  