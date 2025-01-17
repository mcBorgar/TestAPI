document.getElementById('login-button').addEventListener('click', async () => {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
  
    const response = await fetch('/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });
  
    const result = await response.json();
  
    if (response.ok) {
      alert('Innlogging vellykket!');
      // Du kan omdirigere brukeren til hovedsiden her:
      window.location.href = 'program.html';
    } else {
      const errorMessage = document.getElementById('error-message');
      errorMessage.textContent = result.message || 'Innlogging feilet.';
      errorMessage.style.display = 'block';
    }
  });
  // Vis/skjul registreringsskjema
document.getElementById('register-button').addEventListener('click', () => {
    document.getElementById('login-container').style.display = 'none';
    document.getElementById('register-container').style.display = 'block';
  });
  
  // Håndter registreringsskjema
  document.getElementById('register-submit').addEventListener('click', async () => {
    const username = document.getElementById('reg-username').value;
    const password = document.getElementById('reg-password').value;
  
    const response = await fetch('/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });
  
    const result = await response.json();
  
    if (response.ok) {
      alert('Bruker registrert!');
      // Gå tilbake til login-skjermen
      document.getElementById('register-container').style.display = 'none';
      document.getElementById('login-container').style.display = 'block';
    } else {
      const registerError = document.getElementById('register-error');
      registerError.textContent = result.message || 'Registrering feilet.';
      registerError.style.display = 'block';
    }
  });
  