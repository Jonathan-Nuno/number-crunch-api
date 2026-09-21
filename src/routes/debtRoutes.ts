import express from "express";
import { DebtController } from "../controllers/DebtController";
import { Debt } from "../models/Debt";

const router = express.Router();

const MAX_MONEY_VALUE = 100_000_000;

const isNumberInRange = (value: unknown, min: number, max: number) =>
  typeof value === "number" &&
  Number.isFinite(value) &&
  value >= min &&
  value <= max;

router.post("/api/calculate", (req, res) => {
  if (
    typeof req.body !== "object" ||
    req.body === null ||
    Array.isArray(req.body)
  ) {
    return res.status(400).json({ error: "Request body must be a JSON object" });
  }

  const {
    balance,
    interestRate,
    minimumPayment,
    flatMinimumPayment,
    extraPayment,
  } = req.body as Debt;

  const normalizedExtraPayment = extraPayment ?? 0;

  if (
    !isNumberInRange(balance, Number.EPSILON, MAX_MONEY_VALUE) ||
    !isNumberInRange(interestRate, 0, 100) ||
    !isNumberInRange(minimumPayment, 0, MAX_MONEY_VALUE) ||
    typeof flatMinimumPayment !== "boolean" ||
    !isNumberInRange(normalizedExtraPayment, 0, MAX_MONEY_VALUE) ||
    (flatMinimumPayment && minimumPayment === 0)
  ) {
    return res.status(400).json({
      error:
        "Invalid calculator input. Supply finite, non-negative values within the supported ranges.",
    });
  }

  const debt = new Debt(
    balance,
    interestRate,
    minimumPayment,
    flatMinimumPayment,
    normalizedExtraPayment
  );

  try {
    const paymentSchedule = DebtController.calculatePayment(debt);
    return res.json(paymentSchedule);
  } catch (error) {
    if (error instanceof RangeError) {
      return res.status(422).json({ error: error.message });
    }

    throw error;
  }
});

export default router;
