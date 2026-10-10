const mongoose = require('mongoose');

const setSchema = new mongoose.Schema(
  {
    reps: { type: Number, min: 0, default: 0 },
    weight: { type: Number, min: 0, default: 0 },
    duration: { type: Number, min: 0, default: 0 },
    note: { type: String, default: '' },
  },
  { _id: false }
);

const workoutLogSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    workoutId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Workout',
      required: true,
    },
    exerciseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Exercise',
      required: true,
    },
    sets: [setSchema],
    reps: {
      type: Number,
      default: 0,
    },
    weight: {
      type: Number,
      default: 0,
    },
    duration: {
      type: Number,
      default: 0,
    },
    notes: {
      type: String,
      default: '',
    },
    completedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('WorkoutLog', workoutLogSchema);
