import { objectLoop } from '@dzeio/object-util'
import GameEngine from 'GameEngine'
import Component2D from 'GameEngine/Component2D'
import Renderer from '.'

interface Params {
	text?: string
	size?: number
	weight?: 'bold'
	stroke?: string | {color: string, width: number}
	color?: string
	debug?: boolean
}

export default class TextRenderer extends Renderer implements Params {

	public text?: string
	public size?: number
	public weight?: 'bold'
	public color?: string
	public stroke?: string | {color: string, width: number}
	public debug?: boolean

	public constructor(component: Component2D, params?: Params) {
		super(component)
		objectLoop(params ?? {}, (v, k) => {this[k as 'text'] = v})
	}

	public async render(ge: GameEngine, ctx: CanvasRenderingContext2D) {
		const position = this.getPosition()
		const globalScale = ge.currentScene?.scale ?? 1
		const item: [number, number] = [
			// source x
			// 0 - 1.5 - -1.5
			position.x * ge.caseSize.x * globalScale,
			// source y
			position.y * ge.caseSize.y * globalScale
		]

		const size = this.component.scale.y * ge.caseSize.y

		// console.log
		if (this.text) {
			ctx.textBaseline = 'top'
			ctx.textAlign = 'left'

			ctx.font = `${this.weight ? `${this.weight} ` : ''}${(this.size ?? size) / 16 * ge.caseSize.x * globalScale * 3}px sans-serif`
			if (this.color) {
				ctx.fillStyle = this.color ?? 'black'
				ctx.fillText(this.text, ...item)
			}
			if (this.stroke) {
				if (typeof this.stroke === 'string') {
					ctx.strokeStyle = this.stroke
					ctx.lineWidth = ge.currentScene?.scale ?? 1
				} else {
					ctx.strokeStyle = this.stroke.color
					ctx.lineWidth = this.stroke.width * (ge.currentScene?.scale ?? 1)
				}
				ctx.strokeText(this.text, ...item)
			}
		} else if (this.debug) {
			console.warn('no text, no display')
		}
	}
}
