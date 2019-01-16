import React, { Component } from 'react';
import './App.css';
import Chat from './Chat/Chat';

class App extends Component {

    constructor(_props: any) {
        super(_props);
    }

    render() {
        return (
            <Chat />
        );
    }
}

export default App;
