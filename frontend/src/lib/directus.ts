import { PUBLIC_BACKEND_URL } from '$env/static/public'
import {
	createDirectus,
	readItems,
	rest,
	type Query,
	type QueryFilter,
	type RestCommand,
} from '@directus/sdk'

export interface Mission {
	title: string
	date: string
	type_of_work: string
	effect_on_biodiversity: string
	slug: string
	E: number
	N: number
	nft_serial_numbers: string[]
}

interface Schema {
	Mission: Mission[]
}

const requestWithFetch = <Output>(
	options: RestCommand<Output, Schema>,
	fetch: typeof globalThis.fetch,
) => {
	const client = createDirectus<Schema>(PUBLIC_BACKEND_URL, { globals: { fetch } }).with(rest())

	return client.request(options)
}

export const getMissions = async (options: {
	filter?: QueryFilter<Schema, Mission>
	limit?: number
	fetch: typeof globalThis.fetch
}) => {
	const query: Query<Schema, Mission> = {
		fields: ['*'],
		limit: options.limit ?? 10,
		sort: '-date',
	}
	if (options.filter) {
		query.filter = options.filter
	}

	return requestWithFetch(readItems('Mission', query), options.fetch)
}

export const getMission = async (options: {
	slug: string
	limit?: number
	fetch: typeof globalThis.fetch
}) => {
	const query: Query<Schema, Mission> = {
		fields: ['*'],
		filter: {
			slug: {
				_eq: options.slug,
			},
		},
		limit: 1,
	}

	const missions = await requestWithFetch(readItems('Mission', query), options.fetch)
	const mission = missions[0]

	if (!mission) {
		throw new Error(`no mission with slug ${options.slug} exists.`)
	}

	return mission
}
