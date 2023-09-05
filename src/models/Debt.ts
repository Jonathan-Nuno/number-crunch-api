export class Debt {
  constructor(
    public balance: number,
    public interestRate: number,
    public minimumPayment: number,
    public flatMinimumPayment: boolean,
    public extraPayment: number = 0
  ) {}
}
