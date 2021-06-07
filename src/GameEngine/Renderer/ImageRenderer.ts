import GameEngine from 'GameEngine'
import Asset from 'GameEngine/Asset'
import Component2D from 'GameEngine/Component2D'
import Renderer from '.'

export default class ImageRenderer implements Renderer {

	public constructor(
		private component: Component2D,
		private image: Asset
	) {}

	public async render(ge: GameEngine, ctx: CanvasRenderingContext2D) {
		if (!this.component.pos) {
			return
		}
		ctx.drawImage(
			await this.image.get(),
			this.component.pos.x * (ge.caseSize[0]),
			this.component.pos.y * (ge.caseSize[1]),
			(this.component.width() ?? ge.caseSize[0]) * ge.caseSize[0],
			(this.component.height() ?? ge.caseSize[1]) * ge.caseSize[1]
		)
	}
}
