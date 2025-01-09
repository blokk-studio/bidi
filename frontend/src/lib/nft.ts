import type { AccountId } from '@hashgraph/sdk'
import type { BidiCertificate } from './certificate'

export type IpfsUri = `ipfs://${string}`

export interface NftMetadata {
	image: IpfsUri
}

export interface Nft {
	serialNumber: number
	name: string
	imageUrl: string
	certificate: BidiCertificate
	claimerAccountId: AccountId
	isClaimed: boolean
}
