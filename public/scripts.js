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
