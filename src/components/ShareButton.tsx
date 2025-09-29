import React, { useState } from 'react';
import { Share2, Copy, Check } from 'lucide-react';
import { Step } from '../types';
import { generateShareUrl } from '../utils/urlUtils';

interface ShareButtonProps {
  tempo: number;
  steps: Step[];
}

const ShareButton: React.FC<ShareButtonProps> = ({ tempo, steps }) => {
  const [isSharing, setIsSharing] = useState(false);
  const [showNotification, setShowNotification] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleShare = () => {
    setIsSharing(true);
    setCopied(false);
  };

  const handleCopy = async () => {
    const shareUrl = generateShareUrl(tempo, steps);
    
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setShowNotification(true);
      
      // Hide notification after 3 seconds
      setTimeout(() => {
        setShowNotification(false);
      }, 3000);
      
      // Reset copy icon after 2 seconds
      setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch (error) {
      console.error('Failed to copy URL:', error);
      // Fallback for browsers that don't support clipboard API
      const textArea = document.createElement('textarea');
      textArea.value = shareUrl;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      
      setCopied(true);
      setShowNotification(true);
      setTimeout(() => setShowNotification(false), 3000);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const shareUrl = generateShareUrl(tempo, steps);

  return (
    <div className="bg-gray-700 p-4 rounded-lg shadow-lg">
      {/* Share Button */}
      {!isSharing && (
        <button
          onClick={handleShare}
          className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200"
        >
          <Share2 className="w-5 h-5" />
          Share Pattern
        </button>
      )}

      {/* Share URL Input */}
      {isSharing && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-white font-medium">Share Your Pattern</h3>
            <button
              onClick={() => setIsSharing(false)}
              className="text-gray-400 hover:text-white text-sm"
            >
              ✕
            </button>
          </div>
          
          <div className="flex gap-2">
            <input
              type="text"
              value={shareUrl}
              readOnly
              className="flex-1 bg-gray-800 text-white px-3 py-2 rounded border border-gray-600 text-sm font-mono"
              onClick={(e) => (e.target as HTMLInputElement).select()}
            />
            <button
              onClick={handleCopy}
              className={`flex items-center justify-center w-10 h-10 rounded transition-colors duration-200 ${
                copied 
                  ? 'bg-green-600 hover:bg-green-700' 
                  : 'bg-gray-600 hover:bg-gray-500'
              }`}
              title="Copy URL"
            >
              {copied ? (
                <Check className="w-4 h-4 text-white" />
              ) : (
                <Copy className="w-4 h-4 text-white" />
              )}
            </button>
          </div>
          
          <p className="text-gray-400 text-xs">
            Copy this URL to share your pattern with others!
          </p>
        </div>
      )}

      {/* Success Notification */}
      {showNotification && (
        <div className="fixed top-4 right-4 bg-green-600 text-white px-4 py-2 rounded-lg shadow-lg z-50 flex items-center gap-2">
          <Check className="w-4 h-4" />
          URL copied, ready to paste and share!
        </div>
      )}
    </div>
  );
};

export default ShareButton;