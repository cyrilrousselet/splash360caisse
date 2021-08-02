import React from 'react';

import TopZone from '../../containers/TopZone';
import SelecteurCont from '../../containers/SelecteurCont';
import PanierCont from '../../containers/PanierCont';
import ReglementCont from '../../containers/ReglementCont';
import PersonnalisationCont from '../../containers/PersonnalisationCont';
// import Logger from '../../helpers/Logger';
import logger from '../../helpers/Logger';

// const logger = new Logger();

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
    logger.info('openPersonnalisation(item:'+itemid+', stepid:'+stepid+', previd:'+previousstepid+', nextid:'+nextstepid+', itmstatus:'+itemstatus+', (from:'+from+'))');
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
    logger.info('closePersonnalisation('+from+')');
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
    logger.info('Enc.unlockEncaissement()');
    this.setState({lockEncaissement: false});
  }

 render () {

  const { parametres } = this.props;
  const layout = (parametres.options && parametres.options.hasOwnProperty('encaissement_layout')) ? parametres.options.encaissement_layout : 'normal';

  // logger.info('encaissement state', this.state.personnalisationReview);
  logger.info('encaissement lock', this.state.lockEncaissement);

    return (
      <div className={ `Encaissement container ${(layout==='narrow' ? 'encaissement-narrow' : 'encaissement-normal')}` }>
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
            layout={layout}
          />
        </div>
      </div>
    );
   }
}

export default Encaissement;