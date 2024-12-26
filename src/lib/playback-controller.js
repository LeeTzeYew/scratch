import Blockly from 'scratch-blocks';

class PlaybackController {
    constructor(workspace) {
        this.workspace = workspace;
        this.events = [];
        this.currentEventIndex = 0;
        this.lastExecutedTime = 0;
    }

    loadRecording(tutorialData) {
        this.events = tutorialData.events;
        this.currentEventIndex = 0;
    }

    play() {
        this.isPlaying = true;
    }

    pause() {
        this.isPlaying = false;
    }

    syncToTime(currentTimeMs) {
        if (!this.isPlaying) return;

        // 如果时间回退，重置状态
        if (currentTimeMs < this.lastExecutedTime) {
            this.currentEventIndex = 0;
            this.lastExecutedTime = 0;
        }

        // 执行所有应该发生的事件
        while (this.currentEventIndex < this.events.length) {
            const event = this.events[this.currentEventIndex];
            
            if (event.timestamp <= currentTimeMs) {
                this.executeEvent(event);
                this.currentEventIndex++;
                this.lastExecutedTime = event.timestamp;
            } else {
                break;
            }
        }
    }

    executeEvent(event) {
        try {
            // 从事件数据中还原工作区状态
            if (event.data.xml) {
                // 保存当前视图状态
                const viewLocation = this.workspace.getMetrics();
                
                // 更新积木
                const xml = Blockly.Xml.textToDom(event.data.xml);
                Blockly.Xml.clearWorkspaceAndLoadFromXml(xml, this.workspace);
                
                // 恢复视图状态
                this.workspace.scroll(viewLocation.viewLeft, viewLocation.viewTop);
                
                // 高亮最新添加的积木
                if (event.data.highlightBlock) {
                    this.workspace.highlightBlock(event.data.highlightBlock);
                }
            }
        } catch (error) {
            console.error('Error executing event:', error);
        }
    }
}

export default PlaybackController; 