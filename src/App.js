// @flow
import React, { Component } from 'react';
import logo from './logo.svg';
import './App.scss';
import SwitchCheckbox from './components/common/SwitchCheckbox';
import LocalizedStrings from 'react-localization';
import {data} from './constants/translations';

let strings = new LocalizedStrings(data);


class App extends Component {


  render() {
    console.log("App.render()");
    return (
      <div className="App">
        <header className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <p>
            Edit Class <code>src/App.js</code> and save to reload.
          </p>
          <a
            className="App-link"
            href="https://reactjs.org"
            target="_blank"
            rel="noopener noreferrer"
          >
            Learn React
          </a>
        </header>
        <div className="App-gui">
          <SwitchCheckbox isChecked={true} name="option1" label={strings.general.checkbox} onChange={(index)=>{console.log(index)}} />
          <br />
          <SwitchCheckbox isChecked={false} name="option2" label={strings.general.checkbox2} onChange={(index)=>{console.log(index)}} />
        </div>
      </div>
    );
  }
}
export default App;
