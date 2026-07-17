// Shapes returned by the Amhra bot server. See docs/API.md for the full contract.

export interface QueueItem {
	url: string
	repeating: boolean
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
}

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
	SetTime = "setTime",
	RemoveSong = "removeSong",
	SetVolume = "setVolume",
	SetQueue = "setQueue",
	Quit = "quit",
	Mute = "mute",
	Unmute = "unmute",
	Loop = "loop",
	SkipSegment = "skipSegment",
	AutoSuggest = "autoSuggest",
}

export const FormatSongEditType: Record<SongEditType, string> = {
	[SongEditType.Pause]: "Paused",
	[SongEditType.Resume]: "Resumed",
	[SongEditType.Skip]: "Skipped",
	[SongEditType.Stop]: "Stopped",
	[SongEditType.AddSong]: "Added Song",
	[SongEditType.SetTime]: "Set Time",
	[SongEditType.RemoveSong]: "Removed Song",
	[SongEditType.SetVolume]: "Set Volume",
	[SongEditType.SetQueue]: "Set Queue",
	[SongEditType.Quit]: "Quitted",
	[SongEditType.Mute]: "Muted",
	[SongEditType.Unmute]: "Unmuted",
	[SongEditType.Loop]: "Loop Toggled",
	[SongEditType.SkipSegment]: "Skipped Non-Music",
	[SongEditType.AutoSuggest]: "Radio Toggled",
} as const

export enum ActionType {
	Exit = "exit",
	AddAuth = "addAuth",
	ReloadCommands = "reload",
	ReloadSetting = "reloadSetting",
}

export interface ActionData {
	action: ActionType
	guildId?: string
}

export interface YoutubeVideoData {
	durationInSec: number
	channel: {
		url: string
		id: string
		name: string
	}
	id: string
	title: string
	views: number
	url: string
}

export type SearchResult = Pick<
	YoutubeVideoData,
	"url" | "title" | "durationInSec"
>

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
	time: string
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

export interface Message {
	message: {
		content: string
		id: string
	}
	author: {
		id: string
		tag: string
	}
	timestamp: {
		createdAt: number
		editedAt?: number
	}
}

export interface Channel {
	channel: {
		id: string
		name: string
	}
	messages: Message[]
}

export interface Guild {
	id: string
	name: string
}

export const YoutubeVideoRegex =
	/^http(?:s?):\/\/(?:www\.)?youtu(?:be\.com\/watch\?v=|\.be\/)([\w\-\_]*)(&(amp;)?[\w\?=]*)?$/
