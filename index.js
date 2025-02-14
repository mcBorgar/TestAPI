const express = require('express');    //Variabler - moduler
const mysql = require('mysql2'); // gjør at den forstår sql
const bcrypt = require('bcrypt');  //hashing algoritme
const bodyParser = require('body-parser'); //middleware som oversetter data over til json data så express kan håndtere det
const app = express(); //rec,res. sjekker data i public
const port = 3000;
app.use(express.json()); // lese json

// Middleware for å lese JSON-data og tjene statiske filer
app.use(bodyParser.json());   //express bruk bodyparser for å lese json
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
// error melding hvis det ikke går
db.connect((err) => {
  if (err) {
    console.error('Feil ved tilkobling til databasen:', err);
  } else {
    console.log('Tilkoblet til databasen.');
  }
});

// Registrer ny bruker, hashe med bcypt
app.post('/register', async (req, res) => { //programmet sender data, url "/registrer" async, vente på at den går
    const { username, password } = req.body;  //hente username og pass for å bruke i siden
  
    if (!username || !password) {
      console.log('Manglende brukernavn eller passord.');
      return res.status(400).json({ message: 'Brukernavn og passord er påkrevd.' });
    }
  
    try {
      const hashedPassword = await bcrypt.hash(password, 10); //"saltrounds"
      console.log('Hashet passord:', hashedPassword);      //status
  
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
  

///logg inn
app.post('/login', (req, res) => {    //express redigerer login req res 
  const { username, password } = req.body;    //henter user, pass fra body

  if (!username || !password) {    //"!" mangler, || eller
    return res.status(400).json({ message: 'Brukernavn og passord er påkrevd.' });
  }
//navn
  const query = 'SELECT * FROM users WHERE username = ?';            //placeholder=?
  db.query(query, [username], async (err, results) => {
    if (err) {
      console.error('Feil ved innlogging:', err);
      return res.status(500).json({ message: 'Feil ved innlogging.' });
    }
    if (results.length === 0) {
      return res.status(404).json({ message: 'Bruker ikke funnet.' });
    }
    //passord
    const user = results[0];
    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect) {
      return res.status(401).json({ message: 'Ugyldig passord.' });
    }

    res.status(200).json({ message: 'Innlogging vellykket!' });
  });
});

//end-point legge til bok
app.post('/add-book', (req, res) => {
    const { title, author, quantity } = req.body;  ///req fra bod
  
    if (!title || !author || !quantity) {
      return res.status(400).json({ message: 'Tittel, forfatter og antall er påkrevd.' });
    }
  
    const checkQuery = 'SELECT * FROM books WHERE title = ? AND author = ?';  //checkoutquery tittel forfatter
    db.query(checkQuery, [title, author], (err, results) => {    
      if (err) {
        console.error('Feil ved å sjekke bok:', err);
        return res.status(500).json({ message: 'Serverfeil.' });  //error
      }
  
      if (results.length > 0) {   //✅
        const updateQuery = 'UPDATE books SET quantity = quantity + ? WHERE title = ? AND author = ?';
        db.query(updateQuery, [quantity, title, author], (err) => {
          if (err) {  //err
            console.error('Feil ved å oppdatere bok:', err);
            return res.status(500).json({ message: 'Kunne ikke oppdatere boka.' });
          }
          res.status(200).json({ message: 'Bok oppdatert!' });
        });
      } else {   //riktig
        const insertQuery = 'INSERT INTO books (title, author, quantity) VALUES (?, ?, ?)'; //array
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

//Slett Bok
console.log('Sletterute registrert: DELETE /delete-book/:id');
app.delete('/delete-book/:id', (req, res) => {                      //url med id
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
 
  
// Endepunkt: Hent liste over bøker
app.get('/books', (req, res) => {     //express leser/henter data til /books
    const query = 'SELECT * FROM books';    //henter alle bøker fra books
    db.query(query, (err, results) => {    //vi bruker den over, sjekke feil og gi melding
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


// Endepunkt: Lån en bok
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

// Endepunkt: Returnere en bok
app.delete('/return-book/:id', (req, res) => {
  const loanId = req.params.id;

  if (!loanId) {
      return res.status(400).json({ message: 'Låne-ID er påkrevd.' });
  }

  const checkLoanQuery = 'SELECT * FROM loans WHERE loan_id = ?';
  db.query(checkLoanQuery, [loanId], (err, results) => {
      if (err) {
          console.error('Feil ved å sjekke lån:', err);
          return res.status(500).json({ message: 'Serverfeil.' });
      }

      if (results.length === 0) {
          return res.status(404).json({ message: 'Lånet eksisterer ikke.' });
      }

      const deleteLoanQuery = 'DELETE FROM loans WHERE loan_id = ?';
      const updateBookQuery = 'UPDATE books SET quantity = quantity + 1 WHERE title = ?';

      db.query(deleteLoanQuery, [loanId], (err) => {
          if (err) {
              console.error('Feil ved å slette lån:', err);
              return res.status(500).json({ message: 'Kunne ikke returnere boka.' });
          }

          db.query(updateBookQuery, [results[0].title], (err) => {
              if (err) {
                  console.error('Feil ved å oppdatere bok:', err);
                  return res.status(500).json({ message: 'Kunne ikke oppdatere boka.' });
              }
              res.status(200).json({ message: 'Bok returnert!' });
          });
      });
  });
});



// Endepunkt: Hent liste over lånte bøker
app.get('/loans', (req, res) => {
  const query = 'SELECT * FROM loans';
  db.query(query, (err, results) => {
      if (err) {
          console.error('Feil ved henting av lånte bøker:', err);
          return res.status(500).json({ message: 'Kunne ikke hente lånte bøker.' });
      }
      res.status(200).json(results);
  });
});

