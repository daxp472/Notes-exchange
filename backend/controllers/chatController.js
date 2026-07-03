import { supabase } from '../config/supabase.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import { createNotification } from './notificationController.js';

// ===================
// PRIVATE CHAT ROUTES
// ===================

// Get private messages between current user and another user
export const getPrivateMessages = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const currentUserId = req.user.id;
  const { page = 1, limit = 50 } = req.query;

  const offset = (page - 1) * limit;

  // Fetch messages between two users
  const { data: messages, error, count } = await supabase
    .from('private_messages')
    .select(`
      *,
      sender:users!private_messages_sender_id_fkey (
        id,
        name,
        college
      ),
      receiver:users!private_messages_receiver_id_fkey (
        id,
        name,
        college
      )
    `, { count: 'exact' })
    .or(`and(sender_id.eq.${currentUserId},receiver_id.eq.${userId}),and(sender_id.eq.${userId},receiver_id.eq.${currentUserId})`)
    .order('created_at', { ascending: false }) // Changed to descending to get newest first
    .range(offset, offset + parseInt(limit) - 1);

  if (error) {
    throw new Error('Failed to fetch messages: ' + error.message);
  }

  // Reverse the array to show oldest first (for proper chat display)
  const reversedMessages = messages.reverse();

  const totalPages = Math.ceil(count / limit);

  res.json({
    messages: reversedMessages.map(msg => ({
      id: msg.id,
      senderId: msg.sender_id,
      receiverId: msg.receiver_id,
      content: msg.content,
      createdAt: msg.created_at,
      senderName: msg.sender.name,
      senderCollege: msg.sender.college,
      receiverName: msg.receiver.name,
      receiverCollege: msg.receiver.college,
    })),
    pagination: {
      currentPage: parseInt(page),
      totalPages,
      totalMessages: count,
      hasNext: page < totalPages,
      hasPrev: page > 1,
    }
  });
});

// Send a private message to another user
export const sendPrivateMessage = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const { content } = req.body;
  const currentUserId = req.user.id;

  if (!content || content.trim().length === 0) {
    return res.status(400).json({ message: 'Message content is required' });
  }

  if (content.length > 1000) {
    return res.status(400).json({ message: 'Message must be less than 1000 characters' });
  }

  if (currentUserId === userId) {
    return res.status(400).json({ message: 'Cannot send message to yourself' });
  }

  // Check if receiver exists
  const { data: receiver, error: receiverError } = await supabase
    .from('users')
    .select('id, name, college')
    .eq('id', userId)
    .single();

  if (receiverError || !receiver) {
    return res.status(404).json({ message: 'Receiver not found' });
  }

  // Insert message
  const { data: message, error } = await supabase
    .from('private_messages')
    .insert([{
      sender_id: currentUserId,
      receiver_id: userId,
      content: content.trim()
    }])
    .select(`
      *,
      sender:users!private_messages_sender_id_fkey (
        id,
        name,
        college
      ),
      receiver:users!private_messages_receiver_id_fkey (
        id,
        name,
        college
      )
    `)
    .single();

  if (error) {
    throw new Error('Failed to send message: ' + error.message);
  }

  // Create notification for receiver
  await createNotification(
    userId,
    'message',
    'New Private Message',
    `You received a new message from ${req.user.name}`,
    message.id
  );

  res.status(201).json({
    message: 'Message sent successfully',
    data: {
      id: message.id,
      senderId: message.sender_id,
      receiverId: message.receiver_id,
      content: message.content,
      createdAt: message.created_at,
      senderName: message.sender.name,
      senderCollege: message.sender.college,
      receiverName: message.receiver.name,
      receiverCollege: message.receiver.college,
    }
  });
});

// Search users by name for starting new conversations
export const searchUsers = asyncHandler(async (req, res) => {
  const { q: query } = req.query;
  const currentUserId = req.user.id;

  if (!query || query.trim().length < 2) {
    return res.status(400).json({ message: 'Search query must be at least 2 characters' });
  }

  try {
    // Search users by name, excluding current user
    const { data: users, error } = await supabase
      .from('users')
      .select('id, name, college, email')
      .ilike('name', `%${query.trim()}%`)
      .neq('id', currentUserId)
      .limit(20);

    if (error) {
      throw new Error('Failed to search users: ' + error.message);
    }

    res.json({
      users: users || [],
      total: users?.length || 0
    });
  } catch (error) {
    console.error('Search users error:', error);
    res.status(500).json({ message: 'Failed to search users' });
  }
});

