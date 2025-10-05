const express = require('express');
const cors = require('cors');
const path = require('path');
const expenseRoutes = require('./routes/expenseRoutes');
const app = express();
app.use(cors());
app.use(express.json());

// Serve static UI
app.use(express.static(path.join(__dirname, 'public')));
app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'public', 'index.html')));

app.use('/api/expenses', expenseRoutes);

// Simple request logger to help debug incoming requests
app.use((req, res, next) => {
  console.log(new Date().toISOString(), req.method, req.path);
  next();
});

// SPA fallback: serve index.html for any other GET (except API) to avoid 404 on client-side routes
// SPA fallback middleware: serve index.html for any non-API GET requests that accept HTML.
app.use((req, res, next) => {
  try {
    if (req.method === 'GET' && !req.path.startsWith('/api/') && req.headers.accept && req.headers.accept.includes('text/html')) {
      return res.sendFile(path.join(__dirname, 'public', 'index.html'));
    }
  } catch (err) {
    // ignore and continue
  }
  next();
});

const PORT = process.env.PORT || 3000;

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Expense tracker API listening on port ${PORT}`);
  });
}

module.exports = app;
