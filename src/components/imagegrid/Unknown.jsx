import React from 'react';
import {bindActionCreators} from 'redux';
import {connect} from 'react-redux';
import {browserHistory} from 'react-router';
import filesize from 'filesize';
import classNames from 'classnames';
import {push} from 'react-router-redux';

class Unknown extends React.PureComponent {
    constructor(props) {
        super(props);
        console.debug('[React] Unknown loaded.', this.props);
    }
    componentDidMount() {
        let _self = this;

    }
    render() {
        return (
            <div className={classNames('Unknown', this.props.className)} onTouchTap={() => this.props.goTo('/download' + this.props.file.path)}>
                <i className="icon fa fa-question"/>
                <h4>{this.props.file.basename}</h4>
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
Unknown = connect(null, mapDispatchToProps)(Unknown);
Unknown.defaultProps = {};
export default Unknown;
