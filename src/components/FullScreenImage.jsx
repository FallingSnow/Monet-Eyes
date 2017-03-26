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
        this.process();
    }
    process() {
        const type = getType(this.props.file.mime, this.props.file.extname);
        switch (type) {
            case 'jpeg':
                this.setState({type: 'native', src: this.props.file.metadata.scaled.thumbnail});
                break;
            default:
                console.warn('Unknown file type:', this.props.file.mime, this.props.file.extname);
        }
    }
    render() {
        let imageComponent;
        if (this.state.type === 'native') {
            imageComponent = <img src={this.state.src} alt=""/>;
        } else {
            // Set image component to canvas?
        }
        return (
            <div className="fullscreen-container">
                <div className="fullscreen-container-arrow fullscreen-container-arrow-left"><i className="fa fa-chevron-left"/></div>
                {imageComponent}
                <div className="fullscreen-container-arrow fullscreen-container-arrow-right"><i className="fa fa-chevron-right"/></div>
            </div>
        );
    }
    static propTypes = {
        file: React.PropTypes.object.isRequired,
        quality: React.PropTypes.number
    }
}

function getType(mime, ext) {
    switch (mime) {
        case 'image/flif':
            return 'flif';
        case 'image/jpeg':
            return 'jpeg';
        default:
            switch (ext) {
                case '.flif':
                    return 'flif';
                case '.jpeg':
                case '.jpg':
                    return 'jpeg';
                default:
                    return null;
            }
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
