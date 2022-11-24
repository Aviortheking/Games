import { objectLoop } from '@dzeio/object-util'
import GameEngine from 'GameEngine'
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
		objectLoop(params ?? {}, (value, key) => {this[key as 'id'] = value})
	}

	public async render(ge: GameEngine, ctx: CanvasRenderingContext2D) {
		if (!this.tileset || typeof this.id !== 'number') {
			return
		}
		const {sx, sy} = this.tileset.getSourceData(this.id)
		const position = this.getPosition()
		await this.tileset.asset.load()
		ctx.drawImage(
			this.tileset.asset.get(),
			sx,
			sy,
			this.tileset.width(this.id),
			this.tileset.height(this.id),
			position.x * ge.caseSize.x,
			position.y * ge.caseSize.y,
			(this.component.scale.x ?? ge.caseSize.x) * ge.caseSize.x,
			(this.component.scale.y ?? ge.caseSize.y) * ge.caseSize.y
		)
	}
}
