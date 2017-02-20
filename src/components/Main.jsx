import React from 'react';
import {createDevTools} from 'redux-devtools';
import LogMonitor from 'redux-devtools-log-monitor';
import DockMonitor from 'redux-devtools-dock-monitor';
import queryString from 'query-string';

import getMuiTheme from 'material-ui/styles/getMuiTheme';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
const muiTheme = getMuiTheme({});

import {createBrowserHistory, useBasename} from 'history';
import {createStore, combineReducers, applyMiddleware} from 'redux';
import {Provider} from 'react-redux';
import {Router, Route, IndexRoute, IndexRedirect} from 'react-router';
import {routerMiddleware, syncHistoryWithStore, routerReducer} from 'react-router-redux';
import * as reducers from '../reducers';
const reducer = combineReducers({
    ...reducers,
    routing: routerReducer
});

// History v4
function nthChar(string, character, n) {
    var count = 0,
        i = 0;
    while (count < n && (i = string.indexOf(character, i) + 1)) {
        count++;
    }
    if (count == n)
        return i - 1;
    return NaN;
}
const initializedHistory = createBrowserHistory({
    basename: window.location.pathname.substr(0, nthChar(window.location.pathname, '/', 1))
});

// HACK to use history v4 with react-router v3
initializedHistory.getCurrentLocation = () => {
    return Object.assign({}, {query: queryString.parse(initializedHistory.location.search)}, initializedHistory.location);
};
// END HACK

const middleware = routerMiddleware(initializedHistory);

let store = createStore(reducer, applyMiddleware(middleware));
let DevTools,
    stats,
    disableDevTools = false;
if (process.env.NODE_ENV === 'development') {
    DevTools = createDevTools(
        <DockMonitor toggleVisibilityKey="ctrl-h" changePositionKey="ctrl-q" defaultIsVisible={false}>
            <LogMonitor theme="tomorrow" preserveScrollTop={false}/>
        </DockMonitor>
    );
    store = createStore(reducer, DevTools.instrument(), applyMiddleware(middleware));
} else {}

const history = syncHistoryWithStore(initializedHistory, store);

import App from './App.jsx';
import Home from './Home.jsx';
import FullScreenImage from './FullScreenImage.jsx';
import DirectoryView from './DirectoryView.jsx';
import NotFound from './NotFound.jsx';

export default class Main extends React.PureComponent {
    constructor(props) {
        super(props);
        console.debug('[React] Main loaded.', this.props);
    }
    devtools() {
        if (process.env.NODE_ENV === 'development' && !disableDevTools)
            return <DevTools/>;
        else
            return null;
        }
    render() {
        return (
            <Provider store={store}>
                <div>
                    <MuiThemeProvider muiTheme={muiTheme}>
                        <Router history={history}>
                            <Route path="/" component={App}>
                                <IndexRoute component={DirectoryView}/>
                                <Route path="**.flif" component={FullScreenImage}/>
                                <Route path="**.jpg" component={FullScreenImage}/>
                                <Route path="*" component={DirectoryView}/>
                            </Route>
                            <Route path='*' component={NotFound}/>
                        </Router>
                    </MuiThemeProvider>
                    {this.devtools()}
                </div>
            </Provider>
        );
    }
}
