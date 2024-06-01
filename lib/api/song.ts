export interface SongReply {
    song?: {
        link: string,
        channel: string,
        duration: number,
        title: string,
        thumbnails: string[],
        startTime: number,
        startFrom: number
    },
    queue: string[],
    history: string[],
    volume: number,
    isPlaying: boolean,
    paused: boolean
    pausedInMs: number,
    pausedTimestamp: number
}

export enum SongEditType {
    Pause = 'pause',
    Resume = 'resume',
    Skip = 'skip',
    Stop = 'stop',
    AddSong = 'addSong',
    SetTime = 'setTime',
    RemoveSong = 'removeSong',
    SetVolume = 'setVolume',
    SetQueue = 'setQueue'
}

export const FormatSongEditType: Record<SongEditType, string> = {
    [SongEditType.Pause]: 'Paused',
    [SongEditType.Resume]: 'Resumed',
    [SongEditType.Skip]: 'Skipped',
    [SongEditType.Stop]: 'Stopped',
    [SongEditType.AddSong]: 'Added Song',
    [SongEditType.SetTime]: 'Set Time',
    [SongEditType.RemoveSong]: 'Removed Song',
    [SongEditType.SetVolume]: 'Set Volume',
    [SongEditType.SetQueue]: 'Set Queue'
} as const

export const YoutubeVideoRegex = /http(?:s?):\/\/(?:www\.)?youtu(?:be\.com\/watch\?v=|\.be\/)([\w\-\_]*)(&(amp;)?[\w\?=]*)?/