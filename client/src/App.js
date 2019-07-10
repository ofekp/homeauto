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

import AppBar from '@material-ui/core/AppBar';
import Grid from '@material-ui/core/Grid';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import Typography from '@material-ui/core/Typography';
import IconButton from '@material-ui/core/IconButton';
import MenuIcon from '@material-ui/icons/Menu';
import AccountCircle from '@material-ui/icons/AccountCircle';
import MenuItem from '@material-ui/core/MenuItem';
import Menu from '@material-ui/core/Menu';

function TabContainer(props) {
  return (
    <div>
      {props.children}
    </div>
  );
}

// const useStyles = makeStyles(theme => ({
//   root: {
//     flexGrow: 1,
//     backgroundColor: theme.palette.background.paper,
//   },
// }));

// continue with:
// https://material-ui.com/components/app-bar/
// https://material-ui.com/components/tabs/
// App should be a function so we can use the pallete like in RiscoLogin
// Login should have sign in and sign out according to the current state
// risco login should be boxed (+ remove artifact of shadow)

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      content: "home",
      userDetails: null,
      anchorEl: null
    }
  }

  handleMenu = (event) => {
    console.log(this.state)
    this.setState({anchorEl: event.currentTarget});
  }

  handleClose = () => {
    this.setState({anchorEl: null});
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
              <h2 className="text-center">
                Login
              </h2>
              <div className="content-text text-center">
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

    const open = Boolean(this.state.anchorEl);

    return (
      <div>
        <AppBar position="static">
          <Grid
            justify="space-between"
            container 
            spacing={20}
          >
            <Grid item>
              <Tabs value={this.state.content} onChange={(event, newValue) => {console.log(this.state); this.setState({content: newValue})}}>
                <Tab value="home" label="Home" wrapped />
                <Tab value="devices" label="Devices" />
                <Tab value="risco_login" label="Risco Login" />
              </Tabs>
            </Grid>

            <Grid item>
              {userDetails && (
              <div style={{ flex: 1 }}>
                <IconButton
                  aria-label="Account of current user"
                  aria-controls="menu-appbar"
                  aria-haspopup="true"
                  onClick={this.handleMenu}
                  color="inherit"
                >
                  <AccountCircle />
                </IconButton>
                <Menu
                  id="menu-appbar"
                  anchorEl={this.state.anchorEl}
                  anchorOrigin={{
                    vertical: 'top',
                    horizontal: 'right',
                  }}
                  keepMounted
                  transformOrigin={{
                    vertical: 'top',
                    horizontal: 'right',
                  }}
                  open={open}
                  onClose={this.handleClose}
                >
                  <MenuItem onClick={this.handleClose}>Profile</MenuItem>
                  <MenuItem onClick={this.handleClose}>My account</MenuItem>
                </Menu>
              </div>
            )}
            </Grid>
          </Grid>
        </AppBar>
        {this.state.content === 'home' && <TabContainer><Home /></TabContainer>}
        {this.state.content === 'devices' && <TabContainer><Devices /></TabContainer>}
        {this.state.content === 'risco_login' && <TabContainer><RiscoLogin /></TabContainer>}
        <div className="footer">
          Home-Auto by Ofek Pearl
        </div>
      </div>
    );
  }
}

export default App;
