import type { Query } from '@hashgraph/sdk'

export type Execute = <QueryOutput>(query: Query<QueryOutput>) => Promise<QueryOutput>
