import type { ContractId, LedgerId } from '@hashgraph/sdk'
import { eth, type AbiFunctionFragment } from 'web3'
import { getMirrorNodeUrl } from './getMirrorNodeUrl'

type Address = `0x${string}`

type ParameterType<AbiParameter extends { type: string }> = AbiParameter['type'] extends infer Type
	? Type extends 'int64'
		? number
		: Type extends 'address'
			? Address
			: Type extends 'bool'
				? boolean
				: never
	: never

type Inputs<Abi extends AbiFunctionFragment> = Abi['inputs'] extends undefined
	? []
	: {
			[Index in keyof Abi['inputs'] as keyof Abi['inputs'] extends infer key
				? key extends `${number}`
					? key
					: never
				: never]: Abi['inputs'][Index] extends infer Input
				? Input extends { type: string }
					? ParameterType<Input>
					: never
				: never
		}

type Outputs<Abi extends AbiFunctionFragment> = Abi['outputs'] extends undefined
	? []
	: {
			[Index in keyof Abi['outputs'] as keyof Abi['outputs'] extends infer key
				? key extends `${number}`
					? key
					: never
				: never]: Abi['outputs'][Index] extends infer Output
				? Output extends { type: string }
					? ParameterType<Output>
					: never
				: never
		}

export const callContract = async <
	Abi extends Omit<AbiFunctionFragment, 'outputs'> & Pick<Required<AbiFunctionFragment>, 'outputs'>,
>(options: {
	functionAbi: Abi
	inputs: Inputs<Abi>
	contractId: ContractId
	ledgerId: LedgerId
	fetch?: typeof globalThis.fetch
}) => {
	const fetch_ = options.fetch ?? fetch
	const data = eth.abi.encodeFunctionCall(options.functionAbi, options.inputs as unknown[])
	const body = JSON.stringify({
		to: options.contractId.toSolidityAddress(),
		data,
	})
	const mirrorNodeBaseUrl = getMirrorNodeUrl(options.ledgerId)
	const contractCallUrl = new URL('/api/v1/contracts/call', mirrorNodeBaseUrl)
	const response = await fetch_(contractCallUrl, {
		method: 'post',
		headers: {
			'Content-Type': 'application/json',
		},
		body,
	})
	const json: { result: `0x${string}` } = await response.json()
	const outputs = eth.abi.decodeParameters(
		options.functionAbi.outputs,
		json.result,
	) as unknown as Outputs<Abi>

	return outputs
}
