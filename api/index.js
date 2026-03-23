// server/server/index.js
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

// Import models
const EmployeeModel = require('./models/Employee');
const CourseModel = require('./models/Course');
const UserProfileModel = require('./models/UserProfile');
const StudyGroupModel = require('./models/StudyGroup');
const GroupMessageModel = require('./models/GroupMessage');
const EnrollmentModel = require('./models/Enrollment');

const app = express();
app.use(express.json());
app.use(cors());

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/live-in';
mongoose.connect(MONGODB_URI)
  .then(() => console.log('✅ Connected to MongoDB'))
  .catch(err => console.error('❌ MongoDB connection error:', err));

// ============================================
// AUTH ENDPOINTS (Existing)
// ============================================

app.post('/login', (req, res) => {
  const { email, password } = req.body;
  
  if (email === 'founder@gmail.com' && password === 'founder@123') {
    return res.json({ 
      status: "Success", 
      userId: "admin",
      name: "Admin",
      email: "founder@gmail.com",
      stuid: "admin"
    });
  }

  EmployeeModel.findOne({ email: email })
    .then(user => {
      if (user) {
        if (user.password === password) {
          res.json({ 
            status: "Success", 
            userId: user._id,
            name: user.name,
            email: user.email,
            stuid: user.stuid
          });
        } else {
          res.json({ status: "Password Incorrect" });
        }
      } else {
        res.json({ status: "No record existed" });
      }
    })
    .catch(err => res.status(500).json({ status: "Error", message: err.message }));
});

app.post("/register", async (req, res) => {
  try {
    const employee = await EmployeeModel.create(req.body);
    
    // Create default user profile
    await UserProfileModel.create({
      userId: employee._id,
      bio: "New student on ConnectedX",
      interests: [],
      skills: []
    });
    
    res.json({ status: "Success", employee });
  } catch (err) {
    res.status(500).json({ status: "Error", message: err.message });
  }
});

// ============================================
// COURSE ENDPOINTS
// ============================================

// Get all courses
app.get('/api/courses', async (req, res) => {
  try {
    const courses = await CourseModel.find();
    res.json({ status: "Success", courses });
  } catch (err) {
    res.status(500).json({ status: "Error", message: err.message });
  }
});

// Get single course details
app.get('/api/courses/:courseId', async (req, res) => {
  try {
    const course = await CourseModel.findById(req.params.courseId)
      .populate('enrolledStudents', 'name email');
    
    if (!course) {
      return res.status(404).json({ status: "Error", message: "Course not found" });
    }
    
    res.json({ status: "Success", course });
  } catch (err) {
    res.status(500).json({ status: "Error", message: err.message });
  }
});

// Create a new course (Admin only - for now open to all)
app.post('/api/courses', async (req, res) => {
  try {
    const course = await CourseModel.create(req.body);
    res.json({ status: "Success", course });
  } catch (err) {
    res.status(500).json({ status: "Error", message: err.message });
  }
});

// ============================================
// ENROLLMENT ENDPOINTS
// ============================================

// Enroll in a course
app.post('/api/enrollments', async (req, res) => {
  try {
    const { studentId, courseId } = req.body;
    
    // Check if already enrolled
    const existingEnrollment = await EnrollmentModel.findOne({ studentId, courseId });
    if (existingEnrollment) {
      return res.status(400).json({ status: "Error", message: "Already enrolled in this course" });
    }
    
    // Create enrollment
    const enrollment = await EnrollmentModel.create({ studentId, courseId });
    
    // Update course's enrolled students
    await CourseModel.findByIdAndUpdate(courseId, {
      $push: { enrolledStudents: studentId }
    });
    
    res.json({ status: "Success", enrollment });
  } catch (err) {
    res.status(500).json({ status: "Error", message: err.message });
  }
});

// Get student's enrollments
app.get('/api/enrollments/student/:studentId', async (req, res) => {
  try {
    const enrollments = await EnrollmentModel.find({ 
      studentId: req.params.studentId 
    }).populate('courseId');
    
    res.json({ status: "Success", enrollments });
  } catch (err) {
    res.status(500).json({ status: "Error", message: err.message });
  }
});

