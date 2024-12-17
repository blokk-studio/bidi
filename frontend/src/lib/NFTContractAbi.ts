export type NFTContractAbi = [
	{
		inputs: []
		stateMutability: 'nonpayable'
		type: 'constructor'
	},
	{
		anonymous: false
		inputs: [
			{
				indexed: false
				internalType: 'bool'
				name: ''
				type: 'bool'
			},
			{
				indexed: false
				internalType: 'bytes'
				name: ''
				type: 'bytes'
			},
		]
		name: 'CallResponseEvent'
		type: 'event'
	},
	{
		inputs: [
			{
				internalType: 'address'
				name: 'token'
				type: 'address'
			},
			{
				internalType: 'int64'
				name: 'serial'
				type: 'int64'
			},
		]
		name: 'claimNft'
		outputs: [
			{
				internalType: 'int256'
				name: ''
				type: 'int256'
			},
		]
		stateMutability: 'nonpayable'
		type: 'function'
	},
	{
		inputs: [
			{
				internalType: 'int64'
				name: ''
				type: 'int64'
			},
		]
		name: 'claimed'
		outputs: [
			{
				internalType: 'bool'
				name: ''
				type: 'bool'
			},
		]
		stateMutability: 'view'
		type: 'function'
	},
	{
		inputs: [
			{
				internalType: 'string'
				name: 'name'
				type: 'string'
			},
			{
				internalType: 'string'
				name: 'symbol'
				type: 'string'
			},
			{
				internalType: 'string'
				name: 'memo'
				type: 'string'
			},
			{
				internalType: 'int64'
				name: 'maxSupply'
				type: 'int64'
			},
			{
				internalType: 'int64'
				name: 'autoRenewPeriod'
				type: 'int64'
			},
		]
		name: 'createNft'
		outputs: [
			{
				internalType: 'address'
				name: ''
				type: 'address'
			},
		]
		stateMutability: 'payable'
		type: 'function'
	},
	{
		inputs: [
			{
				internalType: 'int64'
				name: 'serial'
				type: 'int64'
			},
		]
		name: 'getClaimerAddress'
		outputs: [
			{
				internalType: 'address'
				name: ''
				type: 'address'
			},
		]
		stateMutability: 'view'
		type: 'function'
	},
	{
		inputs: [
			{
				internalType: 'int64'
				name: 'serial'
				type: 'int64'
			},
		]
		name: 'isNftClaimed'
		outputs: [
			{
				internalType: 'bool'
				name: ''
				type: 'bool'
			},
		]
		stateMutability: 'view'
		type: 'function'
	},
	{
		inputs: [
			{
				internalType: 'address'
				name: 'token'
				type: 'address'
			},
			{
				internalType: 'bytes[]'
				name: 'metadata'
				type: 'bytes[]'
			},
			{
				internalType: 'address'
				name: 'allowedClaimer'
				type: 'address'
			},
		]
		name: 'mintNftForUser'
		outputs: [
			{
				internalType: 'int64'
				name: ''
				type: 'int64'
			},
		]
		stateMutability: 'nonpayable'
		type: 'function'
	},
	{
		inputs: [
			{
				internalType: 'int64'
				name: ''
				type: 'int64'
			},
		]
		name: 'nftClaimRights'
		outputs: [
			{
				internalType: 'address'
				name: ''
				type: 'address'
			},
		]
		stateMutability: 'view'
		type: 'function'
	},
	{
		inputs: []
		name: 'owner'
		outputs: [
			{
				internalType: 'address'
				name: ''
				type: 'address'
			},
		]
		stateMutability: 'view'
		type: 'function'
	},
	{
		inputs: [
			{
				internalType: 'address'
				name: 'token'
				type: 'address'
			},
			{
				internalType: 'bytes'
				name: 'encodedFunctionSelector'
				type: 'bytes'
			},
		]
		name: 'redirectForToken'
		outputs: [
			{
				internalType: 'int256'
				name: 'responseCode'
				type: 'int256'
			},
			{
				internalType: 'bytes'
				name: 'response'
				type: 'bytes'
			},
		]
		stateMutability: 'nonpayable'
		type: 'function'
	},
	{
		inputs: [
			{
				internalType: 'address'
				name: 'token'
				type: 'address'
			},
			{
				internalType: 'address'
				name: 'from'
				type: 'address'
			},
			{
				internalType: 'address'
				name: 'to'
				type: 'address'
			},
			{
				internalType: 'uint256'
				name: 'amount'
				type: 'uint256'
			},
		]
		name: 'transferFrom'
		outputs: [
			{
				internalType: 'int64'
				name: 'responseCode'
				type: 'int64'
			},
		]
		stateMutability: 'nonpayable'
		type: 'function'
	},
	{
		inputs: [
			{
				internalType: 'address'
				name: 'token'
				type: 'address'
			},
			{
				internalType: 'address'
				name: 'from'
				type: 'address'
			},
			{
				internalType: 'address'
				name: 'to'
				type: 'address'
			},
			{
				internalType: 'uint256'
				name: 'serialNumber'
				type: 'uint256'
			},
		]
		name: 'transferFromNFT'
		outputs: [
			{
				internalType: 'int64'
				name: 'responseCode'
				type: 'int64'
			},
		]
		stateMutability: 'nonpayable'
		type: 'function'
	},
]
