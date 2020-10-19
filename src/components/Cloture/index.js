import React from 'react';

import LocalizedStrings from 'react-localization';
import {data} from '../../constants/translations';
import TopZone from '../../containers/TopZone';
import LoadingSpinner from './../common/LoadingSpinner';

import { FormControl, Select, MenuItem } from '@material-ui/core';
import StdButton from '../common/StdButton';
import { startOfToday, endOfToday, parseJSON, format, startOfDay, endOfDay } from 'date-fns';
import DateFnsUtils from '@date-io/date-fns';
import { MuiPickersUtilsProvider, KeyboardDatePicker } from '@material-ui/pickers';
import frLocale from "date-fns/locale/fr";
import Swal from 'sweetalert2';

import { clotureServices } from './../../services/cloture/clotureServices';

import Comptage from './Comptage';

import { devise } from './../../helpers/toolbox';
import NumberKeyboard from '../common/NumberKeyboard';

import Logger from '../../helpers/Logger';


import history from '../../helpers/history';
import paths from '../../constants/routes';


const logger = new Logger();
let strings = new LocalizedStrings(data);

class LocalizedUtils extends DateFnsUtils {
  getDatePickerHeaderText(date) {
    return format(date, "d MMM yyyy", { locale: this.locale });
  }
}


class Cloture extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      comptageOpen:false,
      comptcaisseOpen:false,
      comptage: null,
      selection_operator:{id: 'allope', nom:'Toutes les caisses'},
      selection_caisse:{id:'allcash', nom:'Toutes les caisses'},
      keyboardOpen: false,
      fieldvalue: '',
      activeField: null,
      saisie_prelevement: '0',
      saisie_comptage: '',
      prelevement: 0,
      startDate: startOfToday(),
      endDate: endOfToday()
    }
    this.shouldComponentRender = this.shouldComponentRender.bind(this);
    this.openComptage = this.openComptage.bind(this);
    this.closeComptage = this.closeComptage.bind(this);
    this.openComptcaisse = this.openComptcaisse.bind(this);
    this.closeComptcaisse = this.closeComptcaisse.bind(this);
    this.getListeVendeurs = this.getListeVendeurs.bind(this);
    this.getListeCaisses = this.getListeCaisses.bind(this);
    this.selectCaisse = this.selectCaisse.bind(this);
    this.selectVendeur = this.selectVendeur.bind(this);
    this.validComptage = this.validComptage.bind(this);
    this.openCommandesListe = this.openCommandesListe.bind(this);
    this.startSaisie = this.startSaisie.bind(this);
    this.keyboardButtonHandler = this.keyboardButtonHandler.bind(this);
    this.closeKeyboard = this.closeKeyboard.bind(this);
    this.prepareCloture = this.prepareCloture.bind(this);
    this.printLastCloture = this.printLastCloture.bind(this);
    this.setSelectedDate = this.setSelectedDate.bind(this);
  }

  componentDidMount() {
    const { getCurrentPeriode, getCloturesList } = this.props;
    // getCommandesList();
    //parametres :
    let params = {};
    const { selection_caisse, selection_operator, startDate, endDate } = this.state;
    if (selection_caisse.id!=='allcash') params['caisses'] = [selection_caisse];
    if (selection_operator.id!=='allope') params['vendeurs'] = [selection_operator];
    params['debut'] = startDate;
    params['fin'] = endDate;
    getCurrentPeriode(params);
    getCloturesList();
//    getParametres();
  }

  shouldComponentRender() {
  //  const {loading} = this.props;
  //  if(loading===false) return false;
    return true;
  }

  openComptage(periode_z) {

    if (periode_z.standby>0) {
      Swal.fire({
        title: strings.modules.cloture.alerte.standby.titre,
        text: strings.modules.cloture.alerte.standby.texte,
        focusConfirm: true,
        showCancelButton: true,
        customClass: 'standbycommandes',
        confirmButtonText: 'OK',
        cancelButtonText: strings.general.dialog.cancel,
        buttonsStyling: false 
      }).then((result)=> {
        this.setState({comptageOpen:true, comptcaisseOpen:false});
      });
    } else {
      this.setState({comptageOpen:true, comptcaisseOpen:false});
    }
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

  getListeVendeurs() {
    const { listeCommandes } = this.props;
    let operators = {'allope':{id:'allope', nom:strings.modules.cloture.selection.vendeur_all}};
    Object.entries(listeCommandes).forEach(([id,commande]) => {
      if (!operators.hasOwnProperty(commande.operator.id)) {
        operators[commande.operator.id] = commande.operator;
      }
    });
    return operators;
  }
  getListeCaisses() {
    const { listeCommandes } = this.props;
    let caisses = {'allcash':{id:'allcash', nom:strings.modules.cloture.selection.caisse_all}};
    Object.entries(listeCommandes).forEach(([id,commande]) => {
      if (!caisses.hasOwnProperty(commande.caisse.id)) {
        caisses[commande.caisse.id] = commande.caisse;
      }
    });
    return caisses;
  }

  selectCaisse(event) {

    const caisses = this.getListeCaisses();

    const selection = caisses[event.target.value];
    this.setState({selection_caisse: selection});
    
    let params = {};
    const {selection_operator} = this.state;
    params['caisses'] = selection.id==="allcash" ? [] : [selection];
    if (selection_operator.id!=='allope') params['vendeurs'] = [selection_operator];
    this.props.getCurrentPeriode(params);
  }

  selectVendeur(event) {

    const vendeurs = this.getListeVendeurs();
    const selection = vendeurs[event.target.value];
    this.setState({selection_operator: selection});

    let params = {};
    const {selection_caisse} = this.state;
    params['vendeurs'] = selection.id==="allope" ? [] : [selection];
    if (selection_caisse.id!=='allcash') params['caisses'] = [selection_caisse];
    this.props.getCurrentPeriode(params);
  }

  validComptage(comptageobject) {
    logger.log('validComptage()', comptageobject);
//    this.setState({comptage: valeur, comptageOpen: false});
    this.setState({comptage: comptageobject});
  }
  openCommandesListe() {
    logger.log('openCommandesListe()');
  }
  startSaisie(field) {
    logger.log('startSaisie',field);
    let comptage = this.state.comptage;
    if (field==='saisie_comptage') {
      comptage = null;
    }
    this.setState({keyboardOpen: true, comptage: comptage, fieldvalue: this.state[field], activeField: field});
  }

  // action on buttons (fill in passphrase)
  keyboardButtonHandler(text) {
    const { fieldvalue } = this.state;
    if (text!=='c') {
      this.setState({fieldvalue: String(fieldvalue)+text});
    } else {
      this.setState({fieldvalue: String(fieldvalue).slice(0,-1)});
    }
  }

  closeKeyboard() {
    const { fieldvalue, activeField } = this.state;
    const newval = ['saisie_prelevement','saisie_comptage'].indexOf(activeField)===-1 ? Number(fieldvalue) : fieldvalue.replace(',','.');
    this.setState({keyboardOpen: false, [activeField]:newval});
  }


  prepareCloture(prelevement, comptagemanuel) {
    const { selection_operator, selection_caisse, comptage, startDate, endDate } = this.state;
    
    let params = {};
    if (selection_caisse.id!=='allcash') params['caisses'] = [selection_caisse];
    if (selection_operator.id!=='allope') params['vendeurs'] = [selection_operator];
    params['comptage'] = (comptage!==null) ? comptage : {total:comptagemanuel};
    params['prelevement'] = prelevement;
    params['debut'] = startDate;
    params['fin'] = endDate;

    if (selection_caisse.id!=='allcash' || selection_operator.id!=='allope') {
      Swal.fire({
        title: strings.modules.cloture.alerte.partielle.titre,
        text: strings.modules.cloture.alerte.partielle.texte,
        focusConfirm: true,
        showCancelButton: true,
        customClass: 'cloturepartielle',
        confirmButtonText: 'OK',
        cancelButtonText: strings.general.dialog.cancel,
        buttonsStyling: false 
      }).then((result)=> {
        this.props.makeCloture(params);
      });
    }
    else {
      this.props.makeCloture(params);
    }
  }

  printLastCloture() {
    const { clotures, printLastCloture } = this.props;
    printLastCloture(Object.values(clotures).pop());
  }

  setSelectedDate(bound,date) {
    const { startDate, endDate } = this.state;
    if (bound==='start') {
      this.setState({startDate:(date<=endDate)?startOfDay(date):endDate});
    }
    if (bound==='end') {
      this.setState({endDate:(date>=startDate)?endOfDay(date):startDate});
    }
  }

  render() {

    const { periode, clotures, printPeriodeX, listeCommandes, catalogue, fonddecaissetheo } = this.props;

    const { saisie_prelevement, saisie_comptage, activeField, comptageOpen, comptage, selection_caisse, selection_operator, keyboardOpen, fieldvalue, startDate, endDate} = this.state;



    let params = {
      user: periode.editeur,
      caisses: [],
      vendeurs: [],
      fdcaisse: fonddecaissetheo,
      debut: startDate,
      fin: endDate,
      extract: 'z'
    }

    // logger.log('listeCommandes', Object.values(listeCommandes).length);

    if (selection_caisse.id!=='allcash') params['caisses'] = [selection_caisse];
    if (selection_operator.id!=='allope') params['vendeurs'] = [selection_operator];
    const periode_z = clotureServices.getCurrentPeriode(listeCommandes, catalogue, params);
    // logger.log("periode_z", periode_z);

    const __strimp = strings.modules.cloture.impression;

    const operators = this.getListeVendeurs();
    const caisses = this.getListeCaisses();

  //  const prelevement_fv = keyboardOpen ? fieldvalue.replace(',','.') : prelevement;

    // la valeur doit être une chaîne avec 
    const prelevement_fv = activeField==='saisie_prelevement' ? String(fieldvalue).replace(',','.') : saisie_prelevement;
    const comptage_fv = activeField==='saisie_comptage' ? String(fieldvalue).replace(',','.') : saisie_comptage;

    logger.log('fieldvalue', activeField, fieldvalue);
    logger.log('comptage', comptage);
    logger.log('prelevement_fv l.258', prelevement_fv);

    const comptage_total = (null!==comptage) ? comptage.total : Number(comptage_fv);
    const fdcaisse_new = (null!==comptage) ? devise(comptage.total-Number(prelevement_fv.replace(',','.'))) : devise(Number(comptage_fv)-Number(prelevement_fv.replace(',','.')));
    
    // logger.log('operators', operators);
    // logger.log('caisses', caisses);

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

    const lastCloture = Object.values(clotures).pop();

    return (
      <div className="Cloture container">
        <TopZone />
        <div className="MainZone">
          <div className="clo-gauche">
            <div className="blocgauche">
              <div class="blocgauche-wrapper">
                <div className="zone-lastcloture">
                  <div className="titre">{ strings.modules.cloture.derniere.titre }</div>
                  {(lastCloture && 
                  <div className="itmliste">
                    <div className="item item-date">
                      <div className="label">{ strings.modules.cloture.derniere.caption.date }</div>
                      <div className="valeur">{ format(parseJSON(lastCloture.archived), 'dd/MM/yyyy') }</div>
                    </div>
                    <div className="item item-heure">
                      <div className="label">{ strings.modules.cloture.derniere.caption.heure }</div>
                      <div className="valeur">{ format(parseJSON(lastCloture.archived), 'HH:mm:ss') }</div>
                    </div>
                    <div className="item item-editeur">
                      <div className="label">{ strings.modules.cloture.derniere.caption.editeur }</div>
                      <div className="valeur">{ `${lastCloture.periode.editeur.nom} (${lastCloture.periode.editeur.id})` }</div>
                    </div>
                  </div>
                  )}
                  {(lastCloture==null && 
                    <div className="no-item">{ strings.modules.cloture.derniere.aucune }</div>  
                  )}
                  <StdButton identifier="btnreprint" elementclass="btnreprint" key="btnreprint" text="Ré-imprimer" disabled={null==lastCloture} onClick={ () => { this.printLastCloture()} } />
                  <StdButton identifier="btnliste" elementclass="btnliste" key="btnliste" text="Liste des clôtures" onClick={ () => { history.push(paths.LISTECLOTURES) } } />
                </div>
                <div className="zone-selecteur">
                  <MuiPickersUtilsProvider utils={LocalizedUtils} locale={ frLocale }>
                    <div className="label-inline">
                      <div className="label">{ strings.modules.cloture.selection.debut }</div>
                      <KeyboardDatePicker
                        className="datepicker"
                        id="debutdatepicker"
                        margin="normal"
                        value={ params.debut }
                        format="d MMM yyyy"
                        onChange={date => { this.setSelectedDate('start', date) }}
                        KeyboardButtonProps={{ 'aria-label': 'change date' }}
                        clearLabel={ strings.general.dialog.clear }
                        cancelLabel={ strings.general.dialog.cancel }
                        />
                    </div>
                    <div className="label-inline">
                      <div className="label">{ strings.modules.cloture.selection.fin }</div>
                      <KeyboardDatePicker
                        className="datepicker"
                        id="findatepicker"
                        margin="normal"
                        value={ params.fin }
                        format="d MMM yyyy"
                        onChange={date => { this.setSelectedDate('end', date) }}
                        KeyboardButtonProps={{ 'aria-label': 'change date' }}
                        clearLabel={ strings.general.dialog.clear }
                        cancelLabel={ strings.general.dialog.cancel }
                        />
                    </div>
                  </MuiPickersUtilsProvider>
                  <div className="label">{ strings.modules.cloture.selection.caisse }</div>
                  <FormControl variant="outlined" className="selecteur-caisse">
                    <Select value={selection_caisse.id} onChange={this.selectCaisse} className="selecteur selecteur-caisse-select">
                      {Object.values(caisses).map(cash => (
                        <MenuItem key={ `cashitm${cash.id}`} value={cash.id}>{cash.nom}</MenuItem>
                        ))}
                    </Select>
                  </FormControl>
                  <div className="label">{ strings.modules.cloture.selection.vendeur }</div>
                  <FormControl variant="outlined" className="selecteur-vendeur">
                    <Select value={selection_operator.id} onChange={this.selectVendeur} className="selecteur selecteur-vendeur-select">
                      {Object.values(operators).map(ope => (
                        <MenuItem key={ `opeitm${ope.id}`} value={ope.id}>{ope.nom}</MenuItem>
                        ))}
                    </Select>
                  </FormControl>
                </div>
                <StdButton identifier="btncomptage" elementclass="btncomptage" key="btncomptage" text={(selection_caisse.id!=='allcash' || selection_operator.id!=='allope') ? strings.modules.cloture.selection.comptagebtn_partiel : strings.modules.cloture.selection.comptagebtn } disabled={periode_z.cmdtoarchive.length===0} onClick={ () => {this.openComptage(periode_z) }} />
              </div>
            </div>
            <StdButton identifier="btnx" elementclass="btnx" key="btnx" text={(selection_caisse.id!=='allcash' || selection_operator.id!=='allope') ? strings.modules.cloture.print_partiel : strings.modules.cloture.print_x } onClick={ () => { logger.log('printPeriodeX()'); printPeriodeX() } } />
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
                  {(periode.vendeurs.length===1) && (<div className="val">{ `${__strimp.vendeurs[0]}${periode.vendeurs[0].nom} (${periode.vendeurs[0].id})` }</div>)}
                  {(periode.caisses.length>1) && (<div className="val">{ `${__strimp.caisses[1]}${strings.caisses_all}` }</div>)}
                  {(periode.caisses.length===1) && (<div className="val">{ `${__strimp.caisses[0]}${periode.caisses[0].nom} (${periode.caisses[0].id})` }</div>)}
                </div>
                <div className="recap">
                  <div className="recap-item">
                    <div className="nom">{ __strimp.depenses }</div>
                    <div className="val">{ devise(periode.depenses) }</div>
                  </div>
                  <div className="recap-item">
                    <div className="nom">{ __strimp.remboursements }</div>
                    <div className="val">{ devise(periode.remboursements) }</div>
                  </div>
                  <div className="recap-item">
                    <div className="nom">{ __strimp.encaissements }</div>
                    <div className="val">{ devise(periode.ventes) }</div>
                  </div>
                  <div className="recap-item">
                    <div className="nom">{ __strimp.mtcaisse }</div>
                    <div className="val">{ devise(periode.mtcaisse) }</div>
                  </div>
                </div>
                <div className="titre">
                  { __strimp.titre.x }
                </div>
                <div className="detail">
                  <div className="detail-item">
                    <div className="nom">{__strimp.caption.ventes}</div>
                    <div className="val">{devise(periode.ventes)}</div>
                  </div>
                  <div className="detail-item">
                    <div className="nom">{__strimp.caption.remboursements}</div>
                    <div className="val">{`-${devise(periode.remboursements)}`}</div>
                  </div>
                  <div className="detail-item pre-filet post-space">
                    <div className="nom">{__strimp.caption.ca}</div>
                    <div className="val">{devise(periode.ca)}</div>
                  </div>
                  <div className="detail-item total">
                    <div className="nom">{__strimp.caption.numtickets}</div>
                    <div className="val">{periode.numtickets}</div>
                  </div>
                  <div className="detail-item total">
                    <div className="nom">{__strimp.caption.ticket_moyen}</div>
                    <div className="val">{devise(periode.ticket_moyen)}</div>
                  </div>
                </div>
                <div className="titre">
                  { __strimp.ventilation.vendeur }
                </div>
                <div className="ventil intit ventil-vendeur">
                  <div className="ventil-intit"></div>
                  <div className="ventil-intit">{__strimp.caption.vente_short}</div>
                  <div className="ventil-intit">{__strimp.caption.remboursements_short}</div>
                  <div className="ventil-intit">{__strimp.caption.ca_short}</div>
                </div>
                {periode.ventilation.vendeur.map(vendeur => (
                  <div className="ventil ventil-vendeur" key={`vnd-${vendeur.id}`}>
                    <div className="ventil-nom">{`${vendeur.nom} (${vendeur.id})`}</div>
                    <div className="ventil-val">{devise(vendeur.ventes)}</div>
                    <div className="ventil-val">{`-${devise(vendeur.remboursements)}`}</div>
                    <div className="ventil-val">{devise(vendeur.ventes-vendeur.remboursements)}</div>
                  </div>
                ))}
                <div className="ventil ventil-vendeur total">
                  <div className="ventil-nom">{__strimp.caption.total}</div>
                  <div className="ventil-val">{devise(vndvnt)}</div>
                  <div className="ventil-val">{`-${devise(vndrmb)}`}</div>
                  <div className="ventil-val">{devise(vndtotal)}</div>
                </div>
                <div className="titre">
                  { __strimp.ventilation.tva }
                </div>
                <div className="ventil intit ventil-tva">
                  <div className="ventil-intit">{__strimp.caption.type}</div>
                  <div className="ventil-intit">{__strimp.caption.ht}</div>
                  <div className="ventil-intit">{__strimp.caption.tva}</div>
                  <div className="ventil-intit">{__strimp.caption.ttc}</div>
                </div>
                {periode.ventilation.tva.map(tva => (
                  <div className="ventil ventil-vendeur" key={ `ventil-${tva.id}` }>
                    {/* <div className="ventil-nom">{`${devise(tva.taux*100)}%`}</div> */}
                    <div className="ventil-nom">{tva.taux}</div>
                    <div className="ventil-val">{devise(tva.ht)}</div>
                    <div className="ventil-val">{devise(tva.montant)}</div>
                    <div className="ventil-val">{devise(tva.ttc)}</div>
                  </div>
                ))}
                <div className="ventil ventil-vendeur total">
                  <div className="ventil-nom">{__strimp.caption.total}</div>
                  <div className="ventil-val">{devise(tvaht)}</div>
                  <div className="ventil-val">{devise(tvamnt)}</div>
                  <div className="ventil-val">{devise(tvattc)}</div>
                </div>
                <div className="titre">
                  { __strimp.ventilation.moyen }
                </div>
                {periode.ventilation.moyen.map(moyen => (
                  <div className="ventil ventil-vendeur" key={ `ventil-${moyen.moyen}` }>
                    <div className="ventil-nom">{__strimp.caption.moyens[moyen.moyen]}</div>
                    <div className="ventil-val">{devise(moyen.valeur)}</div>
                  </div>
                ))}
                <div className="ventil ventil-vendeur total">
                  <div className="ventil-nom">{__strimp.caption.total}</div>
                  <div className="ventil-val">{devise(moytotal)}</div>
                </div>
              </div>
            </div> {/* /.bloccentre */}

          </div> {/* /.clo-centre */}
          <div className="clo-droite">
            <div className="blocdroite">
              <div className="droite-top">

              <div key={ `total-fonddecaisse` } className="valeur-input">
                  <label>{ strings.modules.cloture.total_fdcaisse }</label>
                  <div className="input">{ `${devise(periode_z.periode.fdcaisse)} €` }</div>
                </div>

                <div key={ `total-caisse-theo` } className="valeur-input">
                  <label>{ strings.modules.cloture.total_caisse_theo }</label>
                  <div className="input">{ `${devise(periode_z.periode.ca)} €` }</div>
                </div>

                <div className="totalcomptageField editable"
                  onClick={ () => { this.startSaisie('saisie_comptage')} }>
                  <div key={ `total-caisse-cmpt` } className="valeur-input strong">
                    <label>{ strings.modules.cloture.total_caisse_cmpt }</label>
                    <div className="input">{ `${(comptage_total ? devise(comptage_total)+' €' : '')}` }</div>
                  </div>
                </div>
 
                <div key={ `fonddecaisse-theo` } className="valeur-input">
                  <label>{ strings.modules.cloture.fondcaisse_default }</label>
                  <div className="input">{ `${devise(fonddecaissetheo)} €` }</div>
                </div>

                <div className="prelevementField editable"
                  onClick={ () => { this.startSaisie('saisie_prelevement')} }>
                  <div className="valeur-input strong">
                    <label>{ strings.modules.cloture.prelevement }</label>
                    <div className="input">{ `${(prelevement_fv ? devise(prelevement_fv)+' €' : '')}` }</div>
                  </div>
                </div>
              </div>
              <div className="droite-btm">

              <div key={ `fonddecaisse-new` } className="valeur-input">
                  <label>{ strings.modules.cloture.fond_de_caisse }</label>
                  <div className="input">{ `${fdcaisse_new} €` }</div>
                </div>
                {/* <LabelledField 
                  id={ `fonddecaisse-new` }
                  key={ `fonddecaisse-new` }
                  name={ `fonddecaisse_new` }
                  value={ fdcaisse_new } 
                  placeholder=''
                  type='text' 
                  readOnly={ true } 
                  label={ strings.modules.cloture.fond_de_caisse }
                  postvalue='€'
                /> */}
              </div>
            </div>
            <StdButton identifier="btncloture" elementclass="btncloture" key="btncloture" text={(selection_caisse.id!=='allcash' || selection_operator.id!=='allope') ? strings.modules.cloture.cloture_partielle : strings.modules.cloture.cloture_z } disabled={(comptage===null && comptage_fv==='') || periode_z.standby>0 || periode_z.cmdtoarchive.length===0} onClick={ () => {this.prepareCloture(Number(prelevement_fv.replace(',','.')), comptage_total)} } />
          </div>
        </div>
        <Comptage 
          open={comptageOpen} 
          closeComptage={this.closeComptage} 
          openCommandesListe={this.openCommandesListe}
          caisses={caisses} 
          operators={operators} 
          selection_caisse={selection_caisse} 
          selection_operator={selection_operator} 
          periode={ periode_z.periode }
          emission={ periode_z.periode.emission}
          commandes={ periode_z.cmdtoarchive }
          validComptage={ this.validComptage }
        />
        <NumberKeyboard open={keyboardOpen} numbersOnly={false} buttonHandler={this.keyboardButtonHandler} inner={true} closeHandler={this.closeKeyboard} />
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