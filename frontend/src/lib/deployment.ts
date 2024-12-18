import { PUBLIC_DEPLOYMENT_CONTRACT_ID, PUBLIC_DEPLOYMENT_NFT_TOKEN_ID } from '$env/static/public'
import { ContractId, TokenId } from '@hashgraph/sdk'

export const contractId = ContractId.fromString(PUBLIC_DEPLOYMENT_CONTRACT_ID)
export const nftTokenId = TokenId.fromString(PUBLIC_DEPLOYMENT_NFT_TOKEN_ID)
