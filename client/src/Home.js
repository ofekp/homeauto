import React, { Component } from 'react';
import axios from 'axios';
import { GoogleLogin } from 'react-google-login';

// TODO: Continue with:
// https://developers.google.com/identity/sign-in/web/sign-in

// https://developers.google.com/actions/identity/google-sign-in-oauth?creation=no
// https://medium.com/google-developer-experts/setup-an-authorization-server-less-for-your-actions-on-google-application-ff56f0328cf8
// https://medium.com/google-cloud/understanding-oauth2-and-building-a-basic-authorization-server-of-your-own-a-beginners-guide-cf7451a16f66
// https://medium.com/@ratrosy/building-a-basic-authorization-server-with-implicit-flow-3f474eb2a306
// https://developers.google.com/identity/protocols/OAuth2WebServer#tokenrevoke

// https://medium.com/google-developer-experts/how-to-use-google-sign-in-for-the-assistant-b818f3de9211
// https://developers.google.com/actions/identity/google-sign-in#nodejs


const responseGoogle = (response) => {
  if (!response || !response.profileOb || !response.profileObj.email) {
    console.log("Error while siging in, email could not be found.");
    return;
  }
  localStorage.setItem('email', response.profileObj.email);
}

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
        <GoogleLogin
          clientId="<client_id>"
          buttonText="Sign in with Google"
          onSuccess={responseGoogle}
          onFailure={responseGoogle}
          cookiePolicy={'single_host_origin'}
        />
      </div>
    );
  }
}

export default Home;