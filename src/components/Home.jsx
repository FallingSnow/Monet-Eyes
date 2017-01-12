import React from 'react';
import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import {push} from 'react-router-redux';
import ImageGrid from './ImageGrid.jsx';

class Home extends React.PureComponent {
    constructor(props) {
        super(props);
        console.debug('[React] Home loaded.', this.props);
    }
    render() {
        return (
            <div id="home">
                <a onTouchTap={() => this.props.goTo('/directory')}>File Manager</a>
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
export default connect(mapStateToProps, mapDispatchToProps)(Home);
