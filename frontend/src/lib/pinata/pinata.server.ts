import { PINATA_JWT } from '$env/static/private'
import { PUBLIC_GATEWAY_URL } from '$env/static/public'
import { PinataSDK } from 'pinata-web3'

export const pinata = new PinataSDK({
	pinataJwt: PINATA_JWT,
	pinataGateway: PUBLIC_GATEWAY_URL,
})
