// server/server/seed.js
const mongoose = require('mongoose');
const CourseModel = require('./models/Course');

mongoose.connect('mongodb://localhost:27017/live-in')
  .then(() => console.log('✅ Connected to MongoDB for seeding'))
  .catch(err => console.error('❌ MongoDB connection error:', err));

const seedCourses = async () => {
  try {
    // Clear existing courses
    await CourseModel.deleteMany({});
    console.log('🗑️  Cleared existing courses');

    // Create courses
    const courses = await CourseModel.insertMany([
      {
        courseId: 'PE101',
        courseName: 'Prompt Engineering',
        courseCode: 'PE101',
        description: 'Learn the fundamentals of prompt engineering, focusing on designing effective prompts for AI models.',
        instructor: 'Dr. Sarah Mitchell',
        imageUrl: 'images/prompt.jpg',
        startDate: new Date('2023-11-01'),
        duration: '6 weeks',
        category: 'AI & ML',
        enrolledStudents: []
      },
      {
        courseId: 'WD202',
        courseName: 'Frameworks of Web development',
        courseCode: 'WD202',
        description: 'Master modern web frameworks including React, Vue, and Angular for building scalable applications.',
        instructor: 'Prof. James Carter',
        imageUrl: 'images/web.jpg',
        startDate: new Date('2023-11-06'),
        duration: '8 weeks',
        category: 'Web Development',
        enrolledStudents: []
      },
      {
        courseId: 'PY101',
        courseName: 'Python for beginners',
        courseCode: 'PY101',
        description: 'Start your programming journey with Python. Learn fundamentals and build real-world applications.',
        instructor: 'Dr. Emily Rodriguez',
        imageUrl: 'images/python.jpg',
        startDate: new Date('2023-11-07'),
        duration: '10 weeks',
        category: 'Programming',
        enrolledStudents: []
      },
      {
        courseId: 'PC301',
        courseName: 'Make your own podcast',
        courseCode: 'PC301',
        description: 'Learn podcast production from start to finish - recording, editing, publishing, and marketing.',
        instructor: 'Alex Thompson',
        imageUrl: 'images/podcast.jpg',
        startDate: new Date('2023-11-09'),
        duration: '5 weeks',
        category: 'Media Production',
        enrolledStudents: []
      },
      {
        courseId: 'DS401',
        courseName: 'Data Science Fundamentals',
        courseCode: 'DS401',
        description: 'Introduction to data science, statistics, and machine learning with Python.',
        instructor: 'Dr. Michael Chen',
        imageUrl: 'images/datascience.jpg',
        startDate: new Date('2023-11-15'),
        duration: '12 weeks',
        category: 'Data Science',
        enrolledStudents: []
      },
      {
        courseId: 'UI201',
        courseName: 'UI/UX Design Principles',
        courseCode: 'UI201',
        description: 'Learn user-centered design, prototyping, and creating intuitive user experiences.',
        instructor: 'Jessica Williams',
        imageUrl: 'images/uiux.jpg',
        startDate: new Date('2023-11-20'),
        duration: '6 weeks',
        category: 'Design',
        enrolledStudents: []
      }
    ]);

    console.log(`✅ Successfully seeded ${courses.length} courses`);
    
    courses.forEach(course => {
      console.log(`   📚 ${course.courseName} (${course.courseCode})`);
    });

    process.exit(0);
  } catch (err) {
    console.error('❌ Error seeding database:', err);
    process.exit(1);
  }
};

seedCourses();

// ============================================
// HOW TO RUN THIS SCRIPT:
// ============================================
// 1. Navigate to: server/server/
// 2. Run: node seed.js
// ============================================