import PropTypes from 'prop-types';
import React from 'react';
import {compose} from 'redux';
import {connect} from 'react-redux';
import ReactModal from 'react-modal';
import VM from 'scratch-vm';
import Blockly from 'scratch-blocks';
import {injectIntl, intlShape} from 'react-intl';

import ErrorBoundaryHOC from '../lib/error-boundary-hoc.jsx';
import {
    getIsError,
    getIsShowingProject
} from '../reducers/project-state';
import {
    activateTab,
    BLOCKS_TAB_INDEX,
    COSTUMES_TAB_INDEX,
    SOUNDS_TAB_INDEX
} from '../reducers/editor-tab';

import {
    closeCostumeLibrary,
    closeBackdropLibrary,
    closeTelemetryModal,
    openExtensionLibrary,
    openTipsLibrary
} from '../reducers/modals';

import FontLoaderHOC from '../lib/font-loader-hoc.jsx';
import LocalizationHOC from '../lib/localization-hoc.jsx';
import SBFileUploaderHOC from '../lib/sb-file-uploader-hoc.jsx';
import ProjectFetcherHOC from '../lib/project-fetcher-hoc.jsx';
import TitledHOC from '../lib/titled-hoc.jsx';
import ProjectSaverHOC from '../lib/project-saver-hoc.jsx';
import QueryParserHOC from '../lib/query-parser-hoc.jsx';
import storage from '../lib/storage';
import vmListenerHOC from '../lib/vm-listener-hoc.jsx';
import vmManagerHOC from '../lib/vm-manager-hoc.jsx';
import cloudManagerHOC from '../lib/cloud-manager-hoc.jsx';
import systemPreferencesHOC from '../lib/system-preferences-hoc.jsx';

import GUIComponent from '../components/gui/gui.jsx';
import {setIsScratchDesktop} from '../lib/isScratchDesktop.js';
import TutorialVideo from '../components/tutorial-video/tutorial-video';
import LoginPage from '../components/login-page/login-page';
import {login, logout, isLoggedIn, getUsername} from '../lib/auth';

const {RequestMetadata, setMetadata, unsetMetadata} = storage.scratchFetch;

const setProjectIdMetadata = projectId => {
    // If project ID is '0' or zero, it's not a real project ID. In that case, remove the project ID metadata.
    // Same if it's null undefined.
    if (projectId && projectId !== '0') {
        setMetadata(RequestMetadata.ProjectId, projectId);
    } else {
        unsetMetadata(RequestMetadata.ProjectId);
    }
};

