import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import { QrCode, Download, Share2, Copy, CheckCircle, X, Smartphone, ExternalLink } from 'lucide-react';

export interface QRShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  url?: string;
  title?: string;
  noteId?: string;
  noteTitle?: string;
  noteUrl?: string;
}

const QRShareModal: React.FC<QRShareModalProps> = ({ 
  isOpen, 
  onClose, 
  url, 
  title, 
  noteId, 
  noteTitle,
  noteUrl 
}) => {
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>('');
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);

  // Compute final URL and title safely from all possible prop combinations
  const finalTitle = title || noteTitle || 'Study Material';
  const finalUrl = url || noteUrl || (noteId ? `${window.location.origin}/notes/${noteId}` : window.location.href);

  useEffect(() => {
    if (isOpen && finalUrl) {
      generateQRCode();
    }
  }, [isOpen, finalUrl]);

  const generateQRCode = async () => {
    try {
      setLoading(true);
      
      const qrCodeOptions = {
        width: 320,
        margin: 2,
        color: {
          dark: '#0f172a', // Slate 900
          light: '#ffffff'
        },
        errorCorrectionLevel: 'H' as const // High error correction for clear scanning
      };

      const dataUrl = await QRCode.toDataURL(finalUrl, qrCodeOptions);
      setQrCodeDataUrl(dataUrl);
    } catch (error) {
      console.warn('Local QRCode generator fallback to high-res QR service:', error);
      // Fallback service ensures QR code never fails
      const fallbackUrl = `https://api.qrserver.com/v1/create-qr-code/?size=320x320&data=${encodeURIComponent(finalUrl)}&color=0f172a&bgcolor=ffffff`;
      setQrCodeDataUrl(fallbackUrl);
    } finally {
      setLoading(false);
    }
  };

  const downloadQRCode = () => {
    if (!qrCodeDataUrl) return;

    const link = document.createElement('a');
    link.download = `${finalTitle.replace(/[^a-zA-Z0-9]/g, '_')}_QR.png`;
    link.href = qrCodeDataUrl;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const copyNoteLink = async () => {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(finalUrl);
      } else {
        const textarea = document.createElement('textarea');
        textarea.value = finalUrl;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Error copying link:', error);
    }
  };

  const shareNote = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: finalTitle,
          text: `Check out "${finalTitle}" on College Notes Exchange:`,
          url: finalUrl
        });
      } catch (error) {
        copyNoteLink();
      }
    } else {
      copyNoteLink();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-950/75 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full mx-auto overflow-hidden border border-slate-100 transform transition-all">
        
        {/* Header */}
        <div className="flex items-center justify-between p-5 sm:p-6 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <QrCode className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900 leading-tight">Share with QR Code</h2>
              <p className="text-xs text-slate-500">Instant mobile phone scanner access</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-xl transition text-slate-400 hover:text-slate-700"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5">
          <div className="text-center">
            <h3 className="font-bold text-slate-900 text-sm sm:text-base line-clamp-1">{finalTitle}</h3>
            <p className="text-xs text-slate-500 mt-1 truncate max-w-xs mx-auto font-mono bg-slate-50 py-1 px-2.5 rounded-lg border border-slate-100">
              {finalUrl}
            </p>
          </div>

          {/* QR Code Canvas Frame */}
          <div className="flex justify-center">
            <div className="relative p-4 bg-white rounded-2xl border-2 border-slate-100 shadow-inner flex items-center justify-center">
              {loading ? (
                <div className="w-56 h-56 flex items-center justify-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              ) : qrCodeDataUrl ? (
                <div className="relative group">
                  <img 
                    src={qrCodeDataUrl} 
                    alt={`QR Code for ${finalTitle}`} 
                    className="w-56 h-56 rounded-xl object-contain"
                  />
                  <button
                    onClick={downloadQRCode}
                    className="absolute bottom-2 right-2 p-2 bg-slate-900/90 text-white hover:bg-slate-900 rounded-xl shadow-md transition text-xs font-semibold flex items-center space-x-1"
                    title="Download PNG"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>PNG</span>
                  </button>
                </div>
              ) : (
                <div className="w-56 h-56 flex items-center justify-center text-xs text-slate-400">
                  Generating QR Code...
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-2.5">
            <button
              onClick={copyNoteLink}
              className="flex items-center justify-center space-x-2 bg-slate-100 hover:bg-slate-200 text-slate-800 px-4 py-2.5 rounded-xl font-semibold text-xs transition active:scale-98"
            >
              {copied ? (
                <>
                  <CheckCircle className="w-4 h-4 text-emerald-600" />
                  <span className="text-emerald-700">Link Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 text-slate-600" />
                  <span>Copy URL</span>
                </>
              )}
            </button>

            <button
              onClick={shareNote}
              className="flex items-center justify-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl font-semibold text-xs shadow-xs transition active:scale-98"
            >
              <Share2 className="w-4 h-4" />
              <span>Share Link</span>
            </button>
          </div>

          {/* Scan Info Banner */}
          <div className="p-3.5 bg-blue-50/70 border border-blue-100 rounded-2xl flex items-start space-x-3">
            <Smartphone className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
            <div className="text-xs text-blue-900 leading-relaxed">
              <span className="font-bold">Scan to open on phone:</span> Open your mobile camera or Google Lens / WhatsApp to immediately view this study module on your smartphone or tablet.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QRShareModal;