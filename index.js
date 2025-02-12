const express = require('express');
const mysql = require('mysql2');
const bcrypt = require('bcrypt');
const bodyParser = require('body-parser');

const app = express();
const port = 3000;
app.use(express.json()); // Sørger for at Express kan tolke JSON-data

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

// Endepunkt: Legge til eller oppdatere bok
app.post('/add-book', (req, res) => {
    const { title, author, quantity } = req.body;
  
    if (!title || !author || !quantity) {
      return res.status(400).json({ message: 'Tittel, forfatter og antall er påkrevd.' });
    }
  
    const checkQuery = 'SELECT * FROM books WHERE title = ? AND author = ?';
    db.query(checkQuery, [title, author], (err, results) => {
      if (err) {
        console.error('Feil ved å sjekke bok:', err);
        return res.status(500).json({ message: 'Serverfeil.' });
      }
  
      if (results.length > 0) {
        const updateQuery = 'UPDATE books SET quantity = quantity + ? WHERE title = ? AND author = ?';
        db.query(updateQuery, [quantity, title, author], (err) => {
          if (err) {
            console.error('Feil ved å oppdatere bok:', err);
            return res.status(500).json({ message: 'Kunne ikke oppdatere boka.' });
          }
          res.status(200).json({ message: 'Bok oppdatert!' });
        });
      } else {
        const insertQuery = 'INSERT INTO books (title, author, quantity) VALUES (?, ?, ?)';
        db.query(insertQuery, [title, author, quantity], (err) => {
          if (err) {
            console.error('Feil ved å legge til bok:', err);
            return res.status(500).json({ message: 'Kunne ikke legge til boka.' });
          }
          res.status(201).json({ message: 'Ny bok lagt til!' });
        });
      }
    });
  });
// Endepunkt: Slett en bok fra databasen
console.log('Sletterute registrert: DELETE /delete-book/:id');
app.delete('/delete-book/:id', (req, res) => {
  const bookId = req.params.id;

  if (!bookId) {
    return res.status(400).json({ message: 'Bok-ID er påkrevd.' });
  }

  console.log(`Forsøker å slette bok med ID: ${bookId}`);

  const deleteQuery = 'DELETE FROM books WHERE book_id = ?';
  db.query(deleteQuery, [bookId], (err, result) => {
    if (err) {
      console.error('Feil ved sletting av bok:', err);
      return res.status(500).json({ message: 'Kunne ikke slette boka.', error: err });
    }

    console.log(`Resultat av DELETE-spørring:`, result);

    if (result.affectedRows === 0) {
      console.warn('Ingen bøker ble slettet. Sjekk at book_id er riktig.');
      return res.status(404).json({ message: 'Bok ikke funnet.' });
    }

    console.log('Bok slettet:', result);
    res.status(200).json({ message: 'Bok slettet!' });
  });
});


  
  
  // Endepunkt: Låne ut bok
app.post('/loan-book', (req, res) => {
    const { student, title } = req.body;
  
    if (!student || !title) {
      return res.status(400).json({ message: 'Elev og boktittel er påkrevd.' });
    }
  
    const checkQuery = 'SELECT * FROM books WHERE title = ?';
    db.query(checkQuery, [title], (err, results) => {
      if (err) {
        console.error('Feil ved å sjekke bok:', err);
        return res.status(500).json({ message: 'Serverfeil.' });
      }
  
      if (results.length === 0 || results[0].quantity <= 0) {
        return res.status(404).json({ message: 'Boka er ikke tilgjengelig.' });
      }
  
      const book = results[0];
      const insertLoanQuery = 'INSERT INTO loans (student, title, book_id) VALUES (?, ?, ?)';
      const updateBookQuery = 'UPDATE books SET quantity = quantity - 1 WHERE title = ?';
  
      db.query(insertLoanQuery, [student, title, book.book_id], (err) => {
        if (err) {
          console.error('Feil ved å legge til lån:', err);
          return res.status(500).json({ message: 'Kunne ikke låne boka.' });
        }
  
        db.query(updateBookQuery, [title], (err) => {
          if (err) {
            console.error('Feil ved å oppdatere bok:', err);
            return res.status(500).json({ message: 'Kunne ikke oppdatere boka.' });
          }
          res.status(200).json({ message: 'Bok lånt ut!' });
        });
      });
    });
  });

  // Endepunkt: Returnere bok
app.post('/return-book', (req, res) => {
    const { student, title } = req.body;
  
    if (!student || !title) {
      return res.status(400).json({ message: 'Elev og boktittel er påkrevd.' });
    }
  
    const checkLoanQuery = 'SELECT * FROM loans WHERE student = ? AND title = ?';
    db.query(checkLoanQuery, [student, title], (err, results) => {
      if (err) {
        console.error('Feil ved å sjekke lån:', err);
        return res.status(500).json({ message: 'Serverfeil.' });
      }
  
      if (results.length === 0) {
        return res.status(404).json({ message: 'Lånet eksisterer ikke.' });
      }
  
      const deleteLoanQuery = 'DELETE FROM loans WHERE student = ? AND title = ? LIMIT 1';
      const updateBookQuery = 'UPDATE books SET quantity = quantity + 1 WHERE title = ?';
  
      db.query(deleteLoanQuery, [student, title], (err) => {
        if (err) {
          console.error('Feil ved å slette lån:', err);
          return res.status(500).json({ message: 'Kunne ikke returnere boka.' });
        }
  
        db.query(updateBookQuery, [title], (err) => {
          if (err) {
            console.error('Feil ved å oppdatere bok:', err);
            return res.status(500).json({ message: 'Kunne ikke oppdatere boka.' });
          }
          res.status(200).json({ message: 'Bok returnert!' });
        });
      });
    });
  });
  
// Endepunkt: Hent liste over bøker
app.get('/books', (req, res) => {
    const query = 'SELECT * FROM books';
    db.query(query, (err, results) => {
      if (err) {
        console.error('Feil ved henting av bøker:', err);
        return res.status(500).json({ message: 'Kunne ikke hente bøker.' });
      }
      res.status(200).json(results);
    });
  });
  

// Start serveren
app.listen(port, () => {
  console.log(`Server kjører på http://localhost:${port}`);
});
