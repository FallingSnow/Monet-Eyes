import React from 'react';
import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import {push} from 'react-router-redux';
import Flif from './images/Flif.jsx';
import Directory from './imagegrid/Directory.jsx';
import Unknown from './imagegrid/Unknown.jsx';

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
    loadDirectory(directory) {
        console.debug('Getting list of directory:', directory);
        let _self = this;
        this.props.socket.emit('listDirectory', directory, function(err, list) {
            if (err)
                throw err;

            console.debug('[React] Directory list:', list);

            let files = [],
                directories = [];
            for (let fileIndex in list) {
                let file = list[fileIndex];
                if (file.type === 'file') {
                    switch (file.extension) {
                        case '.flif':
                            {

                                let width = file.width * _self.props.defaultImgHeight / file.height;
                                files.push(
                                    <div className="image-container" key={fileIndex} style={{
                                        width,
                                        flexGrow: width
                                    }} onTouchTap={() => _self.props.goTo(file.path)}>
                                        <Flif style={{
                                            width: 100 + '%'
                                        }} quality={200} thumbnail={true} file={file}/>
                                    </div>
                                );

                                break;
                            }
                        default:
                            {
                                console.warn('[React] Unknown file format:', file.extension);
                                break;
                            }
                    }
                } else if (file.type === 'directory') {
                    directories.push(<Directory style={{
                        width: _self.props.defaultImgHeight,
                        flexGrow: _self.props.defaultImgHeight
                    }} key={fileIndex} directory={file}/>)
                }
            }
            _self.setState({files, directories});
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
