import { PrismaClient, Prisma } from "@prisma/client";

type TransactionClient = Omit<
  PrismaClient,
  "$connect" | "$disconnect" | "$on" | "$transaction" | "$use" | "$extends"
>;

interface TransactionOptions {
  maxWait?: number;
  timeout?: number;
  isolationLevel?: Prisma.TransactionIsolationLevel;
}

const DEFAULT_OPTIONS: TransactionOptions = {
  maxWait: 5000,
  timeout: 10000,
  isolationLevel: Prisma.TransactionIsolationLevel.ReadCommitted,
};

export async function withTransaction<T>(
  prisma: PrismaClient,
  fn: (tx: TransactionClient) => Promise<T>,
  options?: TransactionOptions,
): Promise<T> {
  const opts = { ...DEFAULT_OPTIONS, ...options };

  return prisma.$transaction(fn, {
    maxWait: opts.maxWait,
    timeout: opts.timeout,
    isolationLevel: opts.isolationLevel,
  });
}

export async function withSerializableTransaction<T>(
  prisma: PrismaClient,
  fn: (tx: TransactionClient) => Promise<T>,
): Promise<T> {
  return withTransaction(prisma, fn, {
    isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
    timeout: 15000,
  });
}
