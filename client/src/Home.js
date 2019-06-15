import React, { Component } from 'react';
import axios from 'axios';
import { GoogleLogin } from 'react-google-login';

const responseGoogle = (response) => {
  console.log(response);
}

// TODO: Continue with:
// https://developers.google.com/identity/sign-in/web/sign-in
// https://developers.google.com/actions/identity/google-sign-in-oauth?creation=no

class Home extends Component {
  constructor(props) {
    super(props);
    this.state = {
      title: '',
      data: '',
    }
  }

  componentDidMount() {
    this.callApi()
      .then(res => {
          this.setState({ title: res.title, data: res.data });
        })
      .catch(err => console.log(err));
  }

  callApi = async() => {
    const response = await axios.get('/catalog');
    const body = await response["data"];
    if (response.status !== 200) throw Error(body.message);
    return body;
  }

  render() {
    return (
      <div>
        <h2>Welcome to Home Auto</h2>
        <p>Welcome to {this.state.title}, a very basic Express website as a tutorial example</p>
        <GoogleLogin
          clientId="567886753913-5aird6relq58gsolp453pa2q4hl745hb.apps.googleusercontent.com"
          buttonText="Login"
          onSuccess={responseGoogle}
          onFailure={responseGoogle}
          cookiePolicy={'single_host_origin'}
        />,
        {/* document.getElementById('googleButton') */}
      </div>
    );
  }
}

export default Home;