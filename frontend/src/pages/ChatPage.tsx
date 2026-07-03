import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  MessageCircle, 
  Users, 
  Plus, 
  Send, 
  Search, 
  UserPlus, 
  Settings,
  Crown,
  Info
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { chatAPI } from '../services/api';
import { ChatContact, ChatGroup, PrivateMessage, GroupMessage } from '../types';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import Alert from '../components/ui/Alert';
import Modal from '../components/ui/Modal';
import UserProfileModal from '../components/chat/UserProfileModal';

type ChatType = 'private' | 'group';

interface ActiveChat {
  type: ChatType;
  id: string;
  name: string;
  college?: string;
  memberCount?: number;
  isCreator?: boolean;
}

interface SearchUser {
  id: string;
  name: string;
  college: string;
  email: string;
}

interface GroupMember {
  id: string;
  name: string;
  college: string;
  joinedAt: string;
}

const ChatPage: React.FC = () => {
  const { user } = useAuth();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  // State
  const [contacts, setContacts] = useState<ChatContact[]>([]);
  const [groups, setGroups] = useState<ChatGroup[]>([]);
  const [activeChat, setActiveChat] = useState<ActiveChat | null>(null);
  const [messages, setMessages] = useState<(PrivateMessage | GroupMessage)[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Modals
  const [showCreateGroup, setShowCreateGroup] = useState(false);
  const [showAddContact, setShowAddContact] = useState(false);
  const [showGroupSettings, setShowGroupSettings] = useState(false);
  const [showUserProfile, setShowUserProfile] = useState(false);
  const [selectedUser, setSelectedUser] = useState<SearchUser | null>(null);
  
  // Search states
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchUser[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  
  // Group states
  const [groupName, setGroupName] = useState('');
  const [groupDescription, setGroupDescription] = useState('');
  const [groupMembers, setGroupMembers] = useState<GroupMember[]>([]);
  const [loadingMembers, setLoadingMembers] = useState(false);

  useEffect(() => {
    fetchContacts();
    fetchGroups();
  }, []);

  useEffect(() => {
    if (messagesContainerRef.current) {
      // Scroll to bottom when messages change
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    }
  }, [messages]);

  // Search users with debouncing
  const searchUsers = useCallback(async (query: string) => {
    if (!query.trim() || query.length < 2) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    try {
      const response = await chatAPI.searchUsers(query.trim());
      setSearchResults(response.users || []);
    } catch (error) {
      console.error('Failed to search users:', error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  }, []);

  // Debounced search effect
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (showAddContact || showGroupSettings) {
        searchUsers(searchQuery);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchQuery, showAddContact, showGroupSettings, searchUsers]);

  // Fetch group members
  const fetchGroupMembers = async (groupId: string) => {
    setLoadingMembers(true);
    try {
      const response = await chatAPI.getGroupMembers(groupId);
      setGroupMembers(response.members || []);
    } catch (error) {
      console.error('Failed to fetch group members:', error);
      setError('Failed to load group members');
    } finally {
      setLoadingMembers(false);
    }
  };

  const fetchContacts = async () => {
    try {
      const response = await chatAPI.getChatContacts();
      setContacts(response.contacts || []);
    } catch (error) {
      console.error('Failed to fetch contacts:', error);
    }
  };

  const fetchGroups = async () => {
    try {
      const response = await chatAPI.getUserGroups();
      setGroups(response.groups || []);
    } catch (error) {
      console.error('Failed to fetch groups:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (chat: ActiveChat) => {
    setMessagesLoading(true);
    try {
      let response;
      if (chat.type === 'private') {
        response = await chatAPI.getPrivateMessages(chat.id);
      } else {
        response = await chatAPI.getGroupMessages(chat.id);
      }
      // Sort messages by createdAt to ensure proper order
      const sortedMessages = [...(response.messages || [])].sort((a, b) => 
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      );
      setMessages(sortedMessages);
    } catch (error) {
      console.error('Failed to fetch messages:', error);
      setError('Failed to load messages');
    } finally {
      setMessagesLoading(false);
    }
  };

  const handleChatSelect = (chat: ActiveChat) => {
    setActiveChat(chat);
    setMessages([]);
    setError(null);
    fetchMessages(chat);
    
    // If it's a group chat, also fetch members for settings
    if (chat.type === 'group') {
      fetchGroupMembers(chat.id);
    }
  };

  const handleSendMessage = async () => {
    if (!activeChat || !newMessage.trim() || sending) return;

    setSending(true);
    try {
      let response;
      if (activeChat.type === 'private') {
        response = await chatAPI.sendPrivateMessage(activeChat.id, newMessage.trim());
      } else {
        response = await chatAPI.sendGroupMessage(activeChat.id, newMessage.trim());
      }
      
      setMessages(prev => {
        const updatedMessages = [...prev, response.data];
        // Sort messages by createdAt to ensure proper order
        return updatedMessages.sort((a, b) => 
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        );
      });
      setNewMessage('');
    } catch (error) {
      console.error('Failed to send message:', error);
      setError('Failed to send message');
    } finally {
      setSending(false);
    }
  };

  const handleCreateGroup = async () => {
    if (!groupName.trim()) return;

    try {
      const response = await chatAPI.createGroup(groupName.trim(), groupDescription.trim());
      setGroups(prev => [response.group, ...prev]);
      setGroupName('');
      setGroupDescription('');
      setShowCreateGroup(false);
    } catch (error) {
      console.error('Failed to create group:', error);
      setError('Failed to create group');
    }
  };

  const handleAddContact = async (userId: string) => {
    try {
      // Send a message to start conversation
      await chatAPI.sendPrivateMessage(userId, 'Hi! 👋');
      await fetchContacts();
      setSearchQuery('');
      setSearchResults([]);
      setShowAddContact(false);
    } catch (error) {
      console.error('Failed to start conversation:', error);
      setError('Failed to start conversation. Please try again.');
    }
  };

  const handleAddGroupMember = async (userId: string) => {
    if (!activeChat || activeChat.type !== 'group') return;

    try {
      await chatAPI.addGroupMember(activeChat.id, userId);
      await fetchGroupMembers(activeChat.id);
      setSearchQuery('');
      setSearchResults([]);
      setError(null);
    } catch (error) {
      console.error('Failed to add member:', error);
      setError('Failed to add member to group');
    }
  };

  const handleRemoveGroupMember = async (userId: string) => {
    if (!activeChat || activeChat.type !== 'group') return;

    try {
      await chatAPI.removeGroupMember(activeChat.id, userId);
      await fetchGroupMembers(activeChat.id);
      setError(null);
    } catch (error) {
      console.error('Failed to remove member:', error);
      setError('Failed to remove member from group');
    }
  };

  const handleViewUserProfile = (userData: SearchUser) => {
    setSelectedUser(userData);
    setShowUserProfile(true);
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <Card padding="lg" className="text-center max-w-md mx-auto">
          <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <MessageCircle className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Sign In Required</h2>
          <p className="text-gray-600">Please sign in to access the chat system and connect with other students.</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-8 min-h-screen bg-gradient-to-br from-blue-50/30 via-white to-purple-50/30">
      {/* Enhanced Header */}
      <div className="mb-8 animate-fade-in-up">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent mb-2">
              Messages
            </h1>
            <p className="text-gray-600 text-lg">Connect with other students and share knowledge</p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-right">
              <p className="text-sm font-medium text-gray-900">{user.name}</p>
              <p className="text-xs text-gray-500">{user.college}</p>
            </div>
            <div className="relative group">
              <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                <span className="text-white font-medium text-lg">
                  {user.name.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white shadow-sm"></div>
            </div>
          </div>
        </div>
      </div>

      {error && (
        <Alert type="error" dismissible onDismiss={() => setError(null)} className="mb-6">
          {error}
        </Alert>
      )}

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-[700px] animate-slide-up">
          {/* Enhanced Sidebar with Glass Morphism */}
          <div className="lg:col-span-1">
            <div className="relative h-full">
              {/* Background Glass Effect */}
              <div className="absolute inset-0 bg-white/80 backdrop-blur-xl border border-white/20 shadow-2xl rounded-2xl"></div>
              
              <div className="relative h-full flex flex-col overflow-hidden rounded-2xl">
                {/* Header with Actions */}
                <div className="p-6 border-b border-gray-200/60 bg-gradient-to-r from-primary-50/80 to-secondary-50/80 backdrop-blur-sm">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-bold text-gray-900 flex items-center space-x-2">
                      <MessageCircle className="w-6 h-6 text-primary-500" />
                      <span>Chats</span>
                    </h2>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => setShowAddContact(true)}
                        className="p-2 rounded-xl bg-white/70 hover:bg-white transition-all duration-300 hover:scale-110 shadow-sm hover:shadow-md group"
                        title="Start New Chat"
                      >
                        <UserPlus className="w-5 h-5 text-primary-600 group-hover:scale-110 transition-transform" />
                      </button>
                      <button
                        onClick={() => setShowCreateGroup(true)}
                        className="p-2 rounded-xl bg-white/70 hover:bg-white transition-all duration-300 hover:scale-110 shadow-sm hover:shadow-md group"
                        title="Create Group"
                      >
                        <Plus className="w-5 h-5 text-secondary-600 group-hover:scale-110 transition-transform" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Chat List */}
                <div className="flex-1 overflow-y-auto scrollbar-custom">
                  {loading ? (
                    <div className="flex justify-center items-center py-8">
                      <LoadingSpinner size="sm" />
                    </div>
                  ) : (
                    <div className="space-y-2 p-4">
                      {/* Private Chats */}
                      {contacts.map(contact => (
                        <div
                          key={`private-${contact.id}`}
                          className={`group p-4 cursor-pointer rounded-xl transition-all duration-300 flex items-center space-x-3 ${
                            activeChat?.type === 'private' && activeChat?.id === contact.id
                              ? 'bg-gradient-to-r from-primary-100/80 to-secondary-100/80 border-2 border-primary-200/60 shadow-lg backdrop-blur-sm'
                              : 'hover:bg-white/70 hover:shadow-sm hover:-translate-y-0.5'
                          }`}
                          onClick={() => handleChatSelect({
                            type: 'private',
                            id: contact.id,
                            name: contact.name,
                            college: contact.college
                          })}
                        >
                          <div className="relative">
                            <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-xl flex items-center justify-center shadow-md group-hover:scale-110 transition-transform duration-300">
                              <span className="text-white font-medium">
                                {contact.name.charAt(0).toUpperCase()}
                              </span>
                            </div>
                            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white shadow-sm"></div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-gray-900 truncate group-hover:text-primary-600 transition-colors">
                              {contact.name}
                            </p>
                            <p className="text-xs text-gray-500 truncate">
                              {contact.college}
                            </p>
                          </div>
                          <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                            <MessageCircle className="w-4 h-4 text-primary-500" />
                          </div>
                        </div>
                      ))}

                      {/* Group Chats */}
                      {groups.map(group => (
                        <div
                          key={`group-${group.id}`}
                          className={`group p-4 cursor-pointer rounded-xl transition-all duration-300 flex items-center space-x-3 ${
                            activeChat?.type === 'group' && activeChat?.id === group.id
                              ? 'bg-gradient-to-r from-green-100/80 to-blue-100/80 border-2 border-green-200/60 shadow-lg backdrop-blur-sm'
                              : 'hover:bg-white/70 hover:shadow-sm hover:-translate-y-0.5'
                          }`}
                          onClick={() => handleChatSelect({
                            type: 'group',
                            id: group.id,
                            name: group.name,
                            memberCount: group.memberCount,
                            isCreator: group.createdBy === user.id
                          })}
                        >
                          <div className="relative">
                            <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-blue-500 rounded-xl flex items-center justify-center shadow-md group-hover:scale-110 transition-transform duration-300">
                              <Users className="w-6 h-6 text-white" />
                            </div>
                            {group.createdBy === user.id && (
                              <div className="absolute -top-1 -right-1 w-5 h-5 bg-yellow-500 rounded-full border-2 border-white shadow-sm flex items-center justify-center">
                                <Crown className="w-3 h-3 text-white" />
                              </div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center space-x-2">
                              <p className="text-sm font-semibold text-gray-900 truncate group-hover:text-green-600 transition-colors">
                                {group.name}
                              </p>
                            </div>
                            <p className="text-xs text-gray-500 truncate">
                              {group.memberCount} member{group.memberCount !== 1 ? 's' : ''}
                            </p>
                          </div>
                          <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                            <Users className="w-4 h-4 text-green-500" />
                          </div>
                        </div>
                      ))}

                      {contacts.length === 0 && groups.length === 0 && (
                        <div className="text-center py-12 text-gray-500">
                          <div className="w-20 h-20 bg-gradient-to-br from-primary-100 to-secondary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <MessageCircle className="w-10 h-10 text-primary-400" />
                          </div>
                          <p className="text-lg font-medium text-gray-700 mb-2">No chats yet</p>
                          <p className="text-sm text-gray-500 mb-4">Start a conversation!</p>
                          <button
                            onClick={() => setShowAddContact(true)}
                            className="inline-flex items-center space-x-2 bg-gradient-to-r from-primary-500 to-secondary-500 text-white px-4 py-2 rounded-xl font-medium hover:from-primary-600 hover:to-secondary-600 transition-all duration-300 shadow-lg hover:shadow-xl"
                          >
                            <UserPlus className="w-4 h-4" />
                            <span>Find People</span>
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Enhanced Chat Area with Glass Morphism */}
          <div className="lg:col-span-3">
            <div className="relative h-full">
              {/* Background Glass Effect */}
              <div className="absolute inset-0 bg-white/90 backdrop-blur-xl border border-white/20 shadow-2xl rounded-2xl"></div>
              
              <div className="relative h-full flex flex-col overflow-hidden rounded-2xl">
                {activeChat ? (
                  <>
                    {/* Enhanced Chat Header */}
                    <div className="p-6 border-b border-gray-200/60 bg-gradient-to-r from-white/80 to-gray-50/80 backdrop-blur-sm">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="relative">
                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg ${
                              activeChat.type === 'private'
                                ? 'bg-gradient-to-br from-primary-500 to-secondary-500'
                                : 'bg-gradient-to-br from-green-500 to-blue-500'
                            }`}>
                              {activeChat.type === 'private' ? (
                                <span className="text-white font-bold text-lg">
                                  {activeChat.name.charAt(0).toUpperCase()}
                                </span>
                              ) : (
                                <Users className="w-6 h-6 text-white" />
                              )}
                            </div>
                            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white shadow-sm"></div>
                          </div>
                          <div>
                            <div className="flex items-center space-x-2">
                              <h3 className="text-xl font-bold text-gray-900">{activeChat.name}</h3>
                              {activeChat.type === 'group' && activeChat.isCreator && (
                                <div className="flex items-center space-x-1 bg-yellow-100 px-2 py-1 rounded-full" title="You are the admin">
                                  <Crown className="w-4 h-4 text-yellow-600" />
                                  <span className="text-xs font-medium text-yellow-700">Admin</span>
                                </div>
                              )}
                            </div>
                            {activeChat.college && (
                              <p className="text-sm text-gray-600 mt-1">{activeChat.college}</p>
                            )}
                            {activeChat.type === 'group' && activeChat.memberCount && (
                              <p className="text-sm text-gray-500 flex items-center space-x-1">
                                <Users className="w-4 h-4" />
                                <span>{activeChat.memberCount} member{activeChat.memberCount !== 1 ? 's' : ''}</span>
                              </p>
                            )}
                          </div>
                        </div>
                        
                        {/* Chat Actions */}
                        <div className="flex items-center space-x-2">
                          {activeChat.type === 'group' && (
                            <button
                              onClick={() => setShowGroupSettings(true)}
                              className="p-3 rounded-xl bg-white/70 hover:bg-white transition-all duration-300 hover:scale-110 shadow-sm hover:shadow-md group"
                              title="Group Settings"
                            >
                              <Settings className="w-5 h-5 text-gray-600 group-hover:text-primary-600 transition-colors" />
                            </button>
                          )}
                          <button
                            className="p-3 rounded-xl bg-white/70 hover:bg-white transition-all duration-300 hover:scale-110 shadow-sm hover:shadow-md group"
                            title="Chat Info"
                          >
                            <Info className="w-5 h-5 text-gray-600 group-hover:text-blue-600 transition-colors" />
                          </button>
                        </div>
                      </div>
                    </div>

                  {/* Enhanced Messages Area with Scrollable Container */}
                  <div 
                    ref={messagesContainerRef}
                    className="flex-1 overflow-y-auto p-6 space-y-4 scrollbar-custom bg-pattern-dots bg-opacity-5"
                    style={{ maxHeight: 'calc(100% - 180px)' }}
                  >
                    {messagesLoading ? (
                      <div className="flex justify-center items-center py-12">
                        <LoadingSpinner size="lg" text="Loading messages..." />
                      </div>
                    ) : messages.length > 0 ? (
                      <>
                        {messages.map(message => {
                          const isOwnMessage = message.senderId === user.id;
                          return (
                            <div
                              key={message.id}
                              className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'} animate-fade-in-up`}
                            >
                              <div className="flex items-end space-x-2 max-w-xs lg:max-w-md group">
                                {!isOwnMessage && (
                                  <div 
                                    className="w-8 h-8 bg-gradient-to-br from-gray-400 to-gray-500 rounded-full flex items-center justify-center shadow-sm cursor-pointer hover:scale-110 transition-transform"
                                    onClick={() => handleViewUserProfile({
                                      id: message.senderId,
                                      name: message.senderName,
                                      college: message.senderCollege || '',
                                      email: ''
                                    })}
                                  >
                                    <span className="text-white font-medium text-xs">
                                      {message.senderName?.charAt(0).toUpperCase()}
                                    </span>
                                  </div>
                                )}
                                
                                <div className="relative">
                                  {/* Message Bubble */}
                                  <div
                                    className={`px-6 py-4 rounded-2xl shadow-lg transition-all duration-300 group-hover:shadow-xl ${
                                      isOwnMessage
                                        ? 'bg-gradient-to-r from-primary-500 to-secondary-500 text-white rounded-br-md'
                                        : 'bg-white text-gray-900 border border-gray-200/60 rounded-bl-md backdrop-blur-sm'
                                    }`}
                                  >
                                    {!isOwnMessage && activeChat.type === 'group' && (
                                      <p 
                                        className={`text-xs font-semibold mb-2 cursor-pointer hover:underline ${
                                          isOwnMessage ? 'text-primary-100' : 'text-gray-600'
                                        }`}
                                        onClick={() => handleViewUserProfile({
                                          id: message.senderId,
                                          name: message.senderName,
                                          college: message.senderCollege || '',
                                          email: ''
                                        })}
                                      >
                                        {message.senderName}
                                      </p>
                                    )}
                                    <p className="text-sm leading-relaxed">{message.content}</p>
                                    <p className={`text-xs mt-2 ${
                                      isOwnMessage ? 'text-primary-100' : 'text-gray-500'
                                    }`}>
                                      {formatTime(message.createdAt)}
                                    </p>
                                  </div>
                                  
                                  {/* Message Status */}
                                  {isOwnMessage && (
                                    <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border border-white shadow-sm"></div>
                                  )}
                                </div>
                                
                                {isOwnMessage && (
                                  <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-full flex items-center justify-center shadow-sm">
                                    <span className="text-white font-medium text-xs">
                                      {user.name.charAt(0).toUpperCase()}
                                    </span>
                                  </div>
                                )}
                              </div>
                            </div>
                          );
                        })}
                        <div ref={messagesEndRef} />
                      </>
                    ) : (
                      <div className="text-center py-20 text-gray-500 animate-fade-in">
                        <div className="w-24 h-24 bg-gradient-to-br from-primary-100 to-secondary-100 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                          <MessageCircle className="w-12 h-12 text-primary-500" />
                        </div>
                        <p className="text-xl font-semibold text-gray-700 mb-2">No messages yet</p>
                        <p className="text-gray-500">Send the first message to start the conversation!</p>
                      </div>
                    )}
                  </div>

                  {/* Enhanced Message Input */}
                  <div className="p-6 border-t border-gray-200/60 bg-gradient-to-r from-white/90 to-gray-50/90 backdrop-blur-sm">
                    <div className="flex space-x-4">
                      <div className="flex-1 relative">
                        <Input
                          placeholder="Type your message..."
                          value={newMessage}
                          onChange={(e) => setNewMessage(e.target.value)}
                          onKeyPress={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                              e.preventDefault();
                              handleSendMessage();
                            }
                          }}
                          className="rounded-2xl border-gray-300/60 focus:border-primary-500 focus:ring-primary-500 pr-12 py-4 text-base shadow-sm"
                        />
                        {/* Typing indicator placeholder */}
                        {newMessage && (
                          <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                          </div>
                        )}
                      </div>
                      <button
                        onClick={handleSendMessage}
                        disabled={!newMessage.trim() || sending}
                        className={`p-4 rounded-2xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed ${
                          newMessage.trim() 
                            ? 'bg-gradient-to-r from-primary-500 to-secondary-500 hover:from-primary-600 hover:to-secondary-600' 
                            : 'bg-gray-300'
                        }`}
                      >
                        {sending ? (
                          <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        ) : (
                          <Send className="w-6 h-6 text-white" />
                        )}
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center text-gray-500 p-8">
                  <div className="text-center animate-fade-in">
                    <div className="w-32 h-32 bg-gradient-to-br from-primary-100 to-secondary-100 rounded-full flex items-center justify-center mx-auto mb-8 shadow-xl">
                      <MessageCircle className="w-16 h-16 text-primary-500" />
                    </div>
                    <p className="text-2xl font-bold text-gray-700 mb-3">Welcome to Messages</p>
                    <p className="text-gray-500 mb-8 max-w-md">Select a chat to start messaging or create a new conversation to connect with other students</p>
                    <div className="flex flex-col sm:flex-row justify-center space-y-3 sm:space-y-0 sm:space-x-4">
                      <button
                        onClick={() => setShowAddContact(true)}
                        className="inline-flex items-center space-x-2 bg-gradient-to-r from-primary-500 to-secondary-500 text-white px-6 py-3 rounded-xl font-semibold hover:from-primary-600 hover:to-secondary-600 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
                      >
                        <UserPlus className="w-5 h-5" />
                        <span>Find People</span>
                      </button>
                      <button
                        onClick={() => setShowCreateGroup(true)}
                        className="inline-flex items-center space-x-2 border-2 border-primary-500 text-primary-500 px-6 py-3 rounded-xl font-semibold hover:bg-primary-500 hover:text-white transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
                      >
                        <Users className="w-5 h-5" />
                        <span>Create Group</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Create Group Modal */}
        <Modal
          isOpen={showCreateGroup}
          onClose={() => {
            setShowCreateGroup(false);
            setGroupName('');
            setGroupDescription('');
          }}
          title="Create New Group"
        >
          <div className="space-y-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-white" />
              </div>
              <p className="text-gray-600">Create a group to chat with multiple students at once</p>
            </div>
            <Input
              label="Group Name"
              placeholder="Enter a name for your group"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
            />
            <Input
              label="Description (Optional)"
              placeholder="What's this group about?"
              value={groupDescription}
              onChange={(e) => setGroupDescription(e.target.value)}
            />
            <div className="flex justify-end space-x-3">
              <Button 
                variant="secondary" 
                onClick={() => {
                  setShowCreateGroup(false);
                  setGroupName('');
                  setGroupDescription('');
                }}
              >
                Cancel
              </Button>
              <Button 
                onClick={handleCreateGroup} 
                disabled={!groupName.trim()}
                className="bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600"
              >
                Create Group
              </Button>
            </div>
          </div>
        </Modal>

        {/* Enhanced Add Contact Modal */}
        <Modal
          isOpen={showAddContact}
          onClose={() => {
            setShowAddContact(false);
            setSearchQuery('');
            setSearchResults([]);
          }}
          title="Start New Conversation"
        >
          <div className="space-y-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <UserPlus className="w-8 h-8 text-white" />
              </div>
              <p className="text-gray-600">Search for students by name to start chatting</p>
            </div>
            
            <div className="relative">
              <Input
                label="Search Users"
                placeholder="Type a name to search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                leftIcon={<Search className="w-4 h-4" />}
              />
              {isSearching && (
                <div className="absolute right-3 top-9">
                  <LoadingSpinner size="sm" />
                </div>
              )}
            </div>
            
            {/* Search Results */}
            {searchResults.length > 0 && (
              <div className="max-h-60 overflow-y-auto border rounded-xl bg-gray-50">
                <div className="p-3 bg-gradient-to-r from-primary-50 to-secondary-50 border-b text-sm font-medium text-gray-700">
                  Found {searchResults.length} student{searchResults.length !== 1 ? 's' : ''}
                </div>
                {searchResults.map(user => (
                  <div
                    key={user.id}
                    className="p-4 hover:bg-white transition-colors flex items-center justify-between border-b last:border-b-0"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-full flex items-center justify-center">
                        <span className="text-white font-medium">
                          {user.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <p 
                          className="font-medium text-gray-900 cursor-pointer hover:underline"
                          onClick={() => handleViewUserProfile(user)}
                        >
                          {user.name}
                        </p>
                        <p className="text-sm text-gray-500">{user.college}</p>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => handleAddContact(user.id)}
                      leftIcon={<MessageCircle className="w-4 h-4" />}
                      className="bg-gradient-to-r from-primary-500 to-secondary-500 hover:from-primary-600 hover:to-secondary-600"
                    >
                      Chat
                    </Button>
                  </div>
                ))}
              </div>
            )}
            
            {searchQuery.length >= 2 && !isSearching && searchResults.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <Users className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p className="font-medium">No students found</p>
                <p className="text-sm">Try searching with a different name</p>
              </div>
            )}
            
            {searchQuery.length < 2 && (
              <div className="text-center py-8 text-gray-400">
                <Search className="w-12 h-12 mx-auto mb-3" />
                <p className="font-medium">Start typing to search</p>
                <p className="text-sm">Type at least 2 characters</p>
              </div>
            )}
          </div>
        </Modal>

        {/* Enhanced Group Settings Modal */}
        <Modal
          isOpen={showGroupSettings}
          onClose={() => {
            setShowGroupSettings(false);
            setSearchQuery('');
            setSearchResults([]);
          }}
          title={`Group Settings - ${activeChat?.name || ''}`}
        >
          <div className="space-y-6">
            {/* Group Info */}
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">{activeChat?.name}</h3>
              <p className="text-sm text-gray-500">{activeChat?.memberCount} members</p>
              {activeChat?.isCreator && (
                <div className="flex items-center justify-center space-x-1 mt-2">
                  <Crown className="w-4 h-4 text-yellow-500" />
                  <span className="text-sm text-yellow-600 font-medium">You are the admin</span>
                </div>
              )}
            </div>

            {/* Group Management Options */}
            {activeChat?.isCreator && (
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-4">
                <h4 className="font-medium text-gray-900 mb-3 flex items-center space-x-2">
                  <Settings className="w-4 h-4" />
                  <span>Admin Controls</span>
                </h4>
                <div className="grid grid-cols-2 gap-3">
                  <Button
                    size="sm"
                    variant="ghost"
                    className="justify-start bg-white/50 hover:bg-white"
                    leftIcon={<UserPlus className="w-4 h-4" />}
                  >
                    Add Members
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="justify-start bg-white/50 hover:bg-white"
                    leftIcon={<Settings className="w-4 h-4" />}
                  >
                    Group Settings
                  </Button>
                </div>
              </div>
            )}

            {/* Members List */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-medium text-gray-900 flex items-center space-x-2">
                  <Users className="w-4 h-4" />
                  <span>Members ({groupMembers.length})</span>
                </h4>
                {activeChat?.isCreator && (
                  <Button
                    size="sm"
                    onClick={() => {
                      setSearchQuery('');
                      setSearchResults([]);
                    }}
                    leftIcon={<UserPlus className="w-4 h-4" />}
                    className="bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600"
                  >
                    Add Member
                  </Button>
                )}
              </div>
              
              {/* Add Member Search (only for group creators) */}
              {activeChat?.isCreator && (
                <div className="mb-4">
                  <div className="relative">
                    <Input
                      placeholder="Search users to add to group..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      leftIcon={<Search className="w-4 h-4" />}
                      className="border-green-200 focus:border-green-500 focus:ring-green-500"
                    />
                    {isSearching && (
                      <div className="absolute right-3 top-3">
                        <LoadingSpinner size="sm" />
                      </div>
                    )}
                  </div>
                  
                  {/* Search Results for Adding Members */}
                  {searchResults.length > 0 && (
                    <div className="mt-3 max-h-40 overflow-y-auto border rounded-lg bg-gray-50 shadow-inner">
                      <div className="p-2 bg-gradient-to-r from-green-50 to-blue-50 border-b text-xs font-medium text-gray-700">
                        Found {searchResults.length} student{searchResults.length !== 1 ? 's' : ''}
                      </div>
                      {searchResults.map(user => {
                        const isAlreadyMember = groupMembers.some(member => member.id === user.id);
                        return (
                          <div
                            key={user.id}
                            className="p-3 hover:bg-white transition-colors flex items-center justify-between border-b last:border-b-0"
                          >
                            <div className="flex items-center space-x-3">
                              <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-full flex items-center justify-center">
                                <span className="text-white text-sm font-medium">
                                  {user.name.charAt(0).toUpperCase()}
                                </span>
                              </div>
                              <div>
                                <p 
                                  className="font-medium text-gray-900 cursor-pointer hover:underline"
                                  onClick={() => handleViewUserProfile(user)}
                                >
                                  {user.name}
                                </p>
                                <p className="text-sm text-gray-500">{user.college}</p>
                              </div>
                            </div>
                            {isAlreadyMember ? (
                              <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                                Already member
                              </span>
                            ) : (
                              <Button
                                size="sm"
                                onClick={() => handleAddGroupMember(user.id)}
                                className="bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600"
                                leftIcon={<UserPlus className="w-3 h-3" />}
                              >
                                Add
                              </Button>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                  
                  {searchQuery.length >= 2 && !isSearching && searchResults.length === 0 && (
                    <div className="mt-3 text-center py-4 text-gray-500 bg-gray-50 rounded-lg">
                      <Search className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                      <p className="text-sm font-medium">No students found</p>
                      <p className="text-xs">Try searching with a different name</p>
                    </div>
                  )}
                  
                  {searchQuery.length < 2 && searchQuery.length > 0 && (
                    <div className="mt-3 text-center py-4 text-gray-400 bg-gray-50 rounded-lg">
                      <p className="text-sm">Type at least 2 characters to search</p>
                    </div>
                  )}
                </div>
              )}

              {/* Current Members */}
              <div className="max-h-64 overflow-y-auto border rounded-lg bg-white shadow-inner">
                {loadingMembers ? (
                  <div className="flex justify-center items-center py-8">
                    <LoadingSpinner size="sm" text="Loading members..." />
                  </div>
                ) : groupMembers.length > 0 ? (
                  <>
                    {groupMembers.map((member, index) => (
                      <div
                        key={member.id}
                        className={`p-4 hover:bg-gray-50 transition-colors flex items-center justify-between ${
                          index !== groupMembers.length - 1 ? 'border-b border-gray-100' : ''
                        }`}
                      >
                        <div className="flex items-center space-x-3">
                          <div 
                            className="w-10 h-10 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-full flex items-center justify-center shadow-sm cursor-pointer hover:scale-110 transition-transform"
                            onClick={() => handleViewUserProfile({
                              id: member.id,
                              name: member.name,
                              college: member.college,
                              email: ''
                            })}
                          >
                            <span className="text-white font-medium">
                              {member.name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div>
                            <div className="flex items-center space-x-2">
                              <p 
                                className="font-medium text-gray-900 cursor-pointer hover:underline"
                                onClick={() => handleViewUserProfile({
                                  id: member.id,
                                  name: member.name,
                                  college: member.college,
                                  email: ''
                                })}
                              >
                                {member.name}
                              </p>
                              {member.id === user.id && (
                                <span className="text-xs text-primary-600 font-medium bg-primary-50 px-2 py-1 rounded-full">
                                  You
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-gray-500">{member.college}</p>
                            <p className="text-xs text-gray-400">Joined {new Date(member.joinedAt).toLocaleDateString()}</p>
                          </div>
                        </div>
                        
                        {/* Member Actions */}
                        <div className="flex items-center space-x-2">
                          {activeChat?.isCreator && member.id !== user.id && (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => {
                                if (window.confirm(`Are you sure you want to remove ${member.name} from the group?`)) {
                                  handleRemoveGroupMember(member.id);
                                }
                              }}
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                              title={`Remove ${member.name} from group`}
                            >
                              Remove
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Users className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                    <p className="font-medium">No members found</p>
                    <p className="text-sm">This shouldn't happen. Try refreshing the page.</p>
                  </div>
                )}
              </div>
            </div>

            {/* Group Actions */}
            {activeChat?.isCreator && (
              <div className="pt-4 border-t border-gray-200">
                <div className="flex justify-between items-center">
                  <div className="text-sm text-gray-600">
                    <p>As the group admin, you can manage members and settings.</p>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    onClick={async () => {
                      if (window.confirm('Are you sure you want to delete this group? This action cannot be undone.')) {
                        if (window.confirm('Are you sure you want to delete this group?')) {
                          try {
                            await chatAPI.deleteGroup(selectedGroup.id);
                            setGroups(prev => prev.filter(g => g.id !== selectedGroup.id));
                            setSelectedGroup(null);
                            setError(null);
                          } catch (err) {
                            setError('Failed to delete group');
                          }
                        }
                      }
                    }}
                  >
                    Delete Group
                  </Button>
                </div>
              </div>
            )}
          </div>
        </Modal>

        {/* User Profile Modal */}
        <UserProfileModal
          isOpen={showUserProfile}
          onClose={() => setShowUserProfile(false)}
          user={selectedUser}
          onStartChat={handleAddContact}
        />
      </div>
    
  );
};

export default ChatPage;