// Shapes returned by the Amhra bot server. See docs/API.md for the full contract.

export interface QueueItem {
	url: string
	repeating: boolean
	/** Seconds to resume from: set on a track a scheduled play cut in over */
	seek?: number
}

/** A video set to cut in at a given time. See docs/API.md, "Scheduled plays". */
export interface ScheduledPlay {
	id: string
	url: string
	title: string
	/** Epoch milliseconds it was scheduled for */
	at: number
	/** When it will actually cut in: later than `at` when the warning went out late */
	fireAt: number
	/** The ten-second warning is out and it can still be stopped */
	warning: boolean
	/** Being started; a premiere retries for a few minutes until it is live */
	starting: boolean
	/** An upcoming premiere, timed to its start */
	premiere: boolean
	createdBy: string
}

export interface SongReply {
	song: {
		link: string
		channel?: string
		duration: number
		title?: string
		thumbnails: string[]
		startFrom: number
		startTime: number
	} | null
	queue: QueueItem[]
	volume: number
	isPlaying: boolean
	history: string[]
	useYoutubeDl: boolean
	paused: boolean
	pausedInMs: number
	pausedTimestamp: number
	canSeek: boolean
	isMuting: boolean
	loop: boolean
	autoSuggest: boolean
	skipToTimestamp: number | null
	/** How long the seam between two tracks is mixed over, in milliseconds */
	crossfadeMs: number
	/** The shorter fade used when a track is skipped rather than ending */
	skipFadeMs: number
	/** Only the bot's Rust voice path mixes tracks; elsewhere fades are ignored */
	canCrossfade: boolean
	/** Absent on a bot that predates scheduling */
	schedules?: ScheduledPlay[]
	/** Only the bot's Rust voice path can mix songs over the queue. Absent on older bots */
	canMix?: boolean
	/** Tracks playing on top of the queue. Absent on a bot that predates mixing */
	mix?: Mix
	/** When this reply arrived, by this browser's clock; set by `getSong`, not the bot */
	receivedAt?: number
}

/** A song on a mix track. See docs/API.md, "Mix". */
export interface MixSong {
	title: string
	url: string
	/** Null when the bot did not know the video's length */
	durationMs: number | null
	/**
	 * Silence before it in place of the track's gap, set by where it was
	 * dropped on the timeline. Null or absent: the track's gap.
	 */
	gapBeforeMs?: number | null
}

/** A lane of the mix: one song at a time, then the next after its gap. */
export interface MixTrack {
	/** Stable while other tracks come and go; what the edits name it by */
	id: string
	/** Linear, like the player's volume: 1 is 100% */
	volume: number
	/** Silence between one song ending and the next starting */
	gapMs: number
	/** Songs that end go to the back of the track's queue */
	loop: boolean
	playing: (MixSong & { positionMs: number }) | null
	/** Being downloaded to play next */
	loading: MixSong | null
	queue: MixSong[]
	/** Until the next song starts, while the track waits out its gap */
	dueInMs: number | null
}

export interface Mix {
	/** The queue song's own volume within the mix, under the player's volume */
	mainVolume: number
	/** The bot's cap on tracks at once. Absent, with `tracks`, on a bot from before tracks */
	maxTracks?: number
	tracks?: MixTrack[]
}

/** The bot's cap on tracks, for a bot that does not say */
export const MAX_MIX_TRACKS = 8

export interface Account {
	id: string
	type: "anonymous" | "web"
	displayName: string | null
	permission: number
	isAdmin: boolean
}

export interface Suggestion {
	url: string
	title: string
	durationInSec: number
	channel?: string
}

export enum SongEditType {
	Pause = "pause",
	Resume = "resume",
	Skip = "skip",
	Stop = "stop",
	AddSong = "addSong",
	AddPlaylist = "addPlaylist",
	SetTime = "setTime",
	RemoveSong = "removeSong",
	SetVolume = "setVolume",
	SetCrossfade = "setCrossfade",
	SetQueue = "setQueue",
	Quit = "quit",
	Mute = "mute",
	Unmute = "unmute",
	Loop = "loop",
	SkipSegment = "skipSegment",
	AutoSuggest = "autoSuggest",
	SetMainVolume = "setMainVolume",
	AddMixTrack = "addMixTrack",
	RemoveMixTrack = "removeMixTrack",
	SetMixTrack = "setMixTrack",
	SkipMixTrack = "skipMixTrack",
	SwapMixTrack = "swapMixTrack",
	AddMixSong = "addMixSong",
	RemoveMixSong = "removeMixSong",
	MoveMixSong = "moveMixSong",
}

