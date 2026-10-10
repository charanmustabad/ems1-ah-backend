const express = require('express');
const {
  getExercises,
  getExerciseById,
  createExercise,
  updateExercise,
  deleteExercise,
} = require('../controllers/exerciseController');
const { protect, adminOnly } = require('../middleware/auth');

const router = express.Router();

router.get('/', protect, getExercises);
router.get('/:id', protect, getExerciseById);
router.post('/', protect, adminOnly, createExercise);
router.put('/:id', protect, adminOnly, updateExercise);
router.delete('/:id', protect, adminOnly, deleteExercise);

module.exports = router;
