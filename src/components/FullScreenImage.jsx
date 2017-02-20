import React from 'react';
import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import {push} from 'react-router-redux';
import Flif from './modules/Flif.jsx';
import Jpeg from './modules/Jpeg.jsx';

class FullScreenImage extends React.PureComponent {
    constructor(props) {
        super(props);
        console.debug('[React] FullScreenImage loaded.', this.props);
        this.run();
    }
    run() {
        let _self = this;
        this.processPath(this.props.location.pathname, function(image) {
            _self.setState({
                imageComponents: _self.state.imageComponents.concat([image])
            });
            // if (image.props.file.prev) {
            //     _self.processPath(image.props.file.prev, function(image) {
            //         _self.setState({
            //             imageComponents: _self.state.imageComponents.concat([image])
            //         });
            //     });
            // }
        });
    }
    getImageData(src, cb) {
        this.props.socket.emit('fileInfo', src, function(err, file) {
            if (err)
                return console.error(err);

            cb(file);
        });
    }
    state = {
        imageComponents: []
    };
    processPath(path, cb) {
        let _self = this;
        this.getImageData(path, function(file) {
            switch (file.extension) {
                case '.flif':
                    cb(<Flif fullscreen={true} key={file.name} quality={_self.props.quality} file={file}/>);
                    break;
                case '.jpg':
                case 'jpeg':
                    cb(<Jpeg fullscreen={true} key={file.name} file={file}/>);
                    break;

                default:
                    console.warn('Unknown image file type', file.extension);
                    break;
            }
        });
    }
    render() {
        return (
            <div className="fullscreen-container">
                <div className="fullscreen-container-arrow fullscreen-container-arrow-left"><i className="fa fa-chevron-left"/></div>
                {this.state.imageComponents}
                <div className="fullscreen-container-arrow fullscreen-container-arrow-right"><i className="fa fa-chevron-right"/></div>
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
FullScreenImage = connect(mapStateToProps, mapDispatchToProps)(FullScreenImage);
FullScreenImage.defaultProps = {
    quality: 0.3
};
export default FullScreenImage;
