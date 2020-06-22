import React from 'react';
import PropTypes from 'prop-types';

import { isDev } from 'electron-is-dev';

import { Modal, Fab, List, ListItem, Button } from '@material-ui/core';
import { differenceInMilliseconds, isBefore, endOfDay } from 'date-fns';
import StdButton from '../common/StdButton';
import CloseIcon from '../common/icon/CloseIcon';
import EspecesIcon from '../common/icon/EspecesIcon';
import TicketIcon from '../common/icon/TicketIcon';
import CarteIcon from '../common/icon/CarteIcon';
import ChequeIcon from '../common/icon/ChequeIcon';
import Calculette from './Calculette';
import LocalizedStrings from 'react-localization';
import {data} from '../../constants/translations';
import Swal from 'sweetalert2';
import PillButton from '../common/PillButton';
import QRCodeIcon from '../common/icon/QRCodeIcon';
import { endOfToday } from 'date-fns/esm';
import { decodetable } from '../../constants/decodetable';

let strings = new LocalizedStrings(data);


const RACCOURCIS = [5,10,20,50];

class Reglement extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      total: 0,
      input: false,
      trlist: []
    }
    this.addValeur = this.addValeur.bind(this);
    this.calculetteClick = this.calculetteClick.bind(this);
    this.deleteCalculette = this.deleteCalculette.bind(this);

    this.updateValeurs = this.updateValeurs.bind(this);

    this.beforeCloseReglement = this.beforeCloseReglement.bind(this);
    this.toAddReglement = this.toAddReglement.bind(this);
    this.toRemoveReglement = this.toRemoveReglement.bind(this);

    this.closeTiroir = this.closeTiroir.bind(this);

    this.scanHandler = this.scanHandler.bind(this);
    this.decodeQRCode = this.decodeQRCode.bind(this);
    this.parseTR = this.parseTR.bind(this);
    this.parseAvoir = this.parseAvoir.bind(this);

    this.createAvoir = this.createAvoir.bind(this);
  }

  interval = 0;

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
    let __i = true;
    switch (value) {
      case 'c':
        __t = 0;
        __i = false;
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
    this.setState({total:__t, input: __i});
  }

  deleteCalculette() {
    this.setState({total: 0, input: false});
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

    const { modif } = this.props;
    const { reste, rendu } = this.updateValeurs();
    const { trlist } = this.state;
    console.log(reste, rendu);
    if (reste==0) {
      if (this.props.commande.status=='pending') {
        this.props.commande.end = new Date();
        this.props.commande.chrono = Math.round(differenceInMilliseconds(this.props.commande.end, this.props.commande.start)/10)/100;
      }

      // si on encaisse une commande déjà produite, 
      // on ne réimprime pas les tickets de production (ms seulmt 'commande')
      if (this.props.commande.status=='a_encaisser') {
        this.props.printTicket({templates:['commande']});
      }
      this.props.commande.status = 'confirmed';

      // on imprime tous les tickets (sauf si on modifie juste les réglements)
      if (!modif) this.props.printTicket('all');

      // enregistrement des TR en base (pour contrôle ultérieur)
      if (trlist.length>0) this.props.persistTicketsRestaurants(trlist);
      this.props.validateCommande(this.props.commande);

    }
    this.setState({input: false});
    this.props.closeReglement();
  }


  toAddReglement(moyen, valeur=-1, info=null) {


    const { addReglement, openDrawer, params, modif } = this.props;

    let montant = 0;
    const { reste } = this.updateValeurs();
    if (valeur==-1) {
      const {input, total} = this.state;
      montant = input ? total : reste;
    } else {
      montant = valeur;
    }

    // lors de la modif d'encaissement, 
    // le montant du réglement ne peut pas être supérieur à la somme à régler
    if (modif && montant>reste) {
      Swal.fire({
        title: strings.modules.encaissement.reglement.erreur.modif.depassement.titre,
        html: strings.modules.encaissement.reglement.erreur.modif.depassement.texte,
        showCancelButton: false,
        focusCancel: false,
        focusConfirm: true
      })
    } else {
      
      if (montant > 0) {
        addReglement({moyen: moyen, valeur: montant, info:info});
        const { reste } = this.updateValeurs();
        if (moyen=='especes') openDrawer();
        if (moyen=='ticket' && reste<0) openDrawer();
        this.setState({total: 0, input: false});

        // s'il ne reste rien à payer ni à rendre, 
        // on ferme l'encaissement et on valide la commande
        if (reste==0) this.beforeCloseReglement();

      }
    }
  }

  toRemoveReglement(id) {

    const { trlist } = this.state;
    const { reglements } = this.props.commande;

    const rgt = reglements.find(r=>r.reglementId==id);
    if (rgt && rgt.moyen=='ticket') {
      this.setState({trlist: trlist.filter(t => t!=rgt.info)});
    }

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


  scanHandler(event) {
    if (event.keyCode==13) {
      console.log(event.target.value);
      const decoded_string = this.decodeQRCode(event.target.value);

      if (decoded_string.substr(0,3)==='cdt') {
        this.parseAvoir(decoded_string)
      } else {
        this.parseTR(decoded_string)
      }
      
      event.target.value = '';
    }
  }


  decodeQRCode(value) {

    const platform = process.platform=='darwin' ? 'darwin' : 'win';

    let decoded = '';
    for (let caractere of value) {
      if (!decodetable[platform].hasOwnProperty(caractere)) {
        continue;
      }
      decoded += decodetable[platform][caractere];
    }
    return decoded;
  }


  parseTR(value) {
    const { trlist } = this.state;
    let error = '';

    const __value = String(value);

    const __trValue = Number(__value.substr(11,5)) / 100;
    const __trValid = Number(__value.substr(16,2));

    const __now = new Date().getFullYear() - 2000;

    if (trlist.indexOf(__value)!==-1) error = 'yet';
    if (__trValid<__now) error = 'deprecated';

    if (error==='') {
      this.toAddReglement('ticket',__trValue, value);
      this.setState({ trlist: [...trlist, __value] });
    } else {
      if (error=='deprecated') {
        Swal.fire({
          type: 'warning',
          title: strings.modules.encaissement.reglement.erreur.ticket[error].titre,
          html: strings.modules.encaissement.reglement.erreur.ticket[error].texte,
          showCancelButton: false,
          focusCancel: false,
          focusConfirm: true
        });
      }
    }

    console.log('tr', __trValue, __trValid);

  }


  parseAvoir(value) {
    console.log('avoirID', value);

    const { avoirs, updateAvoir, commande } = this.props;
    let error = '';
    const avoir = avoirs.find(av => av.code==value);
    // s'il y a un avoir correspondant au code
    // on vérifie qu'il n'a pas déjà été utilisé
    // et qu'il n'est pas périmé
    // AJOUTER ICI : la vérification du client
    if (avoir) {
     if (avoir.hasOwnProperty('burnt')) error = 'burnt';
     if (isBefore(endOfDay(new Date(avoir.limite)), endOfToday())) error = 'deprecated';
    //  if (avoir.client && avoir.client!==commande.client_id) error = 'client';
    } else {
      error = 'inconnu';
    }

    if (error==='') {
      this.toAddReglement('avoir', avoir.valeur, avoir.avoir_id);
      updateAvoir({
        avoir_id: avoir.avoir_id, 
        burnt: new Date().getTime()
      });
    } else {

      Swal.fire({
        type: 'warning',
        title: strings.modules.encaissement.reglement.erreur.avoir[error].titre,
        html: strings.modules.encaissement.reglement.erreur.avoir[error].texte,
        showCancelButton: false,
        focusCancel: false,
        focusConfirm: true
      });
    }
  }

  createAvoir(montant) {

    const { commande, createAvoir, addRendu } = this.props;

    createAvoir({
      client_id: null,
      ticket_id: commande.ticketId,
      valeur: montant
    });
    addRendu({moyen:'avoir', valeur: montant});

    this.closeTiroir();
  }


  render() {

    const { open, valueToPay, contClass, closeReglement, addReglement, addRendu, tiroirOuvert, params, modif } = this.props;
    const { items, reglements, rendus } = this.props.commande;
    const { paye, reste, rendable } = this.updateValeurs();
    const { total, input, inputTarget } = this.state;
    
    const aAfficher = input ? total : Math.max(0,reste);


    // gestion du focus sur le champ de recherche (scan QR code)
    clearInterval(this.interval);
    
    const self = this;
    if (open) {      
      this.interval = setInterval(() => {
        if (self.refs.trInput) self.refs.trInput.focus();
      },500);
    } else {
      clearInterval(this.interval);
      this.interval = 0;
    }


    
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
            <input className="tr-input" ref="trInput" onKeyUp={this.scanHandler} /> 
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
                          info={ rgl.info }
                          removeItem={ this.toRemoveReglement } />
                  )}
                  { (undefined !== rendus) &&
                      rendus.map((rgl,i) => 
                        (undefined!==rgl) && <RenduListeItem
                            id={ i } 
                            renduid={ rgl.renduId.toString() }
                            key={ i }
                            moyen={ rgl.moyen }
                            valeur={ rgl.valeur } />
                    )}
                </List>
              </div>
              {/* affichage du trop perçu : affiche si on peut rendre ou non la monnaie */}
              <div className={ (reste<0 && rendable) ? 'trop-percu rendable' : 'trop-percu' }>
              { (reste<0) && 
                <div className="libelle"> 
                {rendable && strings.modules.encaissement.reglement.liste.rendre }
                {(!rendable && params.avoirs) && <PillButton elementclass="create-avoir" onClick={()=>{this.createAvoir((0-reste))}} text={strings.modules.encaissement.reglement.liste.create_avoir} />}
                {(!rendable && !params.avoirs) && strings.modules.encaissement.reglement.liste.trop }
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
                { params.avoirs && <StdButton identifier="avoir" elementclass={ `moyen avr`} icon={ <QRCodeIcon htmlColor="#ffffff" /> } text={ strings.modules.encaissement.reglement.moyens.avoir } onClick={(value) => { this.toAddReglement(value) }} /> }
              </div>
            </div>
          </div>
        </div>
        { (null==reglements || reglements.length==0) &&
        <Fab aria-label="close" size="small" className="close-button" onClick={ this.beforeCloseReglement }>
          <CloseIcon />
        </Fab>
        }
        { (modif && reste==0) &&
        <Fab aria-label="close" size="small" className="close-button" onClick={ closeReglement }>
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


const RenduListeItem = ({id, renduid, moyen, valeur}) => (
  <div className="RenduListeItem">
    <ListItem 
      disableGutters
      >
      <div className="rnditm moyen">{ strings.modules.encaissement.reglement.moyens[moyen] }</div> 
      <div className="rnditm valeur">{ `-${valeur.toFixed(2).replace('.',',')}` }</div>
    </ListItem>
  </div>
);


const ReglementListeItem = ({id, reglementid, moyen, valeur, info, removeItem}) => (
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
  info: PropTypes.string,
  _onClick: PropTypes.func
};