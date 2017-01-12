import PackageConfig from '../../package.json';
import Cache from '../utilities/cache.js';

let cache = new Cache();

export default function(state = cache, action) {
    return state;
}
