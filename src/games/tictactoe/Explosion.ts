import Asset from 'GameEngine/Asset'
import Component2D from 'GameEngine/Component2D'
import TileRenderer from 'GameEngine/Renderer/TileRenderer'
import SoundManager from 'GameEngine/SoundManager'
import Tileset from 'GameEngine/Tileset'

export class Explosion extends Component2D {

	public size = {
		width: .9,
		height: .9
	}

	private explosionTileset = new Tileset(Asset.init('/assets/tictactoe/explosion.png'), {
		fileSize: {width: 480, height: 362},
		tileSize: 91,
		spacing: 1,
	})
	private animationNumber = -1
	private n = 0


	public update() {
		if (this.animationNumber !== -1 && this.n++ >= 10) {
			this.renderer = new TileRenderer(this, this.explosionTileset, this.animationNumber++)
			this.n = 0
			if (this.animationNumber >= 10) {
				this.animationNumber = -1
				this.renderer = undefined
			}
		}
	}

	public run(pos: Component2D['pos']) {
		new SoundManager('/assets/tictactoe/victory.wav').play()
		this.pos = pos
		this.animationNumber = 0
	}
}
