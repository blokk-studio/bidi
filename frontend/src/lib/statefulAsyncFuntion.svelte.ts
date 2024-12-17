export const getStatefulAsyncFunction = <Arguments extends unknown[], Result>(
	fn: (...args: Arguments) => Promise<Result>,
) => {
	let isPending = $state(false)
	let error = $state<Error>()
	let result = $state<Result>()

	const call = async (...args: Arguments) => {
		isPending = true
		error = undefined
		result = undefined
		try {
			result = await fn(...args)
		} catch (throwable) {
			error = throwable instanceof Error ? throwable : new Error(String(throwable))
		}
		isPending = false
	}

	return {
		get isPending() {
			return isPending
		},
		get error() {
			return error
		},
		get result() {
			return result
		},
		call,
	}
}
