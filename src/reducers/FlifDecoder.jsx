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
}

const decoderManaager = new DecodeManager(avaliableLogicalProcessors);

export default function(state = decoderManaager, action) {
    return state;
}
