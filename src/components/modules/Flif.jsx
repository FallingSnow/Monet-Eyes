import React from 'react';
import {bindActionCreators} from 'redux';
import {connect} from 'react-redux';
import {browserHistory} from 'react-router';
import filesize from 'filesize';
import classNames from 'classnames';

class Flif extends React.PureComponent {
    constructor(props) {
        super(props);
        console.debug('[React] Flif loaded.', this.props);
    }
    componentDidMount() {
        this.run();
        window.addEventListener("resize", this.onResize);
    }
    componentWillUpdate(nextProps, nextState) {
        if (this.props.file.path !== nextProps.file.path) {
            this.clearCanvas();
            this.run();
        }
    }
    state = {
        loading: true
    }
    run() {
        let _self = this;
        this.src = this.props.file.path;
        this.quality = this.props.quality;
        let cs = window.getComputedStyle(this.refs.canvas);
        this.canvasDimensions = {
            width: parseInt(cs.width),
            height: parseInt(cs.height)
        }

        if (this.src.endsWith('.flif')) {
            if (this.props.thumbnail) {
                this.loadThumbnail();
            } else {
                this.retrieve();
            }
        } else
            console.error('Image is not a flif image.');
        }
    loadThumbnail() {
        let _self = this;
        this.quality = 0.1;
        const targetWidth = Math.round(180 / this.props.file.height * this.props.file.width);
        this.loadFromCache(this.src, {
            width: targetWidth,
            height: 180,
            quality: this.quality,
            thumbnail: true
        }, function(err, blob) {
            if (err)
                return console.error(err);

            if (blob !== null) { // Cache hit
                _self.blobToImage(blob, function(img) {
                    _self.updateCanvas(img, img.width, img.height);
                });
            } else { // Cache miss

                // Load from socket connection
                _self.loadThumbnailFromSocket(function(err, buffer) {
                    if (err)
                        return console.error(err);

                    _self.buffer = buffer;

                    console.debug('[Socket] Downloaded', (buffer.byteLength / 1024).toFixed(2), 'kB');

                    // Decode recieved buffer
                    _self.decodeWebWorker(buffer);
                });
            }
        });
    }
    retrieve() {
        let _self = this;

        let scale = 1;
        let fullscreenContainer = document.getElementsByClassName('fullscreen-container')[0];
        if (this.props.fullscreen && fullscreenContainer) {
            let cs = getComputedStyle(fullscreenContainer);
            let width = parseInt(cs.width);
            let height = parseInt(cs.height);

            scale = this.getScale(this.props.file.width, width, this.props.file.height, height);
        } else {
            scale = this.getScale(this.props.file.width, this.canvasDimensions.width, this.props.file.height, this.canvasDimensions.height);
        }
        const ratio = 1 / scale;
        let targetWidth = Math.round(this.props.file.width * ratio);
        let targetHeight = Math.round(this.props.file.height * ratio);

        // Attempt to retrieve from cache first
        this.loadFromCache(this.src, {
            width: targetWidth,
            height: targetHeight,
            quality: this.quality
        }, function(err, blob) {
            if (err)
                return console.error(err);

            if (blob !== null) { // Cache hit
                _self.blobToImage(blob, function(img) {
                    _self.updateCanvas(img, img.width, img.height);
                });
            } else { // Cache miss

                // Load from socket connection
                _self.loadFromSocket(function(err, buffer) {
                    if (err)
                        return console.error(err);

                    _self.buffer = buffer;

                    // Decode recieved buffer
                    _self.decodeWebWorker(buffer);
                });
            }
        });
    }
    loadFromCache(src, attributes, cb) {
        this.props.cache.retrieveFile(this.props.cache.createUrl(src, attributes), cb);
    }
    loadFromSocket(cb) {
        let _self = this;
        let recieveSize;
        if (this.quality > 1) {
            recieveSize = this.quality * 1024;
        } else {
            recieveSize = this.quality * this.props.file.stat.size;
        }

        this.recieveSize = recieveSize;

        this.getByteRange(recieveSize, function(err, buffer) {
            console.debug('[Socket] Saved', filesize(_self.props.file.stat.size - recieveSize) + '/' + filesize(_self.props.file.stat.size), 'on image request.');
            cb(err, buffer);
        });
    }
    loadThumbnailFromSocket(cb) {
        this.props.socket.emit('thumbnail', this.src, cb);
    }
    componentWillUnmount() {
        window.removeEventListener("resize", this.onResize);
    }
    getFileSize(cb) {
        this.props.socket.emit('fileSize', this.src, cb);
    }
    getByteRange(bytes, cb) {
        bytes = Math.floor(bytes);
        console.debug('[Socket] Getting', bytes, 'bytes...');
        this.props.socket.emit('fileRead', this.src, bytes, cb);
    }
    getLowestScaling(native, target) {
        let i = 1,
            scale = 1;
        while ((native / (i *= 2)) > target) {
            scale = i;
        }
        return scale;
    }
    getScale(nativeWidth, targetWidth, nativeHeight, targetHeight) {
        const widthScale = this.getLowestScaling(nativeWidth, targetWidth);
        const heightScale = this.getLowestScaling(nativeHeight, targetHeight);
        return Math.min(widthScale, heightScale);
    }
    getDimensionsFromBuffer(buffer) {
        const dimensionsMetadata = new Uint8Array(buffer, 5, 20);

        let position = 0;
        function readBigEndianVarint() {
            let result = 0;
            let bytesRead = 0;
            while (bytesRead++ < 10) {
                let number = dimensionsMetadata[position += 1];
                if (number < 0)
                    break;
                if (number < 128)
                    return result + number;
                number -= 128;
                result += number;
                result <<= 7;
            }
        }

        this.originalDimensions = {
            width: readBigEndianVarint() + 1,
            height: readBigEndianVarint() + 1
        };
    }
    decodeWebWorker(buffer = this.buffer) {
        let _self = this;

        this.getDimensionsFromBuffer(buffer);

        let options = {
            action: 'decode',
            buffer
        };

        let fullscreenContainer = document.getElementsByClassName('fullscreen-container')[0];
        if (this.props.fullscreen && fullscreenContainer) {
            let cs = getComputedStyle(fullscreenContainer);
            let width = parseInt(cs.width);
            let height = parseInt(cs.height);

            options.scale = this.getScale(this.originalDimensions.width, width, this.originalDimensions.height, height);
        } else {
            options.scale = this.getScale(this.originalDimensions.width, this.canvasDimensions.width, this.originalDimensions.height, this.canvasDimensions.height);
        }

        let targetWidth = this.originalDimensions.width * (1 / options.scale);
        let targetHeight = this.originalDimensions.height * (1 / options.scale);

        this.props.FlifDecodeManager.decode(buffer, options).then((imageData) => {
            _self.updateCanvas(imageData);
            let attributes = {
                width: imageData.width,
                height: imageData.height,
                quality: _self.quality
            };
            if (_self.props.thumbnail) {
                attributes.thumbnail = true;
            }
            _self.cacheCanvas(_self.src, attributes);
        });

        // this.props.FlifDecodeManager.requestWorker(function(worker) {
        //
        //     // Create preview decode only if height > 400 and width > 711
        //     if (_self.props.fullscreen) {
        //         _self.setState({preview: true});
        //         worker.postMessage({action: 'decode', buffer, scale: 128, preview: true});
        //     }
        //
        //     worker.postMessage(options, [buffer]);
        //     worker.onmessage = function(event) {
        //         let progress = event.data.progress;
        //         let width = progress.frames[0].width;
        //         let height = progress.frames[0].height;
        //         let imageData = new ImageData(new Uint8ClampedArray(progress.frames[0].data), width, height);
        //
        //         if (!event.data.preview)
        //             _self.setState({preview: false});
        //
        //         _self.updateCanvas(imageData, width, height);
        //
        //         if (event.data.preview)
        //             return;
        //
        //         _self.props.FlifDecodeManager.releaseWorker(worker);
        //         let attributes = {
        //             width,
        //             height,
        //             quality: _self.quality
        //         };
        //         if (_self.props.thumbnail) {
        //             attributes.thumbnail = true;
        //         }
        //         _self.cacheCanvas(_self.src, attributes);
        //     }
        // });
    }
    updateCanvas(imagedata) {
        let c = this.refs.canvas,
            ctx = c.getContext('2d');
        c.width = imagedata.width;
        c.height = imagedata.height;
        this.setState({loading: false});
        if (imagedata instanceof window.Image) {
            ctx.drawImage(imagedata, 0, 0);
        } else
            ctx.putImageData(imagedata, 0, 0);
        }
    clearCanvas() {
        this.refs.canvas.getContext('2d').clearRect(0, 0, this.refs.canvas.width, this.refs.canvas.height);
    }
    cacheCanvas(src, attributes) {
        let _self = this;
        this.refs.canvas.toBlob(function(blob) {
            _self.props.cache.writeFile(_self.props.cache.createUrl(src, attributes), blob);
        }, 'image/png');
    }
    blobToImage(blob, cb) {
        var ctx = this.refs.canvas.getContext('2d');
        var img = new window.Image();

        img.onload = function() {
            cb(img);
        };

        img.src = URL.createObjectURL(blob);
    }
    onResize() {
        console.debug('Window resized!');
    }
    render() {
        return (
            <div className={classNames('Image', this.props.className, {
                'fullscreen': this.props.fullscreen,
                'perfect': this.props.perfect,
                'loading': this.state.loading,
                'preview': this.state.preview
            })} title={this.props.file.name} src={this.src} style={this.props.style}>
                <canvas ref="canvas"/>
            </div>
        );
    }
}

function mapStateToProps(state) {
    return {socket: state.socket, cache: state.cache, FlifDecodeManager: state.FlifDecodeManager};
}
function mapDispatchToProps(dispatch) {
    return {
        goTo(dest) {
            dispatch(push(dest));
        }
    };
}
Flif = connect(mapStateToProps, mapDispatchToProps)(Flif);
Flif.defaultProps = {
    fullscreen: false,
    perfect: false,
    quality: 0.1,
    thumbnail: false
};
export default Flif;
