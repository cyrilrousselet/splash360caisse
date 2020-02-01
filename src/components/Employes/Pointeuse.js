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

let strings = new LocalizedStrings(data);



const ChangeEmploye = ({open, closePopin}) => (

  <Modal open={open}>
    <div className="ChangeEmploye">
      <div className="Modal-container">
        <div className="header">
          <div className="title">Change Employé</div>
        </div>
        <div className="body">
          <LoginCont inPopin={true} popinAction={ closePopin } />
        </div>
      </div>
      <Fab aria-label="close" size="small" className="close-button" onClick={ closePopin }>
        <CloseIcon />
      </Fab>
    </div>
  </Modal>
);


class Pointeuse extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      jour: format(new Date(), 'eeee d MMMM', { locale: frLocale }),
      heure: format(new Date(), 'HH:mm:ss', { locale: frLocale }),
      popinOpen: false
    }
  }


  componentDidMount() {
    this.intervalID = setInterval(
        () => this.tick(),
        1000
    );
  }
  componentWillUnmount() {
      clearInterval(this.intervalID);
  }
  tick() {
      this.setState({
        jour: format(new Date(), 'eeee d MMMM', { locale: frLocale }),
        heure: format(new Date(), 'HH:mm:ss', { locale: frLocale })
      });
  }

 

 render() {

  const { jour, heure, popinOpen } = this.state;

  const closePopin = () => {
    this.setState({popinOpen:false});
  }
  const openPopin = () => {
    this.setState({popinOpen:true});
  }

  return (
    <div className="Pointeuse">
      <div className="zoneBoutons">
        <div className="buttons">
          <StdButton identifier="btnretour" elementclass="btnretour" key="btnretour" text="Retour" onClick={ () => { history.push(paths.EMPLOYES) }} />
        </div>
        <div className="titre">Pointeuse</div>
        <div className="search"></div>
      </div>
      <div className="zoneliste">
        <div class="wrapper">
          <div className="horloge">
            <div className="jour">{ jour }</div>
            <div className="heure">{ heure }</div>
          </div>
          <div className="boutons">
             <LargeButton identifier='btnarrivee' elementclass='btnarrivee' icon={ false } text={ 'Arrivée' } onClick={() => void(0) }></LargeButton>
             <LargeButton identifier='btndepart' elementclass='btndepart' icon={ false } text={ 'Départ' } onClick={() => void(0) }></LargeButton>
          </div>
          <div class="change"><LargeButton identifier='btnchange' elementclass='btnchange' icon={ false } text={ 'Autre employé' } onClick={openPopin}></LargeButton></div>
        </div>
      </div>
      <ChangeEmploye open={popinOpen} closePopin={closePopin} />
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