// src/features/portal/QuestionDetailPage.tsx
//
// Desktop "Question and answers" (design: Desktop · 7). GET /api/qa/{id}; "Helpful" is POST /api/qa/answers/{id}/like.
// A verified doctor can add an answer and anyone allowed to reply can answer under one (same rules as before, from
// useQuestionAccess). "Follow", view counts and the doctor's next slot have no backend yet, so they are not shown.
import { useCallback, useEffect, useState } from 'react'
import { Link as RouterLink, useParams } from 'react-router-dom'
import { Box } from '@mui/material'
import { toast } from 'react-toastify'
import { DESK } from '../../styles/deskTokens'
import { ROUTES } from '../../constants/routes'
import { useAuth } from '../../hooks/useAuth'
import { useQuestionAccess } from '../../hooks/useQuestionAccess'
import { getQuestionDetail, likeDoctorAnswer, submitAnswerReply, submitDoctorAnswer, type DoctorAnswer, type DoctorAnswerReply, type PatientQuestion } from '../../services/qaService'
import { Column, Crumbs, EmptyBox, Note, PromoCard, ReadsPage, ReadsSubNav, SideCard, Spinner, Svg } from './readsKit'
import { TONES, cardSx, focusSx, initials, outlineBtnSx, primaryBtnSx, timeAgo, topicStyle } from './readsHelpers'

const MIN_ANSWER_LENGTH = 60

