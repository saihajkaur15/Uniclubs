require('dotenv').config();
const connectDB = require('./config/db');
const User = require('./models/User');
const Club = require('./models/Club');
const Event = require('./models/Event');
const Team = require('./models/Team');

async function seed() {
  await connectDB();
  await Promise.all([User.deleteMany(), Club.deleteMany(), Event.deleteMany(), Team.deleteMany()]);

  const clubs = await Club.insertMany([
    { name: 'Robotics Club', icon: '🤖', category: 'Technology', members: 245, description: 'Build robots and automation projects.' },
    { name: 'Drama Society', icon: '🎭', category: 'Culture', members: 189, description: 'Acting, theatre and stage performances.' },
    { name: 'Music Club', icon: '🎵', category: 'Arts', members: 312, description: 'Singing, instruments and live performances.' },
    { name: 'Literature Society', icon: '📚', category: 'Literature', members: 156, description: 'Books, poetry and writing.' },
    { name: 'Sports Club', icon: '⚽', category: 'Sports', members: 428, description: 'University sports activities.' },
    { name: 'Art & Design', icon: '🎨', category: 'Design', members: 203, description: 'Creative design and art.' }
  ]);

  await Event.insertMany([
    { title: 'Tech Innovation Summit', date: new Date('2026-05-15'), location: 'Main Auditorium', club: clubs[0]._id },
    { title: 'Cultural Night', date: new Date('2026-05-22'), location: 'Student Center', club: clubs[1]._id },
    { title: 'Career Fair 2026', date: new Date('2026-05-28'), location: 'Sports Complex', club: clubs[2]._id }
  ]);

  await Team.insertMany([
    { name: 'Robotics Squad', stream: 'CSE', year: '3rd Year', icon: '🤖', members: [{ name: 'Aarav', specialty: 'AI & ML' }] },
    { name: 'Cultural Crew', stream: 'Humanities', year: '2nd Year', icon: '🎭', members: [{ name: 'Meera', specialty: 'Music' }] },
    { name: 'Tech Ninjas', stream: 'IT', year: '1st Year', icon: '💻', members: [{ name: 'Simran', specialty: 'Backend' }] }
  ]);

  await User.create({ name: 'Demo Student', email: 'student@uniclubs.edu', password: '123456' });
  console.log('✅ Demo data inserted. Login: student@uniclubs.edu / 123456');
  process.exit();
}
seed();
