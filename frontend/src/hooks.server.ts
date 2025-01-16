export const handle = ({ event, resolve }) => {
	return resolve(event, {
		filterSerializedResponseHeaders: (headerName) => {
			return headerName === 'content-type'
		},
	})
}
