import React from 'react';
import {bindActionCreators} from 'redux';
import {connect} from 'react-redux';
import {browserHistory} from 'react-router';
import filesize from 'filesize';
import classNames from 'classnames';
import {push} from 'react-router-redux';

class Directory extends React.PureComponent {
    constructor(props) {
        super(props);
        console.debug('[React] Directory Grid Selector loaded.', this.props);
    }
    componentDidMount() {
        let _self = this;

        window.addEventListener("resize", this.onResize);
    }
    componentWillUnmount() {
        window.removeEventListener("resize", this.onResize);
    }
    onResize() {
        console.debug('Window resized!');
    }
    render() {
        return (
            <div style={this.props.style} className={classNames('Directory', this.props.className)} onTouchTap={() => this.props.goTo(this.props.directory.path)}>
                <i className="icon fa fa-folder"/>
                <h4>{this.props.directory.basename}</h4>
            </div>
        );
    }
}

function mapDispatchToProps(dispatch) {
    return {
        goTo(dest) {
            dispatch(push(dest));
        }
    };
}
Directory = connect(null, mapDispatchToProps)(Directory);
Directory.defaultProps = {};
export default Directory;
