import Event from '.'

export default class PointerEvents extends Event {
	public override init(): void {
		document.addEventListener('mousemove', this.basicEvent)
		document.addEventListener('mousedown', this.mouseDown)
		document.addEventListener('mouseup', this.mouseUp)
	}

	public update() {
		// pouet
	}

	public override destroy() {
		document.removeEventListener('mousemove', this.basicEvent)
		document.removeEventListener('mousedown', this.mouseDown)
		document.removeEventListener('mouseup', this.mouseUp)
	}

	private basicEvent = (ev: MouseEvent) => {
		console.log('Mouse Event :D')
	}

	private mouseUp = (ev: MouseEvent) => {
		this.basicEvent(ev)
	}

	private mouseDown = (ev: MouseEvent) => {
		this.basicEvent(ev)
	}
}
