document.addEventListener('DOMContentLoaded', () => {
    // Авторизация
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
      loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('login-email').value.trim();
        const password = document.getElementById('login-password').value.trim();
  
        if (!email || !password) {
          alert('Заполните все поля');
          return;
        }
  
        try {
          const response = await fetch('/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
          });
          if (!response.ok) {
            const errMsg = await response.text();
            alert(`Ошибка: ${errMsg}`);
            return;
          }
           alert('Вы успешно авторизовались!');
           fetch("/profile")
        .then(response => response.text())
        .then(html => {
            document.open();
            document.write(html);
            document.close();
        });
        } catch (err) {
          console.error('Ошибка при авторизации:', err);
          alert('Ошибка при авторизации');
        }
      });
    }
  
    // Регистрация
    const registerForm = document.getElementById('register-form');
    if (registerForm) {
      registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const lastName = document.getElementById('last-name').value.trim();
        const firstName = document.getElementById('first-name').value.trim();
        const middleName = document.getElementById('middle-name').value.trim();
        const gender = document.getElementById('gender').value.trim();
        const phone = document.getElementById('phone').value.trim();
        const email = document.getElementById('register-email').value.trim();
        const address = document.getElementById('address').value.trim();
        const password = document.getElementById('register-password').value.trim();
        const birthDate = document.getElementById('birth-date').value.trim();
  
        if (!lastName || !firstName || !gender || !phone || !email || !address || !password || !birthDate) {
          alert('Пожалуйста, заполните все обязательные поля');
          return;
        }
  
        try {
          const response = await fetch('/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
              lastName, 
              firstName, 
              middleName, 
              gender, 
              phone, 
              email, 
              address, 
              password, 
              birthDate 
            })
          });
          if (!response.ok) {
            const errMsg = await response.text();
            alert(`Ошибка: ${errMsg}`);
            return;
          }
          alert('Вы успешно зарегистрировались!');
          window.location.href = 'login.html';
        } catch (err) {
          console.error('Ошибка при регистрации:', err);
          alert('Ошибка при регистрации');
        }
      });
    }
  });
  