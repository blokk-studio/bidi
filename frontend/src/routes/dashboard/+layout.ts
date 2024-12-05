// all dashboard functionality is client-only because of the crypto wallet
export const ssr = false

export const load = ({ depends }) => {
	depends('hashConnect:ledgerId')
}
