require('dotenv').config();
const cloudinary = require('cloudinary').v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const pdfUrl = "https://res.cloudinary.com/vleoyybz/raw/upload/v1790766512/bijst_articles/ep6o9hbaqmsllzj42bd2.pdf";
let finalUrl = pdfUrl;
const isRaw = pdfUrl.includes('/raw/upload/');

let publicId = null; // simulate article.pdfPublicId being undefined or not working perfectly
const parts = pdfUrl.split('/upload/');
if (parts.length === 2) {
  publicId = parts[1].replace(/^v\d+\//, '');
  if (!isRaw) {
     publicId = publicId.replace(/\.pdf$/, '');
  }
}

if (publicId) {
  finalUrl = cloudinary.url(publicId, {
    resource_type: isRaw ? 'raw' : 'image',
    type: 'upload',
    format: isRaw ? '' : 'pdf', 
    flags: 'attachment',
    sign_url: true,
  });
}

console.log(finalUrl);
