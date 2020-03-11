import React from 'react';
import PropTypes from 'prop-types';

import LocalizedStrings from 'react-localization';
import {data} from '../../constants/translations';
import TopZone from '../../containers/TopZone';
import LoadingSpinner from './../common/LoadingSpinner';

import contimage from '../../assets/images/fake_contenu_cloture.svg';
import comptageimage from '../../assets/images/fake_contenu_cloturecomptage.svg';
import comptcaisseimage from '../../assets/images/fake_contenu_cloturecomptcaisse.svg';
import { Modal, Fab } from '@material-ui/core';
import CloseIcon from '../common/icon/CloseIcon';
import StdButton from '../common/StdButton';
import { format } from "date-fns";
import frLocale from "date-fns/locale/fr";

let strings = new LocalizedStrings(data);


const ClotureComptage = ({open, closeComptage, openComptcaisse}) => (

    <Modal open={open}>
      <div className="ClotureComptage">
        <div className="Modal-container">
          <div className="header">
            <div className="title">{ strings.modules.encaissement.reglement.titre }</div>
          </div>
          <div className="body">
            <div className="blocbg"></div>
            <img src={ comptageimage } className="contimage" />
            <div className="btncomptcaisse" onClick={ openComptcaisse}></div>
            <StdButton identifier="btncomptcaisse" elementclass="btncomptcaisse" key="btncomptcaisse" text="Compte Caisse" onClick={ openComptcaisse } />
            <StdButton identifier="btncomptverif" elementclass="btncomptverif" key="btncomptverif" text="Vérification" onClick={ closeComptage} />
          </div>
        </div>
        <Fab aria-label="close" size="small" className="close-button" onClick={ closeComptage }>
          <CloseIcon />
        </Fab>
      </div>
    </Modal>
);

const ClotureComptcaisse = ({open, closeComptcaisse}) => (

  <Modal open={open}>
    <div className="ClotureComptcaisse">
      <div className="Modal-container">
        <div className="header">
          <div className="title">{ strings.modules.encaissement.reglement.titre }</div>
        </div>
        <div className="body">
          <img src={ comptcaisseimage } className="contimage" />
        </div>
        <div className="footer">
          <StdButton identifier="comptcaisseverif" elementclass="btncomptcaisseverif" key="comptcaisseverif" text="Vérification" onClick={ closeComptcaisse} />
        </div>
      </div>
      <Fab aria-label="close" size="small" className="close-button" onClick={ closeComptcaisse }>
        <CloseIcon />
      </Fab>
    </div>
  </Modal>
);


