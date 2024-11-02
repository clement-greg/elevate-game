export function playSound(id: string, volume: number = null) {
    const audio: HTMLAudioElement = document.getElementById(id) as HTMLAudioElement;
    audio.currentTime = 0;
    if(volume) {
        audio.volume = volume;
    }
    audio.play();
}

export function pauseSound(id:string) {
    
    const audio: HTMLAudioElement = document.getElementById(id) as HTMLAudioElement;
    audio.pause();
}