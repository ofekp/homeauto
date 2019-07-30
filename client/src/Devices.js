import React, { Component, useState, useEffect } from 'react';
import axios from 'axios';
import { appTheme } from './AppTheme';
import TextField from '@material-ui/core/TextField';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Slider from '@material-ui/core/Slider';
import CircularProgress from '@material-ui/core/CircularProgress';
import Typography from '@material-ui/core/Typography';
import { MuiThemeProvider, makeStyles } from '@material-ui/core/styles'; // v1.x
import Button from '@material-ui/core/Button'
import Box from '@material-ui/core/Box';
import LoginMessage from './LoginMessage'
import IconButton from '@material-ui/core/IconButton';
import MenuItem from '@material-ui/core/MenuItem';
import Menu from '@material-ui/core/Menu';
import MenuIcon from '@material-ui/icons/Menu';
import MoreVertIcon from '@material-ui/icons/MoreVert';
import { getUserDetails, revokeCookie } from "./helpers/db";

const useStyles = makeStyles(theme => ({
  progress: {
    margin: theme.spacing(1),
  },
}));

const RiscoAction = Object.freeze({
  ARMED: 1,
  PARTIALLY_ARMED: 2,
  DISARMED: 3,
  ERROR: 4
});


const marks = [
  {
    value: 1,
    label: 'Partial',
    label_short: 'Part',
    state: RiscoAction.PARTIALLY_ARMED,
  },
  {
    value: 50,
    label: 'Disarm',
    label_short: 'Dis',
    state: RiscoAction.DISARMED,
  },
  {
    value: 100,
    label: 'Arm',
    label_short: 'Arm',
    state: RiscoAction.ARMED,
  },
];

const style = {
  margin: 15,
};

function RiscoDevice(props) {
  const classes = useStyles();

  const [alarmState, setAlarmState] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);

  const open = Boolean(anchorEl);

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  }

  const handleClose = () => {
    setAnchorEl(null);
  }

  const handleDeleteDevice = async () => {
    // TODO - delete the device
    setAnchorEl(null);
    const apiBaseUrl = "/home-keeper";

    const payload = {
      "id": props.device_id,
    }

    const response = await axios.post(apiBaseUrl + '/account/delete', payload);
    if (response.status === 200) {
      // get the updated state of the userDetails
      const userDetailsResponse = await getUserDetails();
      if (userDetailsResponse.status === 401) {
        props.handleLogout()
      } else if (userDetailsResponse.status === 200) {
        const userDetailsStr = JSON.stringify(userDetails);
        props.updateUserDetails(userDetailsStr);
      } else {
        // create a new account for the user
        console.log("ERROR: When deleting a user defined device.");
        return;
      }
    } else if (response.status === 401) {
      props.handleLogout()
    } else {
      console.log("ERROR: The device probably not exists, please try to logout and login in again.");
      return;
    }
  }

  const getRiscoState = async (device_id) => {
    const apiBaseUrl = "/home-keeper";

    const payload = {
      "device_id": device_id,
    }

    const response = await axios.post(apiBaseUrl + '/device/getState', payload)
    if (response.status === 200) {
      const state = response.data.state
      setAlarmState(state);
    } else if (response.status === 401) {
      props.handleLogout()
    } else {
      setAlarmState(RiscoAction.ERROR)
    }
  }

  const setRiscoState = async (device_id, state) => {
    const apiBaseUrl = "/home-keeper";

    const payload = {
      "device_id": device_id,
      "state": state,
    }

    const response = await axios.post(apiBaseUrl + '/device/setState', payload)
    if (response.status === 401) {
      props.handleLogout()
    } else if (response.status === 200) {
      const state = response.data.state;
      setAlarmState(state);
    } else {
      console.log("ERROR: While setting the device state.")
      return null;
    }
  }

  useEffect(() => {
    getRiscoState(props.device_id);
  }, []);

  function valuetext(value) {
    return `${value}`;
  }
  
  function valueLabelFormat(value) {
    return marks.find(mark => mark.value === value).label_short;
  }

  async function handleSliderChange(event, value) {
    // TODO: prevent unneeded setChange calls using `event.target`;
    const state = marks.find(mark => mark.value == value).state;
    setTimeout(function() { 
      setAlarmState(null); 
    }, 600);
    await setRiscoState(props.device_id, state);
  }

  return (
    <div className="device-container">
      <MuiThemeProvider theme={appTheme}>
        <div>
          <AppBar position="static" color="primary">
            <Toolbar>
              <IconButton
                aria-label="Device Options"
                aria-controls="menu-appbar"
                aria-haspopup="true"
                onClick={handleMenu}
                color="inherit"
                edge="start">
                <MoreVertIcon />
              </IconButton>
              <Menu
                id="menu-appbar"
                anchorEl={anchorEl}
                anchorOrigin={{
                  vertical: 'top',
                  horizontal: 'left',
                }}
                keepMounted
                transformOrigin={{
                  vertical: 'top',
                  horizontal: 'left',
                }}
                open={open}
                onClose={handleClose}
              >
                <MenuItem onClick={handleDeleteDevice}>Delete</MenuItem>
              </Menu>
              <Typography variant="h6" color="inherit">
                {props.name}
              </Typography>
            </Toolbar>
          </AppBar>
            {alarmState
            ?
              alarmState === RiscoAction.ERROR
              ?
              <p>Perhaps your device was set up incorrectly?</p>
              :
              <div className="device-slider-container">
              <Slider
                defaultValue={marks.find(mark => mark.state === alarmState).value}
                valueLabelFormat={valueLabelFormat}
                getAriaValueText={valuetext}
                aria-labelledby="discrete-slider-restrict"
                step={null}
                valueLabelDisplay="auto"
                marks={marks}
                onChangeCommitted={handleSliderChange}
              />
              </div>
            :
            <div className="device-slider-loading">
            <CircularProgress className={classes.progress} /> 
            </div>}
          </div>
      </MuiThemeProvider>
    </div>
  );
}

