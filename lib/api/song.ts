export interface IQueueItem {
	url: string;
	repeating: boolean;
}

export interface SongReply {
	song: {
		link: string;
		channel?: string;
		duration: number;
		title?: string;
		thumbnails: string[];
		startFrom: number;
		startTime: number;
	} | null;
	queue: IQueueItem[];
	volume: number;
	isPlaying: boolean;
	history: string[];
	useYoutubeDl: boolean;
	paused: boolean;
	pausedInMs: number;
	pausedTimestamp: number;
	canSeek: boolean;
	isMuting: boolean;
	loop: boolean;
	skipToTimestamp: number | null;
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
} as const;

export const YoutubeVideoRegex =
	/^http(?:s?):\/\/(?:www\.)?youtu(?:be\.com\/watch\?v=|\.be\/)([\w\-\_]*)(&(amp;)?[\w\?=]*)?$/;
