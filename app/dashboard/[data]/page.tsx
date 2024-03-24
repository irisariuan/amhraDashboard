'use client'
import { SongDashboard } from '@/components/custom/dashboard/songDashboard'
import { verifyVisitorWeb } from '@/lib/api/web'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

enum Loading {
	Loading,
	Loaded,
	Error,
}

export default function VisitorPage({ params }: { params: { data: string } }) {
	const [ok, setOk] = useState(Loading.Loading)
	const router = useRouter()
	useEffect(() => {
		if (ok === Loading.Error) {
			router.push('/')
		}
	}, [ok])

	try {
		const { guildId, auth }: { guildId: string; auth: string } = JSON.parse(
			atob(decodeURI(params.data))
		)

		verifyVisitorWeb(auth, guildId)
			.then(v => {
				setOk(v ? Loading.Loaded : Loading.Error)
			})
			.catch(e => {
				setOk(Loading.Error)
			})

		return ok === Loading.Loaded ? (
			<div className="flex justify-center items-center w-full h-full">
				<div className="bg-white p-8 rounded-xl h-1/2 w-1/2">
					<SongDashboard auth={auth} guildId={guildId} visitor={true} />
				</div>
			</div>
		) : ok === Loading.Loading ? (
			<div className="flex justify-center items-center w-full h-full">
				<p className="text-3xl text-white">Opening...</p>
			</div>
		) : (
			<div className="flex justify-center items-center w-full h-full">
				<p className="text-3xl text-white">Error!</p>
			</div>
		)
	} catch {
		router.push('/')
		return <></>
	}
}
