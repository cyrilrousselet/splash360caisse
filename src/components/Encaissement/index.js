import React from 'react';

import TopZone from '../../containers/TopZone';
import SelecteurCont from '../../containers/SelecteurCont';
import PanierCont from '../../containers/PanierCont';
import ReglementCont from '../../containers/ReglementCont';
import PersonnalisationCont from '../../containers/PersonnalisationCont';

class Encaissement extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      reglementOpen: false,
      personnalisationOpen: false
    };
    this.openReglement = this.openReglement.bind(this);
    this.closeReglement = this.closeReglement.bind(this);
    this.openPersonnalisation = this.openPersonnalisation.bind(this);
    this.closePersonnalisation = this.closePersonnalisation.bind(this);
  }

  openReglement() {
    this.setState({reglementOpen: true});
  }
  closeReglement() {
    this.setState({reglementOpen: false});
  }
  openPersonnalisation() {
    this.setState({personnalisationOpen: true});
  }
  closePersonnalisation() {
    this.setState({personnalisationOpen: false});
  }

 render () {
    return (
      <div className="Encaissement container">
        <TopZone />
        <div className="MainZone">
          <SelecteurCont />
          <PanierCont openReglement={ this.openReglement } open={ this.state.reglementOpen } />
          <ReglementCont open={ this.state.reglementOpen } contClass="EncaissementReglement" closeReglement={ this.closeReglement } />
          <PersonnalisationCont open={ this.state.personnalisationOpen } contClass="EncaissementPersonnalisation" closePersonnalisation={ this.closePersonnalisation } />
        </div>
      </div>
    );
   }
}

export default Encaissement;