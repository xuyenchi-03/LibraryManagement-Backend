const db = require("../config/db");

async function getBorrowStatistics(req, res) {
    try {
        const [statistics] = await db.query(`
            SELECT
                YEAR(borrow_date) AS year,
                MONTH(borrow_date) AS month,
                COUNT(*) AS total_borrows
            FROM borrow_records
            GROUP BY YEAR(borrow_date), MONTH(borrow_date)
            ORDER BY year DESC, month DESC
        `);

        res.json(statistics);
    } catch (err) {
        console.log(err);

        res.status(500).json({
            message: "Lỗi Server!"
        });
    }
}

async function getOverdueBooks(req, res) {
    try {
        const [books] = await db.query(`
            SELECT
                br.id AS borrow_record_id,
                b.id AS borrower_id,
                b.name AS borrower_name,
                bo.id AS book_id,
                bo.title,
                br.borrow_date,
                br.due_date,
                DATEDIFF(CURDATE(), br.due_date) AS overdue_days
            FROM borrow_records br
            JOIN borrowers b ON br.borrower_id = b.id
            JOIN borrow_details bd ON br.id = bd.borrow_record_id
            JOIN books bo ON bd.book_id = bo.id
            WHERE br.status = 'borrowed'
            AND br.due_date < CURDATE()
            ORDER BY br.due_date ASC
        `);

        res.json(books);
    } catch (err) {
        console.log(err);

        res.status(500).json({
            message: "Lỗi Server!"
        });
    }
}

module.exports = {
    getBorrowStatistics,
    getOverdueBooks
};