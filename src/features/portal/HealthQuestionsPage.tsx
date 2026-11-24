// src/features/portal/HealthQuestionsPage.tsx
//
// Desktop "Ask a doctor" (design: Desktop · 8 and 8a): the public question list on the left (GET /api/qa) and the ask form
// on the right (POST /api/qa/questions). Age and gender come from the chosen family member / profile, never typed.
import { useEffect, useRef, useState } from 'react'
import { Link as RouterLink, Navigate, useSearchParams } from 'react-router-dom'
import { Box } from '@mui/material'
import { DESK } from '../../styles/deskTokens'
import { useAuth } from '../../hooks/useAuth'
import { useFamilyMembers } from '../../hooks/useFamilyMembers'
import { useQuestionAccess } from '../../hooks/useQuestionAccess'
import { listHealthQuestions, listQuestionTags, submitHealthQuestion, type PatientQuestion } from '../../services/qaService'
import { Chip, Column, EmptyBox, Hero, Pager, ReadsPage, ReadsSubNav, Svg } from './readsKit'
import { TONES, cardSx, focusSx, hoverCardSx, timeAgo, topicStyle, useUrlPage } from './readsHelpers'
import { useLoginPrompt } from '../../components/common/AuthModal/useLoginPrompt'

const ALL = 'All'
const PER_PAGE = 5
const MIN = 20
const MAX = 500

const SPECS: { name: string; tag: string; sub: string }[] = [
	{ name: 'General physician', tag: 'General', sub: 'Fever, cold, everyday concerns' },
	{ name: 'Endocrinology', tag: 'Endocrinology', sub: 'Diabetes, thyroid, hormones' },
	{ name: 'Cardiology', tag: 'Cardiology', sub: 'Heart, blood pressure' },
	{ name: 'Respiratory', tag: 'Respiratory', sub: 'Cough, asthma, breathing' },
	{ name: 'Gastroenterology', tag: 'Gastroenterology', sub: 'Acidity, stomach, digestion' },
	{ name: 'Skin', tag: 'Skin', sub: 'Rashes, acne, hair' },
	{ name: 'Women’s health', tag: 'Women’s health', sub: 'Periods, pregnancy, PCOS' },
	{ name: 'Child health', tag: 'Child health', sub: 'Babies and children' },
	{ name: 'Mental health', tag: 'Mental health', sub: 'Stress, sleep, anxiety' },
]
const AUTO: [string, RegExp][] = [
	['Respiratory', /\b(cough|breath|asthma|wheez|lung)/i],
	['Endocrinology', /\b(sugar|diabet|insulin|thyroid|hba1c)/i],
	['Gastroenterology', /\b(acid|reflux|stomach|swallow|loose motion|constipat)/i],
	['Skin', /\b(skin|rash|acne|itch|hair)/i],
	['Women’s health', /\b(period|pregnan|pcos|breast)/i],
	['Child health', /\b(child\w*|baby|babies|sons?|daughters?|kids?|infants?)\b/i],
	['Mental health', /\b(anxiety|stress|sleep|depress|panic)/i],
]
const URGENT = /chest pain|can.?t breathe|breathless|unconscious|fainted|heavy bleeding|stroke|seizure/i

const who = (q: PatientQuestion) => [q.gender, q.age].filter(Boolean).join(', ')
const ageText = (age: string | number) => (age === '' || age == null ? 'age not set' : ageText0(age))
const ageText0 = (age: string | number) => (/^\d+$/.test(String(age).trim()) ? `${age} Years` : String(age))

export default function HealthQuestionsPage() {
	const [params] = useSearchParams()
	const legacyId = params.get('selectedId')
	if (legacyId) return <Navigate to={`/health-questions/${legacyId}`} replace />
	return <AskADoctor />
}

