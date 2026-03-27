export class Account {
  constructor(
    public id: string,
    public name: string,
    public code: string,
    public type:
      | "checking"
      | "savings"
      | "investment"
      | "credit_card"
      | "cash"
      | "Receita"
      | "Despesa",
    public isAnalytical: boolean,
    public balance: number,
    public currency: string = "BRL",
  ) {}

  public updateBalance(amount: number): void {
    this.balance += amount;
  }

  isDebitNature(): boolean {
    // Ativo e Despesa são devedoras
    return ["checking", "savings", "investment", "cash", "Despesa"].includes(
      this.type,
    );
  }

  static fromPersistence(data: any): Account {
    return new Account(
      data.id,
      data.name,
      data.code,
      data.type as any,
      data.is_analytical,
      Number(data.balance),
      data.currency || "BRL",
    );
  }

  toPersistence(): any {
    return {
      id: this.id,
      name: this.name,
      code: this.code,
      type: this.type,
      is_analytical: this.isAnalytical,
      balance: this.balance,
      currency: this.currency,
    };
  }
}
