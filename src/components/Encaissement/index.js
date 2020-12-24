import React from 'react';

import TopZone from '../../containers/TopZone';
import SelecteurCont from '../../containers/SelecteurCont';
import PanierCont from '../../containers/PanierCont';
import ReglementCont from '../../containers/ReglementCont';
import PersonnalisationCont from '../../containers/PersonnalisationCont';
import Logger from '../../helpers/Logger';

const logger = new Logger();

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
      commandeItemToPersonnalize: null,
      lockEncaissement: true,
    };
    this.openReglement = this.openReglement.bind(this);
    this.closeReglement = this.closeReglement.bind(this);
    this.openPersonnalisation = this.openPersonnalisation.bind(this);
    this.closePersonnalisation = this.closePersonnalisation.bind(this);
    this.validatePersonnalisation = this.validatePersonnalisation.bind(this);
    this.unlockEncaissement = this.unlockEncaissement.bind(this);
  }

  openReglement() {
    this.setState({reglementOpen: true});
  }
  closeReglement() {
    this.setState({reglementOpen: false});
  }
  openPersonnalisation(itemid, stepid, previousstepid, nextstepid, stepvalidated, itemstatus, from='unknown') {
    logger.log('openPersonnalisation(item:'+itemid+', stepid:'+stepid+', previd:'+previousstepid+', nextid:'+nextstepid+', itmstatus:'+itemstatus+', (from:'+from+'))');
    this.setState({
      personnalisationOpen: true, 
      personnalisationStep: stepid, 
      personnalisationPreviousStep: previousstepid, 
      personnalisationNextStep: nextstepid, 
      personnalisationValide: stepvalidated,
      personnalisationStatus: itemstatus,
      commandeItemToPersonnalize: itemid,
      personnalisationReview: from==='item' ? itemid : null,
    });
  }
  closePersonnalisation(from='unknown') {
    logger.log('closePersonnalisation('+from+')');
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
  unlockEncaissement() {
    logger.log('Enc.unlockEncaissement()');
    this.setState({lockEncaissement: false});
  }

 render () {

  // logger.log('encaissement state', this.state.personnalisationReview);
  logger.log('encaissement lock', this.state.lockEncaissement);

    return (
      <div className="Encaissement container">
        <TopZone />
        <div className="MainZone">
          { this.state.lockEncaissement && (<div className="selecteur-wait"></div>) }
          { !this.state.lockEncaissement && (<SelecteurCont />) }
          <PanierCont 
            openReglement={ this.openReglement } 
            closeReglement={ this.closeReglement } 
            openPersonnalisation={ this.openPersonnalisation } 
            closePersonnalisation={ this.closePersonnalisation } 
            allowInput={ !this.state.reglementOpen }
         //   validatePersonnalisation={ this.validatePersonnalisation }
            open={ this.state.reglementOpen } 
            unlockEncaissement={ this.unlockEncaissement }
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