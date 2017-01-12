importScripts('/libflifdec.js');
let notifyReady;
const whenReady = new Promise(resolve => notifyReady = resolve);
const libflifem = _libflifem({
    onRuntimeInitialized: notifyReady
});
let buffer = null;
onmessage = function(event) {
    buffer = event.data.buffer ? event.data.buffer : buffer;
    whenReady.then(function() {
        decode(buffer, {
            width: event.data.width,
            height: event.data.height,
            scale: event.data.scale,
            preview: event.data.preview
        });
    });
}

function decode(input, options) {
    const decoder = new libflifem.FLIFDecoder();
    if (options.width && options.height)
        decoder.setFit(options.width, options.height);
    else if (options.height)
        decoder.setFit(0, options.height);
    else if (options.width)
        decoder.setFit(options.width, 0);
    else if (options.scale)
        decoder.setScale(options.scale);

    decoder.setFirstCallbackQuality(10000);

    let preview = options.preview;

    const callback = libflifem.Runtime.addFunction((quality, bytesRead) => {
        const frames = [];
        for (let i = 0; i < decoder.numImages; i++) {
            const frame = decoder.getImage(i);
            // TODO: replace ArrayBuffer to SharedArrayBuffer
            // (currently impossible on Nightly because of structured clone error
            const bufferView = new Uint8Array(new ArrayBuffer(frame.width * frame.height * 4));
            for (let i = 0; i < frame.height; i++) {
                const row = frame.readRowRGBA8(i);
                const offset = frame.width * 4 * i;
                bufferView.set(row, offset);
                frame.clearBuffer(); // remove C++ internal buffer created by readRow
            }
            frames.push({
                data: bufferView.buffer,
                width: frame.width,
                height: frame.height,
                frameDelay: frame.frameDelay,
            });
            frame.delete(); // will not affect decoder internal image instance
        }
        const progress = {
            quality,
            bytesRead,
            frames,
            loop: decoder.numLoops
        };
        self.postMessage({
            progress,
            preview,
            debug: `progressive decoding: width=${frames[0].width} height=${frames[0].height} quality=${quality}, bytesRead=${bytesRead}. Current memory size: ${libflifem.buffer.byteLength}`
        });
        return quality + 1000;
    });
    decoder.setCallback(callback);
    const allocated = libflifem._malloc(input.byteLength);
    libflifem.HEAP8.set(new Uint8Array(input), allocated);
    try {
        decoder.decodeMemory(allocated, input.byteLength);
    } finally {
        libflifem._free(allocated);
        decoder.delete();
        libflifem.Runtime.removeFunction(callback);
    }
}
