// @ts-expect-error: no type definitions available for opentype
import opentype from 'opentype.js'
// @ts-expect-error: getting vercel error cause of unsupported (new) version of node.js was used for @types/qrcode
import QRCode from 'qrcode'

interface TextElement {
	mission: string
	operationsManager: string
	dateOfWork: string
	bidiEarned: string
}

const generateQRCode = async (text: string): Promise<string> => {
	const qrOptions: QRCode.QRCodeToStringOptions = {
		type: 'svg',
		margin: 5,
	}

	try {
		const qrSvg = await new Promise<string>((resolve, reject) => {
			QRCode.toString(text, qrOptions, (err: Error, string: string) => {
				if (err) reject(err)
				else resolve(string)
			})
		})

		return qrSvg
			.replace(/<\/?svg[^>]*>/g, '')
			.replace(/width="[^"]*"/, '')
			.replace(/height="[^"]*"/, '')
	} catch (error) {
		console.error('Error generating QR code:', error)
		return ''
	}
}

const getRandomItem = <T>(array: T[]): T => array[Math.floor(Math.random() * array.length)]

const getRandomColor = (): string => {
	const colors = [
		'#CE84B7',
		'#DBE38B',
		'#E6595F',
		'#96CEB4',
		'#E6C83C',
		'#F3923E',
		'#9CCDA0',
		'#BCA671',
		'#F1C40F',
		'#CBE1B6',
		'#AD7595',
		'#ADBA42',
		'#EA4B8B',
		'#9684BD',
	]
	return getRandomItem(colors)
}

let font: opentype.Font

const loadFont = async () => {
	try {
		const buffer = await fetch('/fonts/andale-mono.woff').then((res) => res.arrayBuffer())
		font = opentype.parse(buffer)
	} catch (error) {
		console.error('Error loading font:', error)
		throw new Error('Failed to load font')
	}
}

const createTextPathElement = async (textData: TextElement): Promise<string> => {
	await loadFont()

	if (!font) throw new Error('Font not loaded')

	const textToPath = (text: string, x: number, y: number, fontSize: number): string => {
		const path = font.getPath(text, x, y, fontSize)
		return path.toSVG()
	}

	return `
    <g style="text-transform: uppercase">
      ${textToPath(`MISSION: ${textData.mission}`, 180, 730, 8)}
      ${textToPath(`OPERATIONS MANAGER: ${textData.operationsManager}`, 180, 740, 8)}
      ${textToPath(`DATE OF WORK: ${textData.dateOfWork}`, 180, 750, 8)}
      ${textToPath(`NUMBER OF BIDI EARNED: ${textData.bidiEarned}`, 180, 760, 8)}
      ${textToPath('HEDERA BLOCKCHAIN', 180, 770, 8)}
      ${textToPath('BIDIGUT.CH', 180, 785, 8)}
    </g>
  `
}

const combineSVGElements = (
	svgArray: string[],
	filenames: string[],
	qrCode: string,
	textElement: string,
): string => {
	const insectAColor = getRandomColor()

	const processedSVGs = svgArray.map((svg, index) => {
		const isWaves = filenames[index].includes('waves')
		const isDynamic = filenames[index].includes('title-dynamic')
		const isInsectA = filenames[index].includes('insect') && filenames[index].includes('-a')
		const isInsectB = filenames[index].includes('insect') && filenames[index].includes('-b')

		if (isWaves) {
			return svg
				.replace(/<\/?svg[^>]*>/g, '')
				.replace(/<g/, '<g style="mix-blend-mode: multiply"')
				.trim()
		}

		let colorToUse: string = ''
		if (isInsectA || isDynamic) {
			colorToUse = `fill="${insectAColor}" opacity="1"`
		} else if (isInsectB) {
			colorToUse = `fill="${getRandomColor()}" opacity="1"`
		}

		return svg
			.replace(/<\/?svg[^>]*>/g, '')
			.replace(/class="[^"]*"/g, colorToUse)
			.trim()
	})

	const wavesIndex = filenames.findIndex((name) => name.includes('waves'))
	const wavesContent = processedSVGs[wavesIndex]
	const otherContent = processedSVGs.filter((_, index) => index !== wavesIndex)

	const qrElement = `
    <g transform="translate(85, 710) scale(2.6)">
      ${qrCode}
    </g>
  `

	return `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 595.3 841.9">
      <rect width="100%" height="100%" fill="white"/>
      ${otherContent.join('\n')}
      ${textElement}
      ${qrElement}
      ${wavesContent}
    </svg>
  `.trim()
}

const prepareCertificate = async (qrUrl: string, textData: TextElement): Promise<string> => {
	const insectAOptions = [
		'/certificate/insect-1-a.svg',
		'/certificate/insect-2-a.svg',
		'/certificate/insect-3-a.svg',
		'/certificate/insect-4-a.svg',
		'/certificate/insect-5-a.svg',
		'/certificate/insect-6-a.svg',
	]

	const insectBOptions = [
		'/certificate/insect-1-b.svg',
		'/certificate/insect-2-b.svg',
		'/certificate/insect-3-b.svg',
		'/certificate/insect-4-b.svg',
		'/certificate/insect-5-b.svg',
		'/certificate/insect-6-b.svg',
	]

	const wavesPath = '/certificate/waves.svg'
	const titleFixedPath = '/certificate/title-fixed.svg'
	const titleDynamicPath = '/certificate/title-dynamic.svg'

	try {
		const qrCode = await generateQRCode(qrUrl)
		const selectedInsectAPath = getRandomItem(insectAOptions)
		const selectedInsectBPath = getRandomItem(insectBOptions)
		const selectedPaths = [
			selectedInsectAPath,
			selectedInsectBPath,
			wavesPath,
			titleFixedPath,
			titleDynamicPath,
		]

		const [selectedInsectA, selectedInsectB, waves, titleFixed, titleDynamic] = await Promise.all([
			fetch(selectedInsectAPath).then((res) => res.text()),
			fetch(selectedInsectBPath).then((res) => res.text()),
			fetch(wavesPath).then((res) => res.text()),
			fetch(titleFixedPath).then((res) => res.text()),
			fetch(titleDynamicPath).then((res) => res.text()),
		])

		const textElement = await createTextPathElement(textData)

		return combineSVGElements(
			[selectedInsectA, selectedInsectB, waves, titleFixed, titleDynamic],
			selectedPaths,
			qrCode,
			textElement,
		)
	} catch (error) {
		console.error('Error generating certificate:', error)
		throw error
	}
}

export const generateNftCertificate = async (
	qrUrl: string,
	{
		mission,
		operationsManager,
		dateOfWork,
		bidiEarned,
	}: {
		mission: string
		operationsManager: string
		dateOfWork: string
		bidiEarned: string
	},
): Promise<File> => {
	try {
		const truncatedMission = mission.length > 50 ? `${mission.slice(0, 50).trim()}..` : mission

		const svgString = await prepareCertificate(qrUrl, {
			mission: truncatedMission?.toUpperCase(),
			operationsManager: operationsManager?.toUpperCase(),
			dateOfWork: dateOfWork?.toUpperCase(),
			bidiEarned: bidiEarned?.toUpperCase(),
		})

		const svgBlob = new Blob([svgString], { type: 'image/svg+xml' })
		const filename = `bidi-certificate-${new Date().getTime()}.svg`

		return new File([svgBlob], filename, {
			type: 'image/svg+xml',
			lastModified: new Date().getTime(),
		})
	} catch (error) {
		console.error('Error generating certificate:', error)
		throw error
	}
}
