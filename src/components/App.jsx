import React from 'react';
import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import {push} from 'react-router-redux';
import ReactCSSTransitionGroup from 'react-addons-css-transition-group';

import getMuiTheme from 'material-ui/styles/getMuiTheme';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import AppBar from 'material-ui/AppBar';

const muiTheme = getMuiTheme({});

const colors = ['#3F51B5', '#2196F3', '#8BC34A', '#FF9800', '#FF5722']

class App extends React.PureComponent {
    constructor(props) {
        super(props);
        console.debug('[React] App loaded.', this.props);
    }
    renderBreadcrumbs(path) {
        console.debug('[React] Breadcrumbs:', path)
        let breadcrumbs = [];
        let pieces = path.split('/');
        pieces.splice(0, 1);
        pieces.unshift('/');
        let lastColor;
        for (let crumbIdx in pieces) {
            let crumb = pieces[crumbIdx];
            let url = path.substring(0, path.indexOf(crumb) + crumb.length);

            // Generate random background color
            let randomColor;
            do {
                randomColor = colors[Math.floor(Math.random() * colors.length)];
            } while (randomColor === lastColor);
            lastColor = randomColor;
            // End

            breadcrumbs.push(
                <span className="breadcrumb" style={{backgroundColor: randomColor, zIndex: (50 - crumbIdx)}} key={crumb} onTouchTap={() => this.props.goTo(url)}>{crumb}</span>
            );
        }

        return breadcrumbs;
    }
    render() {
        let segment = this.props.location.pathname.split('/')[1] || 'root';
        return (
            <div id="app">
                <AppBar className="navbar" title={this.renderBreadcrumbs(this.props.location.pathname)}/>
                <ReactCSSTransitionGroup id="transition-container" transitionName={{
                    enter: 'fadeIn'
                }} transitionEnterTimeout={1000} transitionEnter={true} transitionLeave={false}>
                    {React.cloneElement(this.props.children, {key: segment})}
                </ReactCSSTransitionGroup>
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
export default connect(mapStateToProps, mapDispatchToProps)(App);
