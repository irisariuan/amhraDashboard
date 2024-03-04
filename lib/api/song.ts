export interface SongReply {
    song: {
        link: string,
        channel: string,
        duration: number,
        title: string,
        thumbnails: string[]
    },
    queue: string[],
    volume: number
}

export enum SongEditType {
    Pause = 'pause',
    Resume = 'resume',
    Skip = 'skip',
    Stop = 'stop',
    AddSong = 'addSong',
    SetTime = 'setTime'
}