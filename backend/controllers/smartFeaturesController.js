// Smart Features Controller - AI-powered features for notes
import crypto from 'crypto';
import path from 'path';
import axios from 'axios';
import { supabase } from '../config/supabase.js';

export const smartFeaturesController = {
  // Check for duplicate files using file hash
  checkDuplicate: async (req, res) => {
    try {
      // For Cloudinary-based system, we'll check duplicates based on metadata
      // rather than file hash since we don't have direct file access
      const { fileUrl, title, description } = req.body;

      if (!fileUrl) {
        return res.status(400).json({ error: 'No file URL provided' });
      }

      // Check if note with similar title and description exists
      let query = supabase
        .from('notes')
        .select('id, title, description, uploaded_by, users:uploaded_by(name)');

      if (title) {
        query = query.ilike('title', `%${title}%`);
      }

      const { data: existingNotes, error } = await query;

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (existingNotes && existingNotes.length > 0) {
        // Check for exact matches in title and description
        const exactMatch = existingNotes.find(note => 
          note.title.toLowerCase() === title.toLowerCase() && 
          note.description.toLowerCase() === description.toLowerCase()
        );

        if (exactMatch) {
          return res.json({
            isDuplicate: true,
            existingNote: {
              id: exactMatch.id,
              title: exactMatch.title,
              uploadedBy: exactMatch.users.name,
              uploadedById: exactMatch.uploaded_by
            }
          });
        }

        // Return similar notes
        return res.json({
          isDuplicate: false,
          similarNotes: existingNotes.slice(0, 5).map(note => ({
            id: note.id,
            title: note.title,
            uploadedBy: note.users.name
          }))
        });
      }

      res.json({
        isDuplicate: false
      });

    } catch (error) {
      console.error('Error checking duplicate:', error);
      res.status(500).json({ error: 'Failed to check for duplicates' });
    }
  },

  // Generate summary for notes (mock implementation - would use AI in production)
  generateSummary: async (req, res) => {
    try {
      const { title, description, subject, content } = req.body;

      if (!title && !description && !content) {
        return res.status(400).json({ error: 'No content provided for summary generation' });
      }

      // Mock AI summary generation (replace with actual AI service)
      const textContent = [title, description, content].filter(Boolean).join(' ');
      
      // Simple extractive summary (first few sentences)
      const sentences = textContent.split(/[.!?]+/).filter(s => s.trim().length > 0);
      const summary = sentences.slice(0, 3).join('. ').trim() + (sentences.length > 3 ? '...' : '');

      // Enhanced summary based on subject
      const subjectContext = getSubjectContext(subject);
      const enhancedSummary = `${subjectContext} ${summary}`.trim();

      res.json({
        summary: enhancedSummary,
        wordCount: textContent.split(' ').length,
        keyTopics: extractKeyTopics(textContent, subject)
      });

    } catch (error) {
      console.error('Error generating summary:', error);
      res.status(500).json({ error: 'Failed to generate summary' });
    }
  },

  // Suggest category based on content analysis
  suggestCategory: async (req, res) => {
    try {
      const { title, description, subject, tags } = req.body;

      if (!title && !description) {
        return res.status(400).json({ error: 'No content provided for category suggestion' });
      }

      const content = [title, description].filter(Boolean).join(' ').toLowerCase();
      const tagString = Array.isArray(tags) ? tags.join(' ').toLowerCase() : '';
      const fullContent = `${content} ${tagString}`.toLowerCase();

      // Get existing categories from database
      const { data: existingNotes, error } = await supabase
        .from('notes')
        .select('category')
        .not('category', 'is', null);

      if (error) throw error;

      const existingCategories = [...new Set(existingNotes.map(note => note.category))];

      // Rule-based category suggestion
      const suggestions = suggestCategoryByRules(fullContent, subject, existingCategories);

      res.json({
        suggestions,
        confidence: calculateConfidence(suggestions, fullContent),
        existingCategories
      });

    } catch (error) {
      console.error('Error suggesting category:', error);
      res.status(500).json({ error: 'Failed to suggest category' });
    }
  },

  // Validate file format and properties (based on URL)
  validateFile: async (req, res) => {
    try {
      const { fileUrl, fileName, fileSize, fileType } = req.body;

      if (!fileUrl) {
        return res.status(400).json({ error: 'No file URL provided' });
      }

      const validation = {
        isValid: true,
        errors: [],
        warnings: [],
        fileInfo: {
          name: fileName || 'unnamed',
          size: fileSize || 0,
          type: fileType || 'unknown',
          sizeFormatted: fileSize ? formatFileSize(fileSize) : 'Unknown'
        }
      };

      // Check file type from URL or provided type
      const urlType = fileType || getFileTypeFromUrl(fileUrl);
      const allowedTypes = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.ms-powerpoint',
        'application/vnd.openxmlformats-officedocument.presentationml.presentation',
        'image/jpeg',
        'image/png',
        'image/jpg'
      ];
      
      if (!allowedTypes.includes(urlType)) {
        validation.isValid = false;
        validation.errors.push('File type not supported');
      }

      // Check file size if provided
      const maxSize = 10 * 1024 * 1024; // 10MB limit
      if (fileSize && fileSize > maxSize) {
        validation.isValid = false;
        validation.errors.push('File size exceeds 10MB limit');
      }

      // Additional checks
      if (fileSize && fileSize < 1024) {
        validation.warnings.push('File seems unusually small');
      }

      // Check filename
      const name = fileName || 'unnamed';
      if (!/^[a-zA-Z0-9\s\-_\.\(\)]+$/.test(name)) {
        validation.warnings.push('Filename contains special characters');
      }

      // Suggest filename improvements
      validation.suggestedFilename = sanitizeFilename(name);

      res.json(validation);

    } catch (error) {
      console.error('Error validating file:', error);
      res.status(500).json({ error: 'Failed to validate file' });
    }
  },

  // Get auto-generated tags based on subject
  getAutoTags: async (req, res) => {
    try {
      const { subject } = req.params;

      if (!subject) {
        return res.status(400).json({ error: 'Subject is required' });
      }

      // Get popular tags for this subject
      const { data: notes, error } = await supabase
        .from('notes')
        .select('tags')
        .eq('subject', subject)
        .not('tags', 'is', null);

      if (error) throw error;

      // Count tag frequency
      const tagFrequency = {};
      notes.forEach(note => {
        if (Array.isArray(note.tags)) {
          note.tags.forEach(tag => {
            if (tag && typeof tag === 'string') {
              const normalizedTag = tag.toLowerCase().trim();
              tagFrequency[normalizedTag] = (tagFrequency[normalizedTag] || 0) + 1;
            }
          });
        }
      });

      // Get top 20 most frequent tags
      const popularTags = Object.entries(tagFrequency)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 20)
        .map(([tag, count]) => ({ tag, count }));

      // Add subject-specific default tags
      const defaultTags = getSubjectDefaultTags(subject);

      res.json({
        popularTags,
        defaultTags,
        totalNotes: notes.length
      });

    } catch (error) {
      console.error('Error getting auto tags:', error);
      res.status(500).json({ error: 'Failed to get auto tags' });
    }
  }
};

