// server.js
const express = require('express');
const bodyParser = require('body-parser');
const app = express();

// 使用内存存储用户数据（仅用于开发）
const users = new Map();

app.use(bodyParser.json());

// 添加错误处理中间件
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});

// 注册接口
app.post('/api/register', (req, res) => {
    try {
        const { username, password } = req.body;

        // 验证用户输入
        if (!username || !password) {
            return res.status(400).json({ error: '用户名和密码不能为空' });
        }

        // 检查用户名是否已存在
        if (users.has(username)) {
            return res.status(400).json({ error: '用户名已存在' });
        }

        // 存储用户信息
        users.set(username, {
            username,
            password // 注意：实际应用中应该对密码进行加密
        });

        // 返回成功响应
        res.json({ username });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ error: '注册失败' });
    }
});

// 登录接口
app.post('/api/login', (req, res) => {
    try {
        const { username, password } = req.body;

        // 验证用户输入
        if (!username || !password) {
            return res.status(400).json({ error: '用户名和密码不能为空' });
        }

        // 检查用户是否存在
        const user = users.get(username);
        if (!user) {
            return res.status(401).json({ error: '用户名或密码错误' });
        }

        // 验证密码
        if (user.password !== password) {
            return res.status(401).json({ error: '用户名或密码错误' });
        }

        // 返回成功响应
        res.json({ username });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: '登录失败' });
    }
});

// 启动服务器
const PORT = 3601;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
