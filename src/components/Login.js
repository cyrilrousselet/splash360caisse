import React from 'react';
import PropTypes from 'prop-types';
import shuffle from 'lodash/shuffle';

import PillButton from './common/PillButton';
import PillField from './common/PillField';
// import PillConnect from './PillConnect';

// import YoutillLogoIcon from './common/icon/YoutillLogoIcon';
import Swal from 'sweetalert2';


import {data} from '../constants/translations';
import LocalizedStrings from 'react-localization';

let strings = new LocalizedStrings(data);

// passphrase number of characters
const NUMCHAR = 6;
const DEFAULT_PASSPHRASE = '000000';

class Login extends React.Component {

  constructor(props) {

    super(props);

    if (!this.props.inPopin) this.props.logout();

    this.state = {
      passphrase: '',
      activated: false,
      boutons: shuffle([...Array(10).keys(), ...Array(6)]),
      prepareToSet: false
    }
    this.buttonHandler = this.buttonHandler.bind(this);
    this.deleteHandler = this.deleteHandler.bind(this);
    this.resetPassphrase = this.resetPassphrase.bind(this);
    this.prepareToSetAdmin = this.prepareToSetAdmin.bind(this);
    this.displayError = this.displayError.bind(this);
    this.submitPassphrase = this.submitPassphrase.bind(this);
  }

  componentDidMount() {
    const { checkUsers } = this.props;
    checkUsers();
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

  resetPassphrase() {
    this.setState({passphrase:'', activated: false});
  }

  prepareToSetAdmin() {
    this.setState({prepareToSet:true});
  }

  displayError(error) {

    Swal.fire({
      type: 'warning',
      title: strings.login.erreur.titre,
      text: strings.login.erreur.texte,
      showCancelButton: false,
      focusConfirm: false
    }).then((result)=> {
      if (result.value) {
        this.props.resetError();
      }
    });
  }

  submitPassphrase(passphrase) {
    const { prepareToSet } = this.state; 
    const { hasUsers, inPopin, popinAction, setAdmin, login } = this.props;

    this.resetPassphrase();
    // dans le cas où la page de login serait utilisée en popin
    if (inPopin) {
      popinAction(passphrase)
    } 
    // sinon, dans son usage normal
    else {
      // cas de personnalisation du login d'Admin
      if (prepareToSet) {
        setAdmin(passphrase);
      } 
      // login normal
      else {
        // s'il y a au moins un user en base
        if (hasUsers) {
          login(passphrase);
        } 
        // si aucun user n'est en base
        else {
          // on attend l'identifiant par défaut
          if (passphrase===DEFAULT_PASSPHRASE) {
            this.resetPassphrase();
            this.prepareToSetAdmin();
          } 
          // sinon message d'erreur
          else {

            Swal.fire({
              type: 'warning',
              title: strings.login.erreur.titre,
              text: strings.login.erreur.texte,
              showCancelButton: false,
              focusConfirm: false
            }).then((result)=> {
              if (result.value) {
                this.resetPassphrase();
              }
            });
          }
        }
      }
    }
  }




  render() {

    const {passphrase, activated, boutons, prepareToSet} = this.state;
    const {hasUsers, error, inPopin} = this.props;


    if (error) {
      this.displayError(error);
    }


    if (activated && !error) this.submitPassphrase(passphrase);

    return (
      <div className="Login">
        {!inPopin && <div className="logo">
          {/* <YoutillLogoIcon className="logoImg" /> */}
        </div>}
        <div className={ `panel${(prepareToSet ? ' prepareAdmin' : '')}` }>
          {(!hasUsers) && <div className="prepareTitle">{ strings.login.premiere.titre }</div> }
          <PillField type="password" innerButton="delete" charNum={ NUMCHAR } value={passphrase} innerButtonHandler={this.deleteHandler}/>
          {(!hasUsers && !prepareToSet) && <div className="prepareTexte">{ strings.login.premiere.active }</div> }
          {(!hasUsers && prepareToSet) && <div className="prepareTexte">{ strings.login.premiere.texte }</div> }
          <div className="keyboard">
            { boutons.map((btn, i) => {
              return (btn!==undefined
                ? <PillButton elementclass="btn" text={ `${btn}` } key={ i } onClick={ this.buttonHandler } />
                : <div className="empty" key={ i }></div>
                );
              })}
          </div>
        </div>
        {/* <PillConnect activated={activated} onClick={ connectBtnHandler } /> */}
      </div>
    );
  }

};


Login.propTypes = {
  login: PropTypes.func.isRequired,
  logout: PropTypes.func.isRequired,
  inPopin: PropTypes.bool
}

export default Login;