// Complete a course
app.put('/api/enrollments/:enrollmentId/complete', async (req, res) => {
  try {
    const { pointsEarned = 50 } = req.body;
    
    const enrollment = await EnrollmentModel.findByIdAndUpdate(
      req.params.enrollmentId,
      {
        status: 'completed',
        completionDate: new Date(),
        progress: 100,
        pointsEarned: pointsEarned
      },
      { new: true }
    );
    
    // Update user profile stats
    await UserProfileModel.findOneAndUpdate(
      { userId: enrollment.studentId },
      {
        $inc: { communityScore: pointsEarned, coursesCompleted: 1 }
      }
    );
    
    res.json({ status: "Success", enrollment });
  } catch (err) {
    res.status(500).json({ status: "Error", message: err.message });
  }
});

// ============================================
// USER PROFILE ENDPOINTS
// ============================================

// Get user profile
app.get('/api/profile/:userId', async (req, res) => {
  try {
    const profile = await UserProfileModel.findOne({ userId: req.params.userId })
      .populate('userId', 'name email stuid');
    
    if (!profile) {
      return res.status(404).json({ status: "Error", message: "Profile not found" });
    }
    
    res.json({ status: "Success", profile });
  } catch (err) {
    res.status(500).json({ status: "Error", message: err.message });
  }
});

// Update user profile
app.put('/api/profile/:userId', async (req, res) => {
  try {
    const profile = await UserProfileModel.findOneAndUpdate(
      { userId: req.params.userId },
      { 
        ...req.body,
        updatedAt: new Date()
      },
      { new: true, runValidators: true }
    );
    
    if (!profile) {
      return res.status(404).json({ status: "Error", message: "Profile not found" });
    }
    
    res.json({ status: "Success", profile });
  } catch (err) {
    res.status(500).json({ status: "Error", message: err.message });
  }
});

// ============================================
// STUDY GROUP ENDPOINTS
// ============================================

// Get all study groups (with filters)
app.get('/api/groups', async (req, res) => {
  try {
    const { courseId, status = 'active' } = req.query;
    
    const filter = { status };
    if (courseId) filter.courseId = courseId;
    
    const groups = await StudyGroupModel.find(filter)
      .populate('courseId', 'courseName courseCode')
      .populate('createdBy', 'name email')
      .populate('members.userId', 'name email');
    
    res.json({ status: "Success", groups });
  } catch (err) {
    res.status(500).json({ status: "Error", message: err.message });
  }
});

// Get single group details
app.get('/api/groups/:groupId', async (req, res) => {
  try {
    const group = await StudyGroupModel.findById(req.params.groupId)
      .populate('courseId', 'courseName courseCode imageUrl')
      .populate('createdBy', 'name email')
      .populate('members.userId', 'name email');
    
    if (!group) {
      return res.status(404).json({ status: "Error", message: "Group not found" });
    }
    
    res.json({ status: "Success", group });
  } catch (err) {
    res.status(500).json({ status: "Error", message: err.message });
  }
});

// Create a study group
app.post('/api/groups', async (req, res) => {
  try {
    const { groupName, description, courseId, createdBy, maxMembers, isPrivate, groupType } = req.body;
    
    const group = await StudyGroupModel.create({
      groupName,
      description,
      courseId,
      createdBy,
      maxMembers,
      isPrivate,
      groupType,
      members: [{
        userId: createdBy,
        role: 'admin',
        joinedAt: new Date()
      }]
    });
    
    // Update user profile
    await UserProfileModel.findOneAndUpdate(
      { userId: createdBy },
      { $inc: { groupsJoined: 1 } }
    );
    
    const populatedGroup = await StudyGroupModel.findById(group._id)
      .populate('courseId', 'courseName courseCode')
      .populate('createdBy', 'name email')
      .populate('members.userId', 'name email');
    
    res.json({ status: "Success", group: populatedGroup });
  } catch (err) {
    res.status(500).json({ status: "Error", message: err.message });
  }
});

