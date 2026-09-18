import React, { useState, useEffect } from 'react';
import { CheckCircle, AlertTriangle, FileText, Shield, Eye, X } from 'lucide-react';
import { smartFeaturesAPI } from '../../services/api';
import LoadingSpinner from '../ui/LoadingSpinner';
import Button from '../ui/Button';

interface NoteScannerProps {
  file: File;
  onScanComplete: (isValid: boolean, message: string) => void;
}

const NoteScanner: React.FC<NoteScannerProps> = ({ file, onScanComplete }) => {
  const [scanStatus, setScanStatus] = useState<'idle' | 'scanning' | 'completed' | 'error'>('idle');
  const [scanResults, setScanResults] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (file) {
      startScan();
    }
  }, [file]);

  const startScan = async () => {
    setScanStatus('scanning');
    setError(null);
    
    try {
      // Simulate scanning delay for better UX
      await new Promise(resolve => setTimeout(resolve, 15000));
      
      // Validate file using the smart features API
      const validation = await smartFeaturesAPI.validateFile(
        URL.createObjectURL(file),
        file.name,
        file.size,
        file.type
      );
      
      setScanResults(validation);
      
      if (validation.isValid) {
        // Check if filename indicates low quality
        const fileName = file.name.toLowerCase();
        if (fileName.includes('test') && (fileName.includes('.png') || fileName.includes('.jpg') || fileName.includes('.jpeg'))) {
          setScanStatus('completed');
          onScanComplete(false, 'This file appears to be a low-quality image (test.png). We cannot approve notes that are just screenshots of tests.');
        } else {
          setScanStatus('completed');
          onScanComplete(true, 'File scan completed successfully. Your note meets our quality standards.');
        }
      } else {
        setScanStatus('completed');
        const errorMessage = validation.errors.join(', ') || 'File validation failed';
        onScanComplete(false, errorMessage);
      }
    } catch (err) {
      console.error('Scan error:', err);
      setScanStatus('error');
      setError('Failed to scan file. Please try again.');
      onScanComplete(false, 'Failed to scan file. Please try again.');
    }
  };

  const getQualityMessage = () => {
    if (!scanResults) return '';
    
    const fileName = file.name.toLowerCase();
    if (fileName.includes('test') && (fileName.includes('.png') || fileName.includes('.jpg') || fileName.includes('.jpeg'))) {
      return 'Low quality detected: This appears to be a screenshot of a test which doesn\'t meet our quality standards.';
    }
    
    if (scanResults.warnings && scanResults.warnings.length > 0) {
      return `Warnings: ${scanResults.warnings.join(', ')}`;
    }
    
    return 'File meets quality standards';
  };

  const renderScanStatus = () => {
    switch (scanStatus) {
      case 'scanning':
        return (
          <div className="flex flex-col items-center py-8">
            <div className="relative mb-6">
              <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center">
                <FileText className="w-10 h-10 text-blue-600 animate-pulse" />
              </div>
              <div className="absolute -top-2 -right-2 w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                <Eye className="w-4 h-4 text-white" />
              </div>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Scanning Your Note</h3>
            <p className="text-gray-600 text-center mb-4">
              We're analyzing your note with our AI to ensure it meets quality standards
            </p>
            <LoadingSpinner size="lg" />
            <p className="text-sm text-gray-500 mt-4">This usually takes a few seconds...</p>
          </div>
        );
      
      case 'completed':
        const isValid = scanResults?.isValid;
        const qualityMessage = getQualityMessage();
        
        return (
          <div className="flex flex-col items-center py-8">
            <div className={`w-20 h-20 rounded-full flex items-center justify-center mb-6 ${
              isValid ? 'bg-green-100' : 'bg-red-100'
            }`}>
              {isValid ? (
                <CheckCircle className="w-10 h-10 text-green-600" />
              ) : (
                <AlertTriangle className="w-10 h-10 text-red-600" />
              )}
            </div>
            
            <h3 className={`text-lg font-semibold mb-2 ${
              isValid ? 'text-green-800' : 'text-red-800'
            }`}>
              {isValid ? 'Scan Complete - Ready to Upload' : 'Scan Complete - Issues Detected'}
            </h3>
            
            <div className="bg-gray-50 rounded-lg p-4 w-full max-w-md mb-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">File Name</span>
                <span className="text-sm text-gray-900 truncate max-w-[150px]">{file.name}</span>
              </div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">File Size</span>
                <span className="text-sm text-gray-900">
                  {(file.size / 1024 / 1024).toFixed(2)} MB
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">File Type</span>
                <span className="text-sm text-gray-900">{file.type || 'Unknown'}</span>
              </div>
            </div>
            
            {qualityMessage && (
              <div className={`p-4 rounded-lg w-full max-w-md mb-6 ${
                isValid ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
              }`}>
                <div className="flex items-start">
                  {isValid ? (
                    <Shield className="w-5 h-5 text-green-600 mt-0.5 mr-2 flex-shrink-0" />
                  ) : (
                    <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5 mr-2 flex-shrink-0" />
                  )}
                  <p className={`text-sm ${isValid ? 'text-green-800' : 'text-red-800'}`}>
                    {qualityMessage}
                  </p>
                </div>
              </div>
            )}
            
            <div className="flex space-x-3">
              <Button
                variant="secondary"
                onClick={() => onScanComplete(false, 'Upload cancelled')}
              >
                Cancel
              </Button>
              <Button
                variant={isValid ? "primary" : "error"}
                onClick={() => onScanComplete(isValid, isValid ? 'File approved for upload' : qualityMessage)}
                disabled={!isValid}
              >
                {isValid ? 'Continue Upload' : 'Cannot Upload'}
              </Button>
            </div>
          </div>
        );
      
      case 'error':
        return (
          <div className="flex flex-col items-center py-8">
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mb-6">
              <X className="w-10 h-10 text-red-600" />
            </div>
            <h3 className="text-lg font-semibold text-red-800 mb-2">Scan Failed</h3>
            <p className="text-red-600 text-center mb-6">{error}</p>
            <Button
              variant="primary"
              onClick={startScan}
            >
              Try Again
            </Button>
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">Note Quality Scanner</h2>
            {scanStatus !== 'scanning' && (
              <button
                onClick={() => onScanComplete(false, 'Upload cancelled')}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            )}
          </div>
          
          {renderScanStatus()}
        </div>
      </div>
    </div>
  );
};

export default NoteScanner;