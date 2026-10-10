const express = require('express');
const {
  getWorkouts,
  getWorkoutById,
  createWorkout,
  updateWorkout,
  deleteWorkout,
  logWorkout,
  getWorkoutHistory,
} = require('../controllers/workoutController');
const { protect, adminOnly } = require('../middleware/auth');

const router = express.Router();

router.get('/', protect, getWorkouts);
router.get('/history', protect, getWorkoutHistory);
router.get('/:id', protect, getWorkoutById);
router.post('/', protect, createWorkout);
router.put('/:id', protect, updateWorkout);
router.delete('/:id', protect, deleteWorkout);
router.post('/:id/log', protect, logWorkout);

module.exports = router;