// Get all users that current user has chatted with
export const getChatContacts = asyncHandler(async (req, res) => {
  const currentUserId = req.user.id;

  // Get unique users who have exchanged messages with current user
  const { data: contacts, error } = await supabase
    .rpc('get_chat_contacts', { current_user_id: currentUserId });

  if (error) {
    // Fallback query if RPC doesn't exist
    const { data: sentMessages } = await supabase
      .from('private_messages')
      .select('receiver_id, users!private_messages_receiver_id_fkey(id, name, college)')
      .eq('sender_id', currentUserId);

    const { data: receivedMessages } = await supabase
      .from('private_messages')
      .select('sender_id, users!private_messages_sender_id_fkey(id, name, college)')
      .eq('receiver_id', currentUserId);

    const contactsMap = new Map();
    
    sentMessages?.forEach(msg => {
      const user = msg.users;
      if (user && !contactsMap.has(user.id)) {
        contactsMap.set(user.id, user);
      }
    });

    receivedMessages?.forEach(msg => {
      const user = msg.users;
      if (user && !contactsMap.has(user.id)) {
        contactsMap.set(user.id, user);
      }
    });

    return res.json({
      contacts: Array.from(contactsMap.values())
    });
  }

  res.json({
    contacts: contacts || []
  });
});

// ================
// GROUP CHAT ROUTES
// ================

// Create a new group
export const createGroup = asyncHandler(async (req, res) => {
  const { name, description, members = [] } = req.body;
  const currentUserId = req.user.id;

  if (!name || name.trim().length === 0) {
    return res.status(400).json({ message: 'Group name is required' });
  }

  if (name.length > 100) {
    return res.status(400).json({ message: 'Group name must be less than 100 characters' });
  }

  // Create group
  const { data: group, error: groupError } = await supabase
    .from('chat_groups')
    .insert([{
      name: name.trim(),
      description: description?.trim() || null,
      created_by: currentUserId
    }])
    .select(`
      *,
      creator:users!chat_groups_created_by_fkey (
        id,
        name,
        college
      )
    `)
    .single();

  if (groupError) {
    throw new Error('Failed to create group: ' + groupError.message);
  }

  // Add creator as first member
  const { error: memberError } = await supabase
    .from('group_members')
    .insert([{
      group_id: group.id,
      user_id: currentUserId
    }]);

  if (memberError) {
    throw new Error('Failed to add creator to group: ' + memberError.message);
  }

  // Add additional members if provided
  if (members && members.length > 0) {
    const memberInserts = members.map(userId => ({
      group_id: group.id,
      user_id: userId
    }));

    const { error: additionalMembersError } = await supabase
      .from('group_members')
      .insert(memberInserts);

    if (additionalMembersError) {
      console.error('Failed to add additional members:', additionalMembersError);
      // Don't throw error here as the group was created successfully
    }
  }

  res.status(201).json({
    message: 'Group created successfully',
    group: {
      id: group.id,
      name: group.name,
      description: group.description,
      createdBy: group.created_by,
      createdAt: group.created_at,
      creatorName: group.creator.name,
      creatorCollege: group.creator.college,
      memberCount: 1 + (members ? members.length : 0)
    }
  });
});

// Get all groups user is part of
export const getUserGroups = asyncHandler(async (req, res) => {
  const currentUserId = req.user.id;

  try {
    const { data: groups, error } = await supabase
      .from('group_members')
      .select(`
        group_id,
        joined_at,
        chat_groups (
          id,
          name,
          description,
          created_by,
          created_at
        )
      `)
      .eq('user_id', currentUserId)
      .order('joined_at', { ascending: false });

    if (error || !groups) {
      return res.json({ groups: [] });
    }

    const groupsWithCounts = groups.filter(gm => gm.chat_groups).map(groupMember => {
      const group = groupMember.chat_groups;
      return {
        id: group.id,
        name: group.name,
        description: group.description,
        createdBy: group.created_by,
        createdAt: group.created_at,
        joinedAt: groupMember.joined_at,
        creatorName: 'Group Creator',
        creatorCollege: 'University',
        memberCount: 1
      };
    });

    res.json({ groups: groupsWithCounts });
  } catch (err) {
    console.warn('Groups fetch error fallback:', err);
    res.json({ groups: [] });
  }
});

