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
      personnalisationOpen: false,
      personnalisationReview: false,
      personnalisationStep: -1,
      commandeItemToPersonnalize: null
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
  openPersonnalisation(itemid, stepid, from='chaipas') {
    console.log('openPersonnalisation('+itemid+', '+stepid+', '+from+')');
    this.setState({personnalisationOpen: true, personnalisationStep: stepid, commandeItemToPersonnalize: itemid});
  }
  closePersonnalisation(from='chaipas') {
    console.log('closePersonnalisation('+from+')');
    this.setState({personnalisationOpen: false, personnalisationStep: -1});
  }

 render () {

    console.log('personnalisationOpen : '+this.state.personnalisationOpen);
    return (
      <div className="Encaissement container">
        <TopZone />
        <div className="MainZone">
          <SelecteurCont />
          <PanierCont 
            openReglement={ this.openReglement } 
            openPersonnalisation={ this.openPersonnalisation } 
            closePersonnalisation={ this.closePersonnalisation } 
            open={ this.state.reglementOpen } 
            itemToPersonnalize={ this.state.commandeItemToPersonnalize } 
          />
          <ReglementCont 
            open={ this.state.reglementOpen } 
            contClass="EncaissementReglement" 
            closeReglement={ this.closeReglement } 
          />
          <PersonnalisationCont 
            open={ this.state.personnalisationOpen } 
            step={ this.state.personnalisationStep } 
            item={ this.state.commandeItemToPersonnalize }
            contClass="EncaissementPersonnalisation" 
            closePersonnalisation={ this.closePersonnalisation } 
          />
        </div>
      </div>
    );
   }
}

export default Encaissement;