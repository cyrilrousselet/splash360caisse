import React from 'react';
import PropTypes from 'prop-types';


import { Modal, Fab } from '@material-ui/core';
import CloseIcon from '../common/icon/CloseIcon';
import StdButton from '../common/StdButton';

import LocalizedStrings from 'react-localization';
import {data} from '../../constants/translations';

import history from '../../helpers/history';
import paths from '../../constants/routes';

import fakeliste from '../../assets/images/fake_stocks_fournisseurs.svg';

let strings = new LocalizedStrings(data);

class Paies extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      vue: 'jour',
      start: null
    }

  }

  componentDidMount() {
    this.props.getUser();
    this.props.getAllPointages();
  }

  render() {

    const { users, pointages } = this.props;


    return (
      <div className="Paies">
        <div className="zoneBoutons">
          <div className="buttons">
            <StdButton identifier="btnretour" elementclass="btnretour" key="btnretour" text="Retour" onClick={ () => { history.push(paths.EMPLOYES) }} />
            <StdButton identifier="btnnew" elementclass="btnnew" key="btnnew" text="Nouveau" onClick={ () => void(0) } />
          </div>
          <div className="titre">Paies</div>
          <div className="search"></div>
        </div>
        <div className="zoneliste">
          <div class="wrapper">
    liste
          </div>
        </div>
      </div>
    );
  }
}
export default Paies;

// Paies.propTypes = {
//   catalogue: PropTypes.array,
//   loading: PropTypes.bool,
//   error: PropTypes.string,
//   getAllActive: PropTypes.func
// }