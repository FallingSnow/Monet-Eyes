import React from 'react';
import {connect} from 'react-redux';
import classNames from 'classnames';
import {push} from 'react-router-redux';

class Unknown extends React.PureComponent {
    constructor(props) {
        super(props);
        console.debug('[React] Unknown loaded.', this.props);
    }
    render() {
        return (
            <div className={classNames('Unknown', this.props.className)} style={this.props.style} title={this.props.file.name}>
                <div>
                    <i className="icon fa fa-question"/>
                    <span className="extension">{this.props.file.extension}</span>
                </div>
                <span className="name">{this.props.file.name}</span>
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
