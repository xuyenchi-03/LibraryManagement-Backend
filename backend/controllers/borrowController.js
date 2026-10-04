const db = require("../config/db");

async function borrowBook(req, res) {
    const connection = await db.getConnection();

    try {
        const { borrower_id, book_id, due_date } = req.body;

        if (!borrower_id || !book_id || !due_date) {
            return res.status(400).json({
                message: "Vui lòng nhập đầy đủ thông tin mượn sách!"
            });
        }

        await connection.beginTransaction();

        const [borrowers] = await connection.query(
            "SELECT id FROM borrowers WHERE id = ?",
            [borrower_id]
        );

        if (borrowers.length === 0) {
            await connection.rollback();

            return res.status(404).json({
                message: "Không tìm thấy người mượn!"
            });
        }

        const [books] = await connection.query(
            "SELECT * FROM books WHERE id = ? FOR UPDATE",
            [book_id]
        );

        if (books.length === 0) {
            await connection.rollback();

            return res.status(404).json({
                message: "Không tìm thấy sách!"
            });
        }

        if (books[0].quantity <= 0) {
            await connection.rollback();

            return res.status(400).json({
                message: "Sách đã hết!"
            });
        }

        const [active] = await connection.query(
            `SELECT br.id
             FROM borrow_records br
             JOIN borrow_details bd ON br.id = bd.borrow_record_id
             WHERE br.borrower_id = ?
             AND bd.book_id = ?
             AND br.status = 'borrowed'`,
            [borrower_id, book_id]
        );

        if (active.length > 0) {
            await connection.rollback();

            return res.status(400).json({
                message: "Người này đang mượn sách này!"
            });
        }

        const [record] = await connection.query(
            `INSERT INTO borrow_records
            (borrower_id, borrow_date, due_date, status)
            VALUES (?, CURDATE(), ?, 'borrowed')`,
            [borrower_id, due_date]
        );

        await connection.query(
            `INSERT INTO borrow_details
            (borrow_record_id, book_id, quantity)
            VALUES (?, ?, 1)`,
            [record.insertId, book_id]
        );

        const newQuantity = books[0].quantity - 1;
        const status = newQuantity > 0 ? "available" : "unavailable";

        await connection.query(
            "UPDATE books SET quantity = ?, status = ? WHERE id = ?",
            [newQuantity, status, book_id]
        );

        await connection.commit();

        res.status(201).json({
            message: "Mượn sách thành công!",
            borrow_record_id: record.insertId
        });
    } catch (err) {
        await connection.rollback();

        console.log(err);

        res.status(500).json({
            message: "Lỗi Server!"
        });
    } finally {
        connection.release();
    }
}

async function returnBook(req, res) {
    const connection = await db.getConnection();

    try {
        const { borrow_record_id } = req.body;

        if (!borrow_record_id) {
            return res.status(400).json({
                message: "Vui lòng nhập mã phiếu mượn!"
            });
        }

        await connection.beginTransaction();

        const [records] = await connection.query(
            `SELECT *
             FROM borrow_records
             WHERE id = ?
             AND status = 'borrowed'
             FOR UPDATE`,
            [borrow_record_id]
        );

        if (records.length === 0) {
            await connection.rollback();

            return res.status(404).json({
                message: "Không tìm thấy phiếu mượn đang hoạt động!"
            });
        }

        const [details] = await connection.query(
            "SELECT * FROM borrow_details WHERE borrow_record_id = ?",
            [borrow_record_id]
        );

        for (const detail of details) {
            await connection.query(
                `UPDATE books
                 SET quantity = quantity + ?, status = 'available'
                 WHERE id = ?`,
                [detail.quantity, detail.book_id]
            );
        }

        const dueDate = new Date(records[0].due_date);
        const today = new Date();

        const status = today > dueDate
            ? "overdue"
            : "returned";

        await connection.query(
            `UPDATE borrow_records
             SET return_date = CURDATE(), status = ?
             WHERE id = ?`,
            [status, borrow_record_id]
        );

        await connection.commit();

        res.json({
            message: "Trả sách thành công!",
            status
        });
    } catch (err) {
        await connection.rollback();

        console.log(err);

        res.status(500).json({
            message: "Lỗi Server!"
        });
    } finally {
        connection.release();
    }
}

async function getBorrowHistory(req, res) {
    try {
        const [history] = await db.query(`
            SELECT
                br.id,
                br.borrower_id,
                b.name AS borrower_name,
                br.borrow_date,
                br.due_date,
                br.return_date,
                br.status,
                bd.book_id,
                bo.title,
                bd.quantity
            FROM borrow_records br
            JOIN borrowers b ON br.borrower_id = b.id
            JOIN borrow_details bd ON br.id = bd.borrow_record_id
            JOIN books bo ON bd.book_id = bo.id
            ORDER BY br.id DESC
        `);

        res.json(history);
    } catch (err) {
        console.log(err);

        res.status(500).json({
            message: "Lỗi Server!"
        });
    }
}

module.exports = {
    borrowBook,
    returnBook,
    getBorrowHistory
};