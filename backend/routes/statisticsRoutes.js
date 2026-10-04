const express = require("express");
const router = express.Router();

const {
    getBorrowStatistics,
    getOverdueBooks
} = require("../controllers/statisticsController");

const {
    authenticateToken,
    authorizeRoles
} = require("../middleware/authMiddleware");

router.get(
    "/borrow",
    authenticateToken,
    authorizeRoles("admin", "librarian"),
    getBorrowStatistics
);

router.get(
    "/overdue",
    authenticateToken,
    authorizeRoles("admin", "librarian"),
    getOverdueBooks
);

module.exports = router;