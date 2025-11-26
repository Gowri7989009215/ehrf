import React, { useState, useRef, useEffect } from 'react';
import { 
  X, 
  ZoomIn, 
  ZoomOut, 
  Maximize, 
  Minimize, 
  RotateCw, 
  Download,
  FileText,
  Image as ImageIcon,
  File
} from 'lucide-react';

const FileViewer = ({ 
  isOpen, 
  onClose, 
  record, 
  content, 
  onDownload,
  canDownload = false 
}) => {
  const [zoom, setZoom] = useState(100);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [imageError, setImageError] = useState(false);
  const viewerRef = useRef(null);
  const contentRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setZoom(100);
      setRotation(0);
      setImageError(false);
    }
  }, [isOpen, record]);

  if (!isOpen || !record || !content) return null;

  const getFileType = () => {
    const mimeType = record.metadata?.mimeType || '';
    const fileType = record.fileType || '';
    
    if (mimeType.startsWith('image/') || fileType === 'image') {
      return 'image';
    } else if (mimeType === 'application/pdf' || fileType === 'pdf') {
      return 'pdf';
    } else if (mimeType.startsWith('text/') || fileType === 'text') {
      return 'text';
    } else {
      return 'other';
    }
  };

  const fileType = getFileType();

  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev + 25, 500));
  };

  const handleZoomOut = () => {
    setZoom(prev => Math.max(prev - 25, 25));
  };

  const handleRotate = () => {
    setRotation(prev => (prev + 90) % 360);
  };

  const toggleFullscreen = () => {
    if (!isFullscreen) {
      if (viewerRef.current?.requestFullscreen) {
        viewerRef.current.requestFullscreen();
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
    setIsFullscreen(!isFullscreen);
  };

  const renderContent = () => {
    switch (fileType) {
      case 'image':
        return (
          <div className="flex items-center justify-center min-h-96">
            {!imageError ? (
              <img
                ref={contentRef}
                src={`data:${record.metadata?.mimeType || 'image/jpeg'};base64,${content}`}
                alt={record.title}
                className="max-w-full max-h-full object-contain transition-transform duration-200"
                style={{
                  transform: `scale(${zoom / 100}) rotate(${rotation}deg)`,
                  transformOrigin: 'center'
                }}
                onError={() => setImageError(true)}
                onLoad={() => setImageError(false)}
              />
            ) : (
              <div className="text-center py-12">
                <ImageIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">Failed to load image</p>
                <p className="text-sm text-gray-400 mt-2">
                  The image format may not be supported or the file may be corrupted
                </p>
              </div>
            )}
          </div>
        );

      case 'pdf':
        return (
          <div className="flex items-center justify-center min-h-96">
            <iframe
              ref={contentRef}
              src={`data:application/pdf;base64,${content}`}
              className="w-full h-96 border border-gray-300 rounded"
              style={{
                transform: `scale(${zoom / 100})`,
                transformOrigin: 'top left',
                width: `${10000 / zoom}%`,
                height: `${9600 / zoom}px`
              }}
              title={record.title}
            />
          </div>
        );

      case 'text':
        return (
          <div className="bg-white border border-gray-200 rounded-lg p-4 max-h-96 overflow-auto">
            <pre 
              className="whitespace-pre-wrap text-gray-900 font-mono"
              style={{ fontSize: `${zoom / 100}rem` }}
            >
              {content}
            </pre>
          </div>
        );

      default:
        return (
          <div className="text-center py-12">
            <File className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">File preview not available</p>
            <p className="text-sm text-gray-400 mt-2">
              This file type cannot be previewed in the browser
            </p>
            {canDownload && (
              <button
                onClick={onDownload}
                className="btn btn-primary mt-4"
              >
                <Download className="w-4 h-4 mr-2" />
                Download to View
              </button>
            )}
          </div>
        );
    }
  };

  const getFileIcon = () => {
    switch (fileType) {
      case 'image':
        return <ImageIcon className="w-5 h-5" />;
      case 'pdf':
        return <FileText className="w-5 h-5" />;
      case 'text':
        return <FileText className="w-5 h-5" />;
      default:
        return <File className="w-5 h-5" />;
    }
  };

  return (
    <div 
      ref={viewerRef}
      className={`fixed inset-0 bg-black bg-opacity-90 flex flex-col z-50 ${
        isFullscreen ? 'bg-black' : ''
      }`}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-white border-b">
        <div className="flex items-center space-x-3">
          {getFileIcon()}
          <div>
            <h2 className="text-lg font-semibold text-gray-900">{record.title}</h2>
            <p className="text-sm text-gray-600">
              {record.category} • {record.fileType} • {record.metadata?.fileSize ? 
                `${Math.round(record.metadata.fileSize / 1024)} KB` : 'Unknown size'}
            </p>
          </div>
        </div>
        
        {/* Controls */}
        <div className="flex items-center space-x-2">
          {(fileType === 'image' || fileType === 'pdf' || fileType === 'text') && (
            <>
              <button
                onClick={handleZoomOut}
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded"
                title="Zoom Out"
              >
                <ZoomOut className="w-5 h-5" />
              </button>
              
              <span className="text-sm text-gray-600 min-w-12 text-center">
                {zoom}%
              </span>
              
              <button
                onClick={handleZoomIn}
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded"
                title="Zoom In"
              >
                <ZoomIn className="w-5 h-5" />
              </button>
            </>
          )}
          
          {fileType === 'image' && (
            <button
              onClick={handleRotate}
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded"
              title="Rotate"
            >
              <RotateCw className="w-5 h-5" />
            </button>
          )}
          
          <button
            onClick={toggleFullscreen}
            className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded"
            title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
          >
            {isFullscreen ? <Minimize className="w-5 h-5" /> : <Maximize className="w-5 h-5" />}
          </button>
          
          {canDownload && (
            <button
              onClick={onDownload}
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded"
              title="Download"
            >
              <Download className="w-5 h-5" />
            </button>
          )}
          
          <button
            onClick={onClose}
            className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-auto bg-gray-100 p-4">
        <div className="max-w-full mx-auto">
          {renderContent()}
        </div>
      </div>

      {/* Footer */}
      <div className="bg-white border-t p-4">
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-600">
            <span className="font-medium">Uploaded:</span> {
              new Date(record.createdAt).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })
            }
          </div>
          
          <div className="flex items-center space-x-4">
            {record.tags && record.tags.length > 0 && (
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-500">Tags:</span>
                <div className="flex flex-wrap gap-1">
                  {record.tags.map((tag, index) => (
                    <span key={index} className="badge badge-primary text-xs">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
            
            <button
              onClick={onClose}
              className="btn btn-primary"
            >
              Close Viewer
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FileViewer;
