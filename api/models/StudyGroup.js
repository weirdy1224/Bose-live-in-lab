const mongoose = require('mongoose');

const StudyGroupSchema = new mongoose.Schema({
  groupName: {
    type: String,
    required: true,
    trim: true
  },
  description: String,
  courseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'courses',
    required: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'employees',
    required: true
  },
  
  // Group settings
  maxMembers: {
    type: Number,
    default: 6,
    min: 2,
    max: 20
  },
  isPrivate: {
    type: Boolean,
    default: false
  },
  groupType: {
    type: String,
    enum: ['study', 'project', 'discussion', 'exam-prep'],
    default: 'study'
  },
  
  // Schedule (optional)
  meetingSchedule: {
    day: String, // e.g., "Monday"
    time: String, // e.g., "18:00"
    frequency: String // e.g., "weekly"
  },
  
  // Current members
  members: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'employees'
    },
    role: {
      type: String,
      enum: ['admin', 'member'],
      default: 'member'
    },
    joinedAt: {
      type: Date,
      default: Date.now
    }
  }],
  
  // Status
  status: {
    type: String,
    enum: ['active', 'inactive', 'archived'],
    default: 'active'
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

// Virtual field for current member count
StudyGroupSchema.virtual('currentMembers').get(function() {
  return this.members.length;
});

// Check if group is full
StudyGroupSchema.methods.isFull = function() {
  return this.members.length >= this.maxMembers;
};

module.exports = mongoose.model('studygroups', StudyGroupSchema);
