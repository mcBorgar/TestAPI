console.log('scripts.js lastet!');

document.addEventListener('DOMContentLoaded', () => {
  console.log('DOMContentLoaded event fired');

  const loginButton = document.getElementById('login-button');
  if (!loginButton) {
    console.error('Login button not found'); // Debug
  } else {
    console.log('Login button found');
  }
});



document.addEventListener('DOMContentLoaded', () => {
  // Legg til ny bok
  document.getElementById('add-book-button').addEventListener('click', async () => {
    const title = document.getElementById('title').value;
    const author = document.getElementById('author').value;
    const quantity = parseInt(document.getElementById('quantity').value);

    const response = await fetch('/add-book', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, author, quantity }),
    });

    const result = await response.json();
    alert(result.message);

    if (response.ok) {
      loadBooks(); // Oppdater boklisten
    }
  });

  // Lån bok
  document.getElementById('loan-book-button').addEventListener('click', async () => {
    const student = document.getElementById('student').value;
    const title = document.getElementById('book-title').value;

    const response = await fetch('/loan-book', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ student, title }),
    });

    const result = await response.json();
    alert(result.message);

    if (response.ok) {
      loadBooks(); // Oppdater boklisten
    }
  });

  // Returner bok
  document.getElementById('return-book-button').addEventListener('click', async () => {
    const student = document.getElementById('student').value;
    const title = document.getElementById('book-title').value;

    const response = await fetch('/return-book', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ student, title }),
    });

    const result = await response.json();
    alert(result.message);

    if (response.ok) {
      loadBooks(); // Oppdater boklisten
    }
  });

  // Hent tilgjengelige bøker og vis dem
  async function loadBooks() {
    const response = await fetch('/books');
    const books = await response.json();

    const bookList = document.getElementById('book-list');
    bookList.innerHTML = '';

    books.forEach(book => {
      const li = document.createElement('li');
      li.textContent = `${book.title} av ${book.author} (${book.quantity} tilgjengelig)`;
      bookList.appendChild(li);
    });
  }

  // Last inn boklisten når siden åpnes
  loadBooks();
});
