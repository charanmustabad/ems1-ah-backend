const User = require('../models/User');
const Workout = require('../models/Workout');
const Exercise = require('../models/Exercise');
const WorkoutLog = require('../models/WorkoutLog');
const bcrypt = require('bcrypt');
const { successResponse, errorResponse } = require('../utils/response');

const sanitizeUser = (user) => ({
  _id: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
  age: user.age,
  gender: user.gender,
  height: user.height,
  weight: user.weight,
  isActive: user.isActive,
  createdAt: user.createdAt,
  updatedAt: user.updatedAt,
});

exports.getDashboard = async (req, res, next) => {
  try {
    const totalUsers = await User.countDocuments();
    const activeUsers = await User.countDocuments({ isActive: true });
    const totalWorkouts = await Workout.countDocuments();
    const totalExercises = await Exercise.countDocuments();
    const totalWorkoutLogs = await WorkoutLog.countDocuments();

    const recentUsers = await User.find().sort({ createdAt: -1 }).limit(5).select('-passwordHash');
    const recentActivity = await WorkoutLog.find().populate('userId').populate('workoutId').sort({ createdAt: -1 }).limit(6);

    return successResponse(res, 200, 'Admin dashboard retrieved successfully', {
      stats: {
        totalUsers,
        activeUsers,
        totalWorkouts,
        totalExercises,
        totalWorkoutLogs,
      },
      recentUsers,
      recentActivity,
    });
  } catch (error) {
    next(error);
  }
};

exports.getUsers = async (req, res, next) => {
  try {
    const users = await User.find().select('-passwordHash').sort({ createdAt: -1 });
    return successResponse(res, 200, 'Users retrieved successfully', { users });
  } catch (error) {
    next(error);
  }
};

exports.createUser = async (req, res, next) => {
  try {
    const { name, email, password, role = 'USER', isActive = true } = req.body;

    if (!name || !email || !password) {
      return errorResponse(res, 400, 'Name, email and password are required');
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return errorResponse(res, 409, 'Email already exists');
    }

    const user = await User.create({
      name,
      email: email.toLowerCase(),
      passwordHash: await bcrypt.hash(password, 10),
      role: role === 'ADMIN' ? 'ADMIN' : 'USER',
      isActive,
    });

    return successResponse(res, 201, 'User created successfully', { user: sanitizeUser(user) });
  } catch (error) {
    next(error);
  }
};

exports.updateUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return errorResponse(res, 404, 'User not found');
    }

    const { name, email, role, isActive } = req.body;
    if (name) user.name = name;
    if (email) user.email = email.toLowerCase();
    if (role) user.role = role === 'ADMIN' ? 'ADMIN' : 'USER';
    if (typeof isActive === 'boolean') user.isActive = isActive;

    await user.save();
    return successResponse(res, 200, 'User updated successfully', { user: sanitizeUser(user) });
  } catch (error) {
    next(error);
  }
};

exports.deleteUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return errorResponse(res, 404, 'User not found');
    }

    await WorkoutLog.deleteMany({ userId: user._id });
    await User.findByIdAndDelete(req.params.id);
    return successResponse(res, 200, 'User deleted successfully', {});
  } catch (error) {
    next(error);
  }
};

exports.getAdminWorkouts = async (req, res, next) => {
  try {
    const workouts = await Workout.find().populate('exercises').sort({ createdAt: -1 });
    return successResponse(res, 200, 'Workouts retrieved successfully', { workouts });
  } catch (error) {
    next(error);
  }
};

exports.getAdminExercises = async (req, res, next) => {
  try {
    const exercises = await Exercise.find().sort({ createdAt: -1 });
    return successResponse(res, 200, 'Exercises retrieved successfully', { exercises });
  } catch (error) {
    next(error);
  }
};

exports.getReports = async (req, res, next) => {
  try {
    const users = await User.countDocuments();
    const logs = await WorkoutLog.find().populate('userId').populate('exerciseId');
    const workoutCount = await Workout.countDocuments();
    const activeUsers = await User.countDocuments({ isActive: true });

    return successResponse(res, 200, 'Reports retrieved successfully', {
      users,
      activeUsers,
      workoutCount,
      logs,
    });
  } catch (error) {
    next(error);
  }
};

exports.getStatistics = async (req, res, next) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalWorkouts = await Workout.countDocuments();
    const totalExercises = await Exercise.countDocuments();
    const totalLogs = await WorkoutLog.countDocuments();
    const activeUsers = await User.countDocuments({ isActive: true });

    return successResponse(res, 200, 'Statistics retrieved successfully', {
      totalUsers,
      activeUsers,
      totalWorkouts,
      totalExercises,
      totalLogs,
    });
  } catch (error) {
    next(error);
  }
};