// Helper Functions

function getSubjectContext(subject) {
  const contexts = {
    'Mathematics': 'Mathematical concepts including',
    'Physics': 'Physics principles covering',
    'Chemistry': 'Chemical processes and reactions involving',
    'Biology': 'Biological systems and processes related to',
    'Computer Science': 'Programming and computational concepts about',
    'Engineering': 'Engineering principles and applications for',
    'Business': 'Business strategies and management concepts for',
    'Literature': 'Literary analysis and themes exploring',
    'History': 'Historical events and context regarding',
    'Psychology': 'Psychological theories and research on'
  };
  
  return contexts[subject] || 'Academic content covering';
}

function extractKeyTopics(content, subject) {
  const subjectKeywords = {
    'Mathematics': ['equation', 'formula', 'theorem', 'proof', 'calculation', 'algebra', 'geometry', 'calculus'],
    'Physics': ['force', 'energy', 'momentum', 'wave', 'particle', 'quantum', 'relativity', 'mechanics'],
    'Chemistry': ['molecule', 'reaction', 'bond', 'element', 'compound', 'organic', 'acid', 'base'],
    'Biology': ['cell', 'DNA', 'protein', 'gene', 'evolution', 'organism', 'ecosystem', 'photosynthesis'],
    'Computer Science': ['algorithm', 'data structure', 'programming', 'software', 'database', 'network', 'security'],
  };

  const keywords = subjectKeywords[subject] || [];
  const contentLower = content.toLowerCase();
  
  return keywords.filter(keyword => contentLower.includes(keyword)).slice(0, 5);
}

