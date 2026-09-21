import { Debt } from "../models/Debt";

interface PaymentScheduleItem {
  principalPaid: number;
  interestPaid: number;
  extraPayment: number;
  balance: number;
}

interface PaymentInformation {
  totalPaidInterest: number;
  totalPaidPrincipal: number;
  totalPaidBalance: number;
  totalPaymentsMade: number;
}

export class DebtController {
  private static readonly MAX_PAYMENT_MONTHS = 1_200;

  public static calculatePayment(debt: Debt) {
    const paymentSchedule = this.generatePaymentSchedule(debt);

    const paymentInformation: PaymentInformation = {
      totalPaidInterest: paymentSchedule.reduce(
        (sum, item) => sum + item.interestPaid,
        0
      ),
      totalPaidPrincipal: paymentSchedule.reduce(
        (sum, item) => sum + item.principalPaid,
        0
      ),
      totalPaymentsMade: paymentSchedule.length,
      totalPaidBalance: 0,
    };

    paymentInformation.totalPaidBalance =
      paymentInformation.totalPaidInterest +
      paymentInformation.totalPaidPrincipal;

    return { paymentInformation, paymentSchedule };
  }

  private static calculateMinimumPayment(debt: Debt): number {
    if (debt.flatMinimumPayment === true) {
      return debt.minimumPayment;
    }

    return Math.max(25, debt.balance * 0.02);
  }

  private static generatePaymentSchedule(debt: Debt) {
    const paymentSchedule: PaymentScheduleItem[] = [];
    let balance = debt.balance;

    while (balance > 0 && paymentSchedule.length < this.MAX_PAYMENT_MONTHS) {
      const interestPaid = balance * (debt.interestRate / 1_200);
      const minimumPayment = this.calculateMinimumPayment({ ...debt, balance });
      const totalPayment = Math.min(
        minimumPayment + debt.extraPayment,
        balance + interestPaid
      );
      const principalPaid = totalPayment - interestPaid;

      if (!Number.isFinite(principalPaid) || principalPaid <= 0) {
        throw new RangeError(
          "The payment must be greater than the monthly interest charge"
        );
      }

      const extraPayment = Math.min(
        debt.extraPayment,
        Math.max(0, totalPayment - Math.min(minimumPayment, totalPayment))
      );
      balance = Math.max(balance - principalPaid, 0);

      paymentSchedule.push({
        principalPaid,
        interestPaid,
        extraPayment,
        balance,
      });
    }

    if (balance > 0) {
      throw new RangeError("The repayment period exceeds 100 years");
    }

    return paymentSchedule;
  }
}
