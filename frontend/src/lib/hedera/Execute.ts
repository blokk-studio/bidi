import type { Transaction, TransactionReceipt } from '@hashgraph/sdk'

export type ExecuteTransaction = (transaction: Transaction) => Promise<TransactionReceipt>
