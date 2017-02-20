import PackageConfig from '../../package.json';
import FLIFDecoder from 'worker-loader!../utilities/flifdecoder0.js';
import Denque from 'denque';

const avaliableLogicalProcessors = window.navigator.hardwareConcurrency - 1 || 1;

class DecodeManager {
    constructor(numWorkers) {
        for (let i = 0; i < numWorkers; i++) {
            this.decoderPool.push(new FLIFDecoder());
        }
    }
    decoderPool = new Denque([]);
    pending = new Denque([]);
    requestWorker(cb) {
        if (this.decoderPool.length)
            return cb(this.decoderPool.pop());
        else {
            return this.pending.push(cb);
        }
    }
    releaseWorker(worker) {
        this.decoderPool.push(worker);
        if (this.pending.length) {
            this.requestWorker(this.pending.shift());
        }
    }
    decode(buffer, options = {}, cb) {
        let _self = this;
        Object.assign(options, {
            action: 'decode',
            buffer
        });
        return new Promise((resolve, reject) => {
            this.requestWorker(function(worker) {
                worker.postMessage(options, [buffer]);
                worker.onmessage = (event) => {
                    let progress = event.data.progress;
                    let width = progress.frames[0].width;
                    let height = progress.frames[0].height;

                    let imageData = new ImageData(new Uint8ClampedArray(progress.frames[0].data), width, height);
                    resolve(imageData);
                    _self.releaseWorker(worker);
                };
            });
        });
    }
}

const decoderManaager = new DecodeManager(avaliableLogicalProcessors);

export default function(state = decoderManaager, action) {
    return state;
}
