const mongoose = require('mongoose');

const exerciseSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Exercise name is required'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
    },
    muscleGroup: {
      type: String,
      required: true,
      enum: ['Chest', 'Back', 'Shoulders', 'Biceps', 'Triceps', 'Legs', 'Core', 'Full Body'],
    },
    equipment: {
      type: String,
      required: true,
      trim: true,
    },
    difficulty: {
      type: String,
      enum: ['Beginner', 'Intermediate', 'Advanced'],
      default: 'Beginner',
    },
    instructions: {
      type: String,
      required: true,
      trim: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Exercise', exerciseSchema);
