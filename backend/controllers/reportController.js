import { supabase } from '../config/supabase.js';
import { asyncHandler } from '../middleware/errorHandler.js';

// Create a report
export const createReport = asyncHandler(async (req, res) => {
  const { contentType, contentId, reason, description } = req.body;
  const reporterId = req.user.id;

  if (!contentType || !contentId || !reason) {
    return res.status(400).json({ 
      message: 'Content type, content ID, and reason are required' 
    });
  }

  // Validate content type
  if (!['note', 'comment', 'user'].includes(contentType)) {
    return res.status(400).json({ 
      message: 'Invalid content type. Must be note, comment, or user' 
    });
  }

  // Check if user has already reported this content
  const { data: existingReport } = await supabase
    .from('reports')
    .select('id')
    .eq('reporter_id', reporterId)
    .eq('reported_content_type', contentType)
    .eq('reported_content_id', contentId)
    .single();

  if (existingReport) {
    return res.status(400).json({ 
      message: 'You have already reported this content' 
    });
  }

  // Create the report
  const { data: report, error } = await supabase
    .from('reports')
    .insert([{
      reporter_id: reporterId,
      reported_content_type: contentType,
      reported_content_id: contentId,
      reason,
      description: description || null
    }])
    .select('*')
    .single();

  if (error) {
    throw new Error('Failed to create report: ' + error.message);
  }

  res.status(201).json({
    message: 'Report submitted successfully',
    report
  });
});

// Get all reports (admin only)
export const getAllReports = asyncHandler(async (req, res) => {
  const { status, page = 1, limit = 20 } = req.query;
  const offset = (page - 1) * limit;

  let query = supabase
    .from('reports')
    .select(`
      *,
      reporter:users!reports_reporter_id_fkey (
        id,
        name,
        college
      ),
      reviewer:users!reports_reviewed_by_fkey (
        id,
        name,
        college
      )
    `);

  if (status) {
    query = query.eq('status', status);
  }

  const { data: reports, error, count } = await query
    .order('created_at', { ascending: false })
    .range(offset, offset + parseInt(limit) - 1);

  if (error) {
    throw new Error('Failed to fetch reports: ' + error.message);
  }

  const totalPages = Math.ceil(count / limit);

  res.json({
    reports: reports || [],
    pagination: {
      currentPage: parseInt(page),
      totalPages,
      totalReports: count,
      hasNext: page < totalPages,
      hasPrev: page > 1,
    }
  });
});

// Update report status (admin only)
export const updateReportStatus = asyncHandler(async (req, res) => {
  const { reportId } = req.params;
  const { status } = req.body;
  const reviewerId = req.user.id;

  if (!['pending', 'reviewed', 'resolved'].includes(status)) {
    return res.status(400).json({ 
      message: 'Invalid status. Must be pending, reviewed, or resolved' 
    });
  }

  const updateData = {
    status,
    reviewed_at: new Date().toISOString(),
    reviewed_by: reviewerId
  };

  const { data: report, error } = await supabase
    .from('reports')
    .update(updateData)
    .eq('id', reportId)
    .select('*')
    .single();

  if (error) {
    throw new Error('Failed to update report: ' + error.message);
  }

  res.json({
    message: 'Report status updated successfully',
    report
  });
});

// Get report statistics (admin only)
export const getReportStats = asyncHandler(async (req, res) => {
  // Get total reports by status
  const { data: statusStats, error: statusError } = await supabase
    .from('reports')
    .select('status')
    .then(({ data, error }) => {
      if (error) throw error;
      
      const stats = data.reduce((acc, report) => {
        acc[report.status] = (acc[report.status] || 0) + 1;
        return acc;
      }, {});
      
      return { data: stats, error: null };
    });

  if (statusError) {
    throw new Error('Failed to get status stats: ' + statusError.message);
  }

  // Get reports by content type
  const { data: typeStats, error: typeError } = await supabase
    .from('reports')
    .select('reported_content_type')
    .then(({ data, error }) => {
      if (error) throw error;
      
      const stats = data.reduce((acc, report) => {
        acc[report.reported_content_type] = (acc[report.reported_content_type] || 0) + 1;
        return acc;
      }, {});
      
      return { data: stats, error: null };
    });

  if (typeError) {
    throw new Error('Failed to get type stats: ' + typeError.message);
  }

  // Get recent reports count
  const { count: recentCount, error: recentError } = await supabase
    .from('reports')
    .select('*', { count: 'exact', head: true })
    .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString());

  if (recentError) {
    throw new Error('Failed to get recent reports count: ' + recentError.message);
  }

  res.json({
    stats: {
      byStatus: statusStats || {},
      byType: typeStats || {},
      recentCount: recentCount || 0
    }
  });
});