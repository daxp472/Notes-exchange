// Study Schedule Controller - Exam scheduling and study planning
import { supabase } from '../config/supabase.js';

export const studyScheduleController = {
  // Get user's exams
  getExams: async (req, res) => {
    try {
      const userId = req.user.id;
      const { upcoming = false } = req.query;

      let query = supabase
        .from('exam_schedule')
        .select('*')
        .eq('user_id', userId)
        .order('exam_date', { ascending: true });

      if (upcoming === 'true') {
        const today = new Date().toISOString().split('T')[0];
        query = query.gte('exam_date', today);
      }

      const { data: exams, error } = await query;

      if (error) throw error;

      res.json({ exams });

    } catch (error) {
      console.error('Error fetching exams:', error);
      res.status(500).json({ error: 'Failed to fetch exams' });
    }
  },

  // Create new exam
  createExam: async (req, res) => {
    try {
      const userId = req.user.id;
      const { subject, exam_date, exam_time, duration, syllabus, notes } = req.body;

      if (!subject || !exam_date) {
        return res.status(400).json({ error: 'Subject and exam date are required' });
      }

      const { data: exam, error } = await supabase
        .from('exam_schedule')
        .insert([{
          user_id: userId,
          subject,
          exam_date,
          exam_time,
          duration,
          syllabus,
          notes
        }])
        .select()
        .single();

      if (error) throw error;

      res.status(201).json({
        message: 'Exam scheduled successfully',
        exam
      });

    } catch (error) {
      console.error('Error creating exam:', error);
      res.status(500).json({ error: 'Failed to create exam' });
    }
  },

  // Update exam
  updateExam: async (req, res) => {
    try {
      const userId = req.user.id;
      const { examId } = req.params;
      const { subject, exam_date, exam_time, duration, syllabus, notes } = req.body;

      const { data: exam, error } = await supabase
        .from('exam_schedule')
        .update({
          subject,
          exam_date,
          exam_time,
          duration,
          syllabus,
          notes
        })
        .eq('id', examId)
        .eq('user_id', userId)
        .select()
        .single();

      if (error) throw error;

      if (!exam) {
        return res.status(404).json({ error: 'Exam not found' });
      }

      res.json({
        message: 'Exam updated successfully',
        exam
      });

    } catch (error) {
      console.error('Error updating exam:', error);
      res.status(500).json({ error: 'Failed to update exam' });
    }
  },

  // Delete exam
  deleteExam: async (req, res) => {
    try {
      const userId = req.user.id;
      const { examId } = req.params;

      const { error } = await supabase
        .from('exam_schedule')
        .delete()
        .eq('id', examId)
        .eq('user_id', userId);

      if (error) throw error;

      res.json({ message: 'Exam deleted successfully' });

    } catch (error) {
      console.error('Error deleting exam:', error);
      res.status(500).json({ error: 'Failed to delete exam' });
    }
  },

  // Get upcoming exams with countdown
  getUpcomingExams: async (req, res) => {
    try {
      const userId = req.user.id;
      const { days = 30 } = req.query;

      const today = new Date();
      const futureDate = new Date();
      futureDate.setDate(today.getDate() + parseInt(days));

      const { data: exams, error } = await supabase
        .from('exam_schedule')
        .select('*')
        .eq('user_id', userId)
        .gte('exam_date', today.toISOString().split('T')[0])
        .lte('exam_date', futureDate.toISOString().split('T')[0])
        .order('exam_date', { ascending: true });

      if (error) throw error;

      // Calculate days until exam and add urgency level
      const examsWithCountdown = exams.map(exam => {
        const examDate = new Date(exam.exam_date);
        const daysUntil = Math.ceil((examDate - today) / (1000 * 60 * 60 * 24));
        
        let urgency = 'low';
        if (daysUntil <= 3) urgency = 'critical';
        else if (daysUntil <= 7) urgency = 'high';
        else if (daysUntil <= 14) urgency = 'medium';

        return {
          ...exam,
          daysUntil,
          urgency,
          isToday: daysUntil === 0,
          isTomorrow: daysUntil === 1
        };
      });

      res.json({ 
        upcomingExams: examsWithCountdown,
        summary: {
          totalExams: examsWithCountdown.length,
          critical: examsWithCountdown.filter(e => e.urgency === 'critical').length,
          high: examsWithCountdown.filter(e => e.urgency === 'high').length,
          medium: examsWithCountdown.filter(e => e.urgency === 'medium').length,
          low: examsWithCountdown.filter(e => e.urgency === 'low').length
        }
      });

    } catch (error) {
      console.error('Error fetching upcoming exams:', error);
      res.status(500).json({ error: 'Failed to fetch upcoming exams' });
    }
  },

  // Get suggested notes for an exam
  getSuggestedNotes: async (req, res) => {
    try {
      const { examId } = req.params;
      const userId = req.user.id;

      // Get exam details
      const { data: exam, error: examError } = await supabase
        .from('exam_schedule')
        .select('*')
        .eq('id', examId)
        .eq('user_id', userId)
        .single();

      if (examError) throw examError;

      if (!exam) {
        return res.status(404).json({ error: 'Exam not found' });
      }

      // Find notes that match the exam subject
      const { data: notes, error: notesError } = await supabase
        .from('notes')
        .select(`
          id, title, description, subject, semester, course, tags,
          file_name, file_size, downloads, created_at,
          users:uploaded_by (name, college),
          ratings (rating)
        `)
        .eq('subject', exam.subject)
        .order('downloads', { ascending: false })
        .limit(20);

      if (notesError) throw notesError;

      // Calculate relevance score based on various factors
      const notesWithScore = notes.map(note => {
        let score = 0;
        
        // Base score from downloads (popularity)
        score += Math.min(note.downloads / 10, 50);
        
        // Boost score for recent notes
        const noteAge = (new Date() - new Date(note.created_at)) / (1000 * 60 * 60 * 24);
        if (noteAge < 365) score += Math.max(0, 20 - noteAge / 18);
        
        // Average rating boost
        const avgRating = note.ratings.length > 0 
          ? note.ratings.reduce((sum, r) => sum + r.rating, 0) / note.ratings.length 
          : 0;
        score += avgRating * 5;
        
        // Tag matching with exam syllabus
        if (exam.syllabus && note.tags) {
          const syllabusWords = exam.syllabus.toLowerCase().split(/\s+/);
          const matchingTags = note.tags.filter(tag => 
            syllabusWords.some(word => tag.toLowerCase().includes(word))
          );
          score += matchingTags.length * 10;
        }
        
        return {
          ...note,
          relevanceScore: Math.round(score),
          averageRating: avgRating
        };
      });

      // Sort by relevance score
      const sortedNotes = notesWithScore.sort((a, b) => b.relevanceScore - a.relevanceScore);

      res.json({
        exam: {
          id: exam.id,
          subject: exam.subject,
          exam_date: exam.exam_date,
          syllabus: exam.syllabus
        },
        suggestedNotes: sortedNotes.slice(0, 15).map(note => ({
          id: note.id,
          title: note.title,
          description: note.description,
          subject: note.subject,
          semester: note.semester,
          course: note.course,
          tags: note.tags,
          fileName: note.file_name,
          fileSize: note.file_size,
          downloads: note.downloads,
          createdAt: note.created_at,
          uploaderName: note.users.name,
          uploaderCollege: note.users.college,
          averageRating: note.averageRating,
          relevanceScore: note.relevanceScore
        }))
      });

    } catch (error) {
      console.error('Error fetching suggested notes:', error);
      res.status(500).json({ error: 'Failed to fetch suggested notes' });
    }
  },

  // Generate study plan for an exam
  getStudyPlan: async (req, res) => {
    try {
      const { examId } = req.params;
      const userId = req.user.id;

      // Get exam details
      const { data: exam, error: examError } = await supabase
        .from('exam_schedule')
        .select('*')
        .eq('id', examId)
        .eq('user_id', userId)
        .single();

      if (examError) throw examError;

      if (!exam) {
        return res.status(404).json({ error: 'Exam not found' });
      }

      const examDate = new Date(exam.exam_date);
      const today = new Date();
      const daysUntil = Math.ceil((examDate - today) / (1000 * 60 * 60 * 24));

      if (daysUntil < 0) {
        return res.status(400).json({ error: 'Cannot create study plan for past exams' });
      }

      // Generate study plan based on days until exam
      let studyPlan = [];
      
      if (daysUntil <= 1) {
        // Last-minute study plan
        studyPlan = [
          {
            day: 0,
            title: 'Final Review',
            tasks: [
              'Quick revision of key concepts',
              'Review important formulas/definitions',
              'Practice past questions',
              'Get adequate rest'
            ],
            intensity: 'high',
            duration: '4-6 hours'
          }
        ];
      } else if (daysUntil <= 7) {
        // Week-long intensive plan
        const dailyTasks = [
          'Complete syllabus overview',
          'Focus on weak areas',
          'Practice problems/questions',
          'Review and consolidate',
          'Mock tests',
          'Revision and clarifications',
          'Final review and rest'
        ];

        studyPlan = Array.from({ length: Math.min(daysUntil, 7) }, (_, i) => ({
          day: i + 1,
          title: dailyTasks[i] || 'Review and practice',
          tasks: generateDailyTasks(dailyTasks[i], exam.subject),
          intensity: i < 5 ? 'high' : 'medium',
          duration: i < 5 ? '6-8 hours' : '4-6 hours'
        }));
      } else {
        // Extended study plan
        const phases = Math.ceil(daysUntil / 7);
        
        for (let phase = 0; phase < phases; phase++) {
          const phaseStart = phase * 7 + 1;
          const phaseEnd = Math.min((phase + 1) * 7, daysUntil);
          
          for (let day = phaseStart; day <= phaseEnd; day++) {
            let intensity = 'medium';
            let duration = '4-5 hours';
            
            if (day > daysUntil - 7) {
              intensity = 'high';
              duration = '6-8 hours';
            }
            
            studyPlan.push({
              day,
              title: getStudyFocus(day, daysUntil, exam.subject),
              tasks: generateDailyTasks(getStudyFocus(day, daysUntil, exam.subject), exam.subject),
              intensity,
              duration
            });
          }
        }
      }

      // Get related notes count
      const { data: relatedNotes, count: notesCount } = await supabase
        .from('notes')
        .select('id', { count: 'exact', head: true })
        .eq('subject', exam.subject);

      res.json({
        exam: {
          id: exam.id,
          subject: exam.subject,
          exam_date: exam.exam_date,
          daysUntil,
          syllabus: exam.syllabus
        },
        studyPlan,
        statistics: {
          totalDays: daysUntil,
          studyDays: studyPlan.length,
          averageHoursPerDay: calculateAverageHours(studyPlan),
          availableNotes: notesCount || 0
        }
      });

    } catch (error) {
      console.error('Error generating study plan:', error);
      res.status(500).json({ error: 'Failed to generate study plan' });
    }
  }
};

