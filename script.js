const bookForm = document.getElementById('bookForm');

bookForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  const title = document.getElementById('title').value;
  const author = document.getElementById('author').value;
  const quantity = document.getElementById('quantity').value;

  const response = await fetch('/api/books', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title, author, quantity }),
  });

  const result = await response.json();
  alert(result.message);
});
        