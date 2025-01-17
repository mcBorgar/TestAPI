console.log('scripts.js lastet!');

document.addEventListener('DOMContentLoaded', () => {
  console.log('DOMContentLoaded event fired');

  const loginButton = document.getElementById('login-button');
  if (!loginButton) {
    console.error('Login button not found');
    return;
  }

  loginButton.addEventListener('click', async () => {
    console.log('Login button clicked');
    const username = document.getElementById('username')?.value;
    const password = document.getElementById('password')?.value;

    console.log(`Brukernavn: ${username}, Passord: ${password}`);

    // Send data til backend
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
});

document.addEventListener('DOMContentLoaded', () => {
  console.log('scripts.js lastet!');

  const registerButton = document.getElementById('register-submit');
  if (!registerButton) {
    console.error('Register button not found');
    return;
  }

  registerButton.addEventListener('click', async () => {
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
        document.getElementById('register-container').style.display = 'none';
        document.getElementById('login-container').style.display = 'block';
      } else {
        alert(`Registrering feilet: ${result.message}`);
      }
    } catch (error) {
      console.error('Feil ved forespørsel:', error);
      alert('En feil oppstod. Prøv igjen.');
    }
  });
});
