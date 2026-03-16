// packages/core/src/usecases/finance/RecordTransaction.ts

import { Transaction } from "../../entities/Transaction";
import { IFinanceRepository } from "../../repositories/IFinanceRepository";
import { DomainError } from "../../errors/DomainErrors";

/**
 * Use Case: Registrar Transação Financeira
 *
 * Regras de Negócio:
 * 1. Toda transação deve ter débito e crédito (partida dobrada)
 * 2. Valores devem ser > 0
 * 3. Data não pode ser futura
 * 4. Contas devem existir e ser analíticas (folhas do plano de contas)
 */
export class RecordTransaction {
  constructor(private financeRepository: IFinanceRepository) {}

  async execute(
    input: RecordTransactionInput,
  ): Promise<RecordTransactionOutput> {
    // 1. Validações de negócio
    this.validateInput(input);

    // 2. Verificar se contas existem
    const [debitAccount, creditAccount] = await Promise.all([
      this.financeRepository.getAccountById(input.accountDebitId),
      this.financeRepository.getAccountById(input.accountCreditId),
    ]);

    if (!debitAccount || !creditAccount) {
      throw new DomainError("Conta inválida", "INVALID_ACCOUNT");
    }

    if (!debitAccount.isAnalytical || !creditAccount.isAnalytical) {
      throw new DomainError(
        "Só é possível lançar em contas analíticas (folhas)",
        "NON_ANALYTICAL_ACCOUNT",
      );
    }

    // 3. Criar entidade de domínio
    const transaction = Transaction.create({
      date: input.date,
      description: input.description,
      accountDebitId: input.accountDebitId,
      accountCreditId: input.accountCreditId,
      amount: input.amount,
      createdBy: input.userId,
    });

    // 4. Persistir
    await this.financeRepository.saveTransaction(transaction);

    // 5. Retornar resultado
    return {
      transactionId: transaction.id,
      success: true,
      message: "Transação registrada com sucesso",
    };
  }

  private validateInput(input: RecordTransactionInput): void {
    // Valor deve ser positivo
    if (input.amount <= 0) {
      throw new DomainError("Valor deve ser maior que zero", "INVALID_AMOUNT");
    }

    // Data não pode ser futura
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const inputDate = new Date(input.date);
    inputDate.setHours(0, 0, 0, 0);

    if (inputDate > today) {
      throw new DomainError("Data não pode ser futura", "FUTURE_DATE");
    }

    // Débito e crédito devem ser diferentes
    if (input.accountDebitId === input.accountCreditId) {
      throw new DomainError(
        "Débito e crédito devem ser contas diferentes",
        "SAME_ACCOUNTS",
      );
    }

    // Descrição obrigatória
    if (!input.description || input.description.trim().length === 0) {
      throw new DomainError("Descrição é obrigatória", "MISSING_DESCRIPTION");
    }
  }
}

// DTO de entrada
export interface RecordTransactionInput {
  date: Date;
  description: string;
  accountDebitId: string;
  accountCreditId: string;
  amount: number;
  userId: string;
}

// DTO de saída
export interface RecordTransactionOutput {
  transactionId: string;
  success: boolean;
  message: string;
}
