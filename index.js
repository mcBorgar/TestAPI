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
  password: 'password', // Erstatt med ditt MySQL-passord
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

// Endepunkt for å legge inn bøker -----------------------------------------------------------------------
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

// Endepunkt for å låne ut og returnere bøker ------------------------------------------------------------
app.post('/api/loans', (req, res) => {
  const { student, title, action } = req.body;

  if (action === 'loan') {
    console.log('Starter utlånsprosessen for:', { student, title });

    // Sjekk om boka finnes og har nok eksemplarer
    const findBookSQL = 'SELECT * FROM books WHERE title = ?';
    db.query(findBookSQL, [title], (err, results) => {
      if (err) {
        console.error('Feil ved sjekking av bok:', err.message);
        return res.status(500).send({ message: 'Serverfeil. Prøv igjen senere.' });
      }

      console.log('Sjekker bok i databasen:', results);

      if (results.length === 0) {
        return res.status(404).send({ message: 'Bok finnes ikke i databasen.' });
      }

      const book = results[0];
      if (book.quantity <= 0) {
        return res.status(400).send({ message: 'Boka er ikke tilgjengelig for utlån.' });
      }

      console.log('Bok funnet, starter registrering av utlån:', book);

      // Legg inn i loans-tabellen
      const insertLoanSQL = 'INSERT INTO loans (student, title, book_id) VALUES (?, ?, ?)';
      db.query(insertLoanSQL, [student, title, book.book_id], (err, loanResult) => {
        if (err) {
          console.error('Feil ved lagring av lån:', err.message);
          return res.status(500).send({ message: 'Kunne ikke registrere utlånet.' });
        }

        console.log('Lån registrert:', loanResult);

        // Oppdater quantity i books-tabellen
        const updateBookSQL = 'UPDATE books SET quantity = quantity - 1 WHERE book_id = ?';
        db.query(updateBookSQL, [book.book_id], (err, updateResult) => {
          if (err) {
            console.error('Feil ved oppdatering av bokantall:', err.message);
            return res.status(500).send({ message: 'Kunne ikke oppdatere bokantall.' });
          }

          console.log('Bokantall oppdatert i databasen:', updateResult);
          res.status(200).send({ message: 'Lån registrert!' });
        });
      });
    });
  } else if (action === 'return') {
    console.log('Starter returprosessen for:', { student, title });

    // Sjekk om lånet eksisterer
    const findLoanSQL = 'SELECT * FROM loans WHERE title = ? AND student = ?';
    db.query(findLoanSQL, [title, student], (err, results) => {
      if (err) {
        console.error('Feil ved sjekking av lån:', err.message);
        return res.status(500).send({ message: 'Serverfeil. Prøv igjen senere.' });
      }

      if (results.length === 0) {
        return res.status(404).send({ message: 'Ingen utlån funnet for denne boken og eleven.' });
      }

      console.log('Lån funnet, starter retur.');

      // Fjern utlånet fra loans-tabellen
      const deleteLoanSQL = 'DELETE FROM loans WHERE title = ? AND student = ?';
      db.query(deleteLoanSQL, [title, student], (err, deleteResult) => {
        if (err) {
          console.error('Feil ved sletting av lån:', err.message);
          return res.status(500).send({ message: 'Kunne ikke fjerne utlånet.' });
        }

        // Øk antall bøker i books-tabellen
        const updateBookSQL = 'UPDATE books SET quantity = quantity + 1 WHERE title = ?';
        db.query(updateBookSQL, [title], (err, updateResult) => {
          if (err) {
            console.error('Feil ved oppdatering av bokantall:', err.message);
            return res.status(500).send({ message: 'Kunne ikke oppdatere bokantall.' });
          }

          console.log('Bok returnert og oppdatert i databasen.');
          res.status(200).send({ message: 'Bok returnert!' });
        });
      });
    });
  } else {
    res.status(400).send({ message: 'Ugyldig handling.' });
  }
});

// Start serveren --------------------------------------------------------------------------------------
app.listen(port, () => {
  console.log(`Server kjører på http://localhost:${port}`);
});
