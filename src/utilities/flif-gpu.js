import jDataView from 'jdataview';
onmessage = function(event) {
    decode(event.data);
};

function decode(options) {
    const quality = options.quality;
    const resizeWidth = options.resizeWidth;
    const resizeHeight = options.resizeHeight;
    const buffer = options.buffer;
    const dataview = new jDataView(buffer);
    let position = 0;

    const FLIFIdentifier = dataview.getString(4, position, 'binary');
    position += 4;
    if (FLIFIdentifier !== 'FLIF') {
        postMessage({
            err: 'Not FLIF file.'
        });
        return false;
    }

    let format = dataview.getChar(position);
    if (format < ' ' || format > ' ' + 32 + 15 + 32) {
        postMessage({
            err: 'Invalid or unknown FLIF format byte.'
        });
        return false;
    }
    format -= ' ';
    let numFrames = 1;
    if (format > 47) {
        format -= 32;
        numFrames = 2; // animation
    }

    console.log(dataview, FLIFIdentifier);
}

function decodeBuffer(buffer) {
    const kernel = gpu.createKernel(function(X) {
        return X[this.thread.x % 3];
    }).dimensions([100]);

    const output = kernel();
}
