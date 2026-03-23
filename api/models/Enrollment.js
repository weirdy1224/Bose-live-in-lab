const mongoose = require('mongoose');

const EnrollmentSchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'employees',
    required: true
  },
  courseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'courses',
    required: true
  },
  enrollmentDate: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['enrolled', 'completed', 'dropped'],
    default: 'enrolled'
  },
  completionDate: Date,
  grade: String, // e.g., "A", "B+", etc.
  progress: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  pointsEarned: {
    type: Number,
    default: 0
  }
});

// Compound index to prevent duplicate enrollments
EnrollmentSchema.index({ studentId: 1, courseId: 1 }, { unique: true });

module.exports = mongoose.model('enrollments', EnrollmentSchema);