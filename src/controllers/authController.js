const bcrypt = require('bcrypt');
const User = require('../models/User');
const { generateToken } = require('../utils/token');
const { successResponse, errorResponse } = require('../utils/response');

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

exports.register = async (req, res, next) => {
  try {
    const { name, email, password, confirmPassword, age, gender, height, weight } = req.body;

    if (!name || !email || !password) {
      return errorResponse(res, 400, 'Name, email, and password are required');
    }

    if (password.length < 8) {
      return errorResponse(res, 400, 'Password must be at least 8 characters long');
    }

    if (password !== confirmPassword) {
      return errorResponse(res, 400, 'Passwords do not match');
    }

    const normalizedEmail = email.trim().toLowerCase();
    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return errorResponse(res, 409, 'Email is already registered');
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({
      name,
      email: normalizedEmail,
      passwordHash,
      role: 'USER',
      age: age ? Number(age) : undefined,
      gender,
      height: height ? Number(height) : undefined,
      weight: weight ? Number(weight) : undefined,
    });

    const token = generateToken(user._id, user.role);

    return successResponse(res, 201, 'Registration successful', {
      token,
      user: sanitizeUser(user),
    });
  } catch (error) {
    next(error);
  }
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return errorResponse(res, 400, 'Email and password are required');
    }

    const normalizedEmail = email.trim().toLowerCase();
    const user = await User.findOne({ email: normalizedEmail });

    if (!user || !user.isActive) {
      return errorResponse(res, 401, 'Invalid email or password');
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return errorResponse(res, 401, 'Invalid email or password');
    }

    const token = generateToken(user._id, user.role);

    return successResponse(res, 200, 'Login successful', {
      token,
      user: sanitizeUser(user),
    });
  } catch (error) {
    next(error);
  }
};

exports.getMe = async (req, res) => {
  return successResponse(res, 200, 'User retrieved successfully', {
    user: sanitizeUser(req.user),
  });
};

exports.logout = async (req, res) => {
  return successResponse(res, 200, 'Logout successful', {});
};
