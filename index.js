const express = require('express');
const app = express();
const port = 3000;
const mysql = require('mysql2');

// Oppsett for å håndtere JSON
app.use(express.json());

// En test-rute
app.get('/', (req, res) => {
  res.send('Serveren fungerer!');
});

// Start serveren
app.listen(port, () => {
  console.log(`Server kjører på http://localhost:${port}`);
});

// Opprett en kobling til databasen
const db = mysql.createConnection({
  host: 'localhost',   // Serveradresse (lokalt)
  user: 'root',        // Brukernavn til databasen
  password: '',        // Passord til databasen (tom hvis ingen passord)
  database: 'test_api' // Navnet på databasen vi skal bruke
});

// Test tilkobling
db.connect((err) => {
  if (err) {
    console.error('Feil ved tilkobling til databasen:', err);
  } else {
    console.log('Koblet til MySQL-databasen!');
  }
});
