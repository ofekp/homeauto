import React, { Component } from 'react';
import LoginMessage from './LoginMessage'

class Home extends Component {
  constructor(props) {
    super(props);
    this.state = {
      userDetails: null
    }
  }

  // componentDidMount() {
  //   this.callApi()
  //     .then(res => {
  //         this.setState({ title: res.title, data: res.data });
  //       })
  //     .catch(err => console.log(err));
  // }

  componentWillMount() {
    const userDetails = localStorage.getItem('userDetails');
    this.setState(() => ({
      userDetails: userDetails,
    }));
  }

  render() {
    if (!this.state.userDetails) {
      return <LoginMessage>You'll first need to sign in before using this app. Use the the button on the upper right corner of this app.</LoginMessage>;
    } else {
      const userDetailsObj = JSON.parse(this.state.userDetails);
      if (!userDetailsObj.accounts || userDetailsObj.accounts.length == 0) {
        return <LoginMessage title="Device Setup Required">Hey {userDetailsObj.user.name}! You have not yet set up any device. Please set up a Risco device in Risco Login tab.</LoginMessage>
      } else {
        return <LoginMessage title="You're logged in &#x2714;">{userDetailsObj.user.name ? "Hey " + userDetailsObj.user.name + "!" : "Hey there!"} Welcome to Home-Keeper.</LoginMessage>
      }
    }
  }
}

export default Home;