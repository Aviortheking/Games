export default class SoundManager {
	private audio: HTMLAudioElement
	public constructor(path: string) {
		this.audio = new Audio(path)
		this.audio.load()
		this.audio.volume = .8
	}

	public play() {
		this.audio.play()
	}

	public end() {
		this.audio.pause()
	}
}
