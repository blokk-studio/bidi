import type { BidiCertificate } from './certificate'
import { getCoordinateString } from './swissGrid'

const dateFormat = new Intl.DateTimeFormat('en-CH', {
	weekday: 'long',
	month: 'long',
	day: 'numeric',
	year: 'numeric',
})

const getIndentedMultilineText = (text: string) => {
	const lines = text.split(/\n/gi)
	let indentedText = ''
	for (const line of lines) {
		indentedText += `  ${line}`
	}

	return indentedText
}

export const getNftDescription = (certificate: BidiCertificate) => {
	const eString = getCoordinateString(certificate.coordinates.E)
	const nString = getCoordinateString(certificate.coordinates.N)
	const coordinates = `Coordinates: ${eString} / ${nString}`

	const dateString = dateFormat.format(new Date(certificate.dateOfWork))
	const date = `Date: ${dateString}`

	const typeOfNaturalObject = `Type of natural object: ${certificate.typeOfNaturalObject}`

	const typeOfWork = `Type of work:\n${getIndentedMultilineText(certificate.typeOfWork)}`

	const effectOnBiodiversity = `Effect on biodiversity:\n${getIndentedMultilineText(certificate.effectOnBiodiversity)}`

	const numberOfHoursOfWork = `Number of hours of work: ${certificate.numberOfHoursOfWork}h`

	const numberOfBidi = `Number of BIDI: ${certificate.numberOfBidi}`

	const description = [
		coordinates,
		date,
		typeOfNaturalObject,
		typeOfWork,
		effectOnBiodiversity,
		numberOfHoursOfWork,
		numberOfBidi,
	].join('\n')

	return description
}
