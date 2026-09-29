require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('MongoDB Connected'))
.catch(err => console.log('MongoDB Connection Error: ', err));

// Routes
app.use('/api/articles', require('./routes/articles'));
app.use('/api/admin', require('./routes/admin'));

// Serve static frontend in production
// (Assuming frontend is served statically from parent directory or we can serve just the admin dashboard from backend)
app.use('/admin', express.static(path.join(__dirname, 'admin-public')));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
