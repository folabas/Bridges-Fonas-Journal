require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const multer = require('multer');
const { v2: cloudinary } = require('cloudinary');
const { CloudinaryStorage } = require('multer-storage-cloudinary');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const PORT = process.env.PORT || 5000;

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/bridges_journal', {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// Models
const Submission = require('./models/Submission');
const Article = require('./models/Article');

// Cloudinary Setup
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'bridges_journal_submissions',
    allowed_formats: ['pdf', 'doc', 'docx']
  }
});
const upload = multer({ storage: storage });

// Routes
app.get('/api/articles', async (req, res) => {
  try {
    const articles = await Article.find().sort({ createdAt: -1 });
    res.json(articles);
  } catch (err) {
    console.error('Error fetching articles:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch articles' });
  }
});

app.post('/api/submit', upload.single('manuscriptFile'), async (req, res) => {
  try {
    const data = req.body;
    const file = req.file;

    const newSubmission = new Submission({
      email: data.email,
      title: data.title,
      surname: data.surname,
      otherNames: data.otherNames,
      gender: data.gender,
      affiliation: data.affiliation,
      manuscriptTitle: data.manuscriptTitle,
      researchArea: data.researchArea,
      keywords: data.keywords,
      coAuthors: data.coAuthors,
      fileUrl: file ? file.path : null,
      cloudinaryId: file ? file.filename : null
    });

    await newSubmission.save();

    res.status(200).json({ 
      success: true, 
      message: 'Manuscript submitted successfully!'
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error during submission' });
  }
});

app.listen(PORT, () => {
  console.log(`Backend server running on port ${PORT}`);
});
