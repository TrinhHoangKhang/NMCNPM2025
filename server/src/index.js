const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 3001; // We'll run our backend on port 3001

// Enable CORS for all routes
app.use(cors());

app.use(express.json());

// Our test route
app.get('/api/hello', (req, res) => {
  res.json({ message: 'Hello from the Express Server!' });
});

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});