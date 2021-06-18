import { objectLoop } from '@dzeio/object-util'
import GameEngine from 'GameEngine'
import Vector2D from 'GameEngine/2D/Vector2D'
import Component2D from 'GameEngine/Component2D'
import Tileset from 'GameEngine/Tileset'
import Renderer from '.'

interface Params {
	tileset?: Tileset
	id?: number
}

/**
 * TODO: Add origin support
 */
export default class TileRenderer extends Renderer implements Params {

	public tileset?: Tileset
	public id?: number

	public constructor(component: Component2D, params?: Params) {
		super(component)
		objectLoop(params ?? {}, (v, k) => {this[k as 'id'] = v})
	}

	public async render(ge: GameEngine, ctx: CanvasRenderingContext2D) {
		if (!this.tileset || typeof this.id !== 'number') {
			return
		}
		const {sx, sy} = this.tileset.getSourceData(this.id)
		const position = this.getPosition()
		ctx.drawImage(
			await this.tileset.asset.get(),
			sx,
			sy,
			this.tileset.width(this.id),
			this.tileset.height(this.id),
			position.x * (ge.caseSize.x),
			position.y * (ge.caseSize.y),
			(this.component.scale.x ?? ge.caseSize.x) * ge.caseSize.x,
			(this.component.scale.y ?? ge.caseSize.y) * ge.caseSize.y
		)
	}
}
