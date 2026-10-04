const db = require("../config/db");

async function getBooks(req, res) {
    try {
        const { search, author, category } = req.query;

        let sql = "SELECT * FROM books WHERE 1=1";
        const params = [];

        if (search) {
            sql += " AND title LIKE ?";
            params.push(`%${search}%`);
        }

        if (author) {
            sql += " AND author LIKE ?";
            params.push(`%${author}%`);
        }

        if (category) {
            sql += " AND category LIKE ?";
            params.push(`%${category}%`);
        }

        sql += " ORDER BY id DESC";

        const [books] = await db.query(sql, params);

        res.json(books);
    } catch (err) {
        console.log(err);

        res.status(500).json({
            message: "Lỗi Server!"
        });
    }
}

async function getBookById(req, res) {
    try {
        const [books] = await db.query(
            "SELECT * FROM books WHERE id = ?",
            [req.params.id]
        );

        if (books.length === 0) {
            return res.status(404).json({
                message: "Không tìm thấy sách!"
            });
        }

        res.json(books[0]);
    } catch (err) {
        console.log(err);

        res.status(500).json({
            message: "Lỗi Server!"
        });
    }
}

async function addBook(req, res) {
    try {
        const { title, author, category, quantity } = req.body;

        if (!title || !author || !category || quantity === undefined) {
            return res.status(400).json({
                message: "Vui lòng nhập đầy đủ thông tin!"
            });
        }

        const bookQuantity = Number(quantity);

        if (bookQuantity < 0) {
            return res.status(400).json({
                message: "Số lượng không hợp lệ!"
            });
        }

        const status = bookQuantity > 0 ? "available" : "unavailable";

        const [result] = await db.query(
            "INSERT INTO books(title, author, category, quantity, status) VALUES (?, ?, ?, ?, ?)",
            [title, author, category, bookQuantity, status]
        );

        res.status(201).json({
            message: "Thêm sách thành công!",
            id: result.insertId
        });
    } catch (err) {
        console.log(err);

        res.status(500).json({
            message: "Lỗi Server!"
        });
    }
}

async function updateBook(req, res) {
    try {
        const { title, author, category, quantity } = req.body;

        const [books] = await db.query(
            "SELECT * FROM books WHERE id = ?",
            [req.params.id]
        );

        if (books.length === 0) {
            return res.status(404).json({
                message: "Không tìm thấy sách!"
            });
        }

        const oldBook = books[0];

        const newTitle = title ?? oldBook.title;
        const newAuthor = author ?? oldBook.author;
        const newCategory = category ?? oldBook.category;
        const newQuantity =
            quantity === undefined ? oldBook.quantity : Number(quantity);

        if (newQuantity < 0) {
            return res.status(400).json({
                message: "Số lượng không hợp lệ!"
            });
        }

        const status = newQuantity > 0 ? "available" : "unavailable";

        await db.query(
            "UPDATE books SET title = ?, author = ?, category = ?, quantity = ?, status = ? WHERE id = ?",
            [
                newTitle,
                newAuthor,
                newCategory,
                newQuantity,
                status,
                req.params.id
            ]
        );

        res.json({
            message: "Cập nhật sách thành công!"
        });
    } catch (err) {
        console.log(err);

        res.status(500).json({
            message: "Lỗi Server!"
        });
    }
}

async function deleteBook(req, res) {
    try {
        const [books] = await db.query(
            "SELECT * FROM books WHERE id = ?",
            [req.params.id]
        );

        if (books.length === 0) {
            return res.status(404).json({
                message: "Không tìm thấy sách!"
            });
        }

        const [borrowDetails] = await db.query(
            "SELECT id FROM borrow_details WHERE book_id = ? LIMIT 1",
            [req.params.id]
        );

        if (borrowDetails.length > 0) {
            return res.status(400).json({
                message: "Không thể xóa sách đã có lịch sử mượn!"
            });
        }

        await db.query(
            "DELETE FROM books WHERE id = ?",
            [req.params.id]
        );

        res.json({
            message: "Xóa sách thành công!"
        });
    } catch (err) {
        console.log(err);

        res.status(500).json({
            message: "Lỗi Server!"
        });
    }
}

module.exports = {
    getBooks,
    getBookById,
    addBook,
    updateBook,
    deleteBook
};