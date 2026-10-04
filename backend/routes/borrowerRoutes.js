const express = require("express");
const router = express.Router();

const {
    getBorrowers,
    getBorrowerById,
    addBorrower,
    updateBorrower,
    deleteBorrower
} = require("../controllers/borrowerController");

const {
    authenticateToken,
    authorizeRoles
} = require("../middleware/authMiddleware");

router.get("/", authenticateToken, getBorrowers);
router.get("/:id", authenticateToken, getBorrowerById);

router.post(
    "/",
    authenticateToken,
    authorizeRoles("admin", "librarian"),
    addBorrower
);

router.put(
    "/:id",
    authenticateToken,
    authorizeRoles("admin", "librarian"),
    updateBorrower
);

router.delete(
    "/:id",
    authenticateToken,
    authorizeRoles("admin"),
    deleteBorrower
);

module.exports = router;