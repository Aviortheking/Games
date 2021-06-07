import GameEngine from 'GameEngine'
import Component2D from 'GameEngine/Component2D'
import Renderer from '.'

export default class ColorRenderer implements Renderer {

	public constructor(
		private component: Component2D,
		private color: string
	) {}

	public async render(ge: GameEngine, ctx: CanvasRenderingContext2D) {
		if (!this.component.pos) {
			return
		}
		ctx.fillStyle = this.color
		ctx.fillRect(
			this.component.pos.x * (ge.caseSize[0]),
			this.component.pos.y * (ge.caseSize[1]),
			(this.component.width() ?? ge.caseSize[0]) * ge.caseSize[0],
			(this.component.height() ?? ge.caseSize[1]) * ge.caseSize[1]
		)
	}
}
