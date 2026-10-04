const express = require("express");
const router = express.Router();

const {
    getBooks,
    getBookById,
    addBook,
    updateBook,
    deleteBook
} = require("../controllers/bookController");

const {
    authenticateToken,
    authorizeRoles
} = require("../middleware/authMiddleware");

router.get("/", authenticateToken, getBooks);
router.get("/:id", authenticateToken, getBookById);

router.post(
    "/",
    authenticateToken,
    authorizeRoles("admin", "librarian"),
    addBook
);

router.put(
    "/:id",
    authenticateToken,
    authorizeRoles("admin", "librarian"),
    updateBook
);

router.delete(
    "/:id",
    authenticateToken,
    authorizeRoles("admin"),
    deleteBook
);

module.exports = router;