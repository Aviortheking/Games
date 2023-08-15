import Listener from '@dzeio/listener'
import Vector2D from './2D/Vector2D'

// eslint-disable-next-line no-shadow
export enum AssetStatus {
	NOT_LOADED,
	LOADING,
	LOADED,
	ERROR
}

/**
 * Asset management Class
 */
export default class Asset extends Listener<{
	loaded: (width: number, height: number) => void
	error: (error?: string) => void
}> {

	public static assets: Record<string, Asset> = {}

	public isLoaded = false
	public status: AssetStatus = AssetStatus.NOT_LOADED

	private image!: HTMLImageElement

	private constructor(
		public readonly path: string
	) {
		super()
	}

	public static init(path: string): Asset {
		if (!this.assets[path]) {
			this.assets[path] = new Asset(path)
		}
		return this.assets[path] as Asset
	}

	public async load() {
		if (this.status === AssetStatus.LOADED || this.status === AssetStatus.LOADING) {
			return
		}
		this.status = AssetStatus.LOADING
		return new Promise<void>((res, rej) => {
			this.image = new Image()
			this.image.src = this.path
			this.image.onload = () => {
				// console.log('resource loaded', this.path, this.image.width, this.image.height)
				if (this.image.width === 0 && this.image.height === 0) {
					this.emit('error', 'sizeZero')
					throw new Error(`resource (${this.path}) not correctly loaded!, width && height at 0`)
				}
				this.isLoaded = true
				this.status = AssetStatus.LOADED
				this.emit('loaded', this.image.width, this.image.height)
				res()
			}
			this.image.onerror = () => {
				console.error('Error loading image')
				this.status = AssetStatus.ERROR
				this.emit('error', 'defaultError')
				rej(`resource (${this.path}) could not be loaded`)
			}
		})
	}

	public get() {
		if (this.status !== AssetStatus.LOADED) {
			throw new Error(`Can't get (${this.path}) because it is not loaded, please load it before`)
		}
		return this.image
	}

	public size(): Vector2D {
		if (this.status !== AssetStatus.LOADED) {
			console.error(`Can't get (${this.path}) because it is not loaded, please load it before`)
			return new Vector2D(0)
		}
		return new Vector2D(this.image.width, this.image.height)
	}
}
