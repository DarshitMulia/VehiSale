const mongoose = require('mongoose');

const testimonialSchema = new mongoose.Schema({
  name: { type: String, required: true },
  text: { type: String, required: true },
  addedAt: { type: String }  
});

// Pre-save middleware to format the date and time
testimonialSchema.pre('save', function(next) {
  const currentDate = new Date();
  const day = String(currentDate.getDate()).padStart(2, '0');
  const month = String(currentDate.getMonth() + 1).padStart(2, '0'); 
  const year = currentDate.getFullYear();
  const hours = String(currentDate.getHours()).padStart(2, '0');
  const minutes = String(currentDate.getMinutes()).padStart(2, '0');

  this.addedAt = `${day}/${month}/${year} ${hours}:${minutes}`;
  next();
});

module.exports = mongoose.model('Testimonial', testimonialSchema);