// Get group messages
export const getGroupMessages = asyncHandler(async (req, res) => {
  const { groupId } = req.params;
  const { page = 1, limit = 50 } = req.query;
  const currentUserId = req.user.id;

  const offset = (page - 1) * limit;

  // Check if user is member of the group
  const { data: membership, error: membershipError } = await supabase
    .from('group_members')
    .select('id')
    .eq('group_id', groupId)
    .eq('user_id', currentUserId)
    .single();

  if (membershipError || !membership) {
    return res.status(403).json({ message: 'You are not a member of this group' });
  }

  // Fetch messages
  const { data: messages, error, count } = await supabase
    .from('group_messages')
    .select(`
      *,
      sender:users!group_messages_sender_id_fkey (
        id,
        name,
        college
      )
    `, { count: 'exact' })
    .eq('group_id', groupId)
    .order('created_at', { ascending: false }) // Changed to descending to get newest first
    .range(offset, offset + parseInt(limit) - 1);

  if (error) {
    throw new Error('Failed to fetch messages: ' + error.message);
  }

  // Reverse the array to show oldest first (for proper chat display)
  const reversedMessages = messages.reverse();

  const totalPages = Math.ceil(count / limit);

  res.json({
    messages: reversedMessages.map(msg => ({
      id: msg.id,
      groupId: msg.group_id,
      senderId: msg.sender_id,
      content: msg.content,
      createdAt: msg.created_at,
      senderName: msg.sender?.name || 'Unknown User',
      senderCollege: msg.sender?.college,
    })),
    pagination: {
      currentPage: parseInt(page),
      totalPages,
      totalMessages: count,
      hasNext: page < totalPages,
      hasPrev: page > 1,
    }
  });
});

// Send message in group
export const sendGroupMessage = asyncHandler(async (req, res) => {
  const { groupId } = req.params;
  const { content } = req.body;
  const currentUserId = req.user.id;

  if (!content || content.trim().length === 0) {
    return res.status(400).json({ message: 'Message content is required' });
  }

  if (content.length > 1000) {
    return res.status(400).json({ message: 'Message must be less than 1000 characters' });
  }

  // Check if user is member of the group
  const { data: membership, error: membershipError } = await supabase
    .from('group_members')
    .select('id')
    .eq('group_id', groupId)
    .eq('user_id', currentUserId)
    .single();

  if (membershipError || !membership) {
    return res.status(403).json({ message: 'You are not a member of this group' });
  }

  // Insert message
  const { data: message, error } = await supabase
    .from('group_messages')
    .insert([{
      group_id: groupId,
      sender_id: currentUserId,
      content: content.trim()
    }])
    .select(`
      *,
      sender:users!group_messages_sender_id_fkey (
        id,
        name,
        college
      )
    `)
    .single();

  if (error) {
    throw new Error('Failed to send message: ' + error.message);
  }

  res.status(201).json({
    message: 'Message sent successfully',
    data: {
      id: message.id,
      groupId: message.group_id,
      senderId: message.sender_id,
      content: message.content,
      createdAt: message.created_at,
      senderName: message.sender.name,
      senderCollege: message.sender.college,
    }
  });
});

// Add member to group
export const addGroupMember = asyncHandler(async (req, res) => {
  const { groupId } = req.params;
  const { userId } = req.body;
  const currentUserId = req.user.id;

  if (!userId) {
    return res.status(400).json({ message: 'User ID is required' });
  }

  // Check if current user is group creator
  const { data: group, error: groupError } = await supabase
    .from('chat_groups')
    .select('created_by')
    .eq('id', groupId)
    .single();

  if (groupError || !group) {
    return res.status(404).json({ message: 'Group not found' });
  }

  if (group.created_by !== currentUserId) {
    return res.status(403).json({ message: 'Only group creator can add members' });
  }

  // Check if user exists
  const { data: user, error: userError } = await supabase
    .from('users')
    .select('id, name, college')
    .eq('id', userId)
    .single();

  if (userError || !user) {
    return res.status(404).json({ message: 'User not found' });
  }

  // Check if user is already a member
  const { data: existingMember } = await supabase
    .from('group_members')
    .select('id')
    .eq('group_id', groupId)
    .eq('user_id', userId)
    .single();

  if (existingMember) {
    return res.status(400).json({ message: 'User is already a member of this group' });
  }

  // Add member
  const { error: addError } = await supabase
    .from('group_members')
    .insert([{
      group_id: groupId,
      user_id: userId
    }]);

  if (addError) {
    throw new Error('Failed to add member: ' + addError.message);
  }

  // Create notification for added user
  await createNotification(
    userId,
    'message',
    'Added to Group',
    `You have been added to the group "${group.name}"`,
    groupId
  );

  res.json({
    message: 'Member added successfully',
    member: {
      id: user.id,
      name: user.name,
      college: user.college
    }
  });
});

// Remove member from group
export const removeGroupMember = asyncHandler(async (req, res) => {
  const { groupId, userId } = req.params;
  const currentUserId = req.user.id;

  // Check if current user is group creator
  const { data: group, error: groupError } = await supabase
    .from('chat_groups')
    .select('created_by, name')
    .eq('id', groupId)
    .single();

  if (groupError || !group) {
    return res.status(404).json({ message: 'Group not found' });
  }

  if (group.created_by !== currentUserId) {
    return res.status(403).json({ message: 'Only group creator can remove members' });
  }

  if (userId === currentUserId) {
    return res.status(400).json({ message: 'Cannot remove yourself from the group' });
  }

  // Remove member
  const { error } = await supabase
    .from('group_members')
    .delete()
    .eq('group_id', groupId)
    .eq('user_id', userId);

  if (error) {
    throw new Error('Failed to remove member: ' + error.message);
  }

  // Create notification for removed user
  await createNotification(
    userId,
    'message',
    'Removed from Group',
    `You have been removed from the group "${group.name}"`,
    groupId
  );

  res.json({ message: 'Member removed successfully' });
});

