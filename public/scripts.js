console.log('scripts.js lastet!');

document.addEventListener('DOMContentLoaded', () => {
  console.log('DOMContentLoaded event fired');

  // Hent knapper
  const loginButton = document.getElementById('login-button');
  const registerButton = document.getElementById('register-button');
  const registerSubmitButton = document.getElementById('register-submit');
  const addBookButton = document.getElementById('add-book-button');

  // Hent containere
  const loginContainer = document.getElementById('login-container');
  const registerContainer = document.getElementById('register-container');

  // Eventlistener for å vise registreringsskjemaet
  if (registerButton) {
    registerButton.addEventListener('click', () => {
      loginContainer.style.display = 'none';
      registerContainer.style.display = 'block';
    });
  } else {
    console.error('Register button not found');
  }

  // Eventlistener for registrering av bruker
  if (registerSubmitButton) {
    registerSubmitButton.addEventListener('click', async () => {
      console.log('Register button clicked');

      const username = document.getElementById('reg-username')?.value;
      const password = document.getElementById('reg-password')?.value;

      if (!username || !password) {
        alert('Brukernavn og passord må fylles ut.');
        return;
      }

      try {
        const response = await fetch('/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username, password }),
        });

        const result = await response.json();
        console.log('Server respons:', result);

        if (response.ok) {
          alert('Bruker registrert!');
          registerContainer.style.display = 'none';
          loginContainer.style.display = 'block';
        } else {
          alert(`Registrering feilet: ${result.message}`);
        }
      } catch (error) {
        console.error('Feil ved forespørsel:', error);
        alert('En feil oppstod. Prøv igjen.');
      }
    });
  } else {
    console.error('Register submit button not found');
  }

  // Eventlistener for innlogging
  if (loginButton) {
    loginButton.addEventListener('click', async () => {
      console.log('Login button clicked');
      const username = document.getElementById('username')?.value;
      const password = document.getElementById('password')?.value;

      console.log(`Brukernavn: ${username}, Passord: ${password}`);

      try {
        const response = await fetch('/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username, password }),
        });

        const result = await response.json();
        console.log('Server respons:', result);

        if (response.ok) {
          alert('Innlogging vellykket!');
          window.location.href = 'program.html'; // Naviger til neste side
        } else {
          console.error('Innlogging feilet:', result.message);
          alert(`Innlogging feilet: ${result.message}`);
        }
      } catch (error) {
        console.error('Feil ved forespørsel:', error);
      }
    });
  } else {
    console.error('Login button not found');
  }

  // Eventlistener for å legge til en bok
  if (addBookButton) {
    addBookButton.addEventListener('click', async () => {
      console.log('Legg til bok-knapp klikket');

      const title = document.getElementById('title')?.value;
      const author = document.getElementById('author')?.value;
      const quantity = document.getElementById('quantity')?.value;

      if (!title || !author || !quantity) {
        alert('Fyll ut alle feltene for å legge til en bok.');
        return;
      }

      try {
        const response = await fetch('/add-book', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ title, author, quantity }),
        });

        const result = await response.json();
        console.log('Server respons:', result);

        if (response.ok) {
          alert('Bok lagt til!');
          document.getElementById('add-book-form').reset();
        } else {
          alert(`Feil ved legging av bok: ${result.message}`);
        }
      } catch (error) {
        console.error('Feil ved forespørsel:', error);
        alert('En feil oppstod. Prøv igjen.');
      }
    });
  } else {
    console.error('Add book button not found');
  }
});
