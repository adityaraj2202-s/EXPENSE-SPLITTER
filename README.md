# 💸 Expense Splitter

A full-stack web application designed to simplify shared living, group trips, and collective bills by tracking expenses, computing split allocations, and managing debt settlements.

Built as part of the **ALTA BUILDER 30** (Track A: Days 1–15).

---

## 🚀 Tech Stack

- **Runtime & Framework:** Node.js, Express.js
- **Database:** SQLite (`better-sqlite3`)
- **Authentication & Security:** JSON Web Tokens (`jsonwebtoken`), Password Hashing (`bcryptjs`)
- **Environment:** Node ES Modules (`"type": "module"`), `dotenv`

---

## 📁 Project Structure

```text
EXPENSE SPLITTER/
├── .gitignore
├── README.md
└── server/
    ├── .env
    ├── db.js
    ├── package.json
    ├── server.js
    └── expenses.db