import React from 'react';
import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import {push} from 'react-router-redux';
import ImageGrid from './ImageGrid.jsx';

class Directory extends React.PureComponent {
    constructor(props) {
        super(props);
        console.debug('[React] Directory loaded.', this.props);
    }
    render() {
        return (
            <div id="directory">
                <ImageGrid directory={this.props.location.pathname} />
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
export default connect(null, mapDispatchToProps)(Directory);
