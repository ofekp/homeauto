import React, { Component, useState } from 'react';
import { getUserDetails } from './helpers/db';
import { Redirect } from 'react-router-dom';
import axios from 'axios';

import TextField from '@material-ui/core/TextField';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import blue from '@material-ui/core/colors/blue';
import pink from '@material-ui/core/colors/pink';
import { MuiThemeProvider, createMuiTheme, makeStyles } from '@material-ui/core/styles'; // v1.x
import { ThemeProvider } from '@material-ui/styles';
import purple from '@material-ui/core/colors/purple';
import Button from '@material-ui/core/Button'
import { Theme } from '@material-ui/core/styles/createMuiTheme';

const theme = createMuiTheme({
  palette: {
    primary: blue,
    secondary: {
      main: '#E33E7F'
    }
  },
});

const useStyles = makeStyles({
  container: {
    display: 'flex',
    flexWrap: 'wrap',
  },
  textField: {
    //marginLeft: theme.spacing(1),
    //marginRight: theme.spacing(1),
    width: 256,
  },
  dense: {
    marginTop: 19,
  },
  menu: {
    width: 200,
  },
});

const style = {
  margin: 15,
};

function RiscoForm(props) {
  const classes = useStyles();

  const [form, setValues] = useState({
    username: '',
    password: '',
    pin: '',
  });

  const updateField = event => {
    setValues({
      ...form,
      [event.target.name]: event.target.value
    });
  };

  const handleClick = async (event) => {
    const apiBaseUrl = "/home-auto";
    const userDetailsObj = JSON.parse(props.userDetails);

    const payload = {
      "user": userDetailsObj.user._id,
      "user_name": form.username,
      "password": form.password,
      "additional_data": {"pin": form.pin},
      "account_type": "RISCO",
      "device_name": "risco"
    }

    await axios.post(apiBaseUrl + '/account/create', payload).then(function (response) {
      console.log(response);
      if (response.status == 200) {
        console.log("Device created successfully");
        this.setState({loginPage:[],uploadScreen:uploadScreen})
      } else {
        console.log("Error while creating the device");
        alert("Error while creating the device");
      }
    })
    .catch(function (error) {
      console.log(error);
    });

    const userDetails = await getUserDetails(userDetailsObj.user.email);
    const userDetailsStr = JSON.stringify(userDetails);
    localStorage.setItem('userDetails', userDetailsStr);
    props.updateUserDetails(userDetailsStr);
  }

  return (
    <div className="device-login">
      <MuiThemeProvider theme={theme}>
        <div>
          <AppBar position="static" color="primary">
            <Toolbar>
              <Typography variant="h6" color="inherit">
                Risco Device
              </Typography>
            </Toolbar>
          </AppBar>
          <TextField
            id="standard-text-input"
            label="Username"
            className={classes.textField}
            type="text"
            autoComplete="current-password"
            margin="normal"
            name="username"
            value={form.username}
            onChange = {updateField}
          />
          <br/>
          <TextField
            id="standard-password-input"
            label="Password"
            className={classes.textField}
            type="password"
            autoComplete="current-password"
            margin="normal"
            name="password"
            value={form.password}
            onChange = {updateField}
          />
          <br/>
          <TextField
            id="standard-pin-input"
            label="Pin"
            className={classes.textField}
            type="password"
            autoComplete="current-password"
            margin="normal"
            name="pin"
            value={form.pin}
            onChange = {updateField}
          />
          <br/>
          <Button variant="contained" color="primary" style={style} onClick={(event) => handleClick(event)}>SUBMIT</Button>
       </div>
      </MuiThemeProvider>
    </div>
  );
}

class RiscoLogin extends Component {
  constructor(props) {
    super(props);
    this.state = {
      userDetails: null
    }
  }

  componentWillMount() {
    const userDetails = localStorage.getItem('userDetails');
    this.setState(() => ({
      userDetails: userDetails,
    }));
  }

  updateUserDetails = (userDetails) => {
    this.setState({
      userDetails: userDetails
    })
  }

  render() {
    if (!this.state.userDetails) {
      return <Redirect to='/' />
    }

    return <RiscoForm userDetails={this.state.userDetails} updateUserDetails={this.updateUserDetails} />;
  }
}

export default RiscoLogin;