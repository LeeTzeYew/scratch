import Blockly from 'scratch-blocks';

class RecordingManager {
    constructor(workspace) {
        this.workspace = workspace;
        this.events = [];
        this.isRecording = false;
        this.startTime = null;
        this.videoRecorder = null;
        this.recordingPromise = null;
    }

    async startRecording() {
        this.isRecording = true;
        this.startTime = Date.now();
        this.events = [];
        this._attachWorkspaceListeners();
        
        try {
            // 先请求用户授权
            const stream = await navigator.mediaDevices.getDisplayMedia({
                video: {
                    cursor: "always"
                },
                audio: false
            });
            
            // 创建 MediaRecorder
            const mediaRecorder = new MediaRecorder(stream, {
                mimeType: 'video/webm;codecs=vp9'
            });
            
            const chunks = [];
            mediaRecorder.ondataavailable = e => chunks.push(e.data);
            
            // 保存录制结果的 Promise
            this.recordingPromise = new Promise(resolve => {
                mediaRecorder.onstop = () => {
                    const blob = new Blob(chunks, { type: 'video/webm' });
                    resolve(URL.createObjectURL(blob));
                };
            });
            
            mediaRecorder.start();
            this.videoRecorder = mediaRecorder;
            
            // 添加停止录制的按钮提示
            this._showRecordingIndicator();
            
        } catch (error) {
            console.error('Failed to start recording:', error);
            this.isRecording = false;
            throw error;
        }
    }

    _attachWorkspaceListeners() {
        this.workspace.addChangeListener((event) => {
            if (!this.isRecording) return;
            
            if (event.type === Blockly.Events.BLOCK_MOVE ||
                event.type === Blockly.Events.BLOCK_CREATE ||
                event.type === Blockly.Events.BLOCK_DELETE ||
                event.type === Blockly.Events.BLOCK_CHANGE) {
                
                this.recordEvent(event.type, {
                    blockId: event.blockId,
                    newParentId: event.newParentId,
                    oldParentId: event.oldParentId,
                    newCoordinate: event.newCoordinate,
                    oldCoordinate: event.oldCoordinate,
                    xml: Blockly.Xml.workspaceToDom(this.workspace),
                    type: event.type
                });
            }
        });
    }

    _showRecordingIndicator() {
        const indicator = document.createElement('div');
        indicator.style.cssText = `
            position: fixed;
            top: 10px;
            right: 10px;
            background: red;
            color: white;
            padding: 5px 10px;
            border-radius: 4px;
            z-index: 9999;
        `;
        indicator.textContent = '录制中...';
        document.body.appendChild(indicator);
        this.recordingIndicator = indicator;
    }

    recordEvent(eventType, data) {
        if (!this.isRecording) return;
        
        this.events.push({
            timestamp: Date.now() - this.startTime,
            type: eventType,
            data: data
        });
    }

    async stopRecording() {
        this.isRecording = false;
        
        // 移除录制指示器
        if (this.recordingIndicator) {
            this.recordingIndicator.remove();
        }

        if (this.videoRecorder) {
            // 停止所有视频轨道
            this.videoRecorder.stream.getTracks().forEach(track => track.stop());
            this.videoRecorder.stop();
            // 等待视频数据处理完成
            const videoUrl = await this.recordingPromise;
            return {
                events: this.events,
                duration: Date.now() - this.startTime,
                videoUrl
            };
        }

        return null;
    }
}

export default RecordingManager; 