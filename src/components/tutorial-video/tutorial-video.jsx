import React, { useRef, useEffect } from 'react';
import PropTypes from 'prop-types';
import PlaybackController from '../../lib/playback-controller';
import styles from './tutorial-video.css';

const TutorialVideo = ({workspace, tutorialData = null}) => {
    const videoRef = useRef(null);
    const playbackControllerRef = useRef(null);
    const lastTimeRef = useRef(0);

    useEffect(() => {
        // 初始化播放控制器
        playbackControllerRef.current = new PlaybackController(workspace);
        if (tutorialData) {
            playbackControllerRef.current.loadRecording(tutorialData);
        }
    }, [workspace, tutorialData]);

    if (!tutorialData) {
        return null; // 如果没有教程数据，不渲染任何内容
    }

    const handleVideoPlay = () => {
        playbackControllerRef.current.play();
    };

    const handleVideoPause = () => {
        playbackControllerRef.current.pause();
    };

    const handleVideoTimeUpdate = () => {
        // 同步积木操作到当前视频时间
        if (playbackControllerRef.current && videoRef.current) {
            try {
                playbackControllerRef.current.syncToTime(videoRef.current.currentTime * 1000);
                
                // 如果视频被拖动，确保积木状态正确
                if (Math.abs(lastTimeRef.current - videoRef.current.currentTime) > 1) {
                    playbackControllerRef.current.syncToTime(videoRef.current.currentTime * 1000);
                }
                lastTimeRef.current = videoRef.current.currentTime;
            } catch (error) {
                console.error('Error syncing tutorial:', error);
            }
        }
    };

    return (
        <div className={styles.tutorialVideoContainer}>
            <video
                ref={videoRef}
                className={styles.tutorialVideo}
                controls
                onPlay={handleVideoPlay}
                onPause={handleVideoPause}
                onTimeUpdate={handleVideoTimeUpdate}
            >
                <source src={tutorialData.videoUrl} type="video/mp4" />
            </video>
        </div>
    );
};

TutorialVideo.propTypes = {
    workspace: PropTypes.object.isRequired,
    tutorialData: PropTypes.oneOfType([
        PropTypes.shape({
            events: PropTypes.arrayOf(PropTypes.shape({
                timestamp: PropTypes.number.isRequired,
                type: PropTypes.string.isRequired,
                data: PropTypes.object.isRequired
            })).isRequired,
            videoUrl: PropTypes.string.isRequired
        }),
        PropTypes.oneOf([null])
    ])
};

export default TutorialVideo; 