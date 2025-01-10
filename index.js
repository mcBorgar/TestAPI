const express = require('express');
const mysql = require('mysql2');
const path = require('path');

const app = express();
const port = 3000;

// Middleware for å håndtere JSON og URL-encoded data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Statiske filer (HTML, CSS, JS)
app.use(express.static('public'));

// Opprett tilkobling til databasen
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',        // Erstatt med ditt MySQL-brukernavn
  password: 'password',        // Erstatt med ditt MySQL-passord
  database: 'TestAPI_' // Navnet på databasen du opprettet
});

// Test databaseforbindelsen
db.connect((err) => {
  if (err) {
    console.error('Kunne ikke koble til databasen:', err.message);
  } else {
    console.log('Koblet til databasen!');
  }
});

// Standard route for å vise nettsiden
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Endepunkt for å legge inn bøker
app.post('/api/books', (req, res) => {
  const { title, author, quantity } = req.body;

  // SQL-spørring for å legge inn en ny bok
  const sql = 'INSERT INTO books (title, author, quantity) VALUES (?, ?, ?)';
  db.query(sql, [title, author, quantity], (err, result) => {
    if (err) {
      console.error('Feil ved lagring av bok:', err.message);
      res.status(500).send({ message: 'Kunne ikke lagre bok.' });
    } else {
      console.log('Ny bok lagret:', result);
      res.status(200).send({ message: 'Bok lagret!' });
    }
  });
});

// Start serveren
app.listen(port, () => {
  console.log(`Server kjører på http://localhost:${port}`);
});
