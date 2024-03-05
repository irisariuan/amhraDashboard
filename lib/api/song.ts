export interface SongReply {
    song: {
        link: string,
        channel: string,
        duration: number,
        title: string,
        thumbnails: string[]
    },
    queue: string[],
    volume: number,
    isPlaying: boolean
}

export enum SongEditType {
    Pause = 'pause',
    Resume = 'resume',
    Skip = 'skip',
    Stop = 'stop',
    AddSong = 'addSong',
    SetTime = 'setTime'
}

export const YoutubeVideoRegex = /http(?:s?):\/\/(?:www\.)?youtu(?:be\.com\/watch\?v=|\.be\/)([\w\-\_]*)(&(amp;)?‌​[\w\?‌​=]*)?/