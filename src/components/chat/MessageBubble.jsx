import { useSelector, useDispatch } from "react-redux";
import { useEffect, useState, useRef } from "react";
import { Play, Pause, Volume2, VolumeX, Download, Video as VideoIcon, Image as ImageIcon } from "lucide-react";
import { updateMessageMedia } from "../../store/feauters/chatSlice"; // Updated import path

export default function MessageBubble({ message, isOwn, isLast }) {
  const currentUser = useSelector(state => state.auth.user);
  const dispatch = useDispatch();
  
  const [mediaLoaded, setMediaLoaded] = useState({});
  const [videoStates, setVideoStates] = useState({});
  const videoRefs = useRef({});

  const isSeen =
    isOwn &&
    isLast &&
    message.seenBy?.some(
      id => String(id) !== String(currentUser._id)
    );

  // Check if media is still uploading
  const isUploading = message.uploading || 
    (message.media && message.media.some(m => m.uploading));

  // Handle video controls
  const toggleVideoPlay = (index) => {
    const video = videoRefs.current[index];
    if (!video) return;

    setVideoStates(prev => ({
      ...prev,
      [index]: {
        ...prev[index],
        playing: !prev[index]?.playing
      }
    }));

    if (video.paused) {
      video.play().catch(console.error);
    } else {
      video.pause();
    }
  };

  const toggleVideoMute = (index) => {
    const video = videoRefs.current[index];
    if (!video) return;

    setVideoStates(prev => ({
      ...prev,
      [index]: {
        ...prev[index],
        muted: !prev[index]?.muted
      }
    }));

    video.muted = !video.muted;
  };

  const handleVideoTimeUpdate = (index) => {
    const video = videoRefs.current[index];
    if (!video) return;

    setVideoStates(prev => ({
      ...prev,
      [index]: {
        ...prev[index],
        currentTime: video.currentTime,
        duration: video.duration,
        progress: (video.currentTime / video.duration) * 100
      }
    }));
  };

  const handleVideoEnded = (index) => {
    setVideoStates(prev => ({
      ...prev,
      [index]: {
        ...prev[index],
        playing: false
      }
    }));
  };

  const handleVideoClick = (index) => {
    const video = videoRefs.current[index];
    if (!video) return;

    if (video.paused) {
      video.play().catch(console.error);
      setVideoStates(prev => ({
        ...prev,
        [index]: {
          ...prev[index],
          playing: true
        }
      }));
    } else {
      video.pause();
      setVideoStates(prev => ({
        ...prev,
        [index]: {
          ...prev[index],
          playing: false
        }
      }));
    }
  };

  // Handle media load
  const handleMediaLoad = (index) => {
    setMediaLoaded(prev => ({ ...prev, [index]: true }));
  };

  // Format time
  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Format video duration
  const formatVideoDuration = (seconds) => {
    if (!seconds || isNaN(seconds)) return "00:00";
    
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Handle download media
  const handleDownload = (mediaUrl, mediaType) => {
    const link = document.createElement('a');
    link.href = mediaUrl;
    link.download = `instagram_${Date.now()}.${mediaType.split('/')[1] || 'jpg'}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Cleanup object URLs on unmount
  useEffect(() => {
    return () => {
      if (message.media && message.tempId) {
        message.media.forEach(media => {
          if (media.url && media.url.startsWith('blob:')) {
            URL.revokeObjectURL(media.url);
          }
        });
      }
    };
  }, [message.media, message.tempId]);

  // Update media URLs when upload completes (if needed)
  useEffect(() => {
    if (message._id && message.media && message.media.some(m => m.uploading)) {
      // Check if we need to update from temp URLs to permanent URLs
      // This would typically be handled by the socket event
    }
  }, [message._id, message.media]);

  return (
    <div className={`mb-4 flex ${isOwn ? "justify-end" : "justify-start"}`}>
      <div
        className={`rounded-2xl max-w-xs md:max-w-md lg:max-w-lg overflow-hidden relative shadow-sm ${
          isOwn 
            ? "bg-blue-500 text-white rounded-br-none" 
            : "bg-gray-100 text-gray-800 rounded-bl-none"
        }`}
      >
        {/* UPLOADING OVERLAY */}
        {isUploading && (
          <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center text-white text-sm z-20 backdrop-blur-sm rounded-2xl">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mb-2"></div>
            <span>Uploading...</span>
            <span className="text-xs mt-1">Please wait</span>
          </div>
        )}

        {/* MEDIA GALLERY */}
        {message.media?.length > 0 && (
          <div className="space-y-1">
            {message.media.map((item, i) => {
              const mediaUrl = typeof item === 'string' ? item : item.url;
              const mediaType = typeof item === 'string' ? 
                (mediaUrl.match(/\.(mp4|webm|mov)$/i) ? 'video' : 'image') :
                (item.type?.startsWith('video/') ? 'video' : 'image');
              
              const isVideo = mediaType === 'video';

              // Optimistic media (uploading)
              if (item.uploading) {
                return (
                  <div
                    key={i}
                    className="relative w-full h-48 bg-linear-to-br from-gray-200 to-gray-300 flex items-center justify-center"
                  >
                    <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                      <div className="text-white text-sm flex items-center gap-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        {isVideo ? 'Processing video...' : 'Processing image...'}
                      </div>
                    </div>
                    
                    {isVideo ? (
                      <div className="w-full h-full flex items-center justify-center">
                        <VideoIcon className="w-12 h-12 text-white/50" />
                      </div>
                    ) : (
                      <img
                        src={mediaUrl}
                        className="w-full h-48 object-cover opacity-30"
                        alt="Uploading"
                        onLoad={() => handleMediaLoad(i)}
                      />
                    )}
                    
                    <div className="absolute bottom-0 left-0 right-0 bg-linear-to-t from-black/60 to-transparent p-2">
                      <div className="text-white text-xs flex justify-between">
                        <span>{item.name || 'File'}</span>
                        <span>Uploading...</span>
                      </div>
                    </div>
                  </div>
                );
              }

              // VIDEO MEDIA
              if (isVideo) {
                return (
                  <div key={i} className="relative group">
                    <video
                      ref={(el) => videoRefs.current[i] = el}
                      src={mediaUrl}
                      className="w-full h-auto max-h-96 object-contain bg-black cursor-pointer"
                      preload="metadata"
                      loop
                      muted={videoStates[i]?.muted ?? true}
                      onClick={() => handleVideoClick(i)}
                      onTimeUpdate={() => handleVideoTimeUpdate(i)}
                      onEnded={() => handleVideoEnded(i)}
                      onLoadedData={() => handleMediaLoad(i)}
                      onPlay={() => setVideoStates(prev => ({ ...prev, [i]: { ...prev[i], playing: true } }))}
                      onPause={() => setVideoStates(prev => ({ ...prev, [i]: { ...prev[i], playing: false } }))}
                    />
                    
                    {/* Video loading state */}
                    {!mediaLoaded[i] && (
                      <div className="absolute inset-0 bg-gray-900 flex items-center justify-center">
                        <div className="text-white text-sm flex items-center gap-2">
                          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                          Loading video...
                        </div>
                      </div>
                    )}

                    {/* Video overlay with controls */}
                    <div className={`absolute inset-0 bg-linear-to-t from-black/60 via-transparent to-transparent transition-opacity duration-300 ${
                      videoStates[i]?.playing ? 'opacity-0 group-hover:opacity-100' : 'opacity-100'
                    }`}>
                      {/* Top bar with download */}
                      <div className="absolute top-0 left-0 right-0 p-3 flex justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDownload(mediaUrl, 'video/mp4');
                          }}
                          className="bg-black/60 text-white p-2 rounded-full hover:bg-black/80 transition-colors"
                          title="Download video"
                        >
                          <Download className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Center play button */}
                      {!videoStates[i]?.playing && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleVideoPlay(i);
                          }}
                          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-black/60 text-white p-4 rounded-full hover:bg-black/80 transition-colors"
                        >
                          <Play className="w-8 h-8" fill="white" />
                        </button>
                      )}

                      {/* Bottom controls */}
                      <div className="absolute bottom-0 left-0 right-0 p-3 bg-linear-to-t from-black/80 to-transparent">
                        {/* Progress bar */}
                        <div className="w-full bg-white/30 h-1 rounded-full mb-2 cursor-pointer"
                          onClick={(e) => {
                            const video = videoRefs.current[i];
                            if (!video) return;
                            
                            const rect = e.currentTarget.getBoundingClientRect();
                            const percent = (e.clientX - rect.left) / rect.width;
                            video.currentTime = percent * video.duration;
                          }}
                        >
                          <div 
                            className="bg-blue-500 h-1 rounded-full transition-all duration-100"
                            style={{ width: `${videoStates[i]?.progress || 0}%` }}
                          />
                        </div>

                        <div className="flex items-center justify-between">
                          {/* Play/pause button */}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleVideoPlay(i);
                            }}
                            className="text-white hover:bg-white/20 p-2 rounded-full transition-colors"
                          >
                            {videoStates[i]?.playing ? (
                              <Pause className="w-5 h-5" />
                            ) : (
                              <Play className="w-5 h-5" fill="white" />
                            )}
                          </button>

                          {/* Time display */}
                          <div className="text-white text-sm font-mono mx-2">
                            {formatVideoDuration(videoStates[i]?.currentTime || 0)} / {formatVideoDuration(videoStates[i]?.duration || 0)}
                          </div>

                          {/* Mute button */}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleVideoMute(i);
                            }}
                            className="text-white hover:bg-white/20 p-2 rounded-full transition-colors"
                          >
                            {videoStates[i]?.muted ? (
                              <VolumeX className="w-5 h-5" />
                            ) : (
                              <Volume2 className="w-5 h-5" />
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              }

              // IMAGE MEDIA
              return (
                <div key={i} className="relative group">
                  <img
                    src={mediaUrl}
                    className="w-full h-auto max-h-96 object-contain bg-gray-100 cursor-pointer"
                    alt=""
                    onClick={() => window.open(mediaUrl, '_blank')}
                    onLoad={() => handleMediaLoad(i)}
                  />
                  
                  {/* Image loading state */}
                  {!mediaLoaded[i] && (
                    <div className="absolute inset-0 bg-gray-200 animate-pulse flex items-center justify-center">
                      <div className="text-gray-600 text-sm">Loading image...</div>
                    </div>
                  )}

                  {/* Image overlay with download button */}
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="absolute top-3 right-3">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDownload(mediaUrl, 'image/jpeg');
                        }}
                        className="bg-black/60 text-white p-2 rounded-full hover:bg-black/80 transition-colors"
                        title="Download image"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                    </div>
                    
                    <div className="absolute bottom-0 left-0 right-0 bg-linear-to-t from-black/60 to-transparent p-3">
                      <button
                        onClick={() => window.open(mediaUrl, '_blank')}
                        className="text-white text-sm hover:underline"
                      >
                        View full size
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* TEXT */}
        {message.text && (
          <div className="px-4 py-3">
            <p className="whitespace-pre-wrap wrap-break-words">{message.text}</p>
          </div>
        )}

        {/* META INFO */}
        <div className={`flex justify-between items-center px-3 py-2 text-xs ${
          isOwn ? "text-blue-200" : "text-gray-500"
        }`}>
          <span>{formatTime(message.createdAt)}</span>
          
          {isOwn && (
            <div className="flex items-center gap-1">
              {isLast && (
                <span className="text-xs">
                  {isSeen ? (
                    <span className="flex items-center gap-1">
                      <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                      <span className="hidden sm:inline">Seen</span>
                    </span>
                  ) : (
                    <span className="flex items-center gap-1">
                      <span className="w-2 h-2 bg-gray-400 rounded-full"></span>
                      <span className="hidden sm:inline">Delivered</span>
                    </span>
                  )}
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}