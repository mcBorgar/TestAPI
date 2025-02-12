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

document.addEventListener('DOMContentLoaded', async () => {
  const bookList = document.getElementById('book-list');
  const deleteBookButton = document.getElementById('delete-book-button');
  let selectedBookId = null;

  // Hent og vis bøker fra databasen
  async function fetchBooks() {
    try {
      const response = await fetch('/books');
      const books = await response.json();
      bookList.innerHTML = '';

      books.forEach(book => {
        const listItem = document.createElement('li');
        listItem.textContent = `${book.title} - ${book.author} (${book.quantity} stk)`;
        listItem.dataset.bookId = book.book_id;

        listItem.addEventListener('click', () => {
          // Marker valgt bok
          document.querySelectorAll('#book-list li').forEach(li => li.classList.remove('selected'));
          listItem.classList.add('selected');
          selectedBookId = book.book_id;
          deleteBookButton.disabled = false;
        });

        bookList.appendChild(listItem);
      });
    } catch (error) {
      console.error('Feil ved henting av bøker:', error);
    }
  }

  // Slett valgt bok
  deleteBookButton.addEventListener('click', async () => {
    if (!selectedBookId) return;

    if (!confirm('Er du sikker på at du vil slette denne boken?')) return;

    try {
      const response = await fetch(`/delete-book/${selectedBookId}`, {
        method: 'DELETE',
      });

      console.log(response); // Logg hele responsobjektet
      const text = await response.text(); // Hent responsen som tekst
      console.log('Rårespons fra server:', text); // Se hva serveren faktisk sender
      const result = JSON.parse(text); // Konverter til JSON manuelt
      alert(result.message);
      

      selectedBookId = null;
      deleteBookButton.disabled = true;
      fetchBooks(); // Oppdater boklisten etter sletting
    } catch (error) {
      console.error('Feil ved sletting av bok:', error);
    }
  });

  fetchBooks(); // Last inn bøkene ved oppstart

  // Oppdater listen automatisk hvert 10. sekund
  setInterval(fetchBooks, 10000);
});

document.addEventListener('DOMContentLoaded', async () => {
  const loanBookButton = document.getElementById('loan-book-button');
  const returnBookButton = document.getElementById('return-book-button');
  const loansList = document.getElementById('loans-list');
  let selectedLoanId = null;

  // Hent og vis lånte bøker
  async function fetchLoans() {
    try {
      const response = await fetch('/loans');
      const loans = await response.json();
      console.log('Lånte bøker mottatt:', loans); 
      loansList.innerHTML = '';

      loans.forEach(loan => {
        const listItem = document.createElement('li');
        listItem.textContent = `${loan.title} lånt av ${loan.student}`;
        listItem.dataset.loanId = loan.id;

        listItem.addEventListener('click', () => {
          document.querySelectorAll('#loans-list li').forEach(li => li.classList.remove('selected'));
          listItem.classList.add('selected');
          selectedLoanId = loan.id;
          returnBookButton.disabled = false;
        });

        loansList.appendChild(listItem);
      });
    } catch (error) {
      console.error('Feil ved henting av lånte bøker:', error);
    }
  }

  // Lån bok
  loanBookButton.addEventListener('click', async () => {
    const student = document.getElementById('student').value;
    const title = document.getElementById('loan-title').value;

    if (!student || !title) {
      alert('Fyll ut alle feltene.');
      return;
    }

    try {
      const response = await fetch('/loan-book', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ student, title }),
      });

      const result = await response.json();
      alert(result.message);
      fetchLoans();
    } catch (error) {
      console.error('Feil ved låning av bok:', error);
    }
  });

  // Returner bok
  returnBookButton.addEventListener('click', async () => {
    if (!selectedLoanId) return;

    try {
      const response = await fetch(`/return-book/${selectedLoanId}`, { method: 'DELETE' });
      const result = await response.json();
      alert(result.message);
      fetchLoans();
    } catch (error) {
      console.error('Feil ved retur av bok:', error);
    }
  });

  fetchLoans();
});
