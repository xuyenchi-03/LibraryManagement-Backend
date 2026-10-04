const jwt = require("jsonwebtoken");

function authenticateToken(req, res, next) {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
        return res.status(401).json({
            message: "Chưa đăng nhập!"
        });
    }

    const token = authHeader.split(" ")[1];

    if (!token) {
        return res.status(401).json({
            message: "Token không hợp lệ!"
        });
    }

    try {
        const user = jwt.verify(token, process.env.JWT_SECRET);
        req.user = user;
        next();
    } catch (err) {
        return res.status(403).json({
            message: "Token hết hạn hoặc không hợp lệ!"
        });
    }
}

function authorizeRoles(...roles) {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                message: "Chưa đăng nhập!"
            });
        }

        if (!roles.includes(req.user.role)) {
            return res.status(403).json({
                message: "Bạn không có quyền thực hiện chức năng này!"
            });
        }

        next();
    };
}

module.exports = {
    authenticateToken,
    authorizeRoles
};