class GUI extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            workspace: null,
            isLoggedIn: isLoggedIn(),
            username: getUsername(),
            tutorialData: {
                videoUrl: '/tutorial/demo.mp4',
                events: [
                    {
                        timestamp: 225000, // 3:45 - 开始积木
                        type: 'BLOCK_CREATE',
                        data: {
                            xml: `<xml>
                                <block type="event_whenflagclicked" id="block1" x="100" y="100">
                                </block>
                            </xml>`
                        }
                    },
                    {
                        timestamp: 236000, // 3:56 - 多一个说你好2秒(分开)
                        type: 'BLOCK_CREATE',
                        data: {
                            xml: `<xml>
                                <block type="event_whenflagclicked" id="block1" x="100" y="100">
                                </block>
                                <block type="looks_sayforsecs" id="block2" x="100" y="200">
                                    <value name="MESSAGE">
                                        <shadow type="text">
                                            <field name="TEXT">你好</field>
                                        </shadow>
                                    </value>
                                    <value name="SECS">
                                        <shadow type="math_number">
                                            <field name="NUM">2</field>
                                        </shadow>
                                    </value>
                                </block>
                            </xml>`
                        }
                    },
                    {
                        timestamp: 242000, // 4:02 - 多一个移动10步(分开)
                        type: 'BLOCK_CREATE',
                        data: {
                            xml: `<xml>
                                <block type="event_whenflagclicked" id="block1" x="100" y="100">
                                </block>
                                <block type="looks_sayforsecs" id="block2" x="100" y="200">
                                    <value name="MESSAGE">
                                        <shadow type="text">
                                            <field name="TEXT">你好</field>
                                        </shadow>
                                    </value>
                                    <value name="SECS">
                                        <shadow type="math_number">
                                            <field name="NUM">2</field>
                                        </shadow>
                                    </value>
                                </block>
                                <block type="motion_movesteps" id="block3" x="100" y="300">
                                    <value name="STEPS">
                                        <shadow type="math_number">
                                            <field name="NUM">10</field>
                                        </shadow>
                                    </value>
                                </block>
                            </xml>`
                        }
                    },
                    {
                        timestamp: 270000, // 4:30 - 多一个播放声音喵等待播完
                        type: 'BLOCK_CREATE',
                        data: {
                            xml: `<xml>
                                <block type="event_whenflagclicked" id="block1" x="100" y="100">
                                </block>
                                <block type="looks_sayforsecs" id="block2" x="100" y="200">
                                    <value name="MESSAGE">
                                        <shadow type="text">
                                            <field name="TEXT">你好</field>
                                        </shadow>
                                    </value>
                                    <value name="SECS">
                                        <shadow type="math_number">
                                            <field name="NUM">2</field>
                                        </shadow>
                                    </value>
                                </block>
                                <block type="motion_movesteps" id="block3" x="100" y="300">
                                    <value name="STEPS">
                                        <shadow type="math_number">
                                            <field name="NUM">10</field>
                                        </shadow>
                                    </value>
                                </block>
                                <block type="sound_playuntildone" id="block4" x="100" y="400">
                                    <value name="SOUND_MENU">
                                        <shadow type="sound_sounds_menu">
                                            <field name="SOUND_MENU">喵</field>
                                        </shadow>
                                    </value>
                                </block>
                            </xml>`
                        }
                    },
                    {
                        timestamp: 292000, // 4:52 - 开始和说你好结合
                        type: 'BLOCK_CREATE',
                        data: {
                            xml: `<xml>
                                <block type="event_whenflagclicked" id="block1" x="100" y="100">
                                    <next>
                                        <block type="looks_sayforsecs" id="block2">
                                            <value name="MESSAGE">
                                                <shadow type="text">
                                                    <field name="TEXT">你好</field>
                                                </shadow>
                                            </value>
                                            <value name="SECS">
                                                <shadow type="math_number">
                                                    <field name="NUM">2</field>
                                                </shadow>
                                            </value>
                                        </block>
                                    </next>
                                </block>
                                <block type="motion_movesteps" id="block3" x="100" y="300">
                                    <value name="STEPS">
                                        <shadow type="math_number">
                                            <field name="NUM">10</field>
                                        </shadow>
                                    </value>
                                </block>
                                <block type="sound_playuntildone" id="block4" x="100" y="400">
                                    <value name="SOUND_MENU">
                                        <shadow type="sound_sounds_menu">
                                            <field name="SOUND_MENU">喵</field>
                                        </shadow>
                                    </value>
                                </block>
                            </xml>`
                        }
                    },
                    {
                        timestamp: 298000, // 4:58 - 移动10步结合到你好下面
                        type: 'BLOCK_CREATE',
                        data: {
                            xml: `<xml>
                                <block type="event_whenflagclicked" id="block1" x="100" y="100">
                                    <next>
                                        <block type="looks_sayforsecs" id="block2">
                                            <value name="MESSAGE">
                                                <shadow type="text">
                                                    <field name="TEXT">你好</field>
                                                </shadow>
                                            </value>
                                            <value name="SECS">
                                                <shadow type="math_number">
                                                    <field name="NUM">2</field>
                                                </shadow>
                                            </value>
                                                    <next>
                                                        <block type="motion_movesteps" id="block3">
                                                            <value name="STEPS">
                                                                <shadow type="math_number">
                                                                    <field name="NUM">10</field>
                                                                </shadow>
                                                            </value>
                                                        </block>
                                                    </next>
                                        </block>
                                    </next>
                                </block>
                                <block type="sound_playuntildone" id="block4" x="100" y="400">
                                    <value name="SOUND_MENU">
                                        <shadow type="sound_sounds_menu">
                                            <field name="TEXT">喵</field>
                                        </shadow>
                                    </value>
                                </block>
                            </xml>`
                        }
                    },
                    {
                        timestamp: 320000, // 5:20 - 多一个说你好和移动10步的组合
                        type: 'BLOCK_CREATE',
                        data: {
                            xml: `<xml>
                                <block type="event_whenflagclicked" id="block1" x="100" y="100">
                                    <next>
                                        <block type="looks_sayforsecs" id="block2">
                                            <value name="MESSAGE">
                                                <shadow type="text">
                                                    <field name="TEXT">你好</field>
                                                </shadow>
                                            </value>
                                            <value name="SECS">
                                                <shadow type="math_number">
                                                    <field name="NUM">2</field>
                                                </shadow>
                                            </value>
                                            <next>
                                                <block type="motion_movesteps" id="block3">
                                                    <value name="STEPS">
                                                        <shadow type="math_number">
                                                            <field name="NUM">10</field>
                                                        </shadow>
                                                    </value>
                                                    <next>
                                                        <block type="looks_sayforsecs" id="block4">
                                                            <value name="MESSAGE">
                                                                <shadow type="text">
                                                                    <field name="TEXT">你好</field>
                                                                </shadow>
                                                            </value>
                                                            <value name="SECS">
                                                                <shadow type="math_number">
                                                                    <field name="NUM">2</field>
                                                                </shadow>
                                                            </value>
                                                            <next>
                                                                <block type="motion_movesteps" id="block5">
                                                                    <value name="STEPS">
                                                                        <shadow type="math_number">
                                                                            <field name="NUM">10</field>
                                                                        </shadow>
                                                                    </value>
                                                                    
                                                                </block>
                                                            </next>
                                                        </block>
                                                    </next>
                                                </block>
                                            </next>
                                        </block>
                                    </next>
                                </block>
                                <block type="sound_playuntildone" id="block6" x="100" y="400">
                                    <value name="SOUND_MENU">
                                        <shadow type="sound_sounds_menu">
                                            <field name="SOUND_MENU">喵</field>
                                        </shadow>
                                    </value>
                                </block>
                            </xml>`
                        }
                    },
                    {
                        timestamp: 330000, // 5:30 - 多一个说你好和移动10步的组合
                        type: 'BLOCK_CREATE',
                        data: {
                            xml: `<xml>
                                <block type="event_whenflagclicked" id="block1" x="100" y="100">
                                    <next>
                                        <block type="looks_sayforsecs" id="block2">
                                            <value name="MESSAGE">
                                                <shadow type="text">
                                                    <field name="TEXT">你好</field>
                                                </shadow>
                                            </value>
                                            <value name="SECS">
                                                <shadow type="math_number">
                                                    <field name="NUM">2</field>
                                                </shadow>
                                            </value>
                                            <next>
                                                <block type="motion_movesteps" id="block3">
                                                    <value name="STEPS">
                                                        <shadow type="math_number">
                                                            <field name="NUM">10</field>
                                                        </shadow>
                                                    </value>
                                                    <next>
                                                        <block type="looks_sayforsecs" id="block4">
                                                            <value name="MESSAGE">
                                                                <shadow type="text">
                                                                    <field name="TEXT">你好</field>
                                                                </shadow>
                                                            </value>
                                                            <value name="SECS">
                                                                <shadow type="math_number">
                                                                    <field name="NUM">2</field>
                                                                </shadow>
                                                            </value>
                                                            <next>
                                                                <block type="motion_movesteps" id="block5">
                                                                    <value name="STEPS">
                                                                        <shadow type="math_number">
                                                                            <field name="NUM">10</field>
                                                                        </shadow>
                                                                    </value>
                                                                    <next>
                                                                        <block type="looks_sayforsecs" id="block6">
                                                                            <value name="MESSAGE">
                                                                                <shadow type="text">
                                                                                    <field name="TEXT">山前边有四十四个小狮子</field>
                                                                                </shadow>
                                                                            </value>
                                                                            <value name="SECS">
                                                                                <shadow type="math_number">
                                                                                    <field name="NUM">2</field>
                                                                                </shadow>
                                                                            </value>
                                                                            <next>
                                                                                <block type="motion_movesteps" id="block7">
                                                                                    <value name="STEPS">
                                                                                        <shadow type="math_number">
                                                                                            <field name="NUM">10</field>
                                                                                        </shadow>
                                                                                    </value>
                                                                                    <next>
                                                                                        <block type="looks_sayforsecs" id="block8">
                                                                                            <value name="MESSAGE">
                                                                                                <shadow type="text">
                                                                                                    <field name="TEXT">你好</field>
                                                                                                </shadow>
                                                                                            </value>
                                                                                            <value name="SECS">
                                                                                                <shadow type="math_number">
                                                                                                    <field name="NUM">2</field>
                                                                                                </shadow>
                                                                                            </value>
                                                                                            <next>
                                                                                                <block type="motion_movesteps" id="block9">
                                                                                                    <value name="STEPS">
                                                                                                        <shadow type="math_number">
                                                                                                            <field name="NUM">10</field>
                                                                                                        </shadow>
                                                                                                    </value>
                                                                                                </block>
                                                                                            </next>
                                                                                        </block>
                                                                                    </next>
                                                                                </block>
                                                                            </next>
                                                                        </block>
                                                                    </next>
                                                                </block>
                                                            </next>
                                                        </block>
                                                    </next>
                                                </block>
                                            </next>
                                        </block>
                                    </next>
                                </block>
                                <block type="sound_playuntildone" id="block8" x="100" y="400">
                                    <value name="SOUND_MENU">
                                        <shadow type="sound_sounds_menu">
                                            <field name="SOUND_MENU">喵</field>
                                        </shadow>
                                    </value>
                                </block>
                            </xml>`
                        }
                    },
                    {
                        timestamp: 336000, // 5:36 - 再添加一个说你好和移动10步的组合
                        type: 'BLOCK_CREATE',
                        data: {
                            xml: `<xml>
                                <block type="event_whenflagclicked" id="block1" x="100" y="100">
                                    <next>
                                        <block type="looks_sayforsecs" id="block2">
                                            <value name="MESSAGE">
                                                <shadow type="text">
                                                    <field name="TEXT">你好</field>
                                                </shadow>
                                            </value>
                                            <value name="SECS">
                                                <shadow type="math_number">
                                                    <field name="NUM">2</field>
                                                </shadow>
                                            </value>
                                            <next>
                                                <block type="motion_movesteps" id="block3">
                                                    <value name="STEPS">
                                                        <shadow type="math_number">
                                                            <field name="NUM">10</field>
                                                        </shadow>
                                                    </value>
                                                    <next>
                                                        <block type="looks_sayforsecs" id="block4">
                                                            <value name="MESSAGE">
                                                                <shadow type="text">
                                                                    <field name="TEXT">你好</field>
                                                                </shadow>
                                                            </value>
                                                            <value name="SECS">
                                                                <shadow type="math_number">
                                                                    <field name="NUM">2</field>
                                                                </shadow>
                                                            </value>
                                                            <next>
                                                                <block type="motion_movesteps" id="block5">
                                                                    <value name="STEPS">
                                                                        <shadow type="math_number">
                                                                            <field name="NUM">10</field>
                                                                        </shadow>
                                                                    </value>
                                                                    <next>
                                                                        <block type="looks_sayforsecs" id="block6">
                                                                            <value name="MESSAGE">
                                                                                <shadow type="text">
                                                                                    <field name="TEXT">山前边有四十四个小狮子</field>
                                                                                </shadow>
                                                                            </value>
                                                                            <value name="SECS">
                                                                                <shadow type="math_number">
                                                                                    <field name="NUM">2</field>
                                                                                </shadow>
                                                                            </value>
                                                                            <next>
                                                                                <block type="motion_movesteps" id="block7">
                                                                                    <value name="STEPS">
                                                                                        <shadow type="math_number">
                                                                                            <field name="NUM">10</field>
                                                                                        </shadow>
                                                                                    </value>
                                                                                    <next>
                                                                                        <block type="looks_sayforsecs" id="block8">
                                                                                            <value name="MESSAGE">
                                                                                                <shadow type="text">
                                                                                                    <field name="TEXT">你好</field>
                                                                                                </shadow>
                                                                                            </value>
                                                                                            <value name="SECS">
                                                                                                <shadow type="math_number">
                                                                                                    <field name="NUM">2</field>
                                                                                                </shadow>
                                                                                            </value>
                                                                                            <next>
                                                                                                <block type="motion_movesteps" id="block9">
                                                                                                    <value name="STEPS">
                                                                                                        <shadow type="math_number">
                                                                                                            <field name="NUM">10</field>
                                                                                                        </shadow>
                                                                                                    </value>
                                                                                                </block>
                                                                                            </next>
                                                                                        </block>
                                                                                    </next>
                                                                                </block>
                                                                            </next>
                                                                        </block>
                                                                    </next>
                                                                </block>
                                                            </next>
                                                        </block>
                                                    </next>
                                                </block>
                                            </next>
                                        </block>
                                    </next>
                                </block>
                                <block type="sound_playuntildone" id="block10" x="100" y="400">
                                    <value name="SOUND_MENU">
                                        <shadow type="sound_sounds_menu">
                                            <field name="SOUND_MENU">喵</field>
                                        </shadow>
                                    </value>
                                </block>
                            </xml>`
                        }
                    },
                    {
                        timestamp: 353000, // 5:53 - 修改第一个说你好
                        type: 'BLOCK_CREATE',
                        data: {
                            xml: `<xml>
                                <block type="event_whenflagclicked" id="block1" x="100" y="100">
                                    <next>
                                        <block type="looks_sayforsecs" id="block2">
                                            <value name="MESSAGE">
                                                <shadow type="text">
                                                    <field name="TEXT">今天给大家说一个绕口令</field>
                                                </shadow>
                                            </value>
                                            <value name="SECS">
                                                <shadow type="math_number">
                                                    <field name="NUM">2</field>
                                                </shadow>
                                            </value>
                                            <next>
                                                <block type="motion_movesteps" id="block3">
                                                    <value name="STEPS">
                                                        <shadow type="math_number">
                                                            <field name="NUM">10</field>
                                                        </shadow>
                                                    </value>
                                                    <next>
                                                        <block type="looks_sayforsecs" id="block4">
                                                            <value name="MESSAGE">
                                                                <shadow type="text">
                                                                    <field name="TEXT">你好</field>
                                                                </shadow>
                                                            </value>
                                                            <value name="SECS">
                                                                <shadow type="math_number">
                                                                    <field name="NUM">2</field>
                                                                </shadow>
                                                            </value>
                                                            <next>
                                                                <block type="motion_movesteps" id="block5">
                                                                    <value name="STEPS">
                                                                        <shadow type="math_number">
                                                                            <field name="NUM">10</field>
                                                                        </shadow>
                                                                    </value>
                                                                    <next>
                                                                        <block type="looks_sayforsecs" id="block6">
                                                                            <value name="MESSAGE">
                                                                                <shadow type="text">
                                                                                    <field name="TEXT">你好</field>
                                                                                </shadow>
                                                                            </value>
                                                                            <value name="SECS">
                                                                                <shadow type="math_number">
                                                                                    <field name="NUM">2</field>
                                                                                </shadow>
                                                                            </value>
                                                                            <next>
                                                                                <block type="motion_movesteps" id="block7">
                                                                                    <value name="STEPS">
                                                                                        <shadow type="math_number">
                                                                                            <field name="NUM">10</field>
                                                                                        </shadow>
                                                                                    </value>
                                                                                    <next>
                                                                                        <block type="looks_sayforsecs" id="block8">
                                                                                            <value name="MESSAGE">
                                                                                                <shadow type="text">
                                                                                                    <field name="TEXT">你好</field>
                                                                                                </shadow>
                                                                                            </value>
                                                                                            <value name="SECS">
                                                                                                <shadow type="math_number">
                                                                                                    <field name="NUM">2</field>
                                                                                                </shadow>
                                                                                            </value>
                                                                                            <next>
                                                                                                <block type="motion_movesteps" id="block9">
                                                                                                    <value name="STEPS">
                                                                                                        <shadow type="math_number">
                                                                                                            <field name="NUM">10</field>
                                                                                                        </shadow>
                                                                                                    </value>
                                                                                                </block>
                                                                                            </next>
                                                                                        </block>
                                                                                    </next>
                                                                                </block>
                                                                            </next>
                                                                        </block>
                                                                    </next>
                                                                </block>
                                                            </next>
                                                        </block>
                                                    </next>
                                                </block>
                                            </next>
                                        </block>
                                    </next>
                                </block>
                                <block type="sound_playuntildone" id="block10" x="100" y="400">
                                    <value name="SOUND_MENU">
                                        <shadow type="sound_sounds_menu">
                                            <field name="SOUND_MENU">喵</field>
                                        </shadow>
                                    </value>
                                </block>
                            </xml>`
                        }
                    },
                    {
                        timestamp: 365000, // 6:05 - 修改第二个说你好
                        type: 'BLOCK_CREATE',
                        data: {
                            xml: `<xml>
                                <block type="event_whenflagclicked" id="block1" x="100" y="100">
                                    <next>
                                        <block type="looks_sayforsecs" id="block2">
                                            <value name="MESSAGE">
                                                <shadow type="text">
                                                    <field name="TEXT">今天给大家说一个绕口令</field>
                                                </shadow>
                                            </value>
                                            <value name="SECS">
                                                <shadow type="math_number">
                                                    <field name="NUM">2</field>
                                                </shadow>
                                            </value>
                                            <next>
                                                <block type="motion_movesteps" id="block3">
                                                    <value name="STEPS">
                                                        <shadow type="math_number">
                                                            <field name="NUM">10</field>
                                                        </shadow>
                                                    </value>
                                                    <next>
                                                        <block type="looks_sayforsecs" id="block4">
                                                            <value name="MESSAGE">
                                                                <shadow type="text">
                                                                    <field name="TEXT">绕口令的名字是小狮子</field>
                                                                </shadow>
                                                            </value>
                                                            <value name="SECS">
                                                                <shadow type="math_number">
                                                                    <field name="NUM">2</field>
                                                                </shadow>
                                                            </value>
                                                            <next>
                                                                <block type="motion_movesteps" id="block5">
                                                                    <value name="STEPS">
                                                                        <shadow type="math_number">
                                                                            <field name="NUM">10</field>
                                                                        </shadow>
                                                                    </value>
                                                                    <next>
                                                                        <block type="looks_sayforsecs" id="block6">
                                                                            <value name="MESSAGE">
                                                                                <shadow type="text">
                                                                                    <field name="TEXT">山前边有四十四个小狮子</field>
                                                                                </shadow>
                                                                            </value>
                                                                            <value name="SECS">
                                                                                <shadow type="math_number">
                                                                                    <field name="NUM">2</field>
                                                                                </shadow>
                                                                            </value>
                                                                            <next>
                                                                                <block type="motion_movesteps" id="block7">
                                                                                    <value name="STEPS">
                                                                                        <shadow type="math_number">
                                                                                            <field name="NUM">10</field>
                                                                                        </shadow>
                                                                                    </value>
                                                                                    <next>
                                                                                        <block type="looks_sayforsecs" id="block8">
                                                                                            <value name="MESSAGE">
                                                                                                <shadow type="text">
                                                                                                    <field name="TEXT">你好</field>
                                                                                                </shadow>
                                                                                            </value>
                                                                                            <value name="SECS">
                                                                                                <shadow type="math_number">
                                                                                                    <field name="NUM">2</field>
                                                                                                </shadow>
                                                                                            </value>
                                                                                            <next>
                                                                                                <block type="motion_movesteps" id="block9">
                                                                                                    <value name="STEPS">
                                                                                                        <shadow type="math_number">
                                                                                                            <field name="NUM">10</field>
                                                                                                        </shadow>
                                                                                                    </value>
                                                                                                </block>
                                                                                            </next>
                                                                                        </block>
                                                                                    </next>
                                                                                </block>
                                                                            </next>
                                                                        </block>
                                                                    </next>
                                                                </block>
                                                            </next>
                                                        </block>
                                                    </next>
                                                </block>
                                            </next>
                                        </block>
                                    </next>
                                </block>
                                <block type="sound_playuntildone" id="block10" x="100" y="400">
                                    <value name="SOUND_MENU">
                                        <shadow type="sound_sounds_menu">
                                            <field name="SOUND_MENU">喵</field>
                                        </shadow>
                                    </value>
                                </block>
                            </xml>`
                        }
                    },
                    {
                        timestamp: 377000, // 6:17 - 修改第三个说你好
                        type: 'BLOCK_CREATE',
                        data: {
                            xml: `<xml>
                                <block type="event_whenflagclicked" id="block1" x="100" y="100">
                                    <next>
                                        <block type="looks_sayforsecs" id="block2">
                                            <value name="MESSAGE">
                                                <shadow type="text">
                                                    <field name="TEXT">今天给大家说一个绕口令</field>
                                                </shadow>
                                            </value>
                                            <value name="SECS">
                                                <shadow type="math_number">
                                                    <field name="NUM">2</field>
                                                </shadow>
                                            </value>
                                            <next>
                                                <block type="motion_movesteps" id="block3">
                                                    <value name="STEPS">
                                                        <shadow type="math_number">
                                                            <field name="NUM">10</field>
                                                        </shadow>
                                                    </value>
                                                    <next>
                                                        <block type="looks_sayforsecs" id="block4">
                                                            <value name="MESSAGE">
                                                                <shadow type="text">
                                                                    <field name="TEXT">绕口令的名字是小狮子</field>
                                                                </shadow>
                                                            </value>
                                                            <value name="SECS">
                                                                <shadow type="math_number">
                                                                    <field name="NUM">2</field>
                                                                </shadow>
                                                            </value>
                                                            <next>
                                                                <block type="motion_movesteps" id="block5">
                                                                    <value name="STEPS">
                                                                        <shadow type="math_number">
                                                                            <field name="NUM">10</field>
                                                                        </shadow>
                                                                    </value>
                                                                    <next>
                                                                        <block type="looks_sayforsecs" id="block6">
                                                                            <value name="MESSAGE">
                                                                                <shadow type="text">
                                                                                    <field name="TEXT">山前边有四十四个小狮子</field>
                                                                                </shadow>
                                                                            </value>
                                                                            <value name="SECS">
                                                                                <shadow type="math_number">
                                                                                    <field name="NUM">2</field>
                                                                                </shadow>
                                                                            </value>
                                                                            <next>
                                                                                <block type="motion_movesteps" id="block7">
                                                                                    <value name="STEPS">
                                                                                        <shadow type="math_number">
                                                                                            <field name="NUM">10</field>
                                                                                        </shadow>
                                                                                    </value>
                                                                                    <next>
                                                                                        <block type="looks_sayforsecs" id="block8">
                                                                                            <value name="MESSAGE">
                                                                                                <shadow type="text">
                                                                                                    <field name="TEXT">你好</field>
                                                                                                </shadow>
                                                                                            </value>
                                                                                            <value name="SECS">
                                                                                                <shadow type="math_number">
                                                                                                    <field name="NUM">2</field>
                                                                                                </shadow>
                                                                                            </value>
                                                                                            <next>
                                                                                                <block type="motion_movesteps" id="block9">
                                                                                                    <value name="STEPS">
                                                                                                        <shadow type="math_number">
                                                                                                            <field name="NUM">10</field>
                                                                                                        </shadow>
                                                                                                    </value>
                                                                                                </block>
                                                                                            </next>
                                                                                        </block>
                                                                                    </next>
                                                                                </block>
                                                                            </next>
                                                                        </block>
                                                                    </next>
                                                                </block>
                                                            </next>
                                                        </block>
                                                    </next>
                                                </block>
                                            </next>
                                        </block>
                                    </next>
                                </block>
                                <block type="sound_playuntildone" id="block10" x="100" y="400">
                                    <value name="SOUND_MENU">
                                        <shadow type="sound_sounds_menu">
                                            <field name="SOUND_MENU">喵</field>
                                        </shadow>
                                    </value>
                                </block>
                            </xml>`
                        }
                    },
                    {
                        timestamp: 377000, // 6:17 - 修改第4个说你好
                        type: 'BLOCK_CREATE',
                        data: {
                            xml: `<xml>
                                <block type="event_whenflagclicked" id="block1" x="100" y="100">
                                    <next>
                                        <block type="looks_sayforsecs" id="block2">
                                            <value name="MESSAGE">
                                                <shadow type="text">
                                                    <field name="TEXT">今天给大家说一个绕口令</field>
                                                </shadow>
                                            </value>
                                            <value name="SECS">
                                                <shadow type="math_number">
                                                    <field name="NUM">2</field>
                                                </shadow>
                                            </value>
                                            <next>
                                                <block type="motion_movesteps" id="block3">
                                                    <value name="STEPS">
                                                        <shadow type="math_number">
                                                            <field name="NUM">10</field>
                                                        </shadow>
                                                    </value>
                                                    <next>
                                                        <block type="looks_sayforsecs" id="block4">
                                                            <value name="MESSAGE">
                                                                <shadow type="text">
                                                                    <field name="TEXT">绕口令的名字是小狮子</field>
                                                                </shadow>
                                                            </value>
                                                            <value name="SECS">
                                                                <shadow type="math_number">
                                                                    <field name="NUM">2</field>
                                                                </shadow>
                                                            </value>
                                                            <next>
                                                                <block type="motion_movesteps" id="block5">
                                                                    <value name="STEPS">
                                                                        <shadow type="math_number">
                                                                            <field name="NUM">10</field>
                                                                        </shadow>
                                                                    </value>
                                                                    <next>
                                                                        <block type="looks_sayforsecs" id="block6">
                                                                            <value name="MESSAGE">
                                                                                <shadow type="text">
                                                                                    <field name="TEXT">山前边有四十四个小狮子</field>
                                                                                </shadow>
                                                                            </value>
                                                                            <value name="SECS">
                                                                                <shadow type="math_number">
                                                                                    <field name="NUM">2</field>
                                                                                </shadow>
                                                                            </value>
                                                                            <next>
                                                                                <block type="motion_movesteps" id="block7">
                                                                                    <value name="STEPS">
                                                                                        <shadow type="math_number">
                                                                                            <field name="NUM">10</field>
                                                                                        </shadow>
                                                                                    </value>
                                                                                    <next>
                                                                                        <block type="looks_sayforsecs" id="block8">
                                                                                            <value name="MESSAGE">
                                                                                                <shadow type="text">
                                                                                                    <field name="TEXT">......</field>
                                                                                                </shadow>
                                                                                            </value>
                                                                                            <value name="SECS">
                                                                                                <shadow type="math_number">
                                                                                                    <field name="NUM">2</field>
                                                                                                </shadow>
                                                                                            </value>
                                                                                            <next>
                                                                                                <block type="motion_movesteps" id="block9">
                                                                                                    <value name="STEPS">
                                                                                                        <shadow type="math_number">
                                                                                                            <field name="NUM">10</field>
                                                                                                        </shadow>
                                                                                                    </value>
                                                                                                </block>
                                                                                            </next>
                                                                                        </block>
                                                                                    </next>
                                                                                </block>
                                                                            </next>
                                                                        </block>
                                                                    </next>
                                                                </block>
                                                            </next>
                                                        </block>
                                                    </next>
                                                </block>
                                            </next>
                                        </block>
                                    </next>
                                </block>
                                <block type="sound_playuntildone" id="block10" x="100" y="400">
                                    <value name="SOUND_MENU">
                                        <shadow type="sound_sounds_menu">
                                            <field name="SOUND_MENU">喵</field>
                                        </shadow>
                                    </value>
                                </block>
                            </xml>`
                        }
                    },
                    
                    {
                        timestamp: 394000, // 6:34 - 添加喵
                        type: 'BLOCK_CREATE',
                        data: {
                            xml: `<xml>
                                <block type="event_whenflagclicked" id="block1" x="100" y="100">
                                    <next>
                                        <block type="looks_sayforsecs" id="block2">
                                            <value name="MESSAGE">
                                                <shadow type="text">
                                                    <field name="TEXT">今天给大家说一个绕口令</field>
                                                </shadow>
                                            </value>
                                            <value name="SECS">
                                                <shadow type="math_number">
                                                    <field name="NUM">2</field>
                                                </shadow>
                                            </value>
                                            <next>
                                                <block type="motion_movesteps" id="block3">
                                                    <value name="STEPS">
                                                        <shadow type="math_number">
                                                            <field name="NUM">10</field>
                                                        </shadow>
                                                    </value>
                                                    <next>
                                                        <block type="looks_sayforsecs" id="block4">
                                                            <value name="MESSAGE">
                                                                <shadow type="text">
                                                                    <field name="TEXT">绕口令的名字是小狮子</field>
                                                                </shadow>
                                                            </value>
                                                            <value name="SECS">
                                                                <shadow type="math_number">
                                                                    <field name="NUM">2</field>
                                                                </shadow>
                                                            </value>
                                                            <next>
                                                                <block type="motion_movesteps" id="block5">
                                                                    <value name="STEPS">
                                                                        <shadow type="math_number">
                                                                            <field name="NUM">10</field>
                                                                        </shadow>
                                                                    </value>
                                                                    <next>
                                                                        <block type="looks_sayforsecs" id="block6">
                                                                            <value name="MESSAGE">
                                                                                <shadow type="text">
                                                                                    <field name="TEXT">山前边有四十四个小狮子</field>
                                                                                </shadow>
                                                                            </value>
                                                                            <value name="SECS">
                                                                                <shadow type="math_number">
                                                                                    <field name="NUM">2</field>
                                                                                </shadow>
                                                                            </value>
                                                                            <next>
                                                                                <block type="motion_movesteps" id="block7">
                                                                                    <value name="STEPS">
                                                                                        <shadow type="math_number">
                                                                                            <field name="NUM">10</field>
                                                                                        </shadow>
                                                                                    </value>
                                                                                    <next>
                                                                                        <block type="looks_sayforsecs" id="block8">
                                                                                            <value name="MESSAGE">
                                                                                                <shadow type="text">
                                                                                                    <field name="TEXT">......</field>
                                                                                                </shadow>
                                                                                            </value>
                                                                                            <value name="SECS">
                                                                                                <shadow type="math_number">
                                                                                                    <field name="NUM">2</field>
                                                                                                </shadow>
                                                                                            </value>
                                                                                            <next>
                                                                                                <block type="motion_movesteps" id="block9">
                                                                                                    <value name="STEPS">
                                                                                                        <shadow type="math_number">
                                                                                                            <field name="NUM">10</field>
                                                                                                        </shadow>
                                                                                                    </value>
                                                                                                    <next>
                                                                                                        <block type="sound_playuntildone" id="block10" x="100" y="400">
                                                                                                            <value name="SOUND_MENU">
                                                                                                                <shadow type="sound_sounds_menu">
                                                                                                                    <field name="SOUND_MENU">喵</field>
                                                                                                                </shadow>
                                                                                                            </value>
                                                                                                        </block>
                                                                                                    </next>
                                                                                                </block>
                                                                                            </next>
                                                                                        </block>
                                                                                    </next>
                                                                                </block>
                                                                            </next>
                                                                        </block>
                                                                    </next>
                                                                </block>
                                                            </next>
                                                        </block>
                                                    </next>
                                                </block>
                                            </next>
                                        </block>
                                    </next>
                                
                            </xml>`
                        }
                    },
                    
                ]
            }
        };
        this.handleLogin = this.handleLogin.bind(this);
        this.handleLogout = this.handleLogout.bind(this);
    }

    handleLogin(username, password) {
        if (login(username, password)) {
            this.setState({
                isLoggedIn: true,
                username: username
            });
            return true;
        }
        return false;
    }

    handleLogout() {
        logout();
        this.setState({
            isLoggedIn: false,
            username: null
        });
    }

    componentDidMount () {
        setIsScratchDesktop(this.props.isScratchDesktop);
        this.props.onStorageInit(storage);
        this.props.onVmInit(this.props.vm);
        this.waitForWorkspace();
        setProjectIdMetadata(this.props.projectId);
    }

    waitForWorkspace() {
        const checkWorkspace = () => {
            const workspace = Blockly.getMainWorkspace();
            if (workspace) {
                this.setState({ workspace });
            } else {
                setTimeout(checkWorkspace, 100);
            }
        };
        checkWorkspace();
    }

    componentDidUpdate (prevProps) {
        if (this.props.projectId !== prevProps.projectId) {
            if (this.props.projectId !== null) {
                this.props.onUpdateProjectId(this.props.projectId);
            }
            setProjectIdMetadata(this.props.projectId);
        }
        if (this.props.isShowingProject && !prevProps.isShowingProject) {
            // this only notifies container when a project changes from not yet loaded to loaded
            // At this time the project view in www doesn't need to know when a project is unloaded
            this.props.onProjectLoaded();
        }
        if (this.props.shouldStopProject && !prevProps.shouldStopProject) {
            this.props.vm.stopAll();
        }
    }

    render () {
        if (this.props.isError) {
            throw new Error(
                `Error in Scratch GUI [location=${window.location}]: ${this.props.error}`);
        }
        const {
            /* eslint-disable no-unused-vars */
            assetHost,
            cloudHost,
            error,
            isError,
            isScratchDesktop,
            isShowingProject,
            onProjectLoaded,
            onStorageInit,
            onUpdateProjectId,
            onVmInit,
            projectHost,
            projectId,
            /* eslint-enable no-unused-vars */
            children,
            fetchingProject,
            isLoading,
            loadingStateVisible,
            ...componentProps
        } = this.props;

        if (!this.state.isLoggedIn) {
            return (
                <LoginPage
                    onLogin={this.handleLogin}
                    onCancel={() => window.location.href = '/'}
                />
            );
        }

        return (
            <GUIComponent
                loading={fetchingProject || isLoading || loadingStateVisible}
                workspace={this.state.workspace}
                tutorialData={this.state.tutorialData}
                {...componentProps}
                isLoggedIn={this.state.isLoggedIn}
                username={this.state.username}
                onLogout={this.handleLogout}
            >
                {children}
            </GUIComponent>
        );
    }
}