export const FormatSongEditType: Record<SongEditType, string> = {
	[SongEditType.Pause]: "Paused",
	[SongEditType.Resume]: "Resumed",
	[SongEditType.Skip]: "Skipped",
	[SongEditType.Stop]: "Stopped",
	[SongEditType.AddSong]: "Added Song",
	[SongEditType.AddPlaylist]: "Added Playlist",
	[SongEditType.SetTime]: "Set Time",
	[SongEditType.RemoveSong]: "Removed Song",
	[SongEditType.SetVolume]: "Set Volume",
	[SongEditType.SetCrossfade]: "Set Crossfade",
	[SongEditType.SetQueue]: "Set Queue",
	[SongEditType.Quit]: "Quitted",
	[SongEditType.Mute]: "Muted",
	[SongEditType.Unmute]: "Unmuted",
	[SongEditType.Loop]: "Loop Toggled",
	[SongEditType.SkipSegment]: "Skipped Non-Music",
	[SongEditType.AutoSuggest]: "Radio Toggled",
	[SongEditType.SetMainVolume]: "Set Queue Song Mix Volume",
	[SongEditType.AddMixTrack]: "Added Mix Track",
	[SongEditType.RemoveMixTrack]: "Removed Mix Track",
	[SongEditType.SetMixTrack]: "Changed Mix Track",
	[SongEditType.SkipMixTrack]: "Skipped On Mix Track",
	[SongEditType.SwapMixTrack]: "Swapped Mix Track In",
	[SongEditType.AddMixSong]: "Queued On Mix Track",
	[SongEditType.RemoveMixSong]: "Removed Mix Track Song",
	[SongEditType.MoveMixSong]: "Moved Song",
} as const

export interface YoutubeVideoData {
	id: string
	url: string
	title: string
	durationInSec: number
	channel: {
		name: string
		url: string
	}
	thumbnails: { url: string }[]
}

/** A playlist's contents, from /api/getPlaylistDetail */
export interface YoutubePlaylistData {
	url: string
	title: string
	videos: YoutubeVideoData[]
}

export type SearchResult = Pick<
	YoutubeVideoData,
	"url" | "title" | "durationInSec"
> & {
	/** Every hit the bot returned, best match first */
	results: SearchHit[]
}

/** One row of the live search dropdown. */
export interface SearchHit {
	url: string
	title: string
	durationInSec: number
	channel: string
	thumbnail: string | null
}

export type LogType =
	| "dcblog"
	| "dcbmsg"
	| "explog"
	| "experr"
	| "error"
	| "errim"
	| "errwn"

export type LogExtraType = "voice" | "delete" | "edit"

export interface Log {
	message: string
	type: LogType
	extraType?: LogExtraType
	/** Epoch milliseconds */
	time: number
}

export const LogFormatted: Record<LogType | LogExtraType | "null", string> = {
	dcblog: "Bot Log",
	dcbmsg: "Message",
	errim: "Important",
	error: "Error",
	errwn: "Warning",
	experr: "Express Error",
	explog: "Express Log",
	voice: "Voice",
	delete: "Delete",
	edit: "Edit",
	null: "",
} as const

export interface Guild {
	id: string
	name: string
}

const YOUTUBE_HOSTS = new Set([
	"youtube.com",
	"www.youtube.com",
	"m.youtube.com",
	"music.youtube.com",
	"youtu.be",
])

function youtubeUrl(text: string): URL | null {
	try {
		const url = new URL(text.trim())
		return YOUTUBE_HOSTS.has(url.hostname) ? url : null
	} catch {
		return null
	}
}

/** A link to one video, in any of the forms the bot accepts */
export function isYoutubeVideoUrl(text: string): boolean {
	const url = youtubeUrl(text)
	if (!url) return false
	if (url.hostname === "youtu.be") return url.pathname.length > 1
	return (
		(url.pathname === "/watch" && url.searchParams.has("v")) ||
		/^\/(shorts|live|embed)\/[\w-]+/.test(url.pathname)
	)
}

/** A playlist page link; a watch link inside a playlist counts as a video */
export function isYoutubePlaylistUrl(text: string): boolean {
	const url = youtubeUrl(text)
	const list = url?.searchParams.get("list")
	// Mixes and personal lists (RD…, LL…, WL…) cannot be read by the bot
	return url?.pathname === "/playlist" && !!list && !/^(RD|UL|LL|WL)/.test(list)
}

/** Synced lyric line; `time` is milliseconds from the start of the track */
export interface LyricLine {
	time: number
	text: string
}

export interface Lyrics {
	id: number
	trackName: string
	artistName: string
	albumName: string | null
	duration: number | null
	instrumental: boolean
	plain: string | null
	synced: LyricLine[] | null
}

export interface LyricsReply {
	/** The track these lyrics were looked up for; null for a pure search */
	link: string | null
	content: Lyrics | null
	/**
	 * Milliseconds the synced times were already moved by: the playing song's
	 * own lyrics delay, or the bot-wide default when it has none
	 */
	delayMs?: number
}

export interface LyricsDelayReply {
	link: string
	delayMs: number
}
