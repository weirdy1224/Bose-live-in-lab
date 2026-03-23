const mongoose = require('mongoose');

const UserProfileSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'employees',
    required: true,
    unique: true
  },
  bio: String,
  profilePicture: {
    type: String,
    default: 'images/default-avatar.jpg'
  },
  interests: [String], // e.g., ["AI", "Web Dev", "Data Science"]
  skills: [String], // e.g., ["Python", "JavaScript", "React"]
  
  // Study preferences
  preferredStudyTime: {
    type: String,
    enum: ['morning', 'afternoon', 'evening', 'night', 'flexible'],
    default: 'flexible'
  },
  studyMode: {
    type: String,
    enum: ['online', 'offline', 'both'],
    default: 'both'
  },
  location: String, // City or campus location
  
  // Social links (optional)
  github: String,
  linkedin: String,
  
  // Stats
  communityScore: {
    type: Number,
    default: 0
  },
  coursesCompleted: {
    type: Number,
    default: 0
  },
  groupsJoined: {
    type: Number,
    default: 0
  },
  
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('userprofiles', UserProfileSchema);