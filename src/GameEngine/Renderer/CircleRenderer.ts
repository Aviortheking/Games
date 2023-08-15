/* eslint-disable max-depth */
import Renderer from '.'
import type GameEngine from '..'

interface Params {
	material?: string
	stroke?: string | {
		color: string
		width: number
		dotted?: number
		position?: 'inside' | 'center' | 'outside'
	}
}

export default class CircleRenderer extends Renderer<Params> {

	// eslint-disable-next-line complexity
	public async render(ge: GameEngine, ctx: CanvasRenderingContext2D) {
		await super.render(ge, ctx)
		const item = this.preRender(ctx, ge)

		ctx.beginPath()
		const realX = item[0] + item[2] / 2
		const realY = item[1] + item[3] / 2
		ctx.arc(realX, realY, item[2] / 2, 0, 180 * Math.PI)

		if (this.props.material) {
			ctx.fillStyle = this.props.material
			ctx.fill()
		}
		if (this.props.stroke) {
			if (typeof this.props.stroke === 'string') {
				ctx.strokeStyle = this.props.stroke
				ctx.stroke()
			} else {
				if (this.props.stroke.dotted) {
					ctx.setLineDash([this.props.stroke.dotted / 2, this.props.stroke.dotted])
				}

				ctx.lineWidth = this.props.stroke.width * (ge.currentScene?.scale ?? 1)
				ctx.stroke()

				if (this.props.stroke.dotted) {
					ctx.setLineDash([])
				}
			}
		}

		if (this.debug) {
			if (typeof this.props.stroke === 'string') {
				ctx.strokeStyle = this.props.stroke
			} else {
				ctx.strokeStyle = 'red'
				ctx.lineWidth = 1 * (ge.currentScene?.scale ?? 1)
			}
			ctx.strokeRect(...item)
		}

		this.postRender(ctx, ge)
	}
}
