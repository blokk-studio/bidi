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

const createTextElement = (textData: TextElement): string => `
  <g font-family="Andale Mono, Arial, sans-serif" text-anchor="start" style="text-transform: uppercase">
    <text x="180" y="730" font-size="8px" font-weight="400">
      MISSION: ${textData.mission}
    </text>
    <text x="180" y="740" font-size="8px" font-weight="400" style="text-transform: uppercase;;">
      OPERATIONS MANAGER: ${textData.operationsManager}
    </text>
    <text x="180" y="750" font-size="8px" font-weight="400" style="text-transform: uppercase;;">
      DATE OF WORK: ${textData.dateOfWork}
    </text>
    <text x="180" y="760" font-size="8px" font-weight="400" style="text-transform: uppercase;;">
      NUMBER OF BIDI EARNED: ${textData.bidiEarned}
    </text>
    <text x="180" y="770" font-size="8px" style="text-transform: uppercase;;">
      HEDERA BLOCKCHAIN
    </text>
    <text x="180" y="780" font-size="8px" style="text-transform: uppercase;;">
      BIDIGUT.CH
    </text>
  </g>
`

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

		const textElement = createTextElement(textData)

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

const convertSvgToPng = async (svgString: string) => {
	const A4_WIDTH = 2480
	const A4_HEIGHT = 3508

	const canvas = document.createElement('canvas')
	canvas.width = A4_WIDTH
	canvas.height = A4_HEIGHT
	const ctx = canvas.getContext('2d')

	const img = new Image()
	const blob = new Blob([svgString], { type: 'image/svg+xml' })
	const url = URL.createObjectURL(blob)

	return new Promise((resolve, reject) => {
		if (!ctx) throw new Error('Error getting canvas context')

		img.onload = () => {
			ctx.fillStyle = 'white'
			ctx.fillRect(0, 0, canvas.width, canvas.height)

			ctx.drawImage(img, 0, 0, canvas.width, canvas.height)

			canvas.toBlob(
				(blob) => {
					URL.revokeObjectURL(url)
					resolve(blob)
				},
				'image/png',
				1.0,
			)
		}

		img.onerror = () => {
			URL.revokeObjectURL(url)
			reject(new Error('Error loading SVG'))
		}

		img.src = url
	})
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
		const svgString = await prepareCertificate(qrUrl, {
			mission: mission,
			operationsManager: operationsManager,
			dateOfWork: dateOfWork,
			bidiEarned: bidiEarned,
		})

		const pngBlob = (await convertSvgToPng(svgString)) as Blob

		const blobParts: BlobPart[] = [pngBlob]
		const filename = `bidi-certificate-${new Date().getTime()}.png`

		return new File(blobParts, filename, {
			type: 'image/png',
			lastModified: new Date().getTime(),
		})
	} catch (error) {
		console.error('Error generating certificate:', error)
		throw error
	}
}
