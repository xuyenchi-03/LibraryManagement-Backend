const express = require("express");
const router = express.Router();

const {
    borrowBook,
    returnBook,
    getBorrowHistory
} = require("../controllers/borrowController");

const {
    authenticateToken,
    authorizeRoles
} = require("../middleware/authMiddleware");

router.post(
    "/",
    authenticateToken,
    authorizeRoles("admin", "librarian"),
    borrowBook
);

router.post(
    "/return",
    authenticateToken,
    authorizeRoles("admin", "librarian"),
    returnBook
);

router.get(
    "/history",
    authenticateToken,
    getBorrowHistory
);

module.exports = router;