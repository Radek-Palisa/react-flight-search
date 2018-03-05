import React from 'react';
import './appHeader.css';
import logo from '../logo.svg';

export default class AppHeader extends React.Component {
    render() {
        return (
            <header className="App-header">
                <img src={logo} className="App-logo" alt="logo" />
                <h1 className="App-title">Flight Search built on React and Kiwi API</h1>
            </header>
        ) 
    }
}