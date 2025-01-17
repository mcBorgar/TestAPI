const express = require('express');
const mysql = require('mysql2');
const bcrypt = require('bcrypt');
const bodyParser = require('body-parser');

const app = express();
const port = 3000;

// Middleware for å lese JSON-data og tjene statiske filer
app.use(bodyParser.json());
app.use((req, res, next) => {
    console.log(`Forespørsel til: ${req.path}`);
    next();
  });
  
app.use(express.static('public', { extensions: ['html'] }));


// MySQL-tilkobling
const db = mysql.createConnection({
  host: 'localhost',
  user: 'library_user',
  password: 'securepassword',
  database: 'TestAPI_',
});

db.connect((err) => {
  if (err) {
    console.error('Feil ved tilkobling til databasen:', err);
  } else {
    console.log('Tilkoblet til databasen.');
  }
});

// Endepunkt: Registrer ny bruker
app.post('/register', async (req, res) => {
    const { username, password } = req.body;
  
    if (!username || !password) {
      console.log('Manglende brukernavn eller passord.');
      return res.status(400).json({ message: 'Brukernavn og passord er påkrevd.' });
    }
  
    try {
      const hashedPassword = await bcrypt.hash(password, 10);
      console.log('Hashet passord:', hashedPassword);
  
      const query = 'INSERT INTO users (username, password) VALUES (?, ?)';
      db.query(query, [username, hashedPassword], (err, result) => {
        if (err) {
          console.error('Databasefeil ved registrering:', err);
          return res.status(500).json({ message: 'Feil ved registrering.' });
        }
        console.log('Ny bruker lagt til:', result);
        res.status(201).json({ message: 'Bruker registrert!' });
      });
    } catch (err) {
      console.error('Feil ved hashing av passord:', err);
      res.status(500).json({ message: 'Serverfeil.' });
    }
  });
  

// Endepunkt: Logg inn
app.post('/login', (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: 'Brukernavn og passord er påkrevd.' });
  }

  const query = 'SELECT * FROM users WHERE username = ?';
  db.query(query, [username], async (err, results) => {
    if (err) {
      console.error('Feil ved innlogging:', err);
      return res.status(500).json({ message: 'Feil ved innlogging.' });
    }
    if (results.length === 0) {
      return res.status(404).json({ message: 'Bruker ikke funnet.' });
    }

    const user = results[0];
    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect) {
      return res.status(401).json({ message: 'Ugyldig passord.' });
    }

    res.status(200).json({ message: 'Innlogging vellykket!' });
  });
});

// Start serveren
app.listen(port, () => {
  console.log(`Server kjører på http://localhost:${port}`);
});
