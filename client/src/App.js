import React, { Component } from 'react';
import './App.css';
import {
  Route,
  NavLink,
  HashRouter
} from "react-router-dom";
import Home from "./Home";
import Devices from "./Devices";
import RiscoLogin from "./RiscoLogin";

class App extends Component {
  render() {
    return (
      <HashRouter>
        <div>
          <ul className="header">
            <li><NavLink exact to="/">Home-Auto</NavLink></li>
            <li><NavLink to="/devices">My Devices</NavLink></li>
            <li><NavLink to="/risco_login">Add Risco Device</NavLink></li>
          </ul>
          <div className="content">
            <Route exact path="/" component={Home}/>
            <Route path="/devices" component={Devices}/>
            <Route path="/risco_login" component={RiscoLogin}/>
          </div>
        </div>
      </HashRouter>
    );
  }
}

export default App;