// Get group members
export const getGroupMembers = asyncHandler(async (req, res) => {
  const { groupId } = req.params;
  const currentUserId = req.user.id;

  // Check if user is member of the group
  const { data: membership, error: membershipError } = await supabase
    .from('group_members')
    .select('id')
    .eq('group_id', groupId)
    .eq('user_id', currentUserId)
    .single();

  if (membershipError || !membership) {
    return res.status(403).json({ message: 'You are not a member of this group' });
  }

  // Get members
  const { data: members, error } = await supabase
    .from('group_members')
    .select(`
      joined_at,
      users!inner (
        id,
        name,
        college
      )
    `)
    .eq('group_id', groupId)
    .order('joined_at', { ascending: true });

  if (error) {
    throw new Error('Failed to fetch members: ' + error.message);
  }

  res.json({
    members: members.map(member => ({
      id: member.users.id,
      name: member.users.name,
      college: member.users.college,
      joinedAt: member.joined_at
    }))
  });
});

// Leave group
export const leaveGroup = asyncHandler(async (req, res) => {
  const { groupId } = req.params;
  const currentUserId = req.user.id;

  // Check if user is member of the group
  const { data: membership, error: membershipError } = await supabase
    .from('group_members')
    .select('id')
    .eq('group_id', groupId)
    .eq('user_id', currentUserId)
    .single();

  if (membershipError || !membership) {
    return res.status(403).json({ message: 'You are not a member of this group' });
  }

  // Check if user is the group creator
  const { data: group } = await supabase
    .from('chat_groups')
    .select('created_by')
    .eq('id', groupId)
    .single();

  if (group && group.created_by === currentUserId) {
    return res.status(400).json({ message: 'Group creator cannot leave the group. Please delete the group or transfer ownership first.' });
  }

  // Remove member
  const { error } = await supabase
    .from('group_members')
    .delete()
    .eq('group_id', groupId)
    .eq('user_id', currentUserId);

  if (error) {
    throw new Error('Failed to leave group: ' + error.message);
  }

  res.json({ message: 'Successfully left the group' });
});

// Update group details
export const updateGroup = asyncHandler(async (req, res) => {
  const { groupId } = req.params;
  const { name, description } = req.body;
  const currentUserId = req.user.id;

  if (!name || name.trim().length === 0) {
    return res.status(400).json({ message: 'Group name is required' });
  }

  if (name.length > 100) {
    return res.status(400).json({ message: 'Group name must be less than 100 characters' });
  }

  // Check if current user is group creator
  const { data: group, error: groupError } = await supabase
    .from('chat_groups')
    .select('created_by')
    .eq('id', groupId)
    .single();

  if (groupError || !group) {
    return res.status(404).json({ message: 'Group not found' });
  }

  if (group.created_by !== currentUserId) {
    return res.status(403).json({ message: 'Only group creator can update group details' });
  }

  // Update group
  const { data: updatedGroup, error } = await supabase
    .from('chat_groups')
    .update({
      name: name.trim(),
      description: description?.trim() || null
    })
    .eq('id', groupId)
    .select(`
      *,
      creator:users!chat_groups_created_by_fkey (
        id,
        name,
        college
      )
    `)
    .single();

  if (error) {
    throw new Error('Failed to update group: ' + error.message);
  }

  res.json({
    message: 'Group updated successfully',
    group: {
      id: updatedGroup.id,
      name: updatedGroup.name,
      description: updatedGroup.description,
      createdBy: updatedGroup.created_by,
      createdAt: updatedGroup.created_at,
      creatorName: updatedGroup.creator.name,
      creatorCollege: updatedGroup.creator.college
    }
  });
});

// Delete group
export const deleteGroup = asyncHandler(async (req, res) => {
  const { groupId } = req.params;
  const currentUserId = req.user.id;

  // Check if current user is group creator
  const { data: group, error: groupError } = await supabase
    .from('chat_groups')
    .select('created_by')
    .eq('id', groupId)
    .single();

  if (groupError || !group) {
    return res.status(404).json({ message: 'Group not found' });
  }

  if (group.created_by !== currentUserId) {
    return res.status(403).json({ message: 'Only group creator can delete the group' });
  }

  // Delete group (cascading will delete messages and members)
  const { error } = await supabase
    .from('chat_groups')
    .delete()
    .eq('id', groupId);

  if (error) {
    throw new Error('Failed to delete group: ' + error.message);
  }

  res.json({ message: 'Group deleted successfully' });
});