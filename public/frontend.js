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
  

