import { objectLoop } from '@dzeio/object-util'
import GameEngine from 'GameEngine'
import Asset, { AssetStatus } from 'GameEngine/Asset'
import Component2D from 'GameEngine/Component2D'
import Renderer from '.'

interface Params {
	asset?: Asset
	stream?: boolean
	debug?: boolean
}

/**
 * TODO: Add origin support
 */
export default class ImageRenderer extends Renderer implements Params {

	public asset?: Asset
	public stream = true
	public debug = false

	public constructor(component: Component2D, params?: Params) {
		super(component)
		objectLoop(params ?? {}, (value, key) => {this[key as keyof Params] = value})
	}

	public async render(ge: GameEngine, ctx: CanvasRenderingContext2D) {

		if (!this.asset) {
			return
		}

		if (this.asset.status !== AssetStatus.LOADED) {
			if (this.stream) {
				// load asset but do not stop threads
				this.asset.load()
				return
			} else {
				await this.asset.load()
			}
		}

		if (this.asset.status === AssetStatus.LOADING && this.stream) {
			return
		}

		const globalScale = ge.currentScene?.scale ?? 1
		const size = this.asset.size()
		const position = this.getPosition()
		const final: [number, number, number, number] = [
			position.x * ge.caseSize.x * globalScale,
			position.y * ge.caseSize.y * globalScale,
			(this.component.scale.x ?? ge.caseSize.x) * ge.caseSize.x * globalScale,
			(this.component.scale.y ?? ge.caseSize.y) * ge.caseSize.y * globalScale
		]
		if (this.debug || this.component.debug) {
			ctx.fillStyle = 'red'
			ctx.fillRect(...final)
		}
		ctx.drawImage(
			this.asset.get(),
			0,
			0,
			size.x,
			size.y,
			...final
		)
	}
}
