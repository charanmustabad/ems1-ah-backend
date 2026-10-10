const express = require('express');
const {
  getProfile,
  updateProfile,
  getAvailableWorkouts,
  getWorkoutHistory,
  getProgress,
  getStatistics,
} = require('../controllers/userController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.use(protect);
router.get('/profile', getProfile);
router.put('/profile', updateProfile);
router.get('/workouts', getAvailableWorkouts);
router.get('/history', getWorkoutHistory);
router.get('/progress', getProgress);
router.get('/statistics', getStatistics);

module.exports = router;
