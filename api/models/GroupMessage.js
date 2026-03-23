const mongoose = require('mongoose');

const GroupMessageSchema = new mongoose.Schema({
  groupId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'studygroups',
    required: true
  },
  senderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'employees',
    required: true
  },
  messageType: {
    type: String,
    enum: ['text', 'file', 'link', 'announcement'],
    default: 'text'
  },
  content: {
    type: String,
    required: true
  },
  fileUrl: String, // For file attachments
  
  // Reactions (optional)
  reactions: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'employees'
    },
    emoji: String
  }],
  
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('groupmessages', GroupMessageSchema);