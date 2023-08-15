import type Vector2D from '../../GameEngine/2D/Vector2D'
import Asset from '../../GameEngine/Asset'
import Component2D from '../../GameEngine/Component2D'
import TileRenderer from '../../GameEngine/Renderer/TileRenderer'
import SoundManager from '../../GameEngine/SoundManager'
import Tileset from '../../GameEngine/Tileset'

export class Explosion extends Component2D {

	public size = {
		width: .9,
		height: .9
	}

	public ended = true

	// public origin = new Vector2D(-.5, -.5)

	private explosionTileset = new Tileset(Asset.init('/assets/tictactoe/explosion.png'), {
		fileSize: {width: 192, height: 32},
		tileSize: 32
	})
	private animationNumber = -1
	private n = 0


	public override update() {
		if (this.animationNumber !== -1 && this.n++ >= 12) {
			this.renderer = new TileRenderer(this, {
				id: this.animationNumber++,
				tileset: this.explosionTileset
			})
			this.n = 0
			if (this.animationNumber > 5) {
				this.animationNumber = -1
				this.renderer = null
				this.ended = true
			}
		}
	}

	public run(pos: Vector2D) {
		new SoundManager('/assets/tictactoe/explosion.wav').play()
		this.position = pos
		this.animationNumber = 0
		this.ended = false
	}
}
