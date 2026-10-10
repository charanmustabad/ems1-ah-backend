const bcrypt = require('bcrypt');
const User = require('../models/User');
const Exercise = require('../models/Exercise');
const Workout = require('../models/Workout');
const WorkoutLog = require('../models/WorkoutLog');

const DEFAULT_USERS = [
  {
    name: 'FitTrack Admin',
    email: 'admin@fittrack.local',
    password: 'Admin@12345',
    role: 'ADMIN',
    age: 35,
    gender: 'Male',
    height: 178,
    weight: 82,
  },
  {
    name: 'Demo Athlete',
    email: 'demo@fittrack.local',
    password: 'Demo@12345',
    role: 'USER',
    age: 28,
    gender: 'Female',
    height: 165,
    weight: 62,
  },
];

async function seedDefaultData() {
  const userEmails = DEFAULT_USERS.map((user) => user.email);
  const existingUsers = await User.find({ email: { $in: userEmails } }).lean();
  const existingByEmail = new Map(existingUsers.map((user) => [user.email.toLowerCase(), user]));

  const createdUsers = [];
  for (const userSeed of DEFAULT_USERS) {
    const email = userSeed.email.toLowerCase();
    if (!existingByEmail.has(email)) {
      const hashedPassword = await bcrypt.hash(userSeed.password, 10);
      const created = await User.create({
        name: userSeed.name,
        email,
        passwordHash: hashedPassword,
        role: userSeed.role,
        age: userSeed.age,
        gender: userSeed.gender,
        height: userSeed.height,
        weight: userSeed.weight,
        isActive: true,
      });
      createdUsers.push(created);
      existingByEmail.set(email, created);
    }
  }

  const workoutCount = await Workout.countDocuments();
  if (workoutCount === 0) {
    const adminUser = existingByEmail.get('admin@fittrack.local');
    const sampleUser = existingByEmail.get('demo@fittrack.local');

    const exerciseList = await Exercise.insertMany([
      {
        name: 'Barbell Bench Press',
        description: 'Compound chest movement for upper-body strength.',
        muscleGroup: 'Chest',
        equipment: 'Barbell',
        difficulty: 'Intermediate',
        instructions: 'Lie on bench, grip bar slightly wider than shoulders, and press upward until arms extend.',
      },
      {
        name: 'Pull-Up',
        description: 'Upper-back pulling movement for posture and strength.',
        muscleGroup: 'Back',
        equipment: 'Pull-up bar',
        difficulty: 'Intermediate',
        instructions: 'Grip the bar and pull your chest towards the bar while maintaining a controlled motion.',
      },
      {
        name: 'Goblet Squat',
        description: 'Lower-body squat variation for leg strength and mobility.',
        muscleGroup: 'Legs',
        equipment: 'Kettlebell',
        difficulty: 'Beginner',
        instructions: 'Hold the kettlebell close to your chest and sit into a deep squat before standing back up.',
      },
      {
        name: 'Plank',
        description: 'Core stability exercise that builds endurance.',
        muscleGroup: 'Core',
        equipment: 'None',
        difficulty: 'Beginner',
        instructions: 'Brace your core and hold a straight line from head to heels while keeping the hips level.',
      },
      {
        name: 'Overhead Press',
        description: 'Shoulder-focused press to improve upper body strength.',
        muscleGroup: 'Shoulders',
        equipment: 'Barbell',
        difficulty: 'Intermediate',
        instructions: 'Press the bar overhead while keeping your ribs down and core tight.',
      },
      {
        name: 'Deadlift',
        description: 'Posterior chain lift for total-body strength.',
        muscleGroup: 'Back',
        equipment: 'Barbell',
        difficulty: 'Advanced',
        instructions: 'Keep the chest up, hinge at the hips and lift the weight while maintaining a flat back.',
      },
    ]);

    const strengthWorkout = await Workout.create({
      name: 'Strength Builder',
      description: 'A balanced strength routine to improve power and muscle growth.',
      category: 'Strength',
      difficulty: 'Intermediate',
      duration: 45,
      exercises: [exerciseList[0]._id, exerciseList[1]._id, exerciseList[4]._id],
      createdBy: adminUser._id,
    });

    const cardioWorkout = await Workout.create({
      name: 'HIIT Cardio Blast',
      description: 'A short, intense conditioning workout for aerobic capacity.',
      category: 'Cardio',
      difficulty: 'Beginner',
      duration: 30,
      exercises: [exerciseList[3]._id, exerciseList[2]._id],
      createdBy: adminUser._id,
    });

    const fullBodyWorkout = await Workout.create({
      name: 'Full Body Power',
      description: 'Full-body routine focused on strength and recovery.',
      category: 'Full Body',
      difficulty: 'Intermediate',
      duration: 50,
      exercises: [exerciseList[0]._id, exerciseList[2]._id, exerciseList[5]._id],
      createdBy: adminUser._id,
    });

    const today = new Date();
    await WorkoutLog.insertMany([
      {
        userId: sampleUser._id,
        workoutId: strengthWorkout._id,
        exerciseId: exerciseList[0]._id,
        sets: [
          { reps: 10, weight: 45, duration: 40 },
          { reps: 8, weight: 50, duration: 45 },
          { reps: 6, weight: 55, duration: 50 },
        ],
        reps: 24,
        weight: 150,
        duration: 45,
        notes: 'Great push today',
        completedAt: new Date(today.getTime() - 2 * 86400000),
      },
      {
        userId: sampleUser._id,
        workoutId: cardioWorkout._id,
        exerciseId: exerciseList[3]._id,
        sets: [
          { reps: 12, weight: 0, duration: 30 },
          { reps: 12, weight: 0, duration: 30 },
          { reps: 10, weight: 0, duration: 25 },
        ],
        reps: 34,
        weight: 0,
        duration: 30,
        notes: 'Conditioning felt steady',
        completedAt: new Date(today.getTime() - 5 * 86400000),
      },
    ]);
  }

  return { createdUsers, defaultUsers: DEFAULT_USERS };
}

module.exports = { DEFAULT_USERS, seedDefaultData };
