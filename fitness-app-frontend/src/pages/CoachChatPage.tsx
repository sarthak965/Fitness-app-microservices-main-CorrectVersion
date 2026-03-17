import { useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useAppAuth } from '../context/AppAuthContext'
import { fitnessApi } from '../services/fitnessApi'
import { formatDateTime, titleCase } from '../utils/formatters'

type ChatMessage = {
  role: 'user' | 'assistant'
  content: string
}

const starterPrompts = [
  'Review this session and tell me what went well, what to improve, and how to recover.',
  'Based on this activity, what should my next workout look like?',
  'What patterns in this session suggest fatigue, pacing issues, or good progress?',
]

function cleanAssistantText(value: string) {
  return value
    .replace(/#{1,6}\s*/g, '')
    .replace(/\*\*(.*?)\*\*/g, '$1')
    .replace(/\*(.*?)\*/g, '$1')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/\r/g, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}

export function CoachChatPage() {
  const { token } = useAppAuth()
  const [searchParams] = useSearchParams()
  const activityId = searchParams.get('activityId') || undefined
  const activityType = searchParams.get('type')
  const activityName = searchParams.get('name')
  const startedAt = searchParams.get('startedAt')
  const duration = searchParams.get('duration')
  const contextualPrompt = useMemo(() => {
    if (!activityType || !startedAt) {
      return ''
    }

    const sessionLabel = activityName?.trim() ? `${activityName} (${titleCase(activityType)})` : `${titleCase(activityType)} session`
    return `Please review my ${sessionLabel} from ${formatDateTime(startedAt)}. Use the activity data to explain what went well, what needs improvement, and how I should recover.`
  }, [activityName, activityType, startedAt])
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: 'assistant',
      content:
        'Ask for a session review, recovery advice, progression ideas, or what your next workout should be. When you open chat from history, I can answer in the context of that exact activity.',
    },
  ])
  const [input, setInput] = useState(contextualPrompt)
  const [loading, setLoading] = useState(false)

  async function sendMessage(message: string) {
    if (!token || !message.trim()) {
      return
    }

    setMessages((current) => [...current, { role: 'user', content: message }])
    setInput('')
    setLoading(true)

    try {
      const response = await fitnessApi.chat(message, token, activityId)
      setMessages((current) => [...current, { role: 'assistant', content: cleanAssistantText(response.answer) }])
    } catch (error) {
      setMessages((current) => [
        ...current,
        { role: 'assistant', content: error instanceof Error ? error.message : 'Unable to reach the AI assistant right now.' },
      ])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <section className="section-shell">
        <div className="grid gap-6 xl:grid-cols-[0.72fr_1.28fr]">
          <div className="relative overflow-hidden rounded-[28px] bg-slate-950 px-6 py-8 text-white shadow-[0_24px_80px_-36px_rgba(15,23,42,0.85)]">
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(56,189,248,0.24),transparent_42%),radial-gradient(circle_at_bottom_right,rgba(251,191,36,0.18),transparent_38%),linear-gradient(160deg,rgba(15,23,42,0.96),rgba(2,6,23,1))]" />
            <div className="pointer-events-none absolute -right-12 top-10 h-28 w-28 rounded-full bg-cyan-400/20 blur-3xl" />
            <div className="pointer-events-none absolute -left-10 bottom-6 h-24 w-24 rounded-full bg-amber-300/20 blur-3xl" />
            <div className="relative">
              <div className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-200">AI coach chat</div>
              <h1 className="mt-4 bg-gradient-to-r from-white via-cyan-100 to-amber-100 bg-clip-text text-4xl font-semibold leading-tight text-transparent">
                Talk to your coach with full session context
              </h1>
              <p className="mt-4 max-w-sm text-sm leading-7 text-slate-200">
                Start from history and the assistant can review the actual workout instead of guessing from a generic prompt.
              </p>
              <div className="mt-8 flex flex-wrap gap-2 text-xs font-medium text-slate-200">
                <span className="rounded-full border border-white/10 bg-white/10 px-3 py-1 backdrop-blur">Activity-aware</span>
                <span className="rounded-full border border-cyan-300/20 bg-cyan-300/10 px-3 py-1 text-cyan-100">Recovery</span>
                <span className="rounded-full border border-amber-300/20 bg-amber-300/10 px-3 py-1 text-amber-100">Progression</span>
              </div>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-[1.2fr_0.8fr]">
            <div className="theme-accent-card coach-panel-card p-6">
              <div className="coach-panel-label text-sm font-semibold">Selected activity</div>
              <div className="coach-panel-title mt-3 text-2xl font-semibold">
                {activityName?.trim() || (activityType ? titleCase(activityType) : 'General coaching chat')}
              </div>
              <div className="coach-panel-subtitle mt-2 text-sm">
                {startedAt ? formatDateTime(startedAt) : 'No session selected from history'}
              </div>
              <div className="mt-4 flex flex-wrap gap-2 text-sm">
                {activityType ? <span className="coach-chip rounded-full px-3 py-1">{titleCase(activityType)}</span> : null}
                {duration ? <span className="coach-chip rounded-full px-3 py-1">{duration} min</span> : null}
                {activityId ? <span className="coach-chip coach-chip--success rounded-full px-3 py-1">Context attached</span> : null}
              </div>
            </div>

            <div className="theme-accent-card coach-panel-card p-4">
              <div className="coach-panel-label text-sm font-semibold">Quick prompts</div>
              <div className="mt-4 grid gap-3">
                {starterPrompts.map((prompt) => (
                  <button
                    key={prompt}
                    className="coach-prompt-card rounded-[22px] px-4 py-4 text-left text-sm transition"
                    onClick={() => void sendMessage(prompt)}
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section-shell flex min-h-[720px] flex-col">
        <div className="flex-1 space-y-4 overflow-y-auto pr-2">
          {messages.map((message, index) => (
            <div
              key={`${message.role}-${index}`}
              className={`max-w-[92%] rounded-[28px] px-5 py-4 text-sm leading-7 whitespace-pre-wrap ${
                message.role === 'user'
                  ? 'ml-auto bg-slate-950 text-white'
                  : 'bg-white/90 text-slate-700 ring-1 ring-slate-200'
              }`}
            >
              {message.content}
            </div>
          ))}
        </div>

        <form
          className="mt-6 rounded-[28px] border border-slate-200 bg-white/90 p-4"
          onSubmit={(event) => {
            event.preventDefault()
            void sendMessage(input)
          }}
        >
          <textarea
            className="field min-h-32 border-0 bg-white/80"
            placeholder="Ask about this workout, your next session, recovery, pacing, fatigue, or overall fitness..."
            value={input}
            onChange={(event) => setInput(event.target.value)}
          />
          <div className="mt-4 flex items-center justify-between gap-4">
            <div className="text-sm text-slate-500">
              {loading ? 'Thinking...' : activityId ? 'This chat includes the selected activity data.' : 'No activity context attached yet.'}
            </div>
            <button className="action-primary" type="submit" disabled={loading || !input.trim()}>
              {loading ? 'Sending...' : 'Send message'}
            </button>
          </div>
        </form>
      </section>
    </div>
  )
}
