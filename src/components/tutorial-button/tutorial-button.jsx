import React from 'react';
import PropTypes from 'prop-types';
import {FormattedMessage} from 'react-intl';
import styles from './tutorial-button.css';

const TutorialButton = ({onClick}) => (
    <button
        className={styles.tutorialButton}
        onClick={onClick}
    >
        <FormattedMessage
            defaultMessage="教学视频"
            description="Button to open tutorial video list"
            id="gui.menuBar.tutorialButton"
        />
    </button>
);

TutorialButton.propTypes = {
    onClick: PropTypes.func.isRequired
};

export default TutorialButton; 