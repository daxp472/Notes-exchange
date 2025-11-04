import React, { useState } from 'react';
import { Flag, AlertTriangle } from 'lucide-react';
import { reportsAPI } from '../../services/api';
import Modal from './Modal';
import Button from './Button';
import Input from './Input';
import Alert from './Alert';

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  contentType: 'note' | 'comment' | 'user';
  contentId: string;
  contentTitle?: string;
}

const ReportModal: React.FC<ReportModalProps> = ({
  isOpen,
  onClose,
  contentType,
  contentId,
  contentTitle
}) => {
  const [reason, setReason] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const reasonOptions = [
    'Inappropriate content',
    'Spam or duplicate',
    'Wrong subject/category',
    'Copyright violation',
    'Offensive language',
    'Misleading information',
    'Other'
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!reason) {
      setError('Please select a reason for reporting');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await reportsAPI.createReport(contentType, contentId, reason, description);
      setSuccess(true);
      setTimeout(() => {
        onClose();
        resetForm();
      }, 2000);
    } catch (error: any) {
      setError(error.response?.data?.message || 'Failed to submit report');
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setReason('');
    setDescription('');
    setError(null);
    setSuccess(false);
  };

  const handleClose = () => {
    onClose();
    resetForm();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Report Content">
      <div className="space-y-4">
        {error && (
          <Alert type="error" dismissible onDismiss={() => setError(null)}>
            {error}
          </Alert>
        )}

        {success && (
          <Alert type="success">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="w-4 h-4" />
              <span>Report submitted successfully. Thank you for helping keep our platform safe!</span>
            </div>
          </Alert>
        )}

        {!success && (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <p className="text-sm text-gray-600 mb-4">
                You are reporting {contentType}: 
                {contentTitle && <span className="font-medium"> "{contentTitle}"</span>}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Reason for reporting *
              </label>
              <div className="space-y-2">
                {reasonOptions.map((option) => (
                  <label key={option} className="flex items-center">
                    <input
                      type="radio"
                      name="reason"
                      value={option}
                      checked={reason === option}
                      onChange={(e) => setReason(e.target.value)}
                      className="mr-2"
                    />
                    <span className="text-sm">{option}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Additional details (optional)
              </label>
              <textarea
                placeholder="Please provide more information about why you're reporting this content..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200"
              />
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <Button variant="secondary" onClick={handleClose}>
                Cancel
              </Button>
              <Button 
                type="submit" 
                loading={isSubmitting}
                leftIcon={<Flag className="w-4 h-4" />}
              >
                Submit Report
              </Button>
            </div>
          </form>
        )}
      </div>
    </Modal>
  );
};

export default ReportModal;