import { objectLoop } from '@dzeio/object-util'
import GameEngine from 'GameEngine'
import Component2D from 'GameEngine/Component2D'
import Renderer from '.'

interface Params {
	text?: string
}

export default class TextRenderer extends Renderer {

	public text?: string
	public size?: number

	public constructor(component: Component2D, params?: Params) {
		super(component)
		objectLoop(params ?? {}, (v, k) => {this[k as 'text'] = v})
	}

	public async render(ge: GameEngine, ctx: CanvasRenderingContext2D) {
		const position = this.getPosition()
		const item: [number, number] = [
			// source x
			// 0 - 1.5 - -1.5
			position.x * (ge.caseSize.x),
			// source y
			position.y * (ge.caseSize.y)
		]

		const size = this.component.scale.y * ge.caseSize.y

		// console.log
		if (this.text) {
			ctx.fillStyle = 'black'
			ctx.textBaseline = 'top'

			ctx.font = `${size}px sans-serif`
			ctx.fillText(this.text, ...item)
		}
	}
}
