import Renderer from '.'
import type GameEngine from '..'
import type Tileset from '../Tileset'

interface Params {
	tileset?: Tileset
	id?: number
}

/**
 * TODO: Add origin support
 */
export default class TileRenderer extends Renderer<Params> {


	public override async render(ge: GameEngine, ctx: CanvasRenderingContext2D) {
		await super.render(ge, ctx)
		if (!this.props.tileset || typeof this.props.id !== 'number') {
			return
		}
		const {sx, sy} = this.props.tileset.getSourceData(this.props.id)
		const position = this.getPosition()
		await this.props.tileset.asset.load()
		ctx.drawImage(
			this.props.tileset.asset.get(),
			sx,
			sy,
			this.props.tileset.width(this.props.id),
			this.props.tileset.height(this.props.id),
			position.x * ge.caseSize.x,
			position.y * ge.caseSize.y,
			(this.component.scale.x ?? ge.caseSize.x) * ge.caseSize.x,
			(this.component.scale.y ?? ge.caseSize.y) * ge.caseSize.y
		)
	}
}
