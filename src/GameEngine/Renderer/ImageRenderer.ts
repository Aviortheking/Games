import Renderer from '.'
import GameEngine from '..'
import Asset, { AssetStatus } from '../Asset'

interface Params {
	asset?: Asset
	stream?: boolean
	imageRotation?: number
	debug?: boolean
	/**
	 * padding for each sides
	 */
	padding?: number
}

/**
 * TODO: Add origin support
 */
export default class ImageRenderer extends Renderer<Params> {

	protected defaultProps: Partial<Params> = {
		stream: true
	}

	private padding = 0

	public onUpdate(): void {
		const ge = GameEngine.getGameEngine()
		this.padding = (this.props.padding ?? 0) * ge.caseSize.x * (ge.currentScene?.scale ?? 1)
	}

	// eslint-disable-next-line complexity
	public async render(ge: GameEngine, ctx: CanvasRenderingContext2D) {
		await super.render(ge, ctx)

		if (!this.props.asset) {
			return
		}

		if (this.props.asset.status !== AssetStatus.LOADED) {
			if (this.props.stream) {
				// load asset but do not stop threads
				this.props.asset.load()
				return
			} else {
				await this.props.asset.load()
			}
		}

		if (this.props.asset.status === AssetStatus.LOADING && this.props.stream) {
			return
		}

		const padding = this.padding
		const size = this.props.asset.size()
		const final = this.preRender(ctx, ge, this.props.imageRotation)
		const x = final[0] + (padding ?? 0)
		const y = final[1] + (padding ?? 0)
		const width = Math.max(final[2] - (padding ?? 0) * 2, 0)
		const height = Math.max(final[3] - (padding ?? 0) * 2, 0)

		if (this.debug || this.component.debug) {
			ctx.fillStyle = 'red'
			ctx.fillRect(...final)
		}
		ctx.drawImage(
			this.props.asset.get(),
			0,
			0,
			size.x,
			size.y,
			x,
			y,
			width,
			height
		)

		this.postRender(ctx, ge)
	}
}
