import { objectLoop } from '@dzeio/object-util'
import GameEngine from 'GameEngine'
import Component2D from 'GameEngine/Component2D'
import Renderer from '.'

interface Params {
	material?: string
	stroke?: string | {color: string, width: number}
	debug?: boolean
}

export default class RectRenderer extends Renderer implements Params {

	public material?: string
	public stroke?: string | {color: string, width: number}
	public debug?: boolean | undefined

	public constructor(component: Component2D, params?: Params) {
		super(component)
		objectLoop(params ?? {}, (value, key) => {this[key] = value as any})
	}

	public async render(ge: GameEngine, ctx: CanvasRenderingContext2D) {
		const item = this.preRender(ctx, ge)

		if (this.material) {
			ctx.fillStyle = this.material
			ctx.fillRect(...item)
		}
		if (this.stroke) {
			if (typeof this.stroke === 'string') {
				ctx.strokeStyle = this.stroke
			} else {
				ctx.strokeStyle = this.stroke.color
				ctx.lineWidth = this.stroke.width * (ge.currentScene?.scale ?? 1)
			}
			ctx.strokeRect(...item)
		}

		if (this.debug) {
			if (typeof this.stroke === 'string') {
				ctx.strokeStyle = this.stroke
			} else {
				ctx.strokeStyle = 'red'
				ctx.lineWidth = 1 * (ge.currentScene?.scale ?? 1)
			}
			ctx.strokeRect(...item)
		}

		this.postRender(ctx, ge)
	}
}
