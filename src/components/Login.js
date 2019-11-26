import React from 'react';
import PropTypes from 'prop-types';
import shuffle from 'lodash/shuffle';

import PillButton from './common/PillButton';
import PillField from './common/PillField';
import PillConnect from './PillConnect';

import logo from './../assets/images/default_logo.svg';

// passphrase number of characters
const NUMCHAR = 6;

class Login extends React.Component {

  constructor(props) {

    super(props);

    this.props.logout();

    this.state = {
      passphrase: '',
      activated: false,
      boutons: shuffle([...Array(10).keys(), ...Array(6)])
    }
    this.buttonHandler = this.buttonHandler.bind(this);
    this.deleteHandler = this.deleteHandler.bind(this);

  }

  // action on buttons (fill in passphrase)
  buttonHandler(text) {
    if (this.state.passphrase.length<NUMCHAR) {
      let newValue = this.state.passphrase+text;
      this.setState({passphrase: newValue, activated:newValue.length===NUMCHAR});
    }
  }

  // action on delete button
  deleteHandler() {
    if (this.state.passphrase.length>0) {
      this.setState({passphrase: this.state.passphrase.slice(0,-1), activated:false});
    }
  }

  render() {

    const {passphrase, activated, boutons} = this.state;


    return (
      <div className="Login">
        <div className="logo"><img src={logo} alt="" /></div>
        <div className="panel">
          <PillField type="password" innerButton="delete" charNum={ NUMCHAR } value={passphrase} innerButtonHandler={this.deleteHandler}/>
          <div className="keyboard">
            { boutons.map((btn, i) => {
              return (btn!==undefined
                ? <PillButton elementclass="btn" text={ `${btn}` } key={ i } onClick={ this.buttonHandler } />
                : <div className="empty" key={ i }></div>
                );
              })}
          </div>
        </div>
        <PillConnect activated={activated} onClick={ this.props.login } />
      </div>
    );
  }

};


Login.propTypes = {
  login: PropTypes.func.isRequired,
  logout: PropTypes.func.isRequired
}

export default Login;