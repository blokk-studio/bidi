const getDecimalDegreesFromSeconds = (totalSeconds: number) => {
	let totalSeconds_ = totalSeconds
	const hours = Math.floor(totalSeconds_ / 3600)
	totalSeconds_ = totalSeconds_ % 3600
	const minutes = Math.floor(totalSeconds_ / 60)
	totalSeconds_ = totalSeconds_ % 60
	const seconds = totalSeconds_
	const decimal = hours + minutes / 60 + seconds / 3600

	return decimal
}

const { pow } = Math
/**
 * converts swiss grid coordinates in LV03 or LV95 format to decimal latitude and longitude that can be used with embedded maps
 *
 * based on the approximate formula of 3.4 in
 * - https://backend.swisstopo.admin.ch/fileservice/sdweb-docs-prod-swisstopoch-files/files/2023/11/14/ea9cbbd6-9583-4a39-8bdf-15fc6a1c2fad.pdf
 * - via https://www.swisstopo.admin.ch/de/schweizerische-kartenprojektionen
 */
export const getDecimalLatitudeLongitude = (swissGridCoordinates: { E: number; N: number }) => {
	// 1 NNN NNN -> LV95
	const nNormalizationSubtrahend = swissGridCoordinates.N > 1000000 ? 1.2 : 0.2
	const X = swissGridCoordinates.N / 1_000_000 - nNormalizationSubtrahend
	// 2 EEE EEE -> LV95
	const eNormalizationSubtrahend = swissGridCoordinates.E > 2000000 ? 2.6 : 0.6
	const Y = swissGridCoordinates.E / 1_000_000 - eNormalizationSubtrahend

	const a1 =
		4.72973056 + 0.7925714 * X + 0.132812 * pow(X, 2) + 0.0255 * pow(X, 3) + 0.0048 * pow(X, 4)
	const a3 = -0.04427 - 0.0255 * X - 0.0096 * pow(X, 2)
	const a5 = 0.00096
	const lambda = 2.67825 + a1 * Y + a3 * pow(Y, 3) + a5 * pow(Y, 5)

	const p0 = 3.23864877 * X - 0.0025486 * pow(X, 2) - 0.013245 * pow(X, 3) + 0.000048 * pow(X, 4)
	const p2 = -0.27135379 - 0.0450442 * X - 0.007553 * pow(X, 2) - 0.00146 * pow(X, 3)
	const p4 = 0.002442 + 0.00132 * X
	const phi = 16.902866 + p0 + p2 * pow(Y, 2) + p4 * pow(Y, 4)

	const latitude = getDecimalDegreesFromSeconds(phi * 10000)
	const longitude = getDecimalDegreesFromSeconds(lambda * 10000)

	return {
		latitude,
		longitude,
	}
}
