import React from 'react';
import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import {push} from 'react-router-redux';
import Flif from './modules/Flif.jsx';
import Jpeg from './modules/Jpeg.jsx';
import Directory from './modules/Directory.jsx';
import Unknown from './modules/Unknown.jsx';

import ss from 'socket.io-stream';
import streamToBlob from 'stream-to-blob';
import peek from 'buffer-peek-stream';

class ImageGrid extends React.PureComponent {
    constructor(props) {
        super(props);
        console.debug('[React] ImageGrid loaded.', this.props);
    }
    componentWillUpdate(nextProps, nextState) {
        if (this.props.directory !== nextProps.directory)
            this.loadDirectory(nextProps.directory);
        }
    componentWillMount() {
        this.loadDirectory(this.props.directory);
    }
    makeBlob(stream, cb) {
        peek(stream, 65536, function(err, data, outputStream) {
            if (err)
                console.error('Could not peek stream:', err);

            if (String(data).startsWith('ERROR'))
                return console.error(String(data).substr(5))

            streamToBlob(outputStream, f.mime, (err, blob) => {
                if (err)
                    return console.error(err);
                console.log(blob)
            });
        });
    }
    loadDirectory(directory) {
        console.debug('Getting list of directory:', directory);
        let _self = this;
        this.props.socket.emit('file.metadata', directory, function(err, list) {
            if (err)
                return console.error(err);

            console.debug('[React] Directory list:', list);
            _self.props.socket.emit('file.metadata', list.content.list, (err, files) => {
                console.log(err, files)

                let renderables = {
                    files: [],
                    directories: []
                };

                for (let f of files) {

                    if (f.type === 'file') {
                        switch (f.mime) {
                            case 'image/jpeg':
                                {
                                    let width = f.metadata.width * _self.props.defaultImgHeight / f.metadata.height;
                                    renderables.files.push(
                                        <div className="block-container" key={f.path} style={{
                                            width,
                                            flexGrow: width
                                        }} onTouchTap={() => _self.props.goTo(f.path)}>
                                            <Jpeg style={{
                                                width: 100 + '%'
                                            }} quality={200} thumbnail={180} file={f}/>
                                        </div>
                                    );
                                    break;
                                }
                                // default:
                                //     {
                                //         renderables.files.push(
                                //             <div className="block-container" key={f.path} style={{
                                //                 width: _self.props.defaultImgHeight,
                                //                 flexGrow: _self.props.defaultImgHeight
                                //             }} onTouchTap={() => _self.props.goTo(f.path)}>
                                //                 <Unknown file={f}/>
                                //             </div>
                                //         )
                                //         console.warn('[React] Unknown file format:', f.path);
                                //         break;
                                //     }
                        }
                    } else if (f.type === 'directory') {
                        renderables.directories.push(
                            <div className="block-container" key={f.path} style={{
                                width: _self.props.defaultImgHeight,
                                flexGrow: _self.props.defaultImgHeight
                            }}>
                                <Directory key={f.path} directory={f}/>
                            </div>
                        )
                    }
                }

                _self.setState(renderables);
            });
        });
    }
    state = {}
    render() {
        return (
            <div className="ImageGrid">
                {this.state.directories}
                {this.state.files}
                <div className="spacer"></div>
            </div>
        );
    }
}

function mapStateToProps(state) {
    return {socket: state.socket};
}

function mapDispatchToProps(dispatch) {
    return {
        goTo(dest) {
            dispatch(push(dest));
        }
    };
}
ImageGrid = connect(mapStateToProps, mapDispatchToProps)(ImageGrid);
ImageGrid.defaultProps = {
    defaultImgHeight: 180
};
export default ImageGrid