GUI.propTypes = {
    assetHost: PropTypes.string,
    children: PropTypes.node,
    cloudHost: PropTypes.string,
    error: PropTypes.oneOfType([PropTypes.object, PropTypes.string]),
    fetchingProject: PropTypes.bool,
    intl: intlShape,
    isError: PropTypes.bool,
    isLoading: PropTypes.bool,
    isScratchDesktop: PropTypes.bool,
    isShowingProject: PropTypes.bool,
    isTotallyNormal: PropTypes.bool,
    loadingStateVisible: PropTypes.bool,
    onProjectLoaded: PropTypes.func,
    onSeeCommunity: PropTypes.func,
    onStorageInit: PropTypes.func,
    onUpdateProjectId: PropTypes.func,
    onVmInit: PropTypes.func,
    projectHost: PropTypes.string,
    projectId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    shouldStopProject: PropTypes.bool,
    telemetryModalVisible: PropTypes.bool,
    vm: PropTypes.instanceOf(VM).isRequired
};

GUI.defaultProps = {
    isScratchDesktop: false,
    isTotallyNormal: false,
    onStorageInit: storageInstance => storageInstance.addOfficialScratchWebStores(),
    onProjectLoaded: () => {},
    onUpdateProjectId: () => {},
    onVmInit: (/* vm */) => {}
};

