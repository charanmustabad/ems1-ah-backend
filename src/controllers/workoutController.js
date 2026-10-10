const Workout = require('../models/Workout');
const WorkoutLog = require('../models/WorkoutLog');
const Exercise = require('../models/Exercise');
const { successResponse, errorResponse } = require('../utils/response');

exports.getWorkouts = async (req, res, next) => {
  try {
    const workouts = await Workout.find().populate('exercises').sort({ createdAt: -1 });
    return successResponse(res, 200, 'Workouts retrieved successfully', { workouts });
  } catch (error) {
    next(error);
  }
};

exports.getWorkoutById = async (req, res, next) => {
  try {
    const workout = await Workout.findById(req.params.id).populate('exercises');
    if (!workout) {
      return errorResponse(res, 404, 'Workout not found');
    }

    return successResponse(res, 200, 'Workout retrieved successfully', { workout });
  } catch (error) {
    next(error);
  }
};

exports.createWorkout = async (req, res, next) => {
  try {
    const { name, description, category, difficulty, duration, exercises } = req.body;

    if (!name || !description || !duration) {
      return errorResponse(res, 400, 'Workout name, description, and duration are required');
    }

    const workout = await Workout.create({
      name,
      description,
      category: category || 'Custom',
      difficulty: difficulty || 'Beginner',
      duration: Number(duration),
      exercises: exercises || [],
      createdBy: req.user._id,
    });

    const populatedWorkout = await Workout.findById(workout._id).populate('exercises');
    return successResponse(res, 201, 'Workout created successfully', { workout: populatedWorkout });
  } catch (error) {
    next(error);
  }
};

exports.updateWorkout = async (req, res, next) => {
  try {
    const workout = await Workout.findById(req.params.id);
    if (!workout) {
      return errorResponse(res, 404, 'Workout not found');
    }

    const allowedFields = ['name', 'description', 'category', 'difficulty', 'duration', 'exercises'];
    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        workout[field] = req.body[field];
      }
    });

    await workout.save();
    const populatedWorkout = await Workout.findById(workout._id).populate('exercises');
    return successResponse(res, 200, 'Workout updated successfully', { workout: populatedWorkout });
  } catch (error) {
    next(error);
  }
};

exports.deleteWorkout = async (req, res, next) => {
  try {
    const workout = await Workout.findByIdAndDelete(req.params.id);
    if (!workout) {
      return errorResponse(res, 404, 'Workout not found');
    }

    await WorkoutLog.deleteMany({ workoutId: req.params.id });
    return successResponse(res, 200, 'Workout deleted successfully', {});
  } catch (error) {
    next(error);
  }
};

exports.logWorkout = async (req, res, next) => {
  try {
    const workout = await Workout.findById(req.params.id);
    if (!workout) {
      return errorResponse(res, 404, 'Workout not found');
    }

    const { exercises = [] } = req.body;
    if (!Array.isArray(exercises) || exercises.length === 0) {
      return errorResponse(res, 400, 'At least one exercise log is required');
    }

    const logEntries = [];

    for (const exerciseEntry of exercises) {
      const { exerciseId, sets = [], notes = '', duration = 0 } = exerciseEntry;
      if (!exerciseId) continue;

      const exercise = await Exercise.findById(exerciseEntry.exerciseId);
      if (!exercise) {
        return errorResponse(res, 404, `Exercise ${exerciseId} not found`);
      }

      const normalizedSets = (sets || []).map((set) => ({
        reps: Number(set.reps || 0),
        weight: Number(set.weight || 0),
        duration: Number(set.duration || 0),
        note: set.note || '',
      }));

      const totalWeight = normalizedSets.reduce((sum, set) => sum + Number(set.weight || 0), 0);
      const totalReps = normalizedSets.reduce((sum, set) => sum + Number(set.reps || 0), 0);

      const log = await WorkoutLog.create({
        userId: req.user._id,
        workoutId: req.params.id,
        exerciseId,
        sets: normalizedSets,
        reps: totalReps,
        weight: totalWeight,
        duration: Number(duration) || 0,
        notes: notes || '',
        completedAt: new Date(),
      });

      logEntries.push(log);
    }

    return successResponse(res, 201, 'Workout completed successfully', { logs: logEntries });
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
