// 页面加载时清除登录状态
window.onload = () => {
    // 清除之前的登录信息，强制每次重新登录
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('username');
    localStorage.removeItem('expireTime');
};

// 模拟用户数据
const fakeUsers = {
    'admin': 'admin',
    'test': 'test',
    'teacher': 'teacher',
    'student': 'student'
};

// 登录功能
export const login = (username, password) => {
    // 检查用户名和密码是否匹配
    if (fakeUsers[username] === password) {
        // 设置登录状态和用户名
        localStorage.setItem('isLoggedIn', 'true');
        localStorage.setItem('username', username);

        // 设置登录的过期时间（例如30分钟）
        const expireTime = Date.now() + 30 * 60 * 1000; // 30分钟后过期
        localStorage.setItem('expireTime', expireTime);

        return true;
    }
    return false;
};

// 判断用户是否登录，并检查是否过期
export const isLoggedIn = () => {
    const expireTime = localStorage.getItem('expireTime');

    // 检查是否过期，过期则删除登录状态
    if (expireTime && Date.now() > expireTime) {
        logout(); // 过期后强制注销
        return false;
    }

    return localStorage.getItem('isLoggedIn') === 'true';
};

// 注销功能
export const logout = () => {
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('username');
    localStorage.removeItem('expireTime');
};

// 获取用户名
export const getUsername = () => {
    return localStorage.getItem('username');
};
