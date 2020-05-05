import React from 'react';
import PropTypes from 'prop-types';

import 'date-fns';
import { format } from "date-fns";
import DateFnsUtils from '@date-io/date-fns';
import frLocale from "date-fns/locale/fr";

import { Modal, Fab } from '@material-ui/core';
import CloseIcon from '../common/icon/CloseIcon';
import StdButton from '../common/StdButton';

import LocalizedStrings from 'react-localization';
import {data} from '../../constants/translations';

import history from '../../helpers/history';
import paths from '../../constants/routes';

import fakeliste from '../../assets/images/fake_stocks_fournisseurs.svg';
import LargeButton from '../common/LargeButton';

import LoginCont from '../../containers/LoginCont';
import Swal from 'sweetalert2';

let strings = new LocalizedStrings(data);



const ConfirmModal = ({open, clocktype, time, validClock, closePopin}) => (

  <Modal open={open}>
    <div className="ValidationPointage">
      <div className="Modal-container">
        <div className="header">
          <div className="title">{ `${strings.modules.employes.pointeuse.validation[(clocktype==='in'?'titre_arrivee':'titre_depart')]} ${format(new Date(time), 'eeee d MMMM à HH:mm', { locale: frLocale })}` }</div>
        </div>
        <div className="body">
          <div className="soustitre">{ strings.modules.employes.pointeuse.validation.identification }</div>
          <LoginCont inPopin={true} popinAction={ (passphrase) => validClock({clocktype: clocktype, time: time, identifiant: passphrase}) } />
        </div>
      </div>
      <Fab aria-label="close" size="small" className="close-button" onClick={ closePopin }>
        <CloseIcon />
      </Fab>
    </div>
  </Modal>
);



class Pointeuse extends React.Component {


  intervalID = null;

  constructor(props) {
    super(props);

    this.state = {
      jour: format(new Date(), 'eeee d MMMM', { locale: frLocale }),
      heure: format(new Date(), 'HH:mm:ss', { locale: frLocale }),
      popinOpen: false,
      clocktype: null,
      time: null ,
      error: false,
      error_detail: null
    }

    this.declareError = this.declareError.bind(this);
    this.validClock = this.validClock.bind(this);
    this.clockIn = this.clockIn.bind(this);
    this.clockOut = this.clockOut.bind(this);
    this.closePopin = this.closePopin.bind(this);
  }


  componentDidMount() {
    this.props.getUsers();
    this.props.getAllPointages();

    if (this.intervalID==null && !this.state.error) {
      this.intervalID = setInterval(
          () => this.tick(),
          1000
      );
    }
  }
  componentWillUnmount() {
    console.log('pointeuse clearinterval');
      clearInterval(this.intervalID);
      this.intervalID = null;
  }
  tick() {
    if (!this.state.error) {
      this.setState({
        jour: format(new Date(), 'eeee d MMMM', { locale: frLocale }),
        heure: format(new Date(), 'HH:mm:ss', { locale: frLocale })
      });
    }
  }

  declareError(errorname) {

    clearInterval(this.intervalID);
    this.intervalID = null;

    this.setState({
      error: true, 
      error_detail: errorname,
      clocktype: null,
      time: null,
      popinOpen:false
    });
  }

  

  validClock(payload) {
    console.log('validClock()', payload);

    const {clocktype, time, identifiant} = payload;
    const { users, pointages, setClockIn, setClockOut } = this.props;

    // récup de l'employé à partir de son identifiant
    let __usr = null;
    let __pnt = null;
    if (users.length>0) {
      __usr = users.find(u => u.identifiant==identifiant);
    }


    // si l'employé est identifié
    if (__usr) {

      // récup d'un pointage ouvert éventuel
      if (pointages.length) {
        __pnt = pointages.find(p => p.status=='opened' && p.employe==__usr.user_id);
      }
      console.log('validClock, pointage', __pnt, clocktype);


      if (clocktype=='in') {
        // si aucun pointage n'est ouvert pour l'employé
        if (!__pnt) {
          setClockIn({time: time, user_id: __usr.user_id});
          this.closePopin();
        }
        // si un pointage est ouvert
        else {
          this.declareError('deja');
        }
      } else {
        // si un pointage est ouvert pour l'employé
        if (__pnt) {
          setClockOut({time: time, pointage_id: __pnt.pointage_id});
          this.closePopin();
        }
        // si aucun pointage n'est en cours
        else {
          this.declareError('aucun');
        }
      }
    } 
    // si employé inconnu -> erreur
    else {
      this.declareError('inconnu');
    }
  }

  clockIn() {
    this.setState({
      clocktype: 'in',
      time: new Date().getTime(),
      popinOpen: true
    });
  }

  clockOut() {
    this.setState({
      clocktype: 'out',
      time: new Date().getTime(),
      popinOpen: true
    });
  }

  closePopin() {
    this.setState({
      clocktype: null,
      time: null,
      popinOpen:false
    });
  }
 

 render() {

  const { users } = this.props;
  const { jour, heure, popinOpen, clocktype, time, error, error_detail } = this.state;

 // console.log('pointage', this.state);
  const self = this;

  if (error) {
    console.log('error_detail', error_detail);
    Swal.fire({
      title: strings.modules.employes.pointeuse.erreur[error_detail].titre,
      text: strings.modules.employes.pointeuse.erreur[error_detail].texte,
      focusConfirm: true,
      showCancelButton: false,
      customClass: 'pointeuseerror',
      confirmButtonText: 'OK',
      buttonsStyling: false 
    })
    .then(()=>{
      self.setState({
        error: false,
        error_detail:null
      });

      self.intervalID = setInterval(
        () => self.tick(),
        1000
      );
    });
  }

  return (
    <div className="Pointeuse">
      <div className="zoneBoutons">
        <div className="buttons">
          <StdButton identifier="btnretour" elementclass="btnretour" key="btnretour" text="Retour" onClick={ () => { history.push(paths.EMPLOYES) }} />
        </div>
        <div className="titre">{ strings.modules.employes.pointeuse.titre }</div>
        <div className="search"></div>
      </div>
      <div className="zoneliste">
        <div className="wrapper">
          <div className="horloge">
            <div className="jour">{ jour }</div>
            <div className="heure">{ heure }</div>
          </div>
          <div className="boutons">
             <LargeButton identifier='btnarrivee' elementclass='btnarrivee' icon={ false } text={ strings.modules.employes.pointeuse.btn_arrivee } onClick={ this.clockIn }></LargeButton>
             <LargeButton identifier='btndepart' elementclass='btndepart' icon={ false } text={ strings.modules.employes.pointeuse.btn_depart } onClick={ this.clockOut }></LargeButton>
          </div>
        </div>
      </div>
      <ConfirmModal open={popinOpen} clocktype={clocktype} checkuser={this.checkUser} time={time} validClock={this.validClock} closePopin={this.closePopin} />
    </div>
    );
  }
}
export default Pointeuse;

// Pointeuse.propTypes = {
//   catalogue: PropTypes.array,
//   loading: PropTypes.bool,
//   error: PropTypes.string,
//   getAllActive: PropTypes.func
// }