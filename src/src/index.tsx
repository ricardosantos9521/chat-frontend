import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import * as serviceWorker from './serviceWorker';
import { BrowserRouter, Route } from "react-router-dom";
import Login from './Login/Login';

ReactDOM.render(
    <BrowserRouter basename="/chat/client/">
        <div style={{ width: "100%", height: "100%" }}>
            <Route exact path="/" component={App} />
            <Route path="/login" component={Login} />
        </div>
    </BrowserRouter>
    , document.getElementById('root'));

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: http://bit.ly/CRA-PWA
// serviceWorker.unregister();
serviceWorker.register();