// Join a study group
app.post('/api/groups/:groupId/join', async (req, res) => {
  try {
    const { userId } = req.body;
    const group = await StudyGroupModel.findById(req.params.groupId);
    
    if (!group) {
      return res.status(404).json({ status: "Error", message: "Group not found" });
    }
    
    // Check if group is full
    if (group.isFull()) {
      return res.status(400).json({ status: "Error", message: "Group is full" });
    }
    
    // Check if already a member
    const isMember = group.members.some(m => m.userId.toString() === userId);
    if (isMember) {
      return res.status(400).json({ status: "Error", message: "Already a member of this group" });
    }
    
    // Add member
    group.members.push({
      userId: userId,
      role: 'member',
      joinedAt: new Date()
    });
    
    await group.save();
    
    // Update user profile
    await UserProfileModel.findOneAndUpdate(
      { userId: userId },
      { $inc: { groupsJoined: 1 } }
    );
    
    const updatedGroup = await StudyGroupModel.findById(group._id)
      .populate('members.userId', 'name email');
    
    res.json({ status: "Success", group: updatedGroup });
  } catch (err) {
    res.status(500).json({ status: "Error", message: err.message });
  }
});

// Leave a study group
app.post('/api/groups/:groupId/leave', async (req, res) => {
  try {
    const { userId } = req.body;
    const group = await StudyGroupModel.findById(req.params.groupId);
    
    if (!group) {
      return res.status(404).json({ status: "Error", message: "Group not found" });
    }
    
    // Remove member
    group.members = group.members.filter(m => m.userId.toString() !== userId);
    
    // If creator leaves and group has other members, assign new admin
    if (group.createdBy.toString() === userId && group.members.length > 0) {
      group.members[0].role = 'admin';
      group.createdBy = group.members[0].userId;
    }
    
    await group.save();
    
    // Update user profile
    await UserProfileModel.findOneAndUpdate(
      { userId: userId },
      { $inc: { groupsJoined: -1 } }
    );
    
    res.json({ status: "Success", message: "Left group successfully" });
  } catch (err) {
    res.status(500).json({ status: "Error", message: err.message });
  }
});

// Get user's groups
app.get('/api/groups/user/:userId', async (req, res) => {
  try {
    const groups = await StudyGroupModel.find({
      'members.userId': req.params.userId,
      status: 'active'
    })
      .populate('courseId', 'courseName courseCode imageUrl')
      .populate('createdBy', 'name email')
      .populate('members.userId', 'name email');
    
    res.json({ status: "Success", groups });
  } catch (err) {
    res.status(500).json({ status: "Error", message: err.message });
  }
});

// Delete a group (admin only)
app.delete('/api/groups/:groupId', async (req, res) => {
  try {
    const { userId } = req.body; // Admin user ID
    const group = await StudyGroupModel.findById(req.params.groupId);
    
    if (!group) {
      return res.status(404).json({ status: "Error", message: "Group not found" });
    }
    
    // Check if user is admin
    if (group.createdBy.toString() !== userId) {
      return res.status(403).json({ status: "Error", message: "Only group admin can delete" });
    }
    
    // Update all members' profile
    for (let member of group.members) {
      await UserProfileModel.findOneAndUpdate(
        { userId: member.userId },
        { $inc: { groupsJoined: -1 } }
      );
    }
    
    await StudyGroupModel.findByIdAndDelete(req.params.groupId);
    
    res.json({ status: "Success", message: "Group deleted successfully" });
  } catch (err) {
    res.status(500).json({ status: "Error", message: err.message });
  }
});

// ============================================
// GROUP MESSAGES ENDPOINTS
// ============================================

// Get group messages
app.get('/api/groups/:groupId/messages', async (req, res) => {
  try {
    const { limit = 50 } = req.query;
    
    const messages = await GroupMessageModel.find({ groupId: req.params.groupId })
      .populate('senderId', 'name email')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit));
    
    res.json({ status: "Success", messages: messages.reverse() });
  } catch (err) {
    res.status(500).json({ status: "Error", message: err.message });
  }
});

// Send a message
app.post('/api/groups/:groupId/messages', async (req, res) => {
  try {
    const { senderId, content, messageType = 'text', fileUrl } = req.body;
    
    const message = await GroupMessageModel.create({
      groupId: req.params.groupId,
      senderId,
      content,
      messageType,
      fileUrl
    });
    
    const populatedMessage = await GroupMessageModel.findById(message._id)
      .populate('senderId', 'name email');
    
    res.json({ status: "Success", message: populatedMessage });
  } catch (err) {
    res.status(500).json({ status: "Error", message: err.message });
  }
});

// ============================================
// SERVER START
// ============================================

if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 3001;
  app.listen(PORT, () => {
    console.log(`🚀 Server is running on port ${PORT}`);
    console.log(`📡 API ready at http://localhost:${PORT}`);
  });
}

module.exports = app;