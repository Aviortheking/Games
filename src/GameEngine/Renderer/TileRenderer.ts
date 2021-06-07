import GameEngine from 'GameEngine'
import Component2D from 'GameEngine/Component2D'
import Tileset from 'GameEngine/Tileset'
import Renderer from '.'

export default class TileRenderer implements Renderer {

	public constructor(
		private component: Component2D,
		private tileset: Tileset,
		private id: number
	) {}

	public async render(ge: GameEngine, ctx: CanvasRenderingContext2D) {
		if (!this.component.pos) {
			return
		}
		const {sx, sy} = this.tileset.getSourceData(this.id)
		ctx.drawImage(
			await this.tileset.asset.get(),
			sx,
			sy,
			this.tileset.width(),
			this.tileset.height(),
			this.component.pos.x * (ge.caseSize[0]),
			this.component.pos.y * (ge.caseSize[1]),
			(this.component.width() ?? ge.caseSize[0]) * ge.caseSize[0],
			(this.component.height() ?? ge.caseSize[1]) * ge.caseSize[1]
		)
	}
}
