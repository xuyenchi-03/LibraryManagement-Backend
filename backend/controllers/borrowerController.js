const db = require("../config/db");

async function getBorrowers(req, res) {
    try {
        const { search } = req.query;

        let sql = "SELECT * FROM borrowers WHERE 1=1";
        const params = [];

        if (search) {
            sql += " AND (name LIKE ? OR phone LIKE ? OR email LIKE ?)";

            const value = `%${search}%`;

            params.push(value, value, value);
        }

        sql += " ORDER BY id DESC";

        const [borrowers] = await db.query(sql, params);

        res.json(borrowers);
    } catch (err) {
        console.log(err);

        res.status(500).json({
            message: "Lỗi Server!"
        });
    }
}

async function getBorrowerById(req, res) {
    try {
        const [borrowers] = await db.query(
            "SELECT * FROM borrowers WHERE id = ?",
            [req.params.id]
        );

        if (borrowers.length === 0) {
            return res.status(404).json({
                message: "Không tìm thấy người mượn!"
            });
        }

        res.json(borrowers[0]);
    } catch (err) {
        console.log(err);

        res.status(500).json({
            message: "Lỗi Server!"
        });
    }
}

async function addBorrower(req, res) {
    try {
        const { name, phone, email, address } = req.body;

        if (!name) {
            return res.status(400).json({
                message: "Vui lòng nhập tên người mượn!"
            });
        }

        const [result] = await db.query(
            "INSERT INTO borrowers(name, phone, email, address) VALUES (?, ?, ?, ?)",
            [
                name,
                phone || null,
                email || null,
                address || null
            ]
        );

        res.status(201).json({
            message: "Thêm người mượn thành công!",
            id: result.insertId
        });
    } catch (err) {
        console.log(err);

        res.status(500).json({
            message: "Lỗi Server!"
        });
    }
}

async function updateBorrower(req, res) {
    try {
        const { name, phone, email, address } = req.body;

        const [borrowers] = await db.query(
            "SELECT * FROM borrowers WHERE id = ?",
            [req.params.id]
        );

        if (borrowers.length === 0) {
            return res.status(404).json({
                message: "Không tìm thấy người mượn!"
            });
        }

        const oldBorrower = borrowers[0];

        await db.query(
            "UPDATE borrowers SET name = ?, phone = ?, email = ?, address = ? WHERE id = ?",
            [
                name ?? oldBorrower.name,
                phone ?? oldBorrower.phone,
                email ?? oldBorrower.email,
                address ?? oldBorrower.address,
                req.params.id
            ]
        );

        res.json({
            message: "Cập nhật người mượn thành công!"
        });
    } catch (err) {
        console.log(err);

        res.status(500).json({
            message: "Lỗi Server!"
        });
    }
}

async function deleteBorrower(req, res) {
    try {
        const [borrowers] = await db.query(
            "SELECT * FROM borrowers WHERE id = ?",
            [req.params.id]
        );

        if (borrowers.length === 0) {
            return res.status(404).json({
                message: "Không tìm thấy người mượn!"
            });
        }

        const [records] = await db.query(
            "SELECT id FROM borrow_records WHERE borrower_id = ? LIMIT 1",
            [req.params.id]
        );

        if (records.length > 0) {
            return res.status(400).json({
                message: "Không thể xóa người mượn đã có lịch sử mượn!"
            });
        }

        await db.query(
            "DELETE FROM borrowers WHERE id = ?",
            [req.params.id]
        );

        res.json({
            message: "Xóa người mượn thành công!"
        });
    } catch (err) {
        console.log(err);

        res.status(500).json({
            message: "Lỗi Server!"
        });
    }
}

module.exports = {
    getBorrowers,
    getBorrowerById,
    addBorrower,
    updateBorrower,
    deleteBorrower
};