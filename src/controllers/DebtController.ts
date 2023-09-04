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
  public static calculatePayment(debt: Debt) {
    const paymentSchedule = this.generatePaymentSchedule(debt);

    const paymentInformation: PaymentInformation = {
      totalPaidInterest: paymentSchedule.reduce(
        (sum, item) => sum + item.interestPaid,
        0
      ),
      totalPaidPrincipal: paymentSchedule.reduce(
        (sum, item) => sum + item.principalPaid + item.extraPayment,
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
    if (debt.flatMinimumPayment === "Yes") {
      return debt.minimumPayment;
    }

    return Math.max(25, debt.balance * 0.02);
  }

  private static generatePaymentSchedule(debt: Debt) {
    const paymentSchedule: PaymentScheduleItem[] = [];

    while (debt.balance > 0) {
      const interestPaid = debt.balance * ((debt.interestRate * 0.01) / 12);
      const minimumPayment = this.calculateMinimumPayment(debt);
      const principalPaid = minimumPayment + debt.extraPayment - interestPaid;
      debt.balance -= principalPaid + debt.extraPayment;

      paymentSchedule.push({
        principalPaid,
        interestPaid,
        extraPayment: debt.extraPayment,
        balance: Math.max(debt.balance, 0),
      });
    }
    return paymentSchedule;
  }
}
