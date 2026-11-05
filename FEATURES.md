# Expense Splitter - Product Scope & Features

## 1. Problem Statement
Splitting shared bills, group dinners, and trip costs with friends often leads to confusion, manual calculation mistakes, and forgotten repayments. The Expense Splitter application provides an easy way for groups to log shared expenses, split amounts fairly (equally or with custom shares), and see the simplest way to settle up with minimum payments.

---

## 2. User Roles
- **Standard Member:** Can register, log in, create groups, add expenses, split costs, view balances, and mark debts as settled.
- **Group Admin:** Creator of a group who can rename groups, invite friends, and manage members.

---

## 3. MVP Features (Must-Haves for Days 1–15)
1. **User Authentication:** Sign up and log in securely with hashed passwords and JWT tokens.
2. **Group Management:** Create groups and add group members.
3. **Add Expenses:** Log an expense with title, cost, category, date, and who paid.
4. **Equal Split:** Split an expense equally among all or selected members.
5. **Custom / Exact Split:** Split an expense by exact specific amounts per person.
6. **Expense History:** View a clean list of past expenses with details.
7. **Net Balances:** See who owes money and who is owed money in real time.
8. **Smart Debt Simplification:** Automatically calculate the fewest payments needed to clear all balances.
9. **Settle Up Action:** Mark debts as paid to reset balances.
10. **Clean Web UI:** Responsive, easy-to-use interface with error messages and loading indicators.

---

## 4. Future Features (Planned for Later)
- Receipt image scanner (AI OCR) to auto-fill items.
- Currency converter for international travel.
- Export group summaries to PDF / Excel.
- WhatsApp or email balance notifications.