class Devices extends Component {
  constructor(props) {
    super(props);
    this.state = {
      userDetails: null
    }
  }

  componentWillMount() {
    const userDetailsStr = localStorage.getItem('userDetails');
    this.setState(() => ({
      userDetails: userDetailsStr,
    }));
  }

  updateUserDetails = (userDetailsStr) => {
    localStorage.setItem('userDetails', userDetailsStr);
    this.setState(() => ({
      userDetails: userDetailsStr,
    }));
  }

  handleLogout = async () => {
    localStorage.clear()
    await revokeCookie()
    this.setState(() => ({
      userDetails: null,
    }));
    // call App component handleLogout in order to show the Login button
    this.props.handleLogout()
  }

  renderDevice(device) {
    const userDetailsObj = JSON.parse(this.state.userDetails);
    const email = userDetailsObj.user.email;
    return <RiscoDevice 
      key={device.device_name}
      name={device.device_name}
      email={email}
      device_id={device._id}
      updateUserDetails={this.updateUserDetails}
      handleLogout={this.handleLogout}
    />;
  }

  render() {
    var userDetailsObj;
    if (!this.state.userDetails) {
      return <LoginMessage>You'll first need to sign in before using this app. Use the the button on the upper right corner of this app.</LoginMessage>
    } else {
      userDetailsObj = JSON.parse(this.state.userDetails);
      if (!userDetailsObj.accounts || userDetailsObj.accounts.length == 0) {
        return <LoginMessage title="Device Setup Required">Hey {userDetailsObj.user.name}! You have not yet set up any device. Please set up a Risco device in Risco Login tab.</LoginMessage>
      }
    }

    console.log(userDetailsObj)

    // user is signed in and there is a device to display
    const accounts = userDetailsObj.accounts;

    // let arr = [];
    // if (this.state.data) {
    //   this.state.data.map(book_data => arr.push(book_data));
    // }
    return (
      <div>
        {
          accounts.map(device => {
            return this.renderDevice(device);
          })
        }
      </div>
    );
  }
}

export default Devices;