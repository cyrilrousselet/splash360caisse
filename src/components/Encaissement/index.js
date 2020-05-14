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
      personnalisationValide: false,
      personnalisationStatus: '',
      personnalisationStep: -1,
      personnalisationPreviousStep: -1,
      personnalisationNextStep: -1,
      commandeItemToPersonnalize: null
    };
    this.openReglement = this.openReglement.bind(this);
    this.closeReglement = this.closeReglement.bind(this);
    this.openPersonnalisation = this.openPersonnalisation.bind(this);
    this.closePersonnalisation = this.closePersonnalisation.bind(this);
    this.validatePersonnalisation = this.validatePersonnalisation.bind(this);
  }

  openReglement() {
    this.setState({reglementOpen: true});
  }
  closeReglement() {
    this.setState({reglementOpen: false});
  }
  openPersonnalisation(itemid, stepid, previousstepid, nextstepid, stepvalidated, itemstatus, from='unknown') {
    console.log('openPersonnalisation(item:'+itemid+', stepid:'+stepid+', previd:'+previousstepid+', nextid:'+nextstepid+', itmstatus:'+itemstatus+', (from:'+from+'))');
    this.setState({
      personnalisationOpen: true, 
      personnalisationStep: stepid, 
      personnalisationPreviousStep: previousstepid, 
      personnalisationNextStep: nextstepid, 
      personnalisationValide: stepvalidated,
      personnalisationStatus: itemstatus,
      commandeItemToPersonnalize: itemid,
      personnalisationReview: from=='item' ? itemid : null
    });
  }
  closePersonnalisation(from='unknown') {
    console.log('closePersonnalisation('+from+')');
    this.setState({personnalisationOpen: false, personnalisationStep: -1, commandeItemToPersonnalize: null, personnalisationReview:null});
  }

  validatePersonnalisation() {

    const { personnalisationReview } = this.state;
    if (personnalisationReview) {
      this.setState({personnalisationReview: null});
    }

  }
  // validatePersonnalisation(validstep, from='unknown') {
  //   this.setState({personnalisationValide:validstep});
  // }  

 render () {

    console.log('encaissement state', this.state.personnalisationReview);

    return (
      <div className="Encaissement container">
        <TopZone />
        <div className="MainZone">
          <SelecteurCont />
          <PanierCont 
            openReglement={ this.openReglement } 
            openPersonnalisation={ this.openPersonnalisation } 
            closePersonnalisation={ this.closePersonnalisation } 
         //   validatePersonnalisation={ this.validatePersonnalisation }
            open={ this.state.reglementOpen } 
            forcePersonnalisationItem={this.state.personnalisationReview}
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
            previousstep={ this.state.personnalisationPreviousStep }
            nextstep={ this.state.personnalisationNextStep }
            valide={ this.state.personnalisationValide }
            item={ this.state.commandeItemToPersonnalize }
            forcePersonnalisationItem={ this.state.personnalisationReview }
            itemstatus={ this.state.personnalisationStatus }
            contClass="EncaissementPersonnalisation" 
            validatePersonnalisation={ this.validatePersonnalisation }
            closePersonnalisation={ this.closePersonnalisation } 
            openPersonnalisation={ this.openPersonnalisation }
          />
        </div>
      </div>
    );
   }
}

export default Encaissement;