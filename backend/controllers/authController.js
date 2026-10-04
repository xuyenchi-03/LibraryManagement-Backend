const db = require("../config/db");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

async function register(req, res) {
    try {
        const { username, password, role } = req.body;

        if (!username || !password) {
            return res.status(400).json({
                message: "Vui lòng nhập username và password!"
            });
        }

        const [exists] = await db.query(
            "SELECT id FROM users WHERE username = ?",
            [username]
        );

        if (exists.length > 0) {
            return res.status(400).json({
                message: "Username đã tồn tại!"
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const userRole = role === "admin" ? "admin" : "librarian";

        const [result] = await db.query(
            "INSERT INTO users(username, password, role) VALUES (?, ?, ?)",
            [username, hashedPassword, userRole]
        );

        res.status(201).json({
            message: "Đăng ký thành công!",
            user: {
                id: result.insertId,
                username,
                role: userRole
            }
        });
    } catch (err) {
        console.log(err);

        res.status(500).json({
            message: "Lỗi Server!"
        });
    }
}

async function login(req, res) {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({
                message: "Vui lòng nhập username và password!"
            });
        }

        const [users] = await db.query(
            "SELECT * FROM users WHERE username = ?",
            [username]
        );

        if (users.length === 0) {
            return res.status(401).json({
                message: "Sai username hoặc password!"
            });
        }

        const user = users[0];

        const passwordMatch = await bcrypt.compare(
            password,
            user.password
        );

        if (!passwordMatch) {
            return res.status(401).json({
                message: "Sai username hoặc password!"
            });
        }

        const token = jwt.sign(
            {
                id: user.id,
                username: user.username,
                role: user.role
            },
            process.env.JWT_SECRET,
            {
                expiresIn: "8h"
            }
        );

        res.json({
            message: "Đăng nhập thành công!",
            token,
            user: {
                id: user.id,
                username: user.username,
                role: user.role
            }
        });
    } catch (err) {
        console.log(err);

        res.status(500).json({
            message: "Lỗi Server!"
        });
    }
}

function logout(req, res) {
    res.json({
        message: "Đăng xuất thành công!"
    });
}

module.exports = {
    register,
    login,
    logout
};