function suggestCategoryByRules(content, subject, existingCategories) {
  const rules = {
    'lecture': ['lecture', 'class', 'session', 'presentation'],
    'assignment': ['assignment', 'homework', 'problem set', 'exercise'],
    'exam': ['exam', 'test', 'quiz', 'midterm', 'final'],
    'lab': ['lab', 'laboratory', 'experiment', 'practical'],
    'project': ['project', 'report', 'thesis', 'research'],
    'reference': ['reference', 'textbook', 'manual', 'guide', 'handbook'],
    'tutorial': ['tutorial', 'how-to', 'step-by-step', 'guide'],
    'summary': ['summary', 'review', 'overview', 'outline', 'notes']
  };

  const suggestions = [];
  
  for (const [category, keywords] of Object.entries(rules)) {
    const matches = keywords.filter(keyword => content.includes(keyword));
    if (matches.length > 0) {
      suggestions.push({
        category,
        confidence: (matches.length / keywords.length) * 100,
        matchedKeywords: matches
      });
    }
  }

  // Add existing popular categories
  existingCategories.slice(0, 5).forEach(category => {
    if (!suggestions.find(s => s.category === category)) {
      suggestions.push({
        category,
        confidence: 30,
        matchedKeywords: ['existing category']
      });
    }
  });

  return suggestions.sort((a, b) => b.confidence - a.confidence).slice(0, 5);
}

function calculateConfidence(suggestions, content) {
  if (suggestions.length === 0) return 0;
  
  const topSuggestion = suggestions[0];
  const wordCount = content.split(' ').length;
  const keywordDensity = topSuggestion.matchedKeywords.length / wordCount;
  
  return Math.min(topSuggestion.confidence + (keywordDensity * 100), 95);
}

function formatFileSize(bytes) {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function sanitizeFilename(filename) {
  return filename
    .replace(/[^a-zA-Z0-9\s\-_\.\(\)]/g, '')
    .replace(/\s+/g, '_')
    .toLowerCase();
}

function getSubjectDefaultTags(subject) {
  const defaultTagsMap = {
    'Mathematics': ['math', 'calculation', 'formula', 'problem-solving'],
    'Physics': ['physics', 'experiment', 'theory', 'analysis'],
    'Chemistry': ['chemistry', 'reaction', 'compound', 'analysis'],
    'Biology': ['biology', 'organism', 'study', 'research'],
    'Computer Science': ['programming', 'algorithm', 'software', 'technology'],
    'Engineering': ['engineering', 'design', 'solution', 'technical'],
    'Business': ['business', 'strategy', 'management', 'analysis'],
    'Literature': ['literature', 'analysis', 'interpretation', 'writing'],
    'History': ['history', 'event', 'timeline', 'analysis'],
    'Psychology': ['psychology', 'behavior', 'study', 'research']
  };

  return defaultTagsMap[subject] || ['academic', 'study', 'notes', 'learning'];
}

function getFileTypeFromUrl(url) {
  // Try to determine file type from URL
  const extension = url.split('.').pop().toLowerCase();
  
  const extensionMap = {
    'pdf': 'application/pdf',
    'doc': 'application/msword',
    'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'ppt': 'application/vnd.ms-powerpoint',
    'pptx': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'jpg': 'image/jpeg',
    'jpeg': 'image/jpeg',
    'png': 'image/png'
  };
  
  return extensionMap[extension] || 'unknown';
}