class Cloture extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      comptageOpen:false,
      comptcaisseOpen:false
    }
    this.shouldComponentRender = this.shouldComponentRender.bind(this);
    this.openComptage = this.openComptage.bind(this);
    this.closeComptage = this.closeComptage.bind(this);
    this.openComptcaisse = this.openComptcaisse.bind(this);
    this.closeComptcaisse = this.closeComptcaisse.bind(this);
  }

  componentDidMount() {
    const { getCommandesList, getCurrentPeriode } = this.props;
    // getCommandesList();
    getCurrentPeriode();
  }

 shouldComponentRender() {
 //  const {loading} = this.props;
 //  if(loading===false) return false;
   return true;
 }

 openComptage() {
  this.setState({comptageOpen:true, comptcaisseOpen:false});
}
 closeComptage() {
   this.setState({comptageOpen:false});
 }

 openComptcaisse() {
  this.setState({comptageOpen:false, comptcaisseOpen:true});
}
closeComptcaisse() {
   this.setState({comptcaisseOpen:false, comptageOpen:true});
 }

  render() {

    const { periode, error, loading, printPeriodeX } = this.props;

    const { comptageOpen, comptcaisseOpen} = this.state;

    const __strimp = strings.modules.cloture.impression;

    if(!this.shouldComponentRender()) {
      return <LoadingSpinner />
    }

    if (!periode.hasOwnProperty('debut')) {
      return <LoadingSpinner />
    }


    let vndvnt = 0, vndrmb = 0, vndtotal = 0;
    periode.ventilation.vendeur.forEach(vendeur => {
        vndvnt += vendeur.ventes;
        vndrmb += vendeur.remboursements;
        vndtotal += (vendeur.ventes-vendeur.remboursements);
    });


    let tvaht = 0, tvamnt = 0, tvattc = 0;
    periode.ventilation.tva.forEach(tva => { 
        tvaht += tva.ht;
        tvamnt += tva.montant;
        tvattc += tva.ttc;
    });

    let moytotal = 0;
    periode.ventilation.moyen.forEach(moyen => { 
        moytotal += moyen.valeur;
    });

    return (
      <div className="Cloture container">
        <TopZone />
        <div className="MainZone">
          <div className="clo-gauche">
            <div className="blocgauche">
              <StdButton identifier="btnreprint" elementclass="btnreprint" key="btnreprint" text="Ré-imprimer" disabled={true} onClick={ () => void(0) } />
              <StdButton identifier="btncomptage" elementclass="btncomptage" key="btncomptage" text="Comptage" disabled={true} onClick={ this.openComptage } />
            </div>
            <StdButton identifier="btnx" elementclass="btnx" key="btnx" text="Imprime X Caisse" onClick={ () => { console.log('printPeriodeX()'); printPeriodeX() } } />
          </div>
          <div className="clo-centre">
            <div className="bloccentre">
              <div className="blocwrapper">
                <div className="periode">
                  <div className="ttl">{ __strimp.periode.titre }</div>
                  <div className="val">{ `${format(periode.debut, "dd/MM/yyyy - HH:mm:ss", { locale: frLocale })}  ->  ${format(periode.fin, "dd/MM/yyyy - HH:mm:ss", { locale: frLocale })}` }</div>
                  <div className="editeur">{ `${__strimp.editeur} ${periode.editeur.nom} (${periode.editeur.id})` }</div>
                </div>
                <div className="sel">
                  {(periode.vendeurs.length>1) && (<div className="val">{ `${__strimp.vendeurs[1]}${strings.vendeurs_all}` }</div>)}
                  {(periode.vendeurs.length==1) && (<div className="val">{ `${__strimp.vendeurs[0]}${periode.vendeurs[0].nom} (${periode.vendeurs[0].id})` }</div>)}
                  {(periode.caisses.length>1) && (<div className="val">{ `${__strimp.caisses[1]}${strings.caisses_all}` }</div>)}
                  {(periode.caisses.length==1) && (<div className="val">{ `${__strimp.caisses[0]}${periode.caisses[0].nom} (${periode.caisses[0].id})` }</div>)}
                </div>
                <div className="recap">
                  <div className="recap-item">
                    <div className="nom">{ __strimp.depenses }</div>
                    <div className="val">{ Number(periode.depenses).toFixed(2).replace('.',',') }</div>
                  </div>
                  <div className="recap-item">
                    <div className="nom">{ __strimp.remboursements }</div>
                    <div className="val">{ Number(periode.remboursements).toFixed(2).replace('.',',') }</div>
                  </div>
                  <div className="recap-item">
                    <div className="nom">{ __strimp.encaissements }</div>
                    <div className="val">{ Number(periode.ventes).toFixed(2).replace('.',',') }</div>
                  </div>
                  <div className="recap-item">
                    <div className="nom">{ __strimp.mtcaisse }</div>
                    <div className="val">{ Number(periode.mtcaisse).toFixed(2).replace('.',',') }</div>
                  </div>
                </div>
                <div className="titre">
                  { __strimp.titre.x }
                </div>
                <div className="detail">
                  <div class="detail-item">
                    <div className="nom">{__strimp.caption.ventes}</div>
                    <div className="val">{Number(periode.ventes).toFixed(2).replace('.',',')}</div>
                  </div>
                  <div class="detail-item">
                    <div className="nom">{__strimp.caption.remboursements}</div>
                    <div className="val">{`-${Number(periode.remboursements).toFixed(2).replace('.',',')}`}</div>
                  </div>
                  <div class="detail-item pre-filet post-space">
                    <div className="nom">{__strimp.caption.ca}</div>
                    <div className="val">{Number(periode.ca).toFixed(2).replace('.',',')}</div>
                  </div>
                  <div class="detail-item total">
                    <div className="nom">{__strimp.caption.numtickets}</div>
                    <div className="val">{periode.numtickets}</div>
                  </div>
                  <div class="detail-item total">
                    <div className="nom">{__strimp.caption.ticket_moyen}</div>
                    <div className="val">{Number(periode.ticket_moyen).toFixed(2).replace('.',',')}</div>
                  </div>
                </div>
                <div className="titre">
                  { __strimp.ventilation.vendeur }
                </div>
                <div className="ventil intit ventil-vendeur">
                  <div class="ventil-intit"></div>
                  <div class="ventil-intit">{__strimp.caption.vente_short}</div>
                  <div class="ventil-intit">{__strimp.caption.remboursements_short}</div>
                  <div class="ventil-intit">{__strimp.caption.ca_short}</div>
                </div>
                {periode.ventilation.vendeur.map(vendeur => (
                  <div className="ventil ventil-vendeur">
                    <div class="ventil-nom">{`${vendeur.nom} (${vendeur.id})`}</div>
                    <div class="ventil-val">{Number(vendeur.ventes).toFixed(2).replace('.',',')}</div>
                    <div class="ventil-val">{`-${Number(vendeur.remboursements).toFixed(2).replace('.',',')}`}</div>
                    <div class="ventil-val">{Number(vendeur.ventes-vendeur.remboursements).toFixed(2).replace('.',',')}</div>
                  </div>
                ))}
                <div className="ventil ventil-vendeur total">
                  <div class="ventil-nom">{__strimp.caption.total}</div>
                  <div class="ventil-val">{Number(vndvnt).toFixed(2).replace('.',',')}</div>
                  <div class="ventil-val">{`-${Number(vndrmb).toFixed(2).replace('.',',')}`}</div>
                  <div class="ventil-val">{Number(vndtotal).toFixed(2).replace('.',',')}</div>
                </div>
                <div className="titre">
                  { __strimp.ventilation.tva }
                </div>
                <div className="ventil intit ventil-tva">
                  <div class="ventil-intit">{__strimp.caption.type}</div>
                  <div class="ventil-intit">{__strimp.caption.ht}</div>
                  <div class="ventil-intit">{__strimp.caption.tva}</div>
                  <div class="ventil-intit">{__strimp.caption.ttc}</div>
                </div>
                {periode.ventilation.tva.map(tva => (
                  <div className="ventil ventil-vendeur">
                    <div class="ventil-nom">{`${Number(tva.taux*100).toFixed(2).replace('.',',')}%`}</div>
                    <div class="ventil-val">{Number(tva.ht).toFixed(2).replace('.',',')}</div>
                    <div class="ventil-val">{Number(tva.montant).toFixed(2).replace('.',',')}</div>
                    <div class="ventil-val">{Number(tva.ttc).toFixed(2).replace('.',',')}</div>
                  </div>
                ))}
                <div className="ventil ventil-vendeur total">
                  <div class="ventil-nom">{__strimp.caption.total}</div>
                  <div class="ventil-val">{Number(tvaht).toFixed(2).replace('.',',')}</div>
                  <div class="ventil-val">{Number(tvamnt).toFixed(2).replace('.',',')}</div>
                  <div class="ventil-val">{Number(tvattc).toFixed(2).replace('.',',')}</div>
                </div>
                <div className="titre">
                  { __strimp.ventilation.moyen }
                </div>
                {periode.ventilation.moyen.map(moyen => (
                  <div className="ventil ventil-vendeur">
                    <div class="ventil-nom">{__strimp.caption.moyens[moyen.moyen]}</div>
                    <div class="ventil-val">{Number(moyen.valeur).toFixed(2).replace('.',',')}</div>
                  </div>
                ))}
                <div className="ventil ventil-vendeur total">
                  <div class="ventil-nom">{__strimp.caption.total}</div>
                  <div class="ventil-val">{Number(moytotal).toFixed(2).replace('.',',')}</div>
                </div>
              </div>
            </div> {/* /.bloccentre */}

          </div> {/* /.clo-centre */}
          <div className="clo-droite">
            <div className="blocdroite"></div>
            <StdButton identifier="btncloture" elementclass="btncloture" key="btncloture" text="Clôture Z" disabled={true} onClick={ () => void(0) } />
          </div>
        </div>
        <ClotureComptage open={comptageOpen} closeComptage={this.closeComptage} openComptcaisse={this.openComptcaisse} />
        <ClotureComptcaisse open={comptcaisseOpen} closeComptcaisse={this.closeComptcaisse} />
      </div>
    );
  }
}
export default Cloture;

Cloture.propTypes = {
//   catalogue: PropTypes.array,
//   loading: PropTypes.bool,
//   error: PropTypes.string,
//   getAllActive: PropTypes.func
}