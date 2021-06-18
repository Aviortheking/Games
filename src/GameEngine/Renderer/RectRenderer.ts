import { objectLoop } from '@dzeio/object-util'
import GameEngine from 'GameEngine'
import Asset from 'GameEngine/Asset'
import Component2D from 'GameEngine/Component2D'
import Renderer from '.'

interface Params {
	material?: string | Asset
	stroke?: string
}

export default class RectRenderer extends Renderer implements Partial<Params> {

	public material?: string | Asset
	public stroke?: string

	public constructor(component: Component2D, params?: Params) {
		super(component)
		objectLoop(params ?? {}, (v, k) => {this[k as 'material'] = v})
	}

	public async render(ge: GameEngine, ctx: CanvasRenderingContext2D) {
		const position = this.getPosition()
		const item: [number, number, number, number] = [
			// source x
			// 0 - 1.5 - -1.5
			position.x * (ge.caseSize.x),
			// source y
			position.y * (ge.caseSize.y),
			// source end X
			this.component.scale.x * (ge.caseSize.x),
			// source end Y
			this.component.scale.y * (ge.caseSize.y)
		]

		if (this.material instanceof Asset) {
			ctx.drawImage(
				await this.material.get(),
				...item
			)
			return
		}
		if (this.material) {
			ctx.fillStyle = this.material
			ctx.fillRect(...item)
		}
		if (this.stroke) {
			ctx.strokeStyle = this.stroke
			ctx.strokeRect(...item)
		}
	}
}
