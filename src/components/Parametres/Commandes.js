import React from 'react';
import PropTypes from 'prop-types';
import LoadingSpinner from '../common/LoadingSpinner';

import LocalizedStrings from 'react-localization';
import {data} from '../../constants/translations';
let strings = new LocalizedStrings(data);

class Commandes extends React.Component {


  componentDidMount() {
    console.log('Dashboard.componentDidMount()');
    this.props.getCommandesList();
  }

 render() {
  const { commandeslist, error, loading } = this.props;

  if(loading) {
    return <LoadingSpinner />
  }

  if (undefined === commandeslist) {
    return (
      <div className="Commandes subcontent">
        <div className="SelecteurEmpty">{ strings.modules.encaissement.selecteur.empty }</div>
      </div>
    );
  }
 
  return (
   <div className="Commandes subcontent">
    {Object.keys(commandeslist).map(ticketId =>
    <div className="commande-item" key={ticketId}>
      <div className="id">{ `#${ticketId}` }</div>
      <div className="created">{ commandeslist[ticketId].createdAt }</div>
      <div className="montant">{ `${commandeslist[ticketId].total.toFixed(2).replace('.',',')} €` }</div>
    </div>
    )}
   </div>
  );
 }
};

export default Commandes;

Commandes.propTypes = {
  commandeslist: PropTypes.object,
  getCommandesList: PropTypes.func.isRequired
};




