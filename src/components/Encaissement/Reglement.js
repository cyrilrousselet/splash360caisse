import React from 'react';
import PropTypes from 'prop-types';

import { Modal, Fab, List, ListItem, Button } from '@material-ui/core';
import { differenceInMilliseconds } from 'date-fns';
import StdButton from '../common/StdButton';
import CloseIcon from '../common/icon/CloseIcon';
import EspecesIcon from '../common/icon/EspecesIcon';
import TicketIcon from '../common/icon/TicketIcon';
import CarteIcon from '../common/icon/CarteIcon';
import ChequeIcon from '../common/icon/ChequeIcon';
import Calculette from './Calculette';
import LocalizedStrings from 'react-localization';
import {data} from '../../constants/translations';
let strings = new LocalizedStrings(data);

const RACCOURCIS = [5,10,20,50];

class Reglement extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      total: 0,
      input: false
    }
    this.addValeur = this.addValeur.bind(this);
    this.calculetteClick = this.calculetteClick.bind(this);
    this.deleteCalculette = this.deleteCalculette.bind(this);

    this.updateValeurs = this.updateValeurs.bind(this);

    this.beforeCloseReglement = this.beforeCloseReglement.bind(this);
    this.toAddReglement = this.toAddReglement.bind(this);
    this.toRemoveReglement = this.toRemoveReglement.bind(this);

    this.closeTiroir = this.closeTiroir.bind(this);
  }

  componentDidMount() {
    const { getCommande, commandeId } = this.props;
    getCommande(commandeId);
  }

  addValeur(value) {
    let __t = Number(this.state.total) + Number(value);
    console.log('addValeur : +'+value);
    this.setState({total:__t, input: true});
    this.toAddReglement('especes', value);
  }

  calculetteClick(value) {
    let __t = this.state.total;
    switch (value) {
      case 'c':
        __t = 0;
        break;
      case '00':
        __t *= 100;
        break;
      case '0':
        __t *= 10;
        break;
      default:
        __t = (__t*10) + (value/100);
    }
    this.setState({total:__t, input: true});
  }

  deleteCalculette() {
    this.setState({total: 0, input: true});
  }

  updateValeurs() {

    const { reglements, rendus, items } = this.props.commande;
    
    // déjà payé (réglements)
    let __paye = 0;
    let __especes = 0;
    if (undefined!==reglements) {
      reglements.forEach(rgl => {
        __paye += rgl.valeur;
        if (rgl.moyen==='especes') __especes += rgl.valeur;
      });
    }
    let __rendu = 0;
    if (undefined!==rendus) {
      rendus.forEach(rnd => {
        __rendu += rnd.valeur;
      });
    }
    
    // montant à payer (somme des items)
    let __total = this.props.valueToPay;

    let __reste = (__total - __paye + __rendu);

    // payé, montant à payer et reste à payer (ou rendu monnaie si négatif)
    // s'il y a un trop perçu, peut-on le rendre sur les especes ?
    return {
      paye: __paye, 
      apayer: __total, 
      reste: __reste,
      rendu: __rendu,
      rendable: (__reste < 0 && __especes+__reste>0)
    };

  }

  beforeCloseReglement() {

    const { reste, rendu } = this.updateValeurs();
    console.log(reste, rendu);
    if (reste==0) {
      console.warn('!!! DEV - rétablir l’impression des tickets');
      this.props.printTicket('commande');
      this.props.printTicket('sac');
      this.props.printTicket('cuisine');
      if (this.props.commande.status=='pending') {
        this.props.commande.end = new Date();
        this.props.commande.chrono = Math.round(differenceInMilliseconds(this.props.commande.end, this.props.commande.start)/10)/100;
      }
      this.props.commande.status = 'confirmed';
      this.props.validateCommande(this.props.commande);
    }

    this.props.closeReglement();
  }


  toAddReglement(moyen, valeur=-1) {

    let montant = 0;
    if (valeur==-1) {
      const {input, total} = this.state;
      const { reste } = this.updateValeurs();
      montant = input ? total : reste;
    } else {
      montant = valeur;
    }

    if (montant > 0) {
      this.props.addReglement({moyen: moyen, valeur: montant});
      const { reste } = this.updateValeurs();
      if (moyen=='especes') this.props.openDrawer();
      this.setState({total: 0, input: false});

      // s'il ne reste rien à payer ni à rendre, 
      // on ferme l'encaissement et on valide la commande
      if (reste==0) this.beforeCloseReglement();

    }
  }

  toRemoveReglement(id) {
    this.props.removeReglement({reglementId: id});
  }

  // --- DEV / TEMPORAIRE ---
  /*
  le tiroir s'ouvre dès qu'un réglement en espèce est ajouté 
  (cette propriété doit être paramétrable pour permettre l'ouverture du tiroir également pour les CB, les chèques et les TR)
  on considère que l'action de fermeture du tiroir correspond au rendu-monnaie (s'il y a un trop perçu — reste>0)
  DONC une fermeture de tiroir doit être matérialisée par la création d'un rendu ('especes' si reste>0)
  */
  closeTiroir() {
    this.props.closeDrawer();
    const { reste, rendable } = this.updateValeurs();
    if (reste<0 && rendable) this.props.addRendu({moyen:'especes', valeur: -reste});
    this.beforeCloseReglement();
  }


  render() {

    const { open, valueToPay, contClass, closeReglement, addReglement, addRendu, tiroirOuvert } = this.props;
    const { items, reglements } = this.props.commande;
    const { paye, reste, rendable } = this.updateValeurs();
    const { total, input } = this.state;
    
    const aAfficher = input ? total : Math.max(0,reste);
    
    return (
    <Modal
      open={open}
      >
      <div className={ `Reglement ${contClass}`}>
        <div className="Modal-container">
          <div className="header">
            <div className="title">{ strings.modules.encaissement.reglement.titre }</div>
            {/* { tiroirOuvert && 
            <Button variant="outlined" size="small" style={{alignSelf:'flex-end',position:"absolute"}} className="fermeture-tiroir" onClick={ () => this.closeTiroir() }>Fermeture tiroir</Button>
            } */}
          </div>
          <div className="body">
            <div className="calculette">
              <Calculette total={ aAfficher } buttonHandler={ this.calculetteClick } deleteHandler={ this.deleteCalculette } />
            </div>
            <div className="liste">
              <div className="liste-header">
                <div className="lhdr lhdr-nom">{ strings.modules.encaissement.reglement.liste.titre }</div>
              </div>
              <div className="wrapper">
                <List
                  disablePadding
                >
                { (undefined !== reglements) &&
                    reglements.map((rgl,i) => 
                      (undefined!==rgl) && <ReglementListeItem
                          id={ i } 
                          reglementid={ rgl.reglementId.toString() }
                          key={ i }
                          moyen={ rgl.moyen }
                          valeur={ rgl.valeur }
                          removeItem={ this.toRemoveReglement } />
                  )}
                </List>
              </div>
              {/* affichage du trop perçu : affiche si on peut rendre ou non la monnaie */}
              <div className={ (reste<0 && rendable) ? 'trop-percu rendable' : 'trop-percu' }>
              { (reste<0) && 
                <div className="libelle"> 
                {rendable && strings.modules.encaissement.reglement.liste.rendre }
                {!rendable && strings.modules.encaissement.reglement.liste.trop }
                </div>
              }
              { (reste<0) && <div className="reste">{ (0-reste).toFixed(2).replace('.',',') }</div> }
              </div>
            </div>
            <div className="boutons">
              <div className="raccourcis">
                { RACCOURCIS.map((racc,i) =>
                  <StdButton identifier={ `${racc}` } key={i} elementclass="raccourci" icon={ false } text={ strings.modules.encaissement.reglement.raccourcis[i] } onClick={(value) => { this.addValeur(Number(value)) }} />
                  )}
              </div>
              <div className="moyens">
                  <StdButton identifier="especes" elementclass="moyen" icon={ <EspecesIcon /> } text={ strings.modules.encaissement.reglement.moyens.especes } onClick={(value) => { this.toAddReglement(value) }} />
                  <StdButton identifier="ticket" elementclass="moyen" icon={ <TicketIcon /> } text={ strings.modules.encaissement.reglement.moyens.ticket } onClick={(value) => { this.toAddReglement(value) }} />
                  <StdButton identifier="carte" elementclass="moyen" icon={ <CarteIcon /> } text={ strings.modules.encaissement.reglement.moyens.carte } onClick={(value) => { this.toAddReglement(value) }} />
                  <StdButton identifier="cheque" elementclass="moyen" icon={ <ChequeIcon /> } text={ strings.modules.encaissement.reglement.moyens.cheque } onClick={(value) => { this.toAddReglement(value) }} />
              </div>
            </div>
          </div>
        </div>
        { (null==reglements || reglements.length==0) &&
        <Fab aria-label="close" size="small" className="close-button" onClick={ this.beforeCloseReglement }>
          <CloseIcon />
        </Fab>
        }
         { tiroirOuvert && 
          <Fab aria-label="close" size="small" className="close-button" onClick={ () => this.closeTiroir() }>
          <CloseIcon />
        </Fab>
          // <Button variant="outlined" size="small" style={{alignSelf:'flex-end',position:"absolute"}} className="fermeture-tiroir" onClick={ () => this.closeTiroir() }>Fermeture tiroir</Button>
          }
      </div>
    </Modal>
    );
  }

}

