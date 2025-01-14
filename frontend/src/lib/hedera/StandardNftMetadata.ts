type MimeType = `${string}/${string}`

/**
 * the standardized hashpack nft metadata
 *
 * https://docs.hashpack.app/nft-creators/metadata-standards
 */
export interface StandardNftMetadata<Properties = unknown> {
	/** NFT Name */
	name: string
	/** Creator Name */
	creator?: string
	/** Human readable description of the asset */
	description?: string
	/** cid or path to the NFT's image file, or for non-image NFTs, a preview image for display in wallets */
	image: string
	/** mime type - ie image/jpeg */
	type: MimeType
	/** object array that contains uri, type and metadata - can contain multiple files */
	files?: {
		/** cid or uri to file */
		uri: string
		/** indicates if the file is the main file for this NFT */
		is_default_file: '(Type: boolean)  - OPTIONAL'
		/** mime type */
		type: MimeType
	}[]
	// arbitrary json objects that cover the overarching properties of the token
	properties: Properties
}
