import PackageConfig from '../../package.json';
import localforage from 'localforage';

class Cache {
    constructor() {
        this.cache = localforage.createInstance({
            driver: localforage.INDEXEDDB, // Force WebSQL; same as using setDriver()
            name: PackageConfig.name,
            version: 1.0,
            storeName: 'image/png store', // Should be alphanumeric, with underscores.
            description: 'Stores png images'
        });
    }

    writeFile(src, blob, cb = function() {}) {
        if (typeof src !== 'string')
            return console.error('First argument [src] must be of type string.');
        if (typeof blob !== 'object')
            return console.error('Second argument [blob] must be of type object.');

        console.debug('[Cache] Caching', src);
        this.cache.setItem(src, blob, cb);
    }
    retrieveFile(src, cb) {
        if (typeof src !== 'string')
            return console.error('First argument [src] must be of type string.');

        console.debug('[Cache] Retrieving', src);
        this.cache.getItem(src, function(err, blob) {
            if (err) {
                console.warn('[Cache] Error:', err);
            }
            cb(err, blob);
        });

    }
    createUrl(src, args) {
        if (typeof src !== 'string')
            return console.error('First argument [src] must be of type string.');
        if (typeof args !== 'object')
            return console.error('Second argument [args] must be of type object.');

        return src + '?' + Object.keys(args).map(function(key) {
            return key + '=' + encodeURIComponent(args[key]);
        }).join('&');
    }
}

export default Cache;
