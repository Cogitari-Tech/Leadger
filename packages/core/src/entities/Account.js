export class Account {
  id;
  name;
  code;
  type;
  isAnalytical;
  balance;
  currency;
  constructor(id, name, code, type, isAnalytical, balance, currency = "BRL") {
    this.id = id;
    this.name = name;
    this.code = code;
    this.type = type;
    this.isAnalytical = isAnalytical;
    this.balance = balance;
    this.currency = currency;
  }
  updateBalance(amount) {
    this.balance += amount;
  }
  isDebitNature() {
    // Ativo e Despesa são devedoras
    return ["checking", "savings", "investment", "cash", "Despesa"].includes(
      this.type,
    );
  }
  static fromPersistence(data) {
    return new Account(
      data.id,
      data.name,
      data.code,
      data.type,
      data.is_analytical,
      Number(data.balance),
      data.currency || "BRL",
    );
  }
  toPersistence() {
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
