import Link from "next/link"
import type { ReactNode } from "react"
import { IoIosArrowForward } from "react-icons/io"

function SectionTitle({ children }: { children: ReactNode }) {
	return <h2 className="text-xl font-bold my-4">{children}</h2>
}

export default function TermPage() {
	return (
		<div className="p-2 h-full flex items-center justify-center">
			<div className="lg:w-1/3 overflow-auto h-2/3 dark:bg-neutral-900 bg-white rounded-xl flex flex-col shadow-lg">
				<div className="p-6">
					<h1 className="text-3xl font-extrabold">
						Terms of Service for Amhra Discord Music Bot
					</h1>
					<SectionTitle>1. Acceptance of Terms</SectionTitle>
					<p>
						By using the Amhra Discord Music Bot (&quot;the
						Bot&quot;), you agree to be bound by these Terms of
						Service. If you do not agree to these terms, you may
						not use the Bot.
					</p>
					<SectionTitle>2. Compliance with Laws</SectionTitle>
					<p>
						You agree to use the Bot in compliance with all
						applicable local laws and regulations, as well as the
						laws of Hong Kong. You are solely responsible for
						ensuring that your use of the Bot does not violate any
						laws or regulations. You agree to take all
						responsibility and consequences to your actions.
					</p>
					<SectionTitle>3. Content Restrictions</SectionTitle>
					<p>
						All songs played through the Bot must comply with
						copyright laws and any other applicable laws. You must
						have the legal right to play any content you choose to
						play using the Bot. The Bot must not be used to play
						any content that is illegal, offensive, or violates the
						rights of others.
					</p>
					<SectionTitle>4. Recording and Monitoring</SectionTitle>
					<p>
						For diagnostic purposes, messages and voice statuses
						may be recorded and monitored. By using the Bot, you
						consent to this recording and monitoring. You may
						refuse giving permissions in your Discord settings to
						stop being monitored, while your access to the service
						may be limited if you do so.
					</p>
					<SectionTitle>
						5. User Responsibility and Liability
					</SectionTitle>
					<p>
						You are solely responsible for your use of the Bot and
						any content you play using the Bot. You agree to
						indemnify and hold harmless the creators and operators
						of the Bot from any claims, damages, or legal actions
						arising from your use of the Bot.
					</p>
					<SectionTitle>
						6. Right to Pursue Legal Actions
					</SectionTitle>
					<p>
						We reserve the right to pursue legal actions against
						any user who violates these Terms of Service or any
						applicable laws. This includes, but is not limited to,
						reporting illegal activities to the appropriate
						authorities.
					</p>
					<SectionTitle>7. Modifications to Terms</SectionTitle>
					<p>
						We reserve the right to modify these Terms of Service
						at any time. Any changes will be effective immediately
						upon posting the revised Terms of Service. Your
						continued use of the Bot constitutes your acceptance of
						the modified Terms of Service.
					</p>
					<SectionTitle>8. Termination</SectionTitle>
					<p>
						We reserve the right to terminate or suspend your
						access to the Bot at our sole discretion, without
						notice, for conduct that we believe violates these
						Terms of Service or is harmful to other users of the
						Bot, us, or third parties, or for any other reason.
					</p>
					<SectionTitle>9. Disclaimer of Warranties</SectionTitle>
					<p>
						The Bot is provided &quot;as is&quot; and &quot;as
						available&quot; without warranties of any kind, either
						express or implied. We do not warrant that the Bot will
						be uninterrupted, error-free, or free of viruses or
						other harmful components.
					</p>
					<SectionTitle>10. Limitation of Liability</SectionTitle>
					<p>
						In no event shall the creators or operators of the Bot
						be liable for any indirect, incidental, special,
						consequential, or punitive damages arising out of or in
						connection with your use of the Bot.
					</p>
					<SectionTitle>11. Governing Law</SectionTitle>
					<p>
						These Terms of Service shall be governed by and
						construed in accordance with the laws of Hong Kong,
						without regard to its conflict of law principles.
					</p>
					<div className="w-full h-0.5 bg-white my-2" />
					<p>
						By using the Amhra Discord Music Bot, you acknowledge
						that you have read, understood, and agree to be bound
						by these Terms of Service.
					</p>
				</div>
				<Link className="w-full bg-blue-500 p-4" href="/login?checked=true">
					<div className="flex items-center justify-center">
						<span className="font-bold text-2xl text-white">
							Agree
						</span>
						<IoIosArrowForward className="text-2xl text-white" />
					</div>
				</Link>
			</div>
		</div>
	)
}
