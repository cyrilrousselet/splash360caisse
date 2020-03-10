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

    return (
      <div className="Cloture container">
        <TopZone />
        <div className="MainZone">
          <div className="clo-gauche">
            <div className="blocgauche">
              <StdButton identifier="btnreprint" elementclass="btnreprint" key="btnreprint" text="Ré-imprimer" onClick={ () => void(0) } />
              <StdButton identifier="btncomptage" elementclass="btncomptage" key="btncomptage" text="Comptage" onClick={ this.openComptage } />
            </div>
            <StdButton identifier="btnx" elementclass="btnx" key="btnx" text="Imprime X Caisse" onClick={ () => { console.log('printPeriodeX()'); printPeriodeX() } } />
          </div>
          <div className="clo-centre">
            <div className="bloccentre">
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
            </div> {/* /.bloccentre */}
  {/*            
  //           // EN-TÊTE:
  //   // récap montants :
  //   printer
  //     .tableCustom([
  //       {text: strings.depenses, cols:30, align:'LEFT'},
  //       {text: Number(data.depenses).toFixed(2).replace('.',','), cols:18, align:'RIGHT'}
  //     ])
  //     .tableCustom([
  //       {text: strings.remboursements, cols:30, align:'LEFT'},
  //       {text: Number(data.remboursements).toFixed(2).replace('.',','), cols:18, align:'RIGHT'}
  //     ])
  //     .tableCustom([
  //       {text: strings.encaissements, cols:30, align:'LEFT'},
  //       {text: Number(data.ventes).toFixed(2).replace('.',','), cols:18, align:'RIGHT'}
  //     ])
  //     .tableCustom([
  //       {text: strings.mtcaisse, cols:30, align:'LEFT'},
  //       {text: Number(data.mtcaisse).toFixed(2).replace('.',','), cols:18, align:'RIGHT'}
  //     ])
  //     .feed(1);

  // // CORPS
  //   // titre0
  //   printer
  //     .drawLine()
  //     .align('CT')
  //     .style('B')
  //     .text(strings.titre.x)
  //     .drawLine();
    
  //   // recap :
  //   printer
  //   .style('NORMAL')
  //   .tableCustom([
  //     {text: strings.caption.ventes, cols:25, align:'LEFT'},
  //     {text: Number(data.ventes).toFixed(2).replace('.',','), cols:15, align:'RIGHT'},
  //     {text: '2#', cols:8, align:'RIGHT'}
  //   ])
  //   .tableCustom([
  //     {text: strings.caption.remboursements, cols:25, align:'LEFT'},
  //     {text: "-"+Number(data.remboursements).toFixed(2).replace('.',','), cols:15, align:'RIGHT'},
  //     {text: '1#', cols:8, align:'RIGHT'}
  //   ])
  //   .drawLine()
  //   .tableCustom([
  //     {text: strings.caption.ca, cols:25, align:'LEFT'},
  //     {text: "-"+Number(data.ca).toFixed(2).replace('.',','), cols:15, align:'RIGHT'},
  //     {text: '3#', cols:8, align:'RIGHT'}
  //   ])
  //   .feed(1)
  //   .tableCustom([
  //     {text: '', cols:5, align:'LEFT'},
  //     {text: strings.caption.numtickets, cols:20, align:'LEFT'},
  //     {text: data.numtickets, cols:15, align:'RIGHT'},
  //     {text: '', cols:8, align:'RIGHT'}
  //   ])
  //   .tableCustom([
  //     {text: '', cols:5, align:'LEFT'},
  //     {text: strings.caption.ticket_moyen, cols:20, align:'LEFT'},
  //     {text: Number(data.ticket_moyen).toFixed(2).replace('.',','), cols:15, align:'RIGHT'},
  //     {text: '', cols:8, align:'RIGHT'}
  //   ])
  //   .drawLine()
  //   ;

  //   // ventilation par caissier
  //   printer
  //     .align('CT')
  //     .style('B')
  //     .text(strings.ventilation.vendeur)
  //     .drawLine();

  //   let vndvnt = 0;
  //   let vndrmb = 0;
  //   let vndtotal = 0;

  //   printer
  //     .tableCustom([
  //       {text: '', cols:21, align:'LEFT'},
  //       {text: strings.caption.vente_short, cols:9, align:'RIGHT'},
  //       {text: strings.caption.remboursements_short, cols:9, align:'RIGHT'},
  //       {text: strings.caption.ca_short, cols:9, align:'RIGHT'}
  //     ]);

  //   data.ventilation.vendeur.forEach(vendeur => {
      
  //     printer
  //       .style('NORMAL')
  //       .tableCustom([
  //         {text: vendeur.nom+' ('+vendeur.id+')', cols:21, align:'LEFT'},
  //         {text: Number(vendeur.ventes).toFixed(2).replace('.',','), cols:9, align:'RIGHT'},
  //         {text: '-'+Number(vendeur.remboursements).toFixed(2).replace('.',','), cols:9, align:'RIGHT'},
  //         {text: Number(vendeur.ventes-vendeur.remboursements).toFixed(2).replace('.',','), cols:9, align:'RIGHT'}
  //       ]);
  //       vndvnt += vendeur.ventes;
  //       vndrmb += vendeur.remboursements;
  //       vndtotal += (vendeur.ventes-vendeur.remboursements);
  //   });

  //   printer
  //     .feed(1)
  //     .tableCustom([
  //       {text: strings.caption.total, cols:21, align:'LEFT'},
  //       {text: Number(vndvnt).toFixed(2).replace('.',','), cols:9, align:'RIGHT'},
  //       {text: '-'+Number(vndrmb).toFixed(2).replace('.',','), cols:9, align:'RIGHT'},
  //       {text: Number(vndtotal).toFixed(2).replace('.',','), cols:9, align:'RIGHT'}
  //     ]);

  //   // ventilation par TVA
  //   printer
  //     .drawLine()
  //     .align('CT')
  //     .style('B')
  //     .text(strings.ventilation.tva)
  //     .drawLine();

  //   let tvaht = 0;
  //   let tvamnt = 0;
  //   let tvattc = 0;

  //   printer
  //     .tableCustom([
  //       {text: strings.caption.type, cols:9, align:'LEFT'},
  //       {text:'', cols:3},
  //       {text: strings.caption.ht, cols:10, align:'RIGHT'},
  //       {text:'', cols:3},
  //       {text: strings.caption.tva, cols:10, align:'RIGHT'},
  //       {text:'', cols:3},
  //       {text: strings.caption.ttc, cols:10, align:'RIGHT'}
  //     ]);

  //   data.ventilation.tva.forEach(tva => { 
  //     printer
  //       .style('NORMAL')
  //       .tableCustom([
  //         {text: Number(tva.taux*100).toFixed(2).replace('.',',')+'%', cols:9, align:'LEFT'},
  //         {text:'', cols:3},
  //         {text: Number(tva.ht).toFixed(2).replace('.',','), cols:10, align:'RIGHT'},
  //         {text:'', cols:3},
  //         {text: Number(tva.montant).toFixed(2).replace('.',','), cols:10, align:'RIGHT'},
  //         {text:'', cols:3},
  //         {text: Number(tva.ttc).toFixed(2).replace('.',','), cols:10, align:'RIGHT'}
  //       ]);
  //       tvaht += tva.ht;
  //       tvamnt += tva.montant;
  //       tvattc += tva.ttc;
  //   });

  //   printer
  //   .feed(1)
  //   .tableCustom([
  //     {text: strings.caption.total, cols:9, align:'LEFT'},
  //     {text:'', cols:3},
  //     {text: Number(tvaht).toFixed(2).replace('.',','), cols:10, align:'RIGHT'},
  //     {text:'', cols:3},
  //     {text: Number(tvamnt).toFixed(2).replace('.',','), cols:10, align:'RIGHT'},
  //     {text:'', cols:3},
  //     {text: Number(tvattc).toFixed(2).replace('.',','), cols:10, align:'RIGHT'}
  //   ]);


  //   // ventilation par moyen de paiement
  //   printer
  //     .drawLine()
  //     .align('CT')
  //     .style('B')
  //     .text(strings.ventilation.moyen)
  //     .drawLine();

  //   let moytotal = 0;

  //   data.ventilation.moyen.forEach(moyen => { 
  //     printer
  //       .style('NORMAL')
  //       .tableCustom([
  //         {text: strings.caption.moyens[moyen.moyen], cols:30, align:'LEFT'},
  //         {text: Number(moyen.valeur).toFixed(2).replace('.',','), cols:18, align:'RIGHT'}
  //       ]);
  //       moytotal += moyen.valeur;
  //   });

  //   printer
  //   .feed(1)
  //   .tableCustom([
  //     {text: strings.caption.total, cols:30, align:'LEFT'},
  //     {text: Number(moytotal).toFixed(2).replace('.',','), cols:18, align:'RIGHT'}
  //   ]);
  */}


          </div> {/* /.clo-centre */}
          <div className="clo-droite">
            <div className="blocdroite"></div>
            <StdButton identifier="btncloture" elementclass="btncloture" key="btncloture" text="Clôture Z" onClick={ () => void(0) } />
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