const mapStateToProps = state => {
    const loadingState = state.scratchGui.projectState.loadingState;
    return {
        activeTabIndex: state.scratchGui.editorTab.activeTabIndex,
        alertsVisible: state.scratchGui.alerts.visible,
        backdropLibraryVisible: state.scratchGui.modals.backdropLibrary,
        blocksTabVisible: state.scratchGui.editorTab.activeTabIndex === BLOCKS_TAB_INDEX,
        cardsVisible: state.scratchGui.cards.visible,
        connectionModalVisible: state.scratchGui.modals.connectionModal,
        costumeLibraryVisible: state.scratchGui.modals.costumeLibrary,
        costumesTabVisible: state.scratchGui.editorTab.activeTabIndex === COSTUMES_TAB_INDEX,
        error: state.scratchGui.projectState.error,
        isError: getIsError(loadingState),
        isFullScreen: state.scratchGui.mode.isFullScreen,
        isPlayerOnly: state.scratchGui.mode.isPlayerOnly,
        isRtl: state.locales.isRtl,
        isShowingProject: getIsShowingProject(loadingState),
        loadingStateVisible: state.scratchGui.modals.loadingProject,
        projectId: state.scratchGui.projectState.projectId,
        soundsTabVisible: state.scratchGui.editorTab.activeTabIndex === SOUNDS_TAB_INDEX,
        targetIsStage: (
            state.scratchGui.targets.stage &&
            state.scratchGui.targets.stage.id === state.scratchGui.targets.editingTarget
        ),
        telemetryModalVisible: state.scratchGui.modals.telemetryModal,
        tipsLibraryVisible: state.scratchGui.modals.tipsLibrary,
        vm: state.scratchGui.vm
    };
};

