// src/features/booking/visitCalendar.ts
//
// "Add to calendar" for a lab visit: builds a small .ics file in the browser and downloads it (Google, Apple and Outlook calendars open it).
// The visit time is the clinic's wall-clock time, so the event uses floating local times (no zone), like the time the page shows.
import { slotStart } from './bookingFormat'

const pad = (n: number) => String(n).padStart(2, '0')

const localStamp = (d: Date) =>
	`${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}T${pad(d.getHours())}${pad(d.getMinutes())}00`

/** Escapes text for an .ics property value. */
const escapeText = (text: string) =>
	text.replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\r?\n/g, '\\n')

export type VisitEvent = {
	/** The order id shown to the patient ("7K3Q-9M2X-4D8R"). */
	orderId: string
	title: string
	/** 'YYYY-MM-DD' */
	date: string
	/** A display label ("7:30 AM"). */
	time: string
	/** A display label of the end of the visit ("9:00 AM"); without it the event lasts 2 hours. */
	end?: string
	location?: string
	notes?: string
}

/** Downloads the visit as an .ics file. Returns false when there is no date to put in a calendar. */
export function downloadVisitCalendar(event: VisitEvent): boolean {
	if (!event.date) return false
	const start = slotStart(event.date, event.time)
	const known = event.end ? slotStart(event.date, event.end) : null
	const end = known && known.getTime() > start.getTime() ? known : new Date(start.getTime() + 2 * 60 * 60_000)
	const stamp = `${new Date().toISOString().replace(/[-:]/g, '').split('.')[0]}Z`
	const lines = [
		'BEGIN:VCALENDAR',
		'VERSION:2.0',
		'PRODID:-//Karolahealth//Lab tests//EN',
		'CALSCALE:GREGORIAN',
		'BEGIN:VEVENT',
		`UID:${event.orderId}@karolahealth`,
		`DTSTAMP:${stamp}`,
		`DTSTART:${localStamp(start)}`,
		`DTEND:${localStamp(end)}`,
		`SUMMARY:${escapeText(event.title)}`,
		...(event.location ? [`LOCATION:${escapeText(event.location)}`] : []),
		...(event.notes ? [`DESCRIPTION:${escapeText(event.notes)}`] : []),
		'END:VEVENT',
		'END:VCALENDAR',
	]
	const blob = new Blob([lines.join('\r\n')], { type: 'text/calendar;charset=utf-8' })
	const url = URL.createObjectURL(blob)
	const link = document.createElement('a')
	link.href = url
	link.download = `karolahealth-${event.orderId}.ics`
	document.body.appendChild(link)
	link.click()
	link.remove()
	setTimeout(() => URL.revokeObjectURL(url), 1000)
	return true
}
