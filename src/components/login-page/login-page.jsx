import React, { useState } from 'react';
import PropTypes from 'prop-types';
import {FormattedMessage} from 'react-intl';
import styles from './login-page.css';

const LoginPage = ({onLogin, onCancel}) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!username || !password) {
            setError('请输入用户名和密码');
            return;
        }
        if (onLogin(username, password)) {
            setError('');
        } else {
            setError('用户名或密码错误');
        }
    };

    return (
        <div className={styles.loginPageWrapper}>
            <div className={styles.loginBox}>
                <h2>
                    <FormattedMessage
                        defaultMessage="登录"
                        description="Title for login modal"
                        id="gui.login.title"
                    />
                </h2>
                {error && <div className={styles.errorMessage}>{error}</div>}
                <form onSubmit={handleSubmit}>
                    <div className={styles.formGroup}>
                        <label>
                            <FormattedMessage
                                defaultMessage="用户名"
                                description="Label for username input"
                                id="gui.login.username"
                            />
                        </label>
                        <input
                            type="text"
                            value={username}
                            onChange={e => setUsername(e.target.value)}
                        />
                    </div>
                    <div className={styles.formGroup}>
                        <label>
                            <FormattedMessage
                                defaultMessage="密码"
                                description="Label for password input"
                                id="gui.login.password"
                            />
                        </label>
                        <input
                            type="password"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                        />
                    </div>
                    <div className={styles.buttonGroup}>
                        <button type="submit" className={styles.loginButton}>
                            <FormattedMessage
                                defaultMessage="登录"
                                description="Button text for login button"
                                id="gui.login.submit"
                            />
                        </button>
                        <button 
                            type="button" 
                            className={styles.cancelButton}
                            onClick={onCancel}
                        >
                            <FormattedMessage
                                defaultMessage="取消"
                                description="Button text for cancel button"
                                id="gui.login.cancel"
                            />
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

LoginPage.propTypes = {
    onLogin: PropTypes.func.isRequired,
    onCancel: PropTypes.func.isRequired
};

export default LoginPage; 