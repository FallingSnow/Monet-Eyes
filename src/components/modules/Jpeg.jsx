import React from 'react';
import {bindActionCreators} from 'redux';
import {connect} from 'react-redux';
import {browserHistory} from 'react-router';
import filesize from 'filesize';
import classNames from 'classnames';
import imageToBlob from 'image-to-blob';
import inkjet from 'inkjet';

import ss from 'socket.io-stream';
import streamToBlob from 'stream-to-blob';
import peek from 'buffer-peek-stream';

class Jpeg extends React.PureComponent {
    constructor(props) {
        super(props);
        console.debug('[React] Jpeg loaded.', this.props);
    }
    state = {
        loading: true
    }
    componentWillMount() {
        this.run();
        window.addEventListener("resize", this.onResize);
    }
    run() {
        let _self = this;
        this.src = this.props.file.path;

        if (this.src.endsWith('.jpeg') || this.src.endsWith('.jpg')) {
            if (this.props.thumbnail)
                this.retrieve.thumbnail();
            else
                this.retrieve.partial();
            }
        else {
            console.error(new Error('Image is not a jpeg image.'));
        }
    }
    retrieve = {
        thumbnail: () => {
            this.setState({src: this.props.file.metadata.scaled.thumbnail});
        },
        partial: () => {
            let _self = this;
            const file = this.props.file;

            // Attempt to retrieve from cache first
            this.props.cache.retrieveFile(this.props.cache.createUrl(src, {
                width: file.metadata.width,
                height: file.metadata.height,
                quality: _self.props.quality
            }), (err, blob) => {
                if (err)
                    return console.error(err);

                if (blob !== null) { // Cache hit
                    this.setState({src: URL.createObjectURL(blob)});
                } else { // Cache miss

                    // Load from socket connection
                    const dataStream = ss.createStream();
                    ss(_self.props.socket).emit('file.read', dataStream, file.path, {end: 1000});

                    // Make sure an error did not occur
                    peek(dataStream, 65536, function(err, data, outputStream) {
                        if (err)
                            console.error('Could not peek stream:', err);

                        streamString = String(data);
                        if (streamString.startsWith('ERROR'))
                            return console.error(streamString.substr(5))

                            // Convert stream into a blob
                        streamToBlob(outputStream, file.mime, (err, blob) => {
                            if (err)
                                return console.error(err);
                            console.log(blob)
                        });
                    });
                }
            });
        }
    }
    componentWillUnmount() {
        window.removeEventListener("resize", this.onResize);
    }
    cache = {
        set: (src, attributes) => {
            let _self = this;
            imageToBlob(this.ref.image, (err, blob) => {
                _self.props.cache.writeFile(_self.props.cache.createUrl(src, attributes), blob);
            });
        }
    }
    onResize() {
        console.debug('Window resized!');
    }
    render() {
        return (
            <div className={classNames('Image jpeg', this.props.className, {
                'fullscreen': this.props.fullscreen,
                'perfect': this.props.perfect,
                'loading': this.state.loading,
                'preview': this.state.preview
            })} title={this.props.file.name} src={this.src} style={this.props.style}>
                <img src={this.state.src}/>
            </div>
        );
    }
}

function mapStateToProps(state) {
    return {socket: state.socket, cache: state.cache};
}
function mapDispatchToProps(dispatch) {
    return {
        goTo(dest) {
            dispatch(push(dest));
        }
    };
}
Jpeg = connect(mapStateToProps, mapDispatchToProps)(Jpeg);
Jpeg.defaultProps = {
    fullscreen: false,
    perfect: false,
    quality: 1,
    thumbnail: false
};
export default Jpeg;