function AskADoctor() {
	const { accessToken } = useAuth()
	const login = useLoginPrompt('Login to ask a question')
	const access = useQuestionAccess()
	// The people the question can be asked for: the same list as the booking pages (the account holder first); it also refreshes when a family member is added.
	const { members } = useFamilyMembers()

	const [questions, setQuestions] = useState<PatientQuestion[]>([])
	const [tags, setTags] = useState<string[]>([])
	const [pages, setPages] = useState(1)
	const [page, setPage] = useUrlPage()
	const needleRef = useRef('')
	const [loading, setLoading] = useState(true)
	const [failed, setFailed] = useState(false)
	const [sort, setSort] = useState<'new' | 'most'>('new')
	const [sq, setSq] = useState('')
	const [needle, setNeedle] = useState('')
	const [topic, setTopic] = useState(ALL)

	// ask form
	const [forId, setForId] = useState('')
	const [spTag, setSpTag] = useState('')
	const [text, setText] = useState('')
	const [tried, setTried] = useState(false)
	const [posting, setPosting] = useState(false)
	const [sent, setSent] = useState<{ id: string; text: string; spec: string; who: string } | null>(null)
	const [forOpen, setForOpen] = useState(false)
	const [spOpen, setSpOpen] = useState(false)

	// The search text goes to the server a moment after typing stops; the page only resets when the search really changed.
	useEffect(() => {
		const t = setTimeout(() => {
			const v = sq.trim()
			if (v === needleRef.current) return
			needleRef.current = v
			setNeedle(v)
			setPage(1)
		}, 350)
		return () => clearTimeout(t)
	}, [sq, setPage])

	// Topic chips: the tags that have public questions, from the server.
	useEffect(() => {
		let active = true
		const load = async () => {
			try {
				const res = await listQuestionTags()
				if (active) setTags(res)
			} catch {
				if (active) setTags([])
			}
		}
		void load()
		return () => {
			active = false
		}
	}, [])

	// One page of questions, filtered, searched and sorted by the server.
	useEffect(() => {
		let active = true
		const load = async () => {
			setLoading(true)
			setFailed(false)
			try {
				const res = await listHealthQuestions(needle || undefined, page, PER_PAGE, topic === ALL ? undefined : topic, sort === 'most' ? 'most_answered' : 'newest')
				if (!active) return
				const lastPage = Math.max(1, res.meta.pages)
				// A link to a page that no longer exists falls back to the last real page.
				if (page > lastPage) {
					setPage(lastPage)
					return
				}
				setQuestions(res.data)
				setPages(lastPage)
			} catch {
				if (active) setFailed(true)
			} finally {
				if (active) setLoading(false)
			}
		}
		void load()
		return () => {
			active = false
		}
	}, [needle, page, topic, sort, setPage])

	const person = members.find((m) => m.id === forId) ?? members[0]
	// age and gender are the only things shown with a question, so the person must have both
	const needsProfile = !!person && !person.isComplete

	const topics = [ALL, ...tags]
	const list = questions

	const trimmed = text.trim()
	const suggested = trimmed.length >= MIN ? (AUTO.find(([, re]) => re.test(trimmed))?.[0] ?? 'General physician') : ''
	const spec = SPECS.find((s) => s.tag === spTag)
	const missing = [!spec && 'a specialization', trimmed.length < MIN && `a bit more detail (${MIN}+ characters)`].filter(Boolean) as string[]
	const urgent = URGENT.test(trimmed)

	const submit = async () => {
		if (!accessToken) {
			// the question stays typed; once signed in the visitor presses Post again
			login.prompt()
			return
		}
		if (missing.length || !spec || !person || needsProfile) {
			setTried(true)
			return
		}
		setPosting(true)
		try {
			const title = trimmed.length > 90 ? `${trimmed.slice(0, 87)}…` : trimmed
			const res = await submitHealthQuestion({
				gender: person.gender,
				age: ageText(person.age),
				tag: spec.tag,
				question: title,
				short_description: trimmed.length > 160 ? `${trimmed.slice(0, 157)}…` : trimmed,
				full_description: trimmed,
			})
			if (page === 1 && topic === ALL && !needle && sort === 'new') {
				setQuestions((prev) => [res.data, ...prev].slice(0, PER_PAGE))
			}
			setSent({ id: res.data.id, text: trimmed, spec: spec.name, who: `${person.name.split(' ')[0]}, ${ageText(person.age)}, ${person.gender}` })
			setTried(false)
		} catch {
			// ApiService already toasted the server's message
		} finally {
			setPosting(false)
		}
	}

	const again = () => {
		setSent(null)
		setText('')
		setSpTag('')
	}

	return (
		<ReadsPage>
			{login.modal}
			<ReadsSubNav active="ask" />
			<Hero
				eyebrow="ASK A DOCTOR, FREE"
				title="Got a health question? Ask a doctor"
				subtitle="Post it for free and verified doctors reply. Questions show only age and gender, never your name."
				crumbs={[{ label: 'Ask a doctor' }]}
			/>

			<Column sx={{ pt: '28px', pb: '64px', display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 420px', gap: '28px', alignItems: 'start' }}>
				<Box component="section" aria-labelledby="qs-h" sx={{ display: 'flex', flexDirection: 'column', gap: '14px', minWidth: 0 }}>
					<Box sx={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
						<Box component="h2" id="qs-h" sx={{ flexGrow: 1, m: 0, fontSize: 22, fontWeight: 800 }}>
							Health questions
						</Box>
						<Box role="group" aria-label="Sort questions" sx={{ display: 'inline-flex', p: '3px', borderRadius: '9999px', bgcolor: DESK.segmentTrack }}>
							{([['new', 'Newest'], ['most', 'Most answered']] as const).map(([k, label]) => (
								<Box
									key={k}
									component="button"
									type="button"
									aria-pressed={sort === k}
									onClick={() => {
										setSort(k)
										setPage(1)
									}}
									sx={{ height: 32, px: '14px', border: 0, borderRadius: '9999px', bgcolor: sort === k ? '#fff' : 'transparent', color: sort === k ? DESK.ink : DESK.muted, boxShadow: sort === k ? '0 1px 3px #12373E26' : 'none', fontSize: 13, fontWeight: 800, cursor: 'pointer', fontFamily: 'inherit', ...focusSx }}
								>
									{label}
								</Box>
							))}
						</Box>
					</Box>

					<Box component="label" sx={{ height: 48, boxSizing: 'border-box', px: '14px', borderRadius: '12px', bgcolor: '#fff', border: `1px solid ${DESK.lineStrong}`, display: 'flex', alignItems: 'center', gap: '10px', color: DESK.muted, '&:focus-within': { borderColor: DESK.primary } }}>
						<Svg name="search" size={18} />
						<Box component="input" type="search" value={sq} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSq(e.target.value)} placeholder="Search questions" aria-label="Search questions" sx={{ flexGrow: 1, minWidth: 0, height: 44, border: 0, outline: 'none', bgcolor: 'transparent', fontSize: 15, color: DESK.ink, fontFamily: 'inherit' }} />
					</Box>

					<Box role="group" aria-label="Topic" sx={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
						{topics.map((t) => (
							<Chip key={t} label={t} on={t === topic} onClick={() => { setTopic(t); setPage(1) }} height={34} />
						))}
					</Box>

					{loading ? null : failed ? (
						<EmptyBox title="We couldn’t load the questions" text="Check your connection and try again." />
					) : (
						list.map((q) => <QuestionCard key={q.id} q={q} fresh={q.id === sent?.id} />)
					)}
					{!loading && !failed && list.length === 0 && <EmptyBox title="No questions found" text="Try another word, or ask your own question." />}
					{!failed && <Pager page={page} pages={pages} onChange={setPage} />}
				</Box>

				<Box component="aside" sx={{ position: 'sticky', top: 88, display: 'flex', flexDirection: 'column', gap: '16px' }}>
					{sent ? (
						<Box component="section" role="status" sx={{ p: '26px', borderRadius: '20px', bgcolor: '#fff', border: '1px solid #BFE3CF', boxShadow: '0 10px 30px #12373E14', display: 'flex', flexDirection: 'column', gap: '14px' }}>
							<Box component="b" sx={{ fontSize: 22 }}>Question submitted</Box>
							<Box sx={{ fontSize: 14, lineHeight: '21px', color: DESK.inkSoft }}>Sent to {sent.spec} doctors. Most questions get an answer within 24 hours.</Box>
							<Box component="blockquote" sx={{ m: 0, p: '14px', borderRadius: '12px', bgcolor: DESK.page, fontSize: 15, lineHeight: '22px' }}>
								<Box component="span" sx={{ display: 'block', mb: '4px', fontSize: 12, color: DESK.muted }}>For {sent.who}</Box>
								{sent.text}
							</Box>
							<Box sx={{ display: 'flex', gap: '8px' }}>
								<Box component={RouterLink} to={`/health-questions/${sent.id}`} sx={{ flex: '1 1 0', height: 46, borderRadius: '12px', bgcolor: DESK.primary, color: '#fff', fontSize: 15, fontWeight: 800, textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', ...focusSx }}>
									View my question
								</Box>
								<Box component="button" type="button" onClick={again} sx={{ flex: '1 1 0', height: 46, borderRadius: '12px', border: `1.5px solid ${DESK.primary}`, bgcolor: '#fff', color: DESK.primary, fontSize: 15, fontWeight: 800, cursor: 'pointer', fontFamily: 'inherit', ...focusSx }}>
									Ask another
								</Box>
							</Box>
						</Box>
					) : access.canAsk ? (
						<Box component="section" aria-labelledby="ask-h" sx={{ p: '24px', borderRadius: '20px', bgcolor: '#fff', border: `1px solid ${DESK.cardLine}`, boxShadow: '0 10px 30px #12373E14', display: 'flex', flexDirection: 'column', gap: '16px' }}>
							<Box sx={{ display: 'flex', flexDirection: 'column' }}>
								<Box component="b" id="ask-h" sx={{ fontSize: 20 }}>Ask your question</Box>
								<Box sx={{ fontSize: 13, color: DESK.muted }}>Free · answered by verified doctors</Box>
							</Box>

							{accessToken && person && (
								<Field label="Asking for" note="Age and gender come from the profile. Only those are shown with your question.">
									<Box sx={{ position: 'relative', zIndex: forOpen ? 40 : 1, alignSelf: 'flex-start' }}>
										<Box component="button" type="button" aria-haspopup="listbox" aria-expanded={forOpen} onClick={() => { setForOpen(!forOpen); setSpOpen(false) }} sx={{ height: 42, pl: '6px', pr: '12px', borderRadius: '10px', border: `1px solid ${DESK.primary}`, bgcolor: DESK.primaryTint, color: DESK.ink, display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', whiteSpace: 'nowrap', fontFamily: 'inherit', ...focusSx }}>
											<Avatar src={person.avatar} name={person.name} />
											<span style={{ fontSize: 14, color: DESK.muted }}>For</span>
											<b style={{ fontSize: 14 }}>{person.name}</b>
											<span style={{ fontSize: 13, color: DESK.muted }}>· {ageText(person.age)}, {person.gender}</span>
											<Svg name="down" size={16} />
										</Box>
										{forOpen && (
											<Box role="listbox" aria-label="Who is this question for" sx={{ position: 'absolute', top: 'calc(100% + 6px)', left: 0, width: 280, maxHeight: 320, overflowY: 'auto', p: '6px', borderRadius: '12px', bgcolor: '#fff', border: `1px solid ${DESK.cardLine}`, boxShadow: DESK.shadowMenu, display: 'flex', flexDirection: 'column', gap: '2px' }}>
												{members.map((m) => (
													<Box key={m.id} component="button" type="button" role="option" aria-selected={m.id === person.id} onClick={() => { setForId(m.id); setForOpen(false) }} sx={{ display: 'flex', alignItems: 'center', gap: '10px', height: 44, px: '10px', border: 0, borderRadius: '8px', bgcolor: m.id === person.id ? DESK.primaryTint : 'transparent', color: DESK.ink, textAlign: 'left', cursor: 'pointer', fontFamily: 'inherit', '&:hover': { bgcolor: DESK.page } }}>
														<Avatar src={m.avatar} name={m.name} />
														<span style={{ display: 'flex', flexDirection: 'column' }}>
															<span style={{ fontSize: 14, lineHeight: '18px', fontWeight: m.id === person.id ? 800 : 600 }}>{m.name}</span>
															<span style={{ fontSize: 11, lineHeight: '14px', color: DESK.muted }}>{m.relationship} · {ageText(m.age)}, {m.gender}</span>
														</span>
													</Box>
												))}
											</Box>
										)}
									</Box>
								</Field>
							)}
							{accessToken && needsProfile && (
								<Box role="alert" sx={{ p: '12px 14px', borderRadius: '12px', bgcolor: DESK.dangerSoft, border: `1px solid ${DESK.dangerLine}`, fontSize: 13, lineHeight: '18px', color: DESK.inkSoft }}>
								Add {person.name.split(' ')[0]}’s date of birth and gender to ask for them. <Box component={RouterLink} to="/profile" sx={{ color: DESK.primary, fontWeight: 800 }}>Complete profile</Box>
							</Box>
						)}

							<Field label="Specialization">
								<Box sx={{ position: 'relative', zIndex: spOpen ? 30 : 1 }}>
									<Box component="button" type="button" aria-haspopup="listbox" aria-expanded={spOpen} onClick={() => { setSpOpen(!spOpen); setForOpen(false) }} sx={{ width: '100%', height: 44, boxSizing: 'border-box', pl: '14px', pr: '12px', borderRadius: '10px', border: `1px solid ${tried && !spec ? DESK.danger : spOpen || spec ? DESK.primary : DESK.lineStrong}`, bgcolor: spec ? DESK.primaryTint : '#fff', color: DESK.ink, display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', textAlign: 'left', fontFamily: 'inherit', ...focusSx }}>
										<span style={{ flexGrow: 1, minWidth: 0, fontSize: 14, fontWeight: 700, color: spec ? DESK.ink : DESK.muted, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{spec?.name ?? 'Select a specialization'}</span>
										{!spec && suggested && <span style={{ fontSize: 12, color: DESK.muted, whiteSpace: 'nowrap' }}>Suggested: {suggested}</span>}
										<Svg name="down" size={16} />
									</Box>
									{spOpen && (
										<Box role="listbox" sx={{ position: 'absolute', top: 'calc(100% + 6px)', left: 0, right: 0, maxHeight: 300, overflowY: 'auto', p: '6px', borderRadius: '12px', bgcolor: '#fff', border: `1px solid ${DESK.cardLine}`, boxShadow: DESK.shadowMenu, display: 'flex', flexDirection: 'column', gap: '2px' }}>
											{SPECS.map((s) => (
												<Box key={s.tag} component="button" type="button" role="option" aria-selected={s.tag === spTag} onClick={() => { setSpTag(s.tag); setSpOpen(false) }} sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', minHeight: 40, px: '10px', py: '6px', border: 0, borderRadius: '8px', bgcolor: s.tag === spTag ? DESK.primaryTint : 'transparent', color: DESK.ink, textAlign: 'left', cursor: 'pointer', fontFamily: 'inherit', '&:hover': { bgcolor: DESK.page } }}>
													<span style={{ fontSize: 14, lineHeight: '18px', fontWeight: s.tag === spTag ? 800 : 600 }}>{s.name}</span>
													<span style={{ fontSize: 11, lineHeight: '14px', color: DESK.muted }}>{s.sub}</span>
												</Box>
											))}
										</Box>
									)}
								</Box>
							</Field>

							<Field label="Your question">
								<Box component="textarea" rows={5} maxLength={MAX} value={text} onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setText(e.target.value)} placeholder="Describe symptoms, how long you’ve had them and any medicines you take" sx={{ boxSizing: 'border-box', width: '100%', p: '12px 14px', borderRadius: '12px', border: `1.5px solid ${tried && trimmed.length < MIN ? DESK.danger : trimmed ? DESK.primary : DESK.lineStrong}`, bgcolor: DESK.page, color: DESK.ink, fontSize: 15, lineHeight: '22px', resize: 'none', outline: 'none', fontFamily: 'inherit' }} />
								<Box sx={{ display: 'flex', justifyContent: 'space-between', gap: '8px', fontSize: 12 }}>
									<span style={{ color: DESK.primary, fontWeight: 700 }}>{spec ? `Goes to ${spec.name} doctors` : ''}</span>
									<span style={{ color: tried && trimmed.length < MIN ? DESK.danger : DESK.muted }}>{trimmed.length < MIN ? `${MIN - trimmed.length} more characters needed` : `${trimmed.length} / ${MAX}`}</span>
								</Box>
							</Field>

							{urgent && (
								<Box role="alert" sx={{ p: '12px 14px', borderRadius: '12px', bgcolor: DESK.dangerSoft, border: `1px solid ${DESK.dangerLine}`, display: 'flex', flexDirection: 'column', gap: '4px' }}>
									<Box component="b" sx={{ fontSize: 14, color: DESK.danger }}>This sounds urgent</Box>
									<Box sx={{ fontSize: 13, lineHeight: '18px', color: DESK.inkSoft }}>Don’t wait for an answer. Call 108 or go to the nearest emergency.</Box>
								</Box>
							)}
							{tried && missing.length > 0 && <Box sx={{ fontSize: 13, fontWeight: 700, color: DESK.danger }}>Add {missing.join(', ')} to post.</Box>}

							<Box component="button" type="button" disabled={posting || needsProfile} onClick={() => void submit()} sx={{ height: 50, border: 0, borderRadius: '12px', bgcolor: missing.length || needsProfile ? '#7FA9AA' : DESK.primary, color: '#fff', fontSize: 16, fontWeight: 800, cursor: posting || needsProfile ? 'default' : 'pointer', fontFamily: 'inherit', ...focusSx }}>
								{posting ? 'Posting…' : accessToken ? 'Post question' : 'Log in to post'}
							</Box>
							<Box sx={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: 12, lineHeight: '17px', color: DESK.muted }}>
								<Svg name="lock" size={15} />
								Your name is never shown. Not for emergencies, call 108.
							</Box>
						</Box>
					) : (
						<Box component="section" sx={{ ...cardSx, p: '24px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
							<Box component="b" sx={{ fontSize: 18 }}>{access.canAnswer ? 'Doctors answer questions' : 'Questions are asked by patients'}</Box>
							<Box sx={{ fontSize: 14, lineHeight: '20px', color: DESK.muted }}>
								{access.awaitingVerification ? 'You can answer once your profile is verified.' : 'Open a question to read the answers' + (access.canAnswer ? ' or add yours.' : '.')}
							</Box>
						</Box>
					)}

					<Box component="ol" sx={{ listStyle: 'none', m: 0, p: '18px 20px', borderRadius: '18px', bgcolor: DESK.primarySoft, display: 'flex', flexDirection: 'column', gap: '12px' }}>
						{['Post your question. Age and gender come from your profile.', 'Doctors in that speciality reply.', 'Book a consult if you need more.'].map((s, i) => (
							<Box key={s} component="li" sx={{ display: 'flex', gap: '10px', fontSize: 14, lineHeight: '20px' }}>
								<Box component="b" sx={{ flexShrink: 0, width: 24, height: 24, borderRadius: '9999px', bgcolor: '#fff', color: DESK.primary, fontSize: 12, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{i + 1}</Box>
								{s}
							</Box>
						))}
					</Box>
				</Box>
			</Column>
		</ReadsPage>
	)
}

function Field({ label, note, children }: { label: string; note?: string; children: React.ReactNode }) {
	return (
		<Box sx={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
			<Box component="span" sx={{ fontSize: 13, fontWeight: 800 }}>{label}</Box>
			{children}
			{note && <Box component="span" sx={{ fontSize: 12, color: DESK.muted }}>{note}</Box>}
		</Box>
	)
}

function Avatar({ src, name }: { src?: string; name: string }) {
	return src ? (
		<Box component="img" src={src} alt="" sx={{ width: 28, height: 28, borderRadius: '9999px', objectFit: 'cover', bgcolor: DESK.primarySoft }} />
	) : (
		<Box aria-hidden="true" sx={{ flexShrink: 0, width: 28, height: 28, borderRadius: '9999px', bgcolor: DESK.primarySoft, color: DESK.primary, fontSize: 11, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
			{name.charAt(0).toUpperCase()}
		</Box>
	)
}

function QuestionCard({ q, fresh }: { q: PatientQuestion; fresh: boolean }) {
	const [bg, ink] = TONES[topicStyle(q.tag).tone]
	const n = q.answers.length
	const waiting = n === 0
	return (
		<Box component={RouterLink} to={`/health-questions/${q.id}`} sx={{ ...cardSx, ...hoverCardSx, p: '18px 20px', borderRadius: '18px', border: `1px solid ${fresh ? DESK.mint : DESK.cardLine}`, color: DESK.ink, textDecoration: 'none', display: 'flex', flexDirection: 'column', gap: '6px', ...focusSx }}>
			<Box sx={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
				<Box sx={{ px: '8px', py: '2px', borderRadius: '6px', bgcolor: bg, color: ink, fontSize: 11, fontWeight: 800 }}>{q.tag}</Box>
				<Box sx={{ fontSize: 12, color: DESK.muted }}>Asked for {who(q)} · {timeAgo(q.created_at)}</Box>
			</Box>
			<Box component="b" sx={{ fontSize: 17, lineHeight: '24px' }}>{q.question}</Box>
			<Box sx={{ fontSize: 14, lineHeight: '21px', color: DESK.muted }}>{q.short_description.replace(/\.{3}$/, '…')}</Box>
			<Box sx={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: 13, fontWeight: 800, color: waiting ? DESK.warning : DESK.success }}>
				<Svg name={waiting ? 'clock' : 'check'} size={14} />
				{waiting ? 'Waiting for a doctor' : `${n} ${n === 1 ? 'doctor answered' : 'doctors answered'}`}
			</Box>
		</Box>
	)
}
