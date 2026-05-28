import React, { useState, useEffect } from 'react';
import { Users, Plus, Search, MessageCircle, BookOpen, UserPlus, Settings, Eye, Calendar, GraduationCap, User, Crown } from 'lucide-react';
import { socialAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import Input from '../components/ui/Input';
import Alert from '../components/ui/Alert';

interface StudyGroup {
  id: string;
  name: string;
  description: string;
  createdBy: string;
  createdByCollege: string;
  createdAt: string;
  memberCount: number;
}

interface GroupMember {
  id: string;
  name: string;
  college: string;
  contributionScore: number;
  joinedAt: string;
}

interface GroupNote {
  id: string;
  title: string;
  subject: string;
  course: string;
  fileName: string;
  addedAt: string;
}

const StudyGroupsPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [groups, setGroups] = useState<StudyGroup[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<any>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [newGroup, setNewGroup] = useState({
    name: '',
    description: ''
  });

  useEffect(() => {
    fetchGroups();
  }, []);

  const fetchGroups = async () => {
    try {
      setLoading(true);
      const data = await socialAPI.getStudyGroups();
      const rawGroups = data?.groups || data || [];
      setGroups(Array.isArray(rawGroups) ? rawGroups : []);
    } catch (error) {
      console.error('Error fetching groups:', error);
      setMessage({ type: 'error', text: 'Failed to load study groups' });
      setGroups([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchGroupDetails = async (groupId: string) => {
    try {
      const group = await socialAPI.getStudyGroup(groupId);
      setSelectedGroup(group);
    } catch (error) {
      console.error('Error fetching group details:', error);
      setMessage({ type: 'error', text: 'Failed to load group details' });
    }
  };

  const createGroup = async () => {
    if (!newGroup.name.trim()) {
      setMessage({ type: 'error', text: 'Group name is required' });
      return;
    }

    try {
      setActionLoading(true);
      await socialAPI.createStudyGroup(newGroup);
      setShowCreateForm(false);
      setNewGroup({ name: '', description: '' });
      setMessage({ type: 'success', text: 'Study group created successfully!' });
      fetchGroups();
    } catch (error) {
      console.error('Error creating group:', error);
      setMessage({ type: 'error', text: 'Failed to create study group' });
    } finally {
      setActionLoading(false);
    }
  };

  const joinGroup = async (groupId: string) => {
    try {
      setActionLoading(true);
      await socialAPI.joinStudyGroup(groupId);
      setMessage({ type: 'success', text: 'Successfully joined the group!' });
      fetchGroups();
      if (selectedGroup?.id === groupId) {
        fetchGroupDetails(groupId);
      }
    } catch (error) {
      console.error('Error joining group:', error);
      setMessage({ type: 'error', text: 'Failed to join group' });
    } finally {
      setActionLoading(false);
    }
  };

  const leaveGroup = async (groupId: string) => {
    try {
      setActionLoading(true);
      await socialAPI.leaveStudyGroup(groupId);
      setMessage({ type: 'success', text: 'Left the group successfully' });
      fetchGroups();
      if (selectedGroup?.id === groupId) {
        setSelectedGroup(null);
      }
    } catch (error) {
      console.error('Error leaving group:', error);
      setMessage({ type: 'error', text: 'Failed to leave group' });
    } finally {
      setActionLoading(false);
    }
  };

  const safeGroups = Array.isArray(groups) ? groups : [];
  const filteredGroups = safeGroups.filter(group =>
    (group.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (group.description || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <LoadingSpinner size="lg" text="Loading study groups..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {message && (
          <Alert
            type={message.type}
            dismissible
            onDismiss={() => setMessage(null)}
          >
            {message.text}
          </Alert>
        )}

        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
              Study Groups
            </h1>
            <p className="text-gray-600 mt-2">Collaborate and learn together with your peers</p>
          </div>
          <Button
            onClick={() => setShowCreateForm(true)}
            leftIcon={<Plus className="w-5 h-5" />}
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
          >
            Create Group
          </Button>
        </div>

        {/* Search */}
        <Card padding="md" className="backdrop-blur-sm bg-white/80">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search study groups..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/50 backdrop-blur-sm"
            />
          </div>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Groups List */}
          <div className="lg:col-span-2">
            <Card padding="lg" className="backdrop-blur-sm bg-white/80">
              <h2 className="text-2xl font-semibold mb-6 text-gray-900">Available Groups</h2>
              
              {filteredGroups.length === 0 ? (
                <div className="text-center py-16">
                  <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Users className="w-10 h-10 text-gray-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">No Study Groups Found</h3>
                  <p className="text-gray-600 mb-6">Be the first to create a study group for your course</p>
                  <Button
                    onClick={() => setShowCreateForm(true)}
                    leftIcon={<Plus className="w-4 h-4" />}
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                  >
                    Create First Group
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {filteredGroups.map((group) => (
                    <Card key={group.id} padding="md" className="hover:shadow-lg transition-all duration-200 border border-gray-200 hover:border-blue-300">
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                              <Users className="w-5 h-5 text-white" />
                            </div>
                            <div>
                              <h3 className="font-bold text-gray-900 text-lg">{group.name}</h3>
                              <p className="text-sm text-gray-600">{group.createdByCollege}</p>
                            </div>
                          </div>
                          <p className="text-gray-600 text-sm line-clamp-2">{group.description}</p>
                        </div>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => fetchGroupDetails(group.id)}
                          leftIcon={<Eye className="w-4 h-4" />}
                          className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                        >
                          View
                        </Button>
                      </div>
                      
                      <div className="flex justify-between items-center pt-4 border-t border-gray-100">
                        <div className="flex items-center space-x-4 text-sm text-gray-600">
                          <div className="flex items-center space-x-1">
                            <Users className="w-4 h-4" />
                            <span>{group.memberCount} members</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Calendar className="w-4 h-4" />
                            <span>{new Date(group.createdAt).toLocaleDateString()}</span>
                          </div>
                        </div>
                        <Button
                          size="sm"
                          onClick={() => joinGroup(group.id)}
                          loading={actionLoading}
                          leftIcon={<UserPlus className="w-4 h-4" />}
                          className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
                        >
                          Join
                        </Button>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </Card>
          </div>

          {/* Group Details */}
          <div>
            <Card padding="lg" className="backdrop-blur-sm bg-white/80 sticky top-8">
              <h2 className="text-xl font-semibold mb-6 text-gray-900">Group Details</h2>
              
              {selectedGroup ? (
                <div className="space-y-6">
                  {/* Group Header */}
                  <div className="text-center pb-6 border-b border-gray-200">
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Users className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900">{selectedGroup.name}</h3>
                    <p className="text-gray-600 text-sm mt-2">{selectedGroup.description}</p>
                    <div className="flex items-center justify-center space-x-4 mt-4 text-sm text-gray-600">
                      <div className="flex items-center space-x-1">
                        <Users className="w-4 h-4" />
                        <span>{selectedGroup.members?.length || 0} members</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <BookOpen className="w-4 h-4" />
                        <span>{selectedGroup.notes?.length || 0} notes</span>
                      </div>
                    </div>
                  </div>

                  {/* Members */}
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3 flex items-center space-x-2">
                      <Users className="w-4 h-4" />
                      <span>Members</span>
                    </h4>
                    <div className="space-y-2 max-h-40 overflow-y-auto">
                      {selectedGroup.members?.map((member: GroupMember) => (
                        <div key={member.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                              <User className="w-4 h-4 text-white" />
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-900">{member.name}</p>
                              <p className="text-xs text-gray-600">{member.college}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                              {member.contributionScore} pts
                            </div>
                          </div>
                        </div>
                      )) || (
                        <p className="text-sm text-gray-500 text-center py-4">No members to show</p>
                      )}
                    </div>
                  </div>

                  {/* Shared Notes */}
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3 flex items-center space-x-2">
                      <BookOpen className="w-4 h-4" />
                      <span>Shared Notes</span>
                    </h4>
                    <div className="space-y-2 max-h-32 overflow-y-auto">
                      {selectedGroup.notes?.map((note: GroupNote) => (
                        <div key={note.id} className="p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                          <p className="text-sm font-medium text-gray-900">{note.title}</p>
                          <p className="text-xs text-gray-600">{note.subject} • {note.course}</p>
                        </div>
                      )) || (
                        <p className="text-sm text-gray-500 text-center py-4">No notes shared yet</p>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="space-y-3 pt-6 border-t border-gray-200">
                    <Button
                      onClick={() => navigate(`/chat/groups/${selectedGroup.id}`)}
                      leftIcon={<MessageCircle className="w-4 h-4" />}
                      className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white"
                    >
                      Open Group Chat
                    </Button>
                    <Button
                      variant="secondary"
                      leftIcon={<BookOpen className="w-4 h-4" />}
                      className="w-full border-2 border-blue-200 hover:border-blue-300 text-blue-600 hover:text-blue-700"
                    >
                      Add Notes
                    </Button>
                    {user && selectedGroup.createdBy === user.id ? (
                      <Button
                        variant="ghost"
                        leftIcon={<Settings className="w-4 h-4" />}
                        className="w-full text-gray-600 hover:text-gray-700 border border-gray-300 hover:border-gray-400"
                      >
                        Manage Group
                      </Button>
                    ) : (
                      <Button
                        variant="ghost"
                        onClick={() => leaveGroup(selectedGroup.id)}
                        loading={actionLoading}
                        className="w-full text-red-600 hover:text-red-700 border border-red-300 hover:border-red-400"
                      >
                        Leave Group
                      </Button>
                    )}
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Eye className="w-8 h-8 text-gray-400" />
                  </div>
                  <p className="text-gray-500">Select a group to view details</p>
                </div>
              )}
            </Card>
          </div>
        </div>

        {/* Create Group Modal */}
        <Modal
          isOpen={showCreateForm}
          onClose={() => {
            setShowCreateForm(false);
            setNewGroup({ name: '', description: '' });
          }}
          title="Create Study Group"
          size="md"
        >
          <div className="space-y-6">
            <Input
              label="Group Name"
              placeholder="Enter group name"
              value={newGroup.name}
              onChange={(e) => setNewGroup(prev => ({ ...prev, name: e.target.value }))}
              leftIcon={<Users className="w-4 h-4" />}
              required
            />
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                placeholder="Describe your study group..."
                value={newGroup.description}
                onChange={(e) => setNewGroup(prev => ({ ...prev, description: e.target.value }))}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                rows={4}
              />
            </div>
            <div className="flex space-x-4">
              <Button
                variant="ghost"
                onClick={() => {
                  setShowCreateForm(false);
                  setNewGroup({ name: '', description: '' });
                }}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={createGroup}
                loading={actionLoading}
                disabled={!newGroup.name.trim()}
                className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              >
                Create Group
              </Button>
            </div>
          </div>
        </Modal>
      </div>
    </div>
  );    
                        // </span>
//                         </div>
//                         <button
//                           onClick={() => joinGroup(group.id)}
//                           className="flex items-center space-x-1 bg-indigo-600 text-white px-3 py-1 rounded-lg hover:bg-indigo-700 transition-colors text-sm"
//                         >
//                           <UserPlus className="w-4 h-4" />
//                           <span>Join</span>
//                         </button>
//                       </div>
                      
//                       <div className="mt-3 pt-3 border-t border-gray-200">
//                         <p className="text-xs text-gray-500">
//                           Created by {group.createdBy} • {new Date(group.createdAt).toLocaleDateString()}
//                         </p>
//                       </div>
//                     </div>
//                   ))}
//                 </div>
//               )}
//             </div>
//           </div>

//           {/* Group Details */}
//           <div>
//             <div className="glass-card p-6">
//               <h2 className="text-xl font-semibold mb-4">Group Details</h2>
              
//               {selectedGroup ? (
//                 <div className="space-y-4">
//                   <div>
//                     <h3 className="font-semibold text-lg">{selectedGroup.name}</h3>
//                     <p className="text-gray-600 text-sm">{selectedGroup.description}</p>
//                   </div>

//                   {/* Members */}
//                   <div>
//                     <h4 className="font-medium text-gray-800 mb-2">Members ({selectedGroup.members?.length || 0})</h4>
//                     <div className="space-y-2 max-h-32 overflow-y-auto">
//                       {selectedGroup.members?.map((member: GroupMember) => (
//                         <div key={member.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
//                           <div>
//                             <p className="text-sm font-medium">{member.name}</p>
//                             <p className="text-xs text-gray-600">{member.college}</p>
//                           </div>
//                           <span className="text-xs bg-indigo-100 text-indigo-800 px-2 py-1 rounded">
//                             {member.contributionScore} pts
//                           </span>
//                         </div>
//                       ))}
//                     </div>
//                   </div>

//                   {/* Shared Notes */}
//                   <div>
//                     <h4 className="font-medium text-gray-800 mb-2">Shared Notes ({selectedGroup.notes?.length || 0})</h4>
//                     <div className="space-y-2 max-h-32 overflow-y-auto">
//                       {selectedGroup.notes?.map((note: GroupNote) => (
//                         <div key={note.id} className="p-2 bg-gray-50 rounded">
//                           <p className="text-sm font-medium">{note.title}</p>
//                           <p className="text-xs text-gray-600">{note.subject} • {note.course}</p>
//                         </div>
//                       ))}
//                     </div>
//                   </div>

//                   {/* Actions */}
//                   <div className="space-y-2 pt-4 border-t">
//                     <button className="w-full flex items-center justify-center space-x-2 bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition-colors">
//                       <MessageCircle className="w-4 h-4" />
//                       <span>Open Chat</span>
//                     </button>
//                     <button className="w-full flex items-center justify-center space-x-2 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors">
//                       <BookOpen className="w-4 h-4" />
//                       <span>Add Notes</span>
//                     </button>
//                   </div>
//                 </div>
//               ) : (
//                 <p className="text-gray-500 text-sm">Select a group to view details</p>
//               )}
//             </div>
//           </div>
//         </div>

//         {/* Create Group Modal */}
//         {showCreateForm && (
//           <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
//             <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
//               <h2 className="text-xl font-semibold mb-4">Create Study Group</h2>
//               <div className="space-y-4">
//                 <input
//                   type="text"
//                   placeholder="Group Name"
//                   value={newGroup.name}
//                   onChange={(e) => setNewGroup(prev => ({ ...prev, name: e.target.value }))}
//                   className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
//                 />
//                 <textarea
//                   placeholder="Description"
//                   value={newGroup.description}
//                   onChange={(e) => setNewGroup(prev => ({ ...prev, description: e.target.value }))}
//                   className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
//                   rows={3}
//                 />
//               </div>
//               <div className="flex space-x-3 mt-6">
//                 <button
//                   onClick={() => setShowCreateForm(false)}
//                   className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
//                 >
//                   Cancel
//                 </button>
//                 <button
//                   onClick={createGroup}
//                   className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
//                 >
//                   Create Group
//                 </button>
//               </div>
//             </div>
//           </div>
//         )}
//       </div>
//     </div>
//   );
};

export default StudyGroupsPage;