export default function QuestionDetailPage() {
	const { id } = useParams<{ id: string }>()
	const { accessToken } = useAuth()
	const access = useQuestionAccess()
	const [q, setQ] = useState<PatientQuestion | null>(null)
	const [loading, setLoading] = useState(true)
	const [missing, setMissing] = useState(false)
	const [voted, setVoted] = useState<Record<string, boolean>>({})
	const [shared, setShared] = useState(false)
	const [draft, setDraft] = useState('')
	const [posting, setPosting] = useState(false)

	const load = useCallback(async () => {
		if (!id) return
		try {
			const res = await getQuestionDetail(id)
			setQ(res.data)
		} catch {
			setMissing(true)
		} finally {
			setLoading(false)
		}
	}, [id])

	useEffect(() => {
		setLoading(true)
		setMissing(false)
		void load()
	}, [load])

	if (loading) return <ReadsPage><Spinner /></ReadsPage>
	if (missing || !q) {
		return (
			<ReadsPage>
				<ReadsSubNav active="ask" />
				<Column sx={{ py: '48px' }}>
					<EmptyBox title="This question isn’t available" action={<Box component={RouterLink} to={ROUTES.PUBLIC.HEALTH_QUESTIONS} sx={{ ...primaryBtnSx, mt: '6px' }}>All questions</Box>} />
				</Column>
			</ReadsPage>
		)
	}

	const answers = [...q.answers].sort((a, b) => b.likes - a.likes)
	const [bg, ink] = TONES[topicStyle(q.tag).tone]
	const lead = answers[0]
	const asker = [q.gender, q.age].filter(Boolean).join(', ')

	const like = async (a: DoctorAnswer) => {
		if (!accessToken) {
			toast.info('Log in to mark an answer helpful')
			return
		}
		if (voted[a.id]) return
		try {
			const res = await likeDoctorAnswer(a.id)
			setVoted((v) => ({ ...v, [a.id]: true }))
			setQ((cur) => (cur ? { ...cur, answers: cur.answers.map((x) => (x.id === a.id ? { ...x, likes: res.likes ?? x.likes + 1 } : x)) } : cur))
		} catch {
			toast.error('Could not save your vote')
		}
	}

	const share = async () => {
		try {
			await navigator.clipboard.writeText(window.location.href)
			setShared(true)
			setTimeout(() => setShared(false), 2500)
		} catch {
			toast.info(window.location.href)
		}
	}

	const postAnswer = async () => {
		if (draft.trim().length < MIN_ANSWER_LENGTH) {
			toast.warning(`Please write at least ${MIN_ANSWER_LENGTH} characters`)
			return
		}
		setPosting(true)
		try {
			await submitDoctorAnswer(q.id, draft.trim())
			toast.success('Your answer has been posted')
			setDraft('')
			await load()
		} catch {
			toast.error('Could not post your answer')
		} finally {
			setPosting(false)
		}
	}

	return (
		<ReadsPage>
			<ReadsSubNav active="ask" />
			<Column sx={{ pt: '24px', pb: '64px', display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 380px', gap: '28px', alignItems: 'start' }}>
				<Box sx={{ display: 'flex', flexDirection: 'column', gap: '16px', minWidth: 0 }}>
					<Crumbs items={[{ label: 'Ask a doctor', to: ROUTES.PUBLIC.HEALTH_QUESTIONS }, { label: q.question.length > 60 ? `${q.question.slice(0, 57)}…` : q.question }]} />

					<Box component="article" sx={{ ...cardSx, p: '28px', borderRadius: '22px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
						<Box sx={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
							<Box sx={{ px: '8px', py: '2px', borderRadius: '6px', bgcolor: bg, color: ink, fontSize: 11, fontWeight: 800 }}>{q.tag}</Box>
							<Box sx={{ fontSize: 13, color: DESK.muted }}>Asked for {asker} · {timeAgo(q.created_at)}</Box>
						</Box>
						<Box component="h1" sx={{ m: 0, fontSize: 30, lineHeight: '38px', fontWeight: 800 }}>{q.question}</Box>
						<Box component="p" sx={{ m: 0, fontSize: 17, lineHeight: '27px', whiteSpace: 'pre-line' }}>{q.full_description || q.short_description}</Box>
						{q.history && <Box sx={{ fontSize: 14, lineHeight: '21px', color: DESK.muted }}><b style={{ color: DESK.ink }}>History: </b>{q.history}</Box>}
						<Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
							<Box component="button" type="button" onClick={() => void share()} sx={outlineBtnSx}>{shared ? 'Link copied' : 'Share'}</Box>
						</Box>
					</Box>

					<Box sx={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
						<Box component="h2" sx={{ m: 0, fontSize: 20, fontWeight: 800 }}>
							{answers.length === 0 ? 'No answers yet' : `${answers.length} ${answers.length === 1 ? 'doctor' : 'doctors'} answered`}
						</Box>
						{answers.length > 1 && <Box sx={{ fontSize: 13, fontWeight: 700, color: DESK.muted }}>Most helpful first</Box>}
					</Box>

					{answers.length === 0 && <EmptyBox title="Waiting for a doctor" text="Most questions get an answer within 24 hours." />}

					{answers.map((a, i) => (
						<AnswerCard
							key={a.id}
							a={a}
							top={i === 0 && answers.length > 1 && a.likes > 0}
							voted={!!voted[a.id]}
							onLike={() => void like(a)}
							canReply={!!accessToken && access.canReply}
							onChanged={load}
						/>
					))}

					{access.canAnswer && (
						<Box component="section" sx={{ ...cardSx, p: '22px 24px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
							<Box component="b" sx={{ fontSize: 17 }}>Add your answer</Box>
							<Box component="textarea" rows={5} value={draft} onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setDraft(e.target.value)} placeholder="Share general guidance and say when to see a doctor in person" aria-label="Your answer" sx={{ p: '12px 14px', borderRadius: '12px', border: `1.5px solid ${DESK.lineStrong}`, bgcolor: DESK.page, color: DESK.ink, fontSize: 15, lineHeight: '22px', resize: 'none', outline: 'none', fontFamily: 'inherit', '&:focus': { borderColor: DESK.primary } }} />
							<Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
								<Box sx={{ fontSize: 12, color: DESK.muted }}>{draft.trim().length < MIN_ANSWER_LENGTH ? `${MIN_ANSWER_LENGTH - draft.trim().length} more characters needed` : ''}</Box>
								<Box component="button" type="button" disabled={posting} onClick={() => void postAnswer()} sx={{ ...primaryBtnSx, opacity: posting ? 0.7 : 1 }}>Post answer</Box>
							</Box>
						</Box>
					)}
					{access.awaitingVerification && <Note>You can answer questions once your doctor profile is verified.</Note>}

					<Note>Answers are general guidance from verified doctors, not a diagnosis. For chest pain, breathlessness or very low sugar, go to emergency care.</Note>
				</Box>

				<Box component="aside" sx={{ position: 'sticky', top: 88, display: 'flex', flexDirection: 'column', gap: '16px', pt: '32px' }}>
					<Box component={RouterLink} to={ROUTES.PUBLIC.HEALTH_QUESTIONS} sx={{ p: '22px', borderRadius: '20px', background: 'linear-gradient(135deg, #FFFFFF 0%, #E3EFEF 100%)', border: `1px solid ${DESK.lineStrong}`, boxShadow: '0 4px 14px #12373E0A', color: DESK.ink, textDecoration: 'none', display: 'flex', flexDirection: 'column', gap: '8px', ...focusSx }}>
						<Box component="b" sx={{ fontSize: 18 }}>Have a question of your own?</Box>
						<Box sx={{ fontSize: 14, lineHeight: '20px', color: DESK.muted }}>Ask a verified doctor, free. Only age and gender are shown.</Box>
						<Box sx={{ mt: '6px', alignSelf: 'flex-start', height: 42, px: '18px', borderRadius: '10px', bgcolor: DESK.primary, color: '#fff', fontSize: 14, fontWeight: 800, display: 'inline-flex', alignItems: 'center' }}>Ask your own question</Box>
					</Box>
					{lead && (
						<SideCard title={`Talk to ${lead.doctor_name}`}>
							<Box sx={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
								{lead.doctor_avatar ? (
									<Box component="img" src={lead.doctor_avatar} alt="" sx={{ width: 52, height: 52, borderRadius: '14px', objectFit: 'cover' }} />
								) : (
									<Box aria-hidden="true" sx={{ width: 52, height: 52, borderRadius: '14px', bgcolor: TONES.purple[0], color: TONES.purple[1], fontSize: 16, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{initials(lead.doctor_name)}</Box>
								)}
								<Box sx={{ display: 'flex', flexDirection: 'column' }}>
									<Box component="b" sx={{ fontSize: 15 }}>{lead.doctor_specialty}</Box>
									{lead.doctor_hospital && <Box sx={{ fontSize: 13, color: DESK.muted }}>{lead.doctor_hospital}</Box>}
								</Box>
							</Box>
							<Box component={RouterLink} to={ROUTES.DOCTORS.DETAIL.replace(':id', lead.doctor_id)} sx={{ height: 44, borderRadius: '12px', bgcolor: DESK.primary, color: '#fff', fontSize: 15, fontWeight: 800, textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', ...focusSx }}>
								Book a consultation
							</Box>
						</SideCard>
					)}
					<PromoCard to={ROUTES.BLOGS.LIST} title="Read more from doctors" text="Articles, blogs and podcasts reviewed by verified doctors." cta="Health reads" />
				</Box>
			</Column>
		</ReadsPage>
	)
}

function AnswerCard({ a, top, voted, onLike, canReply, onChanged }: { a: DoctorAnswer; top: boolean; voted: boolean; onLike: () => void; canReply: boolean; onChanged: () => Promise<void> }) {
	return (
		<Box component="article" sx={{ p: '22px 24px', borderRadius: '20px', bgcolor: '#fff', border: `1.5px solid ${top ? DESK.mint : DESK.cardLine}`, display: 'flex', flexDirection: 'column', gap: '12px' }}>
			{top && <Box sx={{ alignSelf: 'flex-start', px: '8px', py: '2px', borderRadius: '6px', bgcolor: DESK.primarySoft, color: DESK.primary, fontSize: 11, fontWeight: 800, letterSpacing: '0.04em' }}>MOST HELPFUL</Box>}
			<Box sx={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
				{a.doctor_avatar ? (
					<Box component="img" src={a.doctor_avatar} alt="" sx={{ width: 48, height: 48, borderRadius: '14px', objectFit: 'cover' }} />
				) : (
					<Box aria-hidden="true" sx={{ flexShrink: 0, width: 48, height: 48, borderRadius: '14px', bgcolor: TONES.blue[0], color: TONES.blue[1], fontSize: 15, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{initials(a.doctor_name)}</Box>
				)}
				<Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
					<Box sx={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: 16, fontWeight: 800 }}>
						{a.doctor_name}
						<Box sx={{ display: 'flex', color: DESK.success }} title="Verified doctor"><Svg name="check" size={16} /></Box>
					</Box>
					<Box sx={{ fontSize: 13, color: DESK.muted }}>{[a.doctor_specialty, a.doctor_hospital].filter(Boolean).join(' · ')}</Box>
				</Box>
				<Box sx={{ fontSize: 12, color: DESK.muted }}>Answered {timeAgo(a.created_at)}</Box>
			</Box>
			<Box component="p" sx={{ m: 0, fontSize: 16, lineHeight: '26px', whiteSpace: 'pre-line' }}>{a.answer}</Box>
			<Box sx={{ display: 'flex', alignItems: 'center', gap: '10px', pt: '12px', borderTop: `1px solid ${DESK.lineSoft}` }}>
				<Box component="button" type="button" aria-pressed={voted} onClick={onLike} sx={{ ...outlineBtnSx, borderColor: voted ? DESK.primary : DESK.lineStrong, bgcolor: voted ? DESK.primarySoft : '#fff', color: DESK.primary }}>
					<Svg name="thumb" size={16} />
					Helpful · {a.likes}
				</Box>
				<Box sx={{ flexGrow: 1 }} />
				<Box component={RouterLink} to={ROUTES.DOCTORS.DETAIL.replace(':id', a.doctor_id)} sx={{ ...primaryBtnSx, height: 40 }}>
					Consult {a.doctor_name.split(' ').slice(0, 2).join(' ')}
				</Box>
			</Box>
			{(a.replies?.length > 0 || canReply) && <Replies answerId={a.id} replies={a.replies ?? []} canReply={canReply} onChanged={onChanged} />}
		</Box>
	)
}

function Replies({ answerId, replies, canReply, onChanged }: { answerId: string; replies: DoctorAnswerReply[]; canReply: boolean; onChanged: () => Promise<void> }) {
	const [text, setText] = useState('')
	const [busy, setBusy] = useState(false)

	const send = async (content: string, parentId?: string) => {
		if (!content.trim()) return false
		setBusy(true)
		try {
			await submitAnswerReply(answerId, content.trim(), parentId)
			await onChanged()
			return true
		} catch {
			toast.error('Could not post your reply')
			return false
		} finally {
			setBusy(false)
		}
	}

	return (
		<Box sx={{ display: 'flex', flexDirection: 'column', gap: '10px', pt: '4px' }}>
			{replies.map((r) => <ReplyNode key={r.id} r={r} canReply={canReply} onSend={send} />)}
			{canReply && (
				<Box sx={{ display: 'flex', gap: '8px' }}>
					<Box component="input" value={text} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setText(e.target.value)} placeholder="Write a reply" aria-label="Write a reply" sx={{ flexGrow: 1, height: 40, px: '12px', borderRadius: '10px', border: `1.5px solid ${DESK.lineStrong}`, outline: 'none', fontSize: 14, fontFamily: 'inherit', color: DESK.ink, '&:focus': { borderColor: DESK.primary } }} />
					<Box component="button" type="button" disabled={busy} onClick={async () => { if (await send(text)) setText('') }} sx={primaryBtnSx}>Reply</Box>
				</Box>
			)}
		</Box>
	)
}

function ReplyNode({ r, canReply, onSend, depth = 0 }: { r: DoctorAnswerReply; canReply: boolean; onSend: (c: string, parent?: string) => Promise<boolean>; depth?: number }) {
	const [open, setOpen] = useState(false)
	const [text, setText] = useState('')
	return (
		<Box sx={{ pl: depth ? '18px' : 0, borderLeft: depth ? `2px solid ${DESK.lineSoft}` : 0, display: 'flex', flexDirection: 'column', gap: '6px' }}>
			<Box sx={{ p: '10px 12px', borderRadius: '12px', bgcolor: DESK.page }}>
				<Box sx={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: 13, fontWeight: 800 }}>
					{r.user_name}
					{r.user_role === 'doctor' && <Box sx={{ px: '6px', borderRadius: '6px', bgcolor: DESK.successSoft, color: DESK.success, fontSize: 11 }}>Doctor</Box>}
					<Box component="span" sx={{ fontWeight: 500, color: DESK.muted }}>{timeAgo(r.created_at)}</Box>
				</Box>
				<Box sx={{ fontSize: 14, lineHeight: '21px', whiteSpace: 'pre-line' }}>{r.content}</Box>
				{canReply && <Box component="button" type="button" onClick={() => setOpen(!open)} sx={{ mt: '4px', p: 0, border: 0, bgcolor: 'transparent', color: DESK.primary, fontSize: 12, fontWeight: 800, cursor: 'pointer', fontFamily: 'inherit' }}>Reply</Box>}
			</Box>
			{open && (
				<Box sx={{ display: 'flex', gap: '8px' }}>
					<Box component="input" value={text} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setText(e.target.value)} placeholder={`Reply to ${r.user_name}`} aria-label="Write a reply" sx={{ flexGrow: 1, height: 36, px: '10px', borderRadius: '10px', border: `1.5px solid ${DESK.lineStrong}`, outline: 'none', fontSize: 14, fontFamily: 'inherit', color: DESK.ink }} />
					<Box component="button" type="button" onClick={async () => { if (await onSend(text, r.id)) { setText(''); setOpen(false) } }} sx={{ ...primaryBtnSx, height: 36 }}>Send</Box>
				</Box>
			)}
			{r.replies?.map((c) => <ReplyNode key={c.id} r={c} canReply={canReply} onSend={onSend} depth={depth + 1} />)}
		</Box>
	)
}
