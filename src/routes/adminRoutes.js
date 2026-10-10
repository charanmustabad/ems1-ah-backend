const express = require('express');
const {
  getDashboard,
  getUsers,
  createUser,
  updateUser,
  deleteUser,
  getAdminWorkouts,
  getAdminExercises,
  getReports,
  getStatistics,
} = require('../controllers/adminController');
const { protect, adminOnly } = require('../middleware/auth');

const router = express.Router();

router.use(protect, adminOnly);
router.get('/dashboard', getDashboard);
router.get('/users', getUsers);
router.post('/users', createUser);
router.put('/users/:id', updateUser);
router.delete('/users/:id', deleteUser);
router.get('/workouts', getAdminWorkouts);
router.get('/exercises', getAdminExercises);
router.get('/reports', getReports);
router.get('/statistics', getStatistics);

module.exports = router;
