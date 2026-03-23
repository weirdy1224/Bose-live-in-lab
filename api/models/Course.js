const mongoose = require('mongoose');

const CourseSchema = new mongoose.Schema({
  courseId: {
    type: String,
    required: true,
    unique: true
  },
  courseName: {
    type: String,
    required: true
  },
  courseCode: {
    type: String,
    required: true
  },
  description: String,
  instructor: String,
  imageUrl: String,
  startDate: Date,
  duration: String, // e.g., "8 weeks"
  category: String, // e.g., "Programming", "Web Development"
  enrolledStudents: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'employees'
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('courses', CourseSchema);