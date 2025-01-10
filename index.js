const express = require('express');
const app = express();
const port = 3000;

// Middleware for å håndtere JSON
app.use(express.json());

// Testendepunkt for å sjekke om API-et fungerer
app.get('/', (req, res) => {
  res.send('API fungerer!');
});

// Start serveren
app.listen(port, () => {
  console.log(`Server kjører på http://localhost:${port}`);
});
