import React from 'react';
import { User, MessageCircle } from 'lucide-react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: {
    id: string;
    name: string;
    college: string;
    email?: string;
  } | null;
  onStartChat: (userId: string) => void;
}

const UserProfileModal: React.FC<UserProfileModalProps> = ({ 
  isOpen, 
  onClose, 
  user,
  onStartChat
}) => {
  if (!user) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="User Profile"
    >
      <div className="space-y-6">
        <div className="text-center">
          <div className="w-20 h-20 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-white font-bold text-2xl">
              {user.name.charAt(0).toUpperCase()}
            </span>
          </div>
          <h3 className="text-xl font-bold text-gray-900">{user.name}</h3>
          <p className="text-gray-600">{user.college}</p>
        </div>
        
        <div className="bg-gray-50 rounded-xl p-4">
          <div className="flex items-center space-x-3 mb-3">
            <User className="w-5 h-5 text-gray-500" />
            <span className="font-medium text-gray-900">User Information</span>
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">Name:</span>
              <span className="font-medium">{user.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">College:</span>
              <span className="font-medium">{user.college}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">User ID:</span>
              <span className="font-mono text-xs">{user.id}</span>
            </div>
          </div>
        </div>
        
        <div className="flex justify-center">
          <Button
            onClick={() => {
              onStartChat(user.id);
              onClose();
            }}
            className="bg-gradient-to-r from-primary-500 to-secondary-500 hover:from-primary-600 hover:to-secondary-600"
            leftIcon={<MessageCircle className="w-4 h-4" />}
          >
            Start Chat
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default UserProfileModal;