const mapDispatchToProps = dispatch => ({
    onExtensionButtonClick: () => dispatch(openExtensionLibrary()),
    onActivateTab: tab => dispatch(activateTab(tab)),
    onActivateCostumesTab: () => dispatch(activateTab(COSTUMES_TAB_INDEX)),
    onActivateSoundsTab: () => dispatch(activateTab(SOUNDS_TAB_INDEX)),
    onRequestCloseBackdropLibrary: () => dispatch(closeBackdropLibrary()),
    onRequestCloseCostumeLibrary: () => dispatch(closeCostumeLibrary()),
    onRequestCloseTelemetryModal: () => dispatch(closeTelemetryModal())
});

const ConnectedGUI = injectIntl(connect(
    mapStateToProps,
    mapDispatchToProps
)(GUI));

// note that redux's 'compose' function is just being used as a general utility to make
// the hierarchy of HOC constructor calls clearer here; it has nothing to do with redux's
// ability to compose reducers.
const WrappedGui = compose(
    LocalizationHOC,
    ErrorBoundaryHOC('Top Level App'),
    FontLoaderHOC,
    QueryParserHOC,
    ProjectFetcherHOC,
    TitledHOC,
    ProjectSaverHOC,
    vmListenerHOC,
    vmManagerHOC,
    SBFileUploaderHOC,
    cloudManagerHOC,
    systemPreferencesHOC
)(ConnectedGUI);

WrappedGui.setAppElement = ReactModal.setAppElement;
export default WrappedGui;
