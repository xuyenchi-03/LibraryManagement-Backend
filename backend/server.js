const express = require("express");
const cors = require("cors");
require("dotenv").config();

const authRoutes = require("./routes/authRoutes");
const bookRoutes = require("./routes/bookRoutes");
const borrowerRoutes = require("./routes/borrowerRoutes");
const borrowRoutes = require("./routes/borrowRoutes");
const statisticsRoutes = require("./routes/statisticsRoutes");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
    res.json({
        message: "Library Management API đang hoạt động!"
    });
});

app.use("/api/auth", authRoutes);
app.use("/api/books", bookRoutes);
app.use("/api/borrowers", borrowerRoutes);
app.use("/api/borrow", borrowRoutes);
app.use("/api/statistics", statisticsRoutes);

app.use((req, res) => {
    res.status(404).json({
        message: "API không tồn tại!"
    });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server đang chạy tại http://localhost:${PORT}`);
});