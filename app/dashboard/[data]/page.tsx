'use client'
import { SongDashboard } from '@/components/custom/dashboard/songDashboard'
import { verifyVisitorWeb } from '@/lib/api/web'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

enum Loading {
	Loading,
	Loaded,
	Error,
}

interface VisitorPageData {
	token: null | string
	gid: null | string
}

export default function VisitorPage({ params }: { params: { data: string } }) {
	const [ok, setOk] = useState(Loading.Loading)
	const [{ token, gid }, setData] = useState<VisitorPageData>({
		token: null,
		gid: null,
	})
	const router = useRouter()
	useEffect(() => {
		try {
			const { guildId, auth }: { guildId: string; auth: string } = JSON.parse(
				atob(decodeURI(params.data))
			)

			verifyVisitorWeb(auth, guildId)
				.then(v => {
					setOk(v ? Loading.Loaded : Loading.Error)
					setData({
						gid: guildId,
						token: auth,
					})
				})
				.catch(e => {
					setOk(Loading.Error)
				})
		} catch {
			setOk(Loading.Error)
		}
		if (ok === Loading.Error) {
			router.push('/')
		}
	}, [ok])

	return ok === Loading.Loaded && token && gid ? (
		<motion.div className="flex justify-center items-center w-full h-full p-4 lg:p-0" animate={{opacity: [0, 1], scale: [0, 1]}}>
			<div className="bg-white p-8 rounded-xl w-full h-full overflow-scroll lg:h-5/6 lg:w-5/6">
				<SongDashboard auth={token} guildId={gid} visitor={true} />
			</div>
		</motion.div>
	) : ok === Loading.Loading ? (
		<div className="flex justify-center items-center w-full h-full">
			<p className="text-3xl text-white">Opening...</p>
		</div>
	) : (
		<div className="flex justify-center items-center w-full h-full">
			<p className="text-3xl text-white">Error!</p>
		</div>
	)
}
