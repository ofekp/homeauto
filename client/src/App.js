import React, { Component } from 'react';
import './App.css';
import {
  Route,
  NavLink,
  HashRouter
} from "react-router-dom";
import Home from "./Home";
import Books from "./Books";

class App extends Component {
  render() {
    return (
      <HashRouter>
        <div>
          <h1>Simple SPA</h1>
          <ul className="header">
            <li><NavLink exact to="/catalog">Home</NavLink></li>
            <li><NavLink to="/catalog/books">Books</NavLink></li>
            <li><NavLink to="/catalog/authors">Authors</NavLink></li>
            <li><NavLink to="/catalog/genres">Genres</NavLink></li>
            <li><NavLink to="/catalog/bookinstances">Book Instances</NavLink></li>
          </ul>
          <div className="content">
            <Route exact path="/catalog" component={Home}/>
            <Route path="/catalog/books" component={Books}/>
          </div>
        </div>
      </HashRouter>
    );
  }
}

export default App;
