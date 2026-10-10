const Workout = require('../models/Workout');
const WorkoutLog = require('../models/WorkoutLog');
const { successResponse, errorResponse } = require('../utils/response');
const User = require('../models/User');

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

exports.getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).select('-passwordHash');
    return successResponse(res, 200, 'Profile retrieved successfully', { user: sanitizeUser(user) });
  } catch (error) {
    next(error);
  }
};

exports.updateProfile = async (req, res, next) => {
  try {
    const { name, age, gender, height, weight } = req.body;
    const user = await User.findById(req.user._id);

    if (!user) {
      return errorResponse(res, 404, 'User not found');
    }

    if (name) user.name = name;
    if (age !== undefined) user.age = Number(age);
    if (gender) user.gender = gender;
    if (height !== undefined) user.height = Number(height);
    if (weight !== undefined) user.weight = Number(weight);

    await user.save();

    return successResponse(res, 200, 'Profile updated successfully', { user: sanitizeUser(user) });
  } catch (error) {
    next(error);
  }
};

exports.getAvailableWorkouts = async (req, res, next) => {
  try {
    const workouts = await Workout.find().populate('exercises').sort({ createdAt: -1 });
    return successResponse(res, 200, 'Workouts retrieved successfully', { workouts });
  } catch (error) {
    next(error);
  }
};

exports.getWorkoutHistory = async (req, res, next) => {
  try {
    const logs = await WorkoutLog.find({ userId: req.user._id })
      .populate('workoutId')
      .populate('exerciseId')
      .sort({ completedAt: -1 });

    return successResponse(res, 200, 'Workout history retrieved successfully', { logs });
  } catch (error) {
    next(error);
  }
};

exports.getProgress = async (req, res, next) => {
  try {
    const logs = await WorkoutLog.find({ userId: req.user._id }).sort({ completedAt: 1 });

    const frequency = logs.map((log) => ({
      date: new Date(log.completedAt).toISOString().slice(0, 10),
      count: 1,
    }));

    const weightProgress = logs
      .filter((log) => Number(log.weight) > 0)
      .map((log) => ({
        date: new Date(log.completedAt).toISOString().slice(0, 10),
        weight: Number(log.weight),
      }));

    const volumeData = logs.map((log) => {
      const volume = Array.isArray(log.sets)
        ? log.sets.reduce((sum, set) => sum + Number(set.reps || 0) * Number(set.weight || 0), 0)
        : 0;

      return {
        date: new Date(log.completedAt).toISOString().slice(0, 10),
        volume,
      };
    });

    const durationData = logs.map((log) => ({
      date: new Date(log.completedAt).toISOString().slice(0, 10),
      duration: Number(log.duration) || 0,
    }));

    const exercisePerformance = logs.reduce((acc, log) => {
      const key = String(log.exerciseId || 'exercise');
      const current = acc[key] || { exerciseId: key, totalVolume: 0, entries: 0 };
      current.totalVolume += Array.isArray(log.sets)
        ? log.sets.reduce((sum, set) => sum + Number(set.reps || 0) * Number(set.weight || 0), 0)
        : 0;
      current.entries += 1;
      acc[key] = current;
      return acc;
    }, {});

    return successResponse(res, 200, 'Progress retrieved successfully', {
      frequency,
      weightProgress,
      volumeData,
      durationData,
      exercisePerformance: Object.values(exercisePerformance),
    });
  } catch (error) {
    next(error);
  }
};

exports.getStatistics = async (req, res, next) => {
  try {
    const userId = req.user._id;

    const totalWorkouts = await WorkoutLog.countDocuments({ userId });
    const totalExercises = await WorkoutLog.distinct('exerciseId', { userId }).then((items) => items.length);
    const totalWorkoutTime = await WorkoutLog.aggregate([
      { $match: { userId } },
      { $group: { _id: null, total: { $sum: { $ifNull: ['$duration', 0] } } } },
    ]);
    const completedWorkouts = await WorkoutLog.distinct('workoutId', { userId }).then((items) => items.length);

    return successResponse(res, 200, 'Statistics retrieved successfully', {
      totalWorkouts,
      completedWorkouts,
      totalExercises,
      totalWorkoutTime: totalWorkoutTime[0]?.total || 0,
    });
  } catch (error) {
    next(error);
  }
};
