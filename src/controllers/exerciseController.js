const Exercise = require('../models/Exercise');
const { successResponse, errorResponse } = require('../utils/response');

exports.getExercises = async (req, res, next) => {
  try {
    const exercises = await Exercise.find().sort({ createdAt: -1 });
    return successResponse(res, 200, 'Exercises retrieved successfully', { exercises });
  } catch (error) {
    next(error);
  }
};

exports.getExerciseById = async (req, res, next) => {
  try {
    const exercise = await Exercise.findById(req.params.id);
    if (!exercise) {
      return errorResponse(res, 404, 'Exercise not found');
    }

    return successResponse(res, 200, 'Exercise retrieved successfully', { exercise });
  } catch (error) {
    next(error);
  }
};

exports.createExercise = async (req, res, next) => {
  try {
    const { name, description, muscleGroup, equipment, difficulty, instructions } = req.body;

    if (!name || !description || !muscleGroup || !equipment || !instructions) {
      return errorResponse(res, 400, 'Name, description, muscle group, equipment, and instructions are required');
    }

    const exercise = await Exercise.create({
      name,
      description,
      muscleGroup,
      equipment,
      difficulty: difficulty || 'Beginner',
      instructions,
    });

    return successResponse(res, 201, 'Exercise created successfully', { exercise });
  } catch (error) {
    next(error);
  }
};

exports.updateExercise = async (req, res, next) => {
  try {
    const exercise = await Exercise.findById(req.params.id);
    if (!exercise) {
      return errorResponse(res, 404, 'Exercise not found');
    }

    const fields = ['name', 'description', 'muscleGroup', 'equipment', 'difficulty', 'instructions'];
    fields.forEach((field) => {
      if (req.body[field] !== undefined) {
        exercise[field] = req.body[field];
      }
    });

    await exercise.save();
    return successResponse(res, 200, 'Exercise updated successfully', { exercise });
  } catch (error) {
    next(error);
  }
};

exports.deleteExercise = async (req, res, next) => {
  try {
    const exercise = await Exercise.findByIdAndDelete(req.params.id);
    if (!exercise) {
      return errorResponse(res, 404, 'Exercise not found');
    }

    await Workout.updateMany({ exercises: req.params.id }, { $pull: { exercises: req.params.id } });
    return successResponse(res, 200, 'Exercise deleted successfully', {});
  } catch (error) {
    next(error);
  }
};