// Helper functions
function generateDailyTasks(focus, subject) {
  const taskTemplates = {
    'Complete syllabus overview': [
      `Review ${subject} syllabus completely`,
      'Identify key topics and chapters',
      'Create a topic checklist',
      'Prioritize difficult topics'
    ],
    'Focus on weak areas': [
      'Identify challenging topics',
      'Practice problems from weak areas',
      'Seek help for unclear concepts',
      'Make notes of important points'
    ],
    'Practice problems/questions': [
      'Solve practice questions',
      'Work on past exam papers',
      'Time yourself while solving',
      'Review incorrect answers'
    ],
    'Review and consolidate': [
      'Review all completed topics',
      'Consolidate important formulas',
      'Create summary notes',
      'Test knowledge with flashcards'
    ],
    'Mock tests': [
      'Take full-length mock tests',
      'Analyze performance',
      'Identify time management issues',
      'Review weak areas'
    ],
    'Final review and rest': [
      'Quick revision of key points',
      'Review important formulas',
      'Ensure adequate sleep',
      'Prepare exam materials'
    ]
  };

  return taskTemplates[focus] || [
    `Study ${subject} concepts`,
    'Practice relevant problems',
    'Review important topics',
    'Make summary notes'
  ];
}

function getStudyFocus(day, totalDays, subject) {
  const ratio = day / totalDays;
  
  if (ratio <= 0.3) return 'Foundation building';
  if (ratio <= 0.6) return 'Concept strengthening';
  if (ratio <= 0.8) return 'Practice and application';
  if (ratio <= 0.95) return 'Revision and mock tests';
  return 'Final review';
}

function calculateAverageHours(studyPlan) {
  const totalHours = studyPlan.reduce((sum, day) => {
    const hours = day.duration.match(/(\d+)/g);
    return sum + (hours ? parseInt(hours[0]) : 5);
  }, 0);
  
  return Math.round(totalHours / studyPlan.length);
}