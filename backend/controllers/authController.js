import bcrypt from 'bcryptjs';
import { validationResult } from 'express-validator';
import { supabase } from '../config/supabase.js';
import { generateToken } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/errorHandler.js';

const DEFAULT_AVATARS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200&auto=format&fit=crop&q=80'
];

// Register user
export const register = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ 
      message: 'Validation failed', 
      errors: errors.array() 
    });
  }

  const { name, email, password, college, semester, student_id, department } = req.body;

  // Check if user already exists
  const { data: existingUser } = await supabase
    .from('users')
    .select('email')
    .eq('email', email)
    .single();

  if (existingUser) {
    return res.status(409).json({ message: 'User with this email already exists' });
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(password, 12);
  const defaultAvatar = DEFAULT_AVATARS[Math.floor(Math.random() * DEFAULT_AVATARS.length)];

  // Create user
  let user = null;
  try {
    const { data: newUser, error } = await supabase
      .from('users')
      .insert([
        {
          name,
          email,
          password_hash: hashedPassword,
          college,
          student_id: student_id || null,
          department: department || null,
          semester: semester ? parseInt(semester) : null,
          contribution_score: 0,
          badges: [],
          avatar_url: defaultAvatar
        }
      ])
      .select('*')
      .single();

    if (error) {
      // Fallback if avatar_url column is not yet present
      const { data: fallbackUser, error: fallbackError } = await supabase
        .from('users')
        .insert([
          {
            name,
            email,
            password_hash: hashedPassword,
            college,
            semester: semester ? parseInt(semester) : null,
            contribution_score: 0,
            badges: [],
          }
        ])
        .select('*')
        .single();

      if (fallbackError) throw fallbackError;
      user = fallbackUser;
    } else {
      user = newUser;
    }
  } catch (err) {
    throw new Error('Failed to create user: ' + err.message);
  }

  // Generate token
  const token = generateToken(user.id);
  const userAvatar = user.avatar_url || user.profile_image || defaultAvatar;

  res.status(201).json({
    message: 'User registered successfully',
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      college: user.college,
      studentId: user.student_id,
      department: user.department,
      semester: user.semester,
      contributionScore: user.contribution_score || 0,
      badges: user.badges || [],
      avatarUrl: userAvatar,
      avatar_url: userAvatar,
      createdAt: user.created_at,
    }
  });
});

// Login user
export const login = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ 
      message: 'Validation failed', 
      errors: errors.array() 
    });
  }

  const { email, password } = req.body;

  // Find user
  const { data: user, error } = await supabase
    .from('users')
    .select('*')
    .eq('email', email)
    .single();

  if (error || !user) {
    return res.status(401).json({ message: 'Invalid email or password' });
  }

  // Verify password
  const isPasswordValid = await bcrypt.compare(password, user.password_hash);
  if (!isPasswordValid) {
    return res.status(401).json({ message: 'Invalid email or password' });
  }

  // Generate token
  const token = generateToken(user.id);

  res.json({
    message: 'Login successful',
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      college: user.college,
      studentId: user.student_id,
      department: user.department,
      semester: user.semester,
      contributionScore: user.contribution_score,
      badges: user.badges,
      createdAt: user.created_at,
    }
  });
});

// Get user profile
export const getProfile = asyncHandler(async (req, res) => {
  const user = req.user;
  
  res.json({
    id: user.id,
    name: user.name,
    email: user.email,
    college: user.college,
    studentId: user.student_id,
    department: user.department,
    semester: user.semester,
    contributionScore: user.contribution_score,
    badges: user.badges,
    createdAt: user.created_at,
  });
});

// Update user profile
export const updateProfile = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const updates = req.body;

  // Remove sensitive fields from updates
  delete updates.password;
  delete updates.password_hash;
  delete updates.email;
  delete updates.id;

  const { data: user, error } = await supabase
    .from('users')
    .update(updates)
    .eq('id', userId)
    .select('id, name, email, college, student_id, department, semester, contribution_score, badges, created_at')
    .single();

  if (error) {
    throw new Error('Failed to update profile: ' + error.message);
  }

  res.json({
    message: 'Profile updated successfully',
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      college: user.college,
      studentId: user.student_id,
      department: user.department,
      semester: user.semester,
      contributionScore: user.contribution_score,
      badges: user.badges,
      createdAt: user.created_at,
    }
  });
});