export default Reglement;

Reglement.propTypes = {
  open: PropTypes.bool,
  tiroirOuvert: PropTypes.bool,
  valueToPay: PropTypes.number.isRequired,
  closeReglement: PropTypes.func.isRequired,
  validateCommande: PropTypes.func.isRequired,
  commande: PropTypes.object.isRequired,
  getCommande: PropTypes.func.isRequired,
  addReglement: PropTypes.func.isRequired,
  addRendu: PropTypes.func.isRequired,
  printTest: PropTypes.func.isRequired,
  printTicket: PropTypes.func.isRequired,
  openDrawer: PropTypes.func.isRequired,
  closeDrawer: PropTypes.func,
};


const ReglementListeItem = ({id, reglementid, moyen, valeur, removeItem}) => (
  <div className="ReglementListeItem">
    <ListItem 
      disableGutters
      >
      <div className="ritm moyen">{ strings.modules.encaissement.reglement.moyens[moyen] }</div> 
      <div className="ritm valeur">{ valeur.toFixed(2).replace('.',',') }</div> 
      <Fab aria-label="remove" size="small" className="ritm removebtn" onClick={ () => { removeItem(reglementid) } }>
          <CloseIcon htmlColor="#FFFFFF" />
      </Fab>
    </ListItem>
  </div>
);

ReglementListeItem.propTypes = {
  id: PropTypes.number.isRequired,
  reglementid: PropTypes.string.isRequired,
  moyen: PropTypes.string.isRequired,
  valeur: PropTypes.number,
  _onClick: PropTypes.func
};