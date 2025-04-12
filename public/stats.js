document.addEventListener('DOMContentLoaded', () => {
    fetchOrderStats();
    fetchProductSales();
    fetchUserStats();
  });
  
  // Получение общей статистики заказов
  async function fetchOrderStats() {
    try {
      const res = await fetch('/api/orders-stats');
      const data = await res.json();
  
      document.getElementById('orders-count').textContent = data.count || 0;
      document.getElementById('orders-total').textContent = data.total || 0;
    } catch (err) {
      console.error('Ошибка при загрузке статистики заказов:', err);
    }
  }
  
  // Получение данных по продажам товаров и построение графика
  async function fetchProductSales() {
    try {
      const res = await fetch('/api/product-sales');
      const data = await res.json();
  
      if (!Array.isArray(data) || data.length === 0) return;
  
      const labels = data.map(item => item.name);
      const quantities = data.map(item => item.sold_quantity);
  
      const ctx = document.getElementById('salesChart').getContext('2d');
      new Chart(ctx, {
        type: 'line',
        data: {
          labels,
          datasets: [{
            label: 'Продано',
            data: quantities,
            fill: false,
            borderColor: 'rgba(57, 72, 113, 1)',
            backgroundColor: 'rgba(57, 72, 113, 0.2)',
            tension: 0.4,
            pointBackgroundColor: 'white',
            pointBorderColor: 'rgba(57, 72, 113, 1)',
            pointRadius: 5
          }]
        },
        options: {
          responsive: true,
          scales: {
            y: {
              beginAtZero: true,
              ticks: {
                precision: 0
              }
            }
          },
          plugins: {
            legend: {
              display: true,
              labels: {
                color: '#394871'
              }
            }
          }
        }
      });
  
      const salesContainer = document.getElementById('product-sales');
      salesContainer.innerHTML = data.map(item =>
        `<p>${item.name}: ${item.sold_quantity} шт — ${item.total_revenue} ₽</p>`
      ).join('');
    } catch (err) {
      console.error('Ошибка при загрузке продаж по товарам:', err);
    }
  }
  
  // Получение статистики по пользователям
  async function fetchUserStats() {
    try {
      const res = await fetch('/api/user-stats');
      const data = await res.json();
  
      if (!Array.isArray(data) || data.length === 0) return;
  
      const container = document.getElementById('user-stats');
      let table = `
        <table border="1" cellspacing="0" cellpadding="5">
          <tr>
            <th>ID пользователя</th>
            <th>Количество заказов</th>
            <th>Общая сумма</th>
          </tr>
      `;
  
      data.forEach(u => {
        table += `
          <tr>
            <td>${u.id}</td>
            <td>${u.orders_count}</td>
            <td>${u.total_spent} ₽</td>
          </tr>
        `;
      });
  
      table += '</table>';
      container.innerHTML = table;
    } catch (err) {
      console.error('Ошибка при загрузке статистики пользователей:', err);
    }
  }
  document.querySelector('.visits-btn').addEventListener('click', () => {
    window.location.href = '/visit-stats';   
 });