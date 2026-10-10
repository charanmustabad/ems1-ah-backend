const mongoose = require('mongoose');

const workoutSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Workout name is required'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Workout description is required'],
      trim: true,
    },
    category: {
      type: String,
      enum: ['Strength', 'Cardio', 'Full Body', 'Upper Body', 'Lower Body', 'Beginner', 'Custom'],
      default: 'Custom',
    },
    difficulty: {
      type: String,
      enum: ['Beginner', 'Intermediate', 'Advanced'],
      default: 'Beginner',
    },
    duration: {
      type: Number,
      required: true,
      min: 10,
    },
    exercises: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Exercise',
      },
    ],
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Workout', workoutSchema);
