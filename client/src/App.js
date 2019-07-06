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
import { getUserDetails, createUser } from "./helpers/db";
import { GoogleLogin } from 'react-google-login';

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      userDetails: null
    }
  }

  responseGoogle = async (response) => {
    if (!response || !response.profileObj || !response.profileObj.email) {
      console.log("Error while siging in, email could not be found.");
      return;
    }
    const email = response.profileObj.email;
    const name = response.profileObj.name;
    console.log(email);
    console.log(name);
    var userDetails = await getUserDetails(email);
    if (!userDetails) {
      // create a new account for the user
      userDetails = await createUser(email, name);
    }
    const userDetailsStr = JSON.stringify(userDetails);
    localStorage.setItem('userDetails', userDetailsStr);
    this.setState(() => ({
      userDetails: userDetails
    }))
  }

  render() {
    const userDetails = localStorage.getItem('userDetails');
    if (!userDetails) {
      // display login prompt
      return (
        <div>
          <div className="login">
            <h1 className="text-center">
              Home-Auto
            </h1>
            <div className="login-content">
              <h2>
                Login
              </h2>
              <div className="content-text">
                Currently the only available way to sign in is by signing in with you Google account.
              </div>
              <div className="content-center">
                <GoogleLogin 
                  clientId={process.env.WEBAPP_CLIENT_ID}
                  buttonText="Sign in with Google"
                  onSuccess={this.responseGoogle}
                  onFailure={this.responseGoogle}
                  cookiePolicy={'single_host_origin'}
                />
              </div>
              <div className="content-text content-small text-center">
                Only the email is used for the sole pupose of peronalizing the app. No spam will be sent and your details will not be passed to any third party.
              </div>
            </div>
          </div>
          <div className="footer">
            Home-Auto by Ofek Pearl
          </div>
        </div>
      );
    }

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
          <div className="footer">
            Home-Auto by Ofek Pearl
          </div>
        </div>
      </HashRouter>
    );
  }
}

export default App;
