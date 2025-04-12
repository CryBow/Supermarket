document.getElementById("home-btn").addEventListener("click", () => {
    fetch("/home")
        .then(response => response.text())
        .then(html => {
            document.open();
            document.write(html);
            document.close();
        });
});

document.getElementById("catalog-btn").addEventListener("click", () => {
    fetch("/catalog")
        .then(response => response.text())
        .then(html => {
            document.open();
            document.write(html);
            document.close();
        });
});

document.getElementById("cart-btn").addEventListener("click", () => {
    fetch("/cart")
        .then(response => response.text())
        .then(html => {
            document.open();
            document.write(html);
            document.close();
        });
});

document.getElementById("checkout-btn").addEventListener("click", () => {
    fetch("/checkout")
        .then(response => response.text())
        .then(html => {
            document.open();
            document.write(html);
            document.close();
        });
});

document.getElementById("profile-btn").addEventListener("click", () => {
    fetch("/profile")
        .then(response => response.text())
        .then(html => {
            document.open();
            document.write(html);
            document.close();
        });
});

document.getElementById("orders-btn").addEventListener("click", () => {
    fetch("/orders")
        .then(response => response.text())
        .then(html => {
            document.open();
            document.write(html);
            document.close();
        });
});

document.getElementById("stats-btn").addEventListener("click", () => {
    fetch("/stats")
        .then(response => response.text())
        .then(html => {
            document.open();
            document.write(html);
            document.close();
        });
});


document.querySelectorAll('.add-to-cart-btn').forEach(button => {
    button.addEventListener('click', async () => {
        const productId = button.dataset.id;
        const productName = button.dataset.name;
        const productPrice = parseFloat(button.dataset.price);
        const productImage = button.dataset.image;

        await fetch('/add-to-cart', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                product: {
                    id: productId,
                    name: productName,
                    price: productPrice,
                    image: productImage
                }
            })
        });

        alert('Товар добавлен в корзину');
    });
});


document.addEventListener('DOMContentLoaded', async () => {
    const loginSection = document.querySelector('.login-section');
    const loginBtn = document.getElementById('login-btn');

    try {
        const res = await fetch('/api/session-info');
        const data = await res.json();

        if (data.authorized) {
            loginSection.querySelector('p').textContent = `Вы успешно авторизовались`;
            loginBtn.textContent = 'Вы вошли';
            loginBtn.style.backgroundColor = '#4CAF50';
            loginBtn.disabled = true;
        }
    } catch (err) {
        console.error('Ошибка получения данных о сессии:', err);
    }
});

document.addEventListener('DOMContentLoaded', () => {
    const overlay = document.getElementById('cookie-overlay');
    const acceptBtn = document.getElementById('accept-cookies');
  
    if (!document.cookie.includes('cookiesAccepted=true')) {
      overlay.style.display = 'flex';
    }
  
    acceptBtn?.addEventListener('click', () => {
      document.cookie = "cookiesAccepted=true; max-age=" + (60 * 60 * 24 * 365) + "; path=/";
      overlay.style.display = 'none';
    });
  });
  
