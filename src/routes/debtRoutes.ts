import express from "express";
import { DebtController } from "../controllers/DebtController";
import { Debt } from "../models/Debt";

const router = express.Router();

router.post("/api/calculate", (req, res) => {
  const {
    balance,
    interestRate,
    minimumPayment,
    flatMinimumPayment,
    extraPayment,
  } = req.body as Debt;

  if (
    typeof balance !== "number" ||
    typeof minimumPayment !== "number" ||
    typeof interestRate !== "number"
  ) {
    return res.status(400).json({ error: "Invalid data" });
  }

  const debt = new Debt(
    balance,
    interestRate,
    minimumPayment,
    flatMinimumPayment,
    extraPayment
  );

  const paymentSchedule = DebtController.calculatePayment(debt);
  res.json(paymentSchedule);
});

export default router;
