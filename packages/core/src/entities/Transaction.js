// packages/core/src/entities/Transaction.ts
/**
 * Entidade de Domínio: Transação Financeira
 *
 * Representa um lançamento contábil seguindo o método de partidas dobradas.
 * Toda transação afeta duas contas: uma no débito e outra no crédito.
 */
export class Transaction {
  id;
  date;
  description;
  accountDebitId;
  accountCreditId;
  amount;
  createdBy;
  createdAt;
  constructor(
    id,
    date,
    description,
    accountDebitId,
    accountCreditId,
    amount,
    createdBy,
    createdAt,
  ) {
    this.id = id;
    this.date = date;
    this.description = description;
    this.accountDebitId = accountDebitId;
    this.accountCreditId = accountCreditId;
    this.amount = amount;
    this.createdBy = createdBy;
    this.createdAt = createdAt;
    this.validate();
  }
  /**
   * Factory method para criar uma nova transação
   */
  static create(props) {
    return new Transaction(
      crypto.randomUUID(),
      props.date,
      props.description,
      props.accountDebitId,
      props.accountCreditId,
      props.amount,
      props.createdBy,
      new Date(),
    );
  }
  /**
   * Reconstrói uma transação a partir do banco de dados
   */
  static fromPersistence(data) {
    return new Transaction(
      data.id,
      new Date(data.date),
      data.description,
      data.account_debit_id,
      data.account_credit_id,
      Number(data.amount),
      data.created_by,
      new Date(data.created_at),
    );
  }
  /**
   * Converte para formato de persistência
   */
  toPersistence() {
    return {
      id: this.id,
      date: this.date.toISOString().split("T")[0],
      description: this.description,
      account_debit_id: this.accountDebitId,
      account_credit_id: this.accountCreditId,
      amount: this.amount,
      created_by: this.createdBy,
      created_at: this.createdAt.toISOString(),
    };
  }
  /**
   * Validações invariantes da entidade
   */
  validate() {
    if (this.amount <= 0) {
      throw new Error("Amount must be positive");
    }
    if (!this.description || this.description.trim().length === 0) {
      throw new Error("Description is required");
    }
    if (this.accountDebitId === this.accountCreditId) {
      throw new Error("Debit and credit accounts must be different");
    }
  }
  /**
   * Valor Objects (métodos de consulta)
   */
  isFromCurrentMonth() {
    const now = new Date();
    return (
      this.date.getMonth() === now.getMonth() &&
      this.date.getFullYear() === now.getFullYear()
    );
  }
  getFormattedAmount() {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(this.amount);
  }
  getFormattedDate() {
    return new Intl.DateTimeFormat("pt-BR").format(this.date);
  }
}
