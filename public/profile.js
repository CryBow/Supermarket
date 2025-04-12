window.addEventListener('DOMContentLoaded', async () => {
    // При загрузке страницы пытаемся загрузить данные профиля
    try {
      const res = await fetch('/api/profile');
      if (!res.ok) {
        alert('Пользователь не авторизован! Перенаправляем на страницу входа.');
        window.location.href = '/login';
        return;
      }
      const user = await res.json();
      console.log('Данные профиля:', user);
  
      // Заполняем поля формы данными пользователя.
      document.getElementById('email').value = user.email || user.email || '';
      document.getElementById('first-name').value = user["Имя"] || user.firstName || '';
      document.getElementById('last-name').value = user["Фамилия"] || user.lastName || '';
      document.getElementById('middle-name').value = user["Отчество"] || user.middleName || '';
      document.getElementById('gender').value = user["Пол"] || user.gender || '';
      document.getElementById('phone').value = user["Телефон"] || user.phone || '';
      document.getElementById('address').value = user["Адрес"] || user.address || '';
  
      if (user["Дата_Рождения"] || user.birthDate) {
        const isoDate = user["Дата_Рождения"] || user.birthDate;
        let d = new Date(isoDate);
        const formattedDate = d.toLocaleDateString('en-CA');
        document.getElementById('birth-date').value = formattedDate;

      }
      document.getElementById('profile-password').value = '';
    } catch (err) {
      console.error('Ошибка при загрузке профиля:', err);
      alert('Ошибка при загрузке профиля');
    }
  
    const profileForm = document.getElementById('profile-form');
    const logoutBtn = document.getElementById('logout-btn');
    
    // Обработчик отправки формы "Обновить данные"
    if (profileForm) {
      profileForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const firstName = document.getElementById('first-name').value.trim();
        const lastName = document.getElementById('last-name').value.trim();
        const middleName = document.getElementById('middle-name').value.trim();
        const gender = document.getElementById('gender').value;
        const phone = document.getElementById('phone').value.trim();
        const address = document.getElementById('address').value.trim();
        const birthDate = document.getElementById('birth-date').value.trim();
        const password = document.getElementById('profile-password').value.trim();
  
        const email = document.getElementById('email').value; 
  
        // Проверяем, что все обязательные поля заполнены
        if (!firstName || !lastName || !gender || !phone || !address || !birthDate || !password) {
          alert('Пожалуйста, заполните все обязательные поля');
          return;
        }
  
        try {
          const response = await fetch('/update-profile', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            // Отправляем обновленные данные; 
            body: JSON.stringify({ firstName, lastName, middleName, gender, phone, address, birthDate, password })
          });
          if (!response.ok) {
            const errMsg = await response.text();
            alert('Ошибка при обновлении данных: ' + errMsg);
            return;
          }
          alert('Данные профиля успешно обновлены');
          fetch("/profile")
        } catch (err) {
          console.error('Ошибка при отправке данных профиля:', err);
          alert('Ошибка при обновлении данных');
        }
      });
    }
  
    // Обработчик кнопки "Выйти"
    if (logoutBtn) {
      logoutBtn.addEventListener('click', async () => {
        try {
          const response = await fetch('/logout');
          if (response.ok) {
            alert('Вы успешно вышли');
            window.location.href = '/';
          } else {
            alert('Ошибка при выходе');
          }
        } catch (err) {
          console.error('Ошибка при выходе:', err);
          alert('Ошибка при выходе');
        }
      });
    }
    loadOrders();
});


// Функция загрузки истории заказов
async function loadOrders() {
    try {
      const res = await fetch('/api/profile-orders');
      if (!res.ok) {
        console.error('Не удалось загрузить историю заказов');
        return;
      }
      const orders = await res.json();
      console.log('История заказов:', orders);
      const ordersContainer = document.getElementById('order-history');
      ordersContainer.innerHTML = '';
  
      if (orders.length === 0) {
        ordersContainer.innerHTML = '<p>Заказов не найдено.</p>';
      } else {
        orders.forEach(order => {
          const orderCard = document.createElement('div');
          orderCard.className = 'order-card';
          orderCard.innerHTML = `
            <p><strong>Номер заказа:</strong> ${order.id_Заказа}</p>
            <p><strong>Дата создания:</strong> ${new Date(order.Дата_создания).toLocaleString()}</p>
            <p><strong>Статус:</strong> ${order.Статус_заказа}</p>
            <p><strong>Сумма:</strong> ${order.Стоимость_заказа} ₽</p>
            <p><strong>Количество позиций:</strong> ${order.total_items}</p>
          `;
          ordersContainer.appendChild(orderCard);
        });
      }
    } catch (err) {
      console.error('Ошибка загрузки истории заказов:', err);
    }
  }

  