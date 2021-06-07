import Renderer from './Renderer'

export interface ComponentState {
	mouseHovering: boolean
	mouseClicking: boolean
	mouseClicked: boolean
}

export default abstract class Component2D {
	public id?: number
	public renderer?: Renderer
	public pos?: {x: number, y: number, z?: number, rotation?: number}


	protected size?: number | {width: number, height: number}

	public init?(): Promise<void> | void

	public update?(state: ComponentState): Promise<void> | void

	public width() {
		if (!this.size) {
			return undefined
		}
		return typeof this.size === 'number' ? this.size : this.size?.width
	}

	public height() {
		if (!this.size) {
			return undefined
		}
		return typeof this.size === 'number' ? this.size : this.size?.height
	}
}
