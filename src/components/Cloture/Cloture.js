// import DateFnsUtils from "@date-io/date-fns";
import { Fab, FormControl, MenuItem, Modal, Select } from "@material-ui/core";
// import {
//   KeyboardDatePicker,
//   MuiPickersUtilsProvider,
// } from "@material-ui/pickers";
import {
  endOfDay,
  format,
  parseJSON,
  startOfDay,
} from "date-fns";
import frLocale from "date-fns/locale/fr";
import React from "react";
import LocalizedStrings from "react-localization";
import Swal from "sweetalert2";
import paths from "../../constants/routes";
import { data } from "../../constants/translations";
import history from "../../helpers/history";
import Logger from "../../helpers/Logger";
import CarteIcon from "../common/icon/CarteIcon";
import ChequeIcon from "../common/icon/ChequeIcon";
import CloseIcon from "../common/icon/CloseIcon";
import EspecesIcon from "../common/icon/EspecesIcon";
import QRCodeIcon from "../common/icon/QRCodeIcon";
import TicketIcon from "../common/icon/TicketIcon";
import NumberKeyboard from "../common/NumberKeyboard";
import StdButton from "../common/StdButton";
import { devise } from "./../../helpers/toolbox";
import { clotureServices } from "./../../services/cloture/clotureServices";
import LoadingSpinner from "./../common/LoadingSpinner";
import CountTool from "./CountTool";
import CountTRTool from "./CountTRTool";


const logger = new Logger();
let strings = new LocalizedStrings(data);

// class LocalizedUtils extends DateFnsUtils {
//   getDatePickerHeaderText(date) {
//     return format(date, "d MMM yyyy", { locale: this.locale });
//   }
// }


const MotifModal = ({open, closeHandler, setMotif, fieldname}) => {

  const liste = ["retrait", "erreur encaissement", "à rattraper", "trop perçu", "inconnu"];

  return (
    <Modal open={open}>
      <div className="MotifModal">
        <div className="Modal-container">
          <div className="header">
            <div className="title">{ strings.modules.cloture.comptage.motif.titre }</div>
          </div>
          <div className="body">
            <div className="liste-wrapper">
              { liste.map( item => (<div className="motif-item" key={ item.replace(' ','') } onClick={()=>{ setMotif(fieldname, item) }}>{ item }</div>) )}
              <div className="motif-item delete" key={ `delete` } onClick={()=>{ setMotif(fieldname, null) }}>{ strings.modules.cloture.comptage.motif.delete }</div>
            </div>
          </div>
        </div>
        <Fab aria-label="close" size="small" className="close-button" onClick={ closeHandler }>
          <CloseIcon />
        </Fab>
      </div>
    </Modal>
  );
}



class Cloture extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      comptcaisseOpen: false,
      comptage: null,
      selection_operator: { id: "allope", nom: "Tous les vendeurs" },
      selection_caisse: props.caisse,
      keyboardOpen: false,
      fieldvalue: "",
      activeField: null,
      saisie_prelevement: '',
      prelevement: 0,
      fonddecaisse: 0,

      processing: false,

      motifOpen: false,
      motifField: null,

      saisie_carte: '',
      saisie_ticket: '',
      saisie_cheque: '',
      saisie_especes: '',
      saisie_avoir: '',

      ecart_avoir: null,
      counttoolOpen: false,
      counttrtoolOpen: false,
      numbersOnly: false,
    };
    this.shouldComponentRender = this.shouldComponentRender.bind(this);
    this.openComptcaisse = this.openComptcaisse.bind(this);
    this.closeComptcaisse = this.closeComptcaisse.bind(this);
    this.getListeVendeurs = this.getListeVendeurs.bind(this);
    this.selectCaisse = this.selectCaisse.bind(this);
    this.selectVendeur = this.selectVendeur.bind(this);
    this.validComptage = this.validComptage.bind(this);
    this.startSaisie = this.startSaisie.bind(this);
    this.keyboardButtonHandler = this.keyboardButtonHandler.bind(this);
    this.closeKeyboard = this.closeKeyboard.bind(this);
    this.prepareCloture = this.prepareCloture.bind(this);
    this.setSelectedDate = this.setSelectedDate.bind(this);

    this.openMotifModal = this.openMotifModal.bind(this);
    this.closeMotifModal = this.closeMotifModal.bind(this);
    this.setMotif = this.setMotif.bind(this);

    this.openCountTool = this.openCountTool.bind(this);
    this.closeCountTool = this.closeCountTool.bind(this);
    this.validateCountTool = this.validateCountTool.bind(this);
    this.openCountTRTool = this.openCountTRTool.bind(this);
    this.closeCountTRTool = this.closeCountTRTool.bind(this);
    this.validateCountTRTool = this.validateCountTRTool.bind(this);
    this.checkComptage = this.checkComptage.bind(this);
    this.getEcarts = this.getEcarts.bind(this);
  }

  componentDidMount() {
    const { 
      caisse, 
      getCurrentPeriode, 
      getCommandesList, 
      getLastMouvement, 
      fonddecaisse_activation,
    } = this.props;
    
    getCommandesList({
      $and: [
        { archived: {"$exists": false} },
        { status: { $ne: "deleted" } },
        { $or: [
          { "caisse_encaissement.id": caisse.id },
          { $and: [
            { "caisse.id": caisse.id },
            { status: { $in: ["standby", "a_encaisser"]} }
          ]},
        ]},
        { $or: [
          { centre_revenu: {"$exists": false} },
          { centre_revenu: "restaurant" }
        ]}
      ]
    });
    // si la gestion du fond de caisse est activée, on récupère le solde au dernier mouvement de trésorerie.
    if (fonddecaisse_activation) {
      getLastMouvement(caisse.uniqid).then(__lastmvt => {
        const __lastsolde = (__lastmvt && __lastmvt.hasOwnProperty('lastmouvement')) ? __lastmvt.lastmouvement.solde : 0;
        // logger.log('Clo.getLastMouvement() solde:', __lastmvt, __lastsolde);
        this.setState({fonddecaisse: __lastsolde/100});
      });
    }

    //parametres :
    let params = {};
    const {
      selection_caisse,
      selection_operator,
    } = this.state;

    params["caisse"] = selection_caisse;

    if (selection_operator.id !== "allope")
      params["vendeur"] = selection_operator;

    getCurrentPeriode(params);
    //    getParametres();
  }

  shouldComponentRender() {
    //  const {loading} = this.props;
    //  if(loading===false) return false;
    return true;
  }

  testStandbyCommandes(periode_z) {
    // s'il y a des commandes non confirmées ("standby" et "a_encaisser")
    if (periode_z.standby > 0 ) {
      Swal.fire({
        title: strings.modules.cloture.alerte.standby.titre,
        text: strings.modules.cloture.alerte.standby.texte,
        focusConfirm: true,
        showCancelButton: false,
        customClass: {
          container: "standbycommandes"
        },
        confirmButtonText: "OK",
        buttonsStyling: false,
      }).then((result) => {
        if (result.isConfirmed) {
          history.push(paths.LISTECOMMANDES);
        }
      });
      return false;
    }
    return true;
  }

  openMotifModal(field) {
    this.setState({ motifOpen: true, motifField: field});
  }
  closeMotifModal() {
    this.setState({ motifOpen: false, motifField: null });
  }
  setMotif(field, value) {
    this.setState({ motifOpen: false, motifField: null, [field]: value })
  }

  openComptcaisse() {
    this.setState({ comptcaisseOpen: true });
  }
  closeComptcaisse() {
    this.setState({ comptcaisseOpen: false });
  }

  getListeVendeurs() {
    const { listeCommandes } = this.props;
    let operators = {
      allope: {
        id: "allope",
        nom: strings.modules.cloture.selection.vendeur_all,
      },
    };
    Object.entries(listeCommandes).forEach(([id, commande]) => {
      if (!operators.hasOwnProperty(commande.operator.id)) {
        operators[commande.operator.id] = commande.operator;
      }
    });
    return operators;
  }


  selectCaisse(event) {
    
    const { caisses } = this.props;

    const selection = caisses.find((c) => c.uniqid === event.target.value);
    this.setState({ selection_caisse: selection });

    let params = {};
    const { selection_operator } = this.state;
    params["caisse"] = selection;
    params["vendeur"] = (selection_operator && selection_operator.id === "allope") ? null : selection_operator;
    
    this.props.getCurrentPeriode(params);
  }

  selectVendeur(event) {
    const vendeurs = this.getListeVendeurs();
    const selection = vendeurs[event.target.value];
    this.setState({ selection_operator: selection });

    let params = {};
    const { selection_caisse } = this.state;
    params["vendeur"] = selection.id === "allope" ? null : selection;
    params["caisse"] = selection_caisse;
    
    this.props.getCurrentPeriode(params);
  }

  // validComptage(comptageobject) {
  //   logger.log("validComptage()", comptageobject);
  //   //    this.setState({comptage: valeur, comptageOpen: false});
  //   this.setState({ comptage: comptageobject });
  // }

  startSaisie(field) {
    logger.log("startSaisie", field);
  //  let comptage = this.state.comptage;

    this.setState({
      keyboardOpen: true,
  //    comptage: comptage,
      fieldvalue: this.state[field],
      activeField: field,
    });

  }

  // action on buttons (fill in passphrase)
  keyboardButtonHandler(text) {
    const { fieldvalue } = this.state;
    let newvalue;
    if (fieldvalue===null || isNaN(String(fieldvalue).replace(",", "."))) {
      newvalue = (text !== "c") ? text : 0;
    } else {
      newvalue =
      (text !== "c")
      ? String(fieldvalue) + text
      : String(fieldvalue).slice(0, -1)
      ;
    }
    this.setState({ fieldvalue: newvalue });

  }

  closeKeyboard() {
    const { fieldvalue, activeField } = this.state;
    const newval =
      ['saisie_carte','saisie_ticket','saisie_cheque','saisie_especes','saisie_avoir','saisie_prelevement'].indexOf(activeField) === -1
        ? Number(fieldvalue)
        : Number(String(fieldvalue).replace(",", "."));
    this.setState({ keyboardOpen: false, [activeField]: newval, activeField: null });
    this.validComptage(activeField, newval);
  }

  prepareCloture(prelevement, newfdcaisse, periode) {
    const {
      selection_operator,
      selection_caisse,
      comptage,

      motif_especes,
      motif_carte,
      motif_ticket,
      motif_cheque,
      motif_avoir

    } = this.state;

    const {
      ecart_especes,
      ecart_carte,
      ecart_ticket,
      ecart_cheque,
      ecart_avoir
    } = this.getEcarts(periode);
    
    let params = {};
      params["caisse"] = selection_caisse;
      params["vendeur"] = null;
    if (selection_operator.id !== "allope")
      params["vendeur"] = selection_operator;
    params["comptage"] = comptage;
    params["prelevement"] = prelevement;
    params["fdcaisse"] = newfdcaisse;
    params["ecarts"] = {
      especes: ecart_especes ? { valeur: ecart_especes, motif: motif_especes} : null,
      carte: ecart_carte ? { valeur: ecart_carte, motif: motif_carte} : null,
      ticket: ecart_ticket ? { valeur: ecart_ticket, motif: motif_ticket} : null,
      cheque: ecart_cheque ? { valeur: ecart_cheque, motif: motif_cheque} : null,
      avoir: ecart_avoir ? { valeur: ecart_avoir, motif: motif_avoir} : null
    }

    this.setState({processing: true});

      this.props.addTresor({
        type: "cloture",
        origine: this.props.caisse.uniqid,
        destination: "Coffre",
        debit: prelevement*100,
        credit: 0,
        solde: newfdcaisse*100,
      });
      this.props.makeCloture(params);


  }


  setSelectedDate(bound, date) {
    const { startDate, endDate } = this.state;
    if (bound === "start") {
      this.setState({
        startDate: date <= endDate ? startOfDay(date) : endDate,
      });
    }
    if (bound === "end") {
      this.setState({
        endDate: date >= startDate ? endOfDay(date) : startDate,
      });
    }
  }

  formatDate = (date, dateFormat) => {
    return format(parseJSON(date), dateFormat);
  };



  // ! --- méthodes comptage ---
  openCountTool() {
    this.setState({counttoolOpen:true});
  }
  closeCountTool() {
    this.setState({counttoolOpen:false});
  }
  validateCountTool(valeur) {
    this.validComptage('saisie_especes', valeur);
    this.setState({saisie_especes: valeur, counttoolOpen:false});
  }
  openCountTRTool() {
    this.setState({counttrtoolOpen:true});
  }
  closeCountTRTool() {
    this.setState({counttrtoolOpen:false});
  }
  validateCountTRTool(valeur) {
    this.setState({saisie_ticket: valeur, counttrtoolOpen:false});
  }

  getVentilation(periode) {

    const { ventilation, emission } = periode;

    let especes = 0,
        carte = 0,
        ticket = 0,
        cheque = 0,
        avoir = 0;

    if (ventilation && ventilation.moyen) {
      const esp = ventilation.moyen.find(moy=>moy.moyen==='especes');
      if (esp) especes = esp.valeur;
      const cb = ventilation.moyen.find(moy=>moy.moyen==='carte');
      if (cb) carte = cb.valeur;
      const tr = ventilation.moyen.find(moy=>moy.moyen==='ticket');
      if (tr) ticket = tr.valeur - emission; // on retire des TR le montant des avoirs émis
      const chq = ventilation.moyen.find(moy=>moy.moyen==='cheque');
      if (chq) cheque = chq.valeur;
      const avr = ventilation.moyen.find(moy=>moy.moyen==='avoir');
      if (avr) avoir = avr.valeur;
    }

    return {especes, carte, ticket, cheque, avoir};
  }

  validComptage(fieldname, value) {

    console.log('validComptage', fieldname, value);

    if (([
      "saisie_carte", 
      "saisie_ticket", 
      "saisie_cheque", 
      "saisie_especes", 
      "saisie_avoir"
    ]).includes(fieldname)) {
      
      const { comptage } = this.state;
      let __comptage = {...comptage, total:0};

      if (__comptage===null) {
        __comptage = {
          especes: 0,
          carte: 0,
          ticket: 0,
          cheque: 0,
          avoir: 0
        };
      }

      const __field = fieldname.substr(7);

      __comptage[__field] =  Number(value);
      const totalcomptage = Object.values(__comptage).reduce((a,b)=>a+b,0);

      console.log('comptage', __field, __comptage);

      this.setState({comptage: {...__comptage, [__field]: Number(value), total:totalcomptage}});

    }
  }

  checkComptage(periode) {
    const ventilation = this.getVentilation(periode);
    const { comptage } = this.state;

    let __valid = true;

    (['especes', 'carte', 'ticket', 'cheque', 'avoir']).forEach(moyen => {
      if (ventilation[moyen] > 0) {
        if (!comptage || 
           (comptage && !comptage.hasOwnProperty(moyen)) || 
           ((comptage && comptage[moyen] !== ventilation[moyen]) && !this.state['motif_'+moyen])) __valid = false;
      } else {
        if ((comptage && !comptage.hasOwnProperty(moyen)) || (comptage && comptage.hasOwnProperty(moyen) && comptage[moyen]>0 && !this.state['motif_'+moyen])) __valid = false;
      }
    });

    return __valid;

  }


  getEcarts(periode) {
    const ventilation = this.getVentilation(periode);
    const { comptage } = this.state;

    let __ecarts = {};

    (['especes', 'carte', 'ticket', 'cheque', 'avoir']).forEach(moyen => {
      if (comptage && comptage[moyen]!== ventilation[moyen]) __ecarts['ecart_'+moyen] = comptage[moyen] - ventilation[moyen];
    });

    return __ecarts;

  }

  render() {
    const {
      periode,
      listeCommandes,
      catalogue,
      caisses,
      user,
    } = this.props;

    const {
      saisie_prelevement,
      activeField,
      selection_caisse,
      selection_operator,
      keyboardOpen,
      fieldvalue,
      startDate,
      endDate,
      fonddecaisse,

      motifOpen,
      motifField,

      counttoolOpen,
      counttrtoolOpen,
      saisie_carte, 
      saisie_ticket, 
      saisie_cheque, 
      saisie_especes, 
      saisie_avoir,

      motif_especes,
      motif_carte,
      motif_cheque,
      motif_ticket,
      motif_avoir,

      processing,

    } = this.state;

    let params = {
      user: {
        id: user.id,
        nom: user.nom,
        user_id: user.user_id,
      },
      caisse: selection_caisse,
      vendeur: null,
      fdcaisse: fonddecaisse,
      debut: startDate,
      fin: endDate,
      extract: "z",
    };

    if (periode) {
      params.debut = periode.debut;
      params.fin = periode.fin;
    }


    if (selection_operator.id !== "allope")
      params["vendeur"] = selection_operator;

    const periode_z = clotureServices.getCurrentPeriode(
      listeCommandes,
      catalogue,
      params
    );

    // logger.log("periode", periode);

    logger.log("periode_z", periode_z);
    logger.log("periode_z ventil.", periode_z.periode.ventilation);

    const readyToCloture = this.testStandbyCommandes(periode_z);

    const operators = this.getListeVendeurs();


          
    // logger.log('fdcaisse_new', periode_z.periode.fdcaisse+' + ('+comptage_fv+' - '+Number(prelevement_fv.replace(",", "."))+')');
    // logger.log('operators', operators);
    // logger.log('caisses', caisses);

    if (processing) {

      setTimeout(function() {
        history.push(paths.CLOTURE);
      }, 1500);

      return (
      <div className="Cloture container">
        <div className="MainZone">
          <div className="clo-top">
            <StdButton identifier="btnretour" elementclass="btnretour" key="btnretour" text={ strings.general.dialog.back } onClick={ () => { history.push(paths.CLOTURE) }} />
          </div>  
          <div className="processing">{ strings.modules.cloture.processing }</div>
          <LoadingSpinner />
        </div>
      </div>
      );
    }

    if (!readyToCloture) {
      return <LoadingSpinner />;
    }

    if (!this.shouldComponentRender()) {
      return <LoadingSpinner />;
    }

    if (!periode.hasOwnProperty("debut")) {
      return <LoadingSpinner />;
    }


    let saisie_carte_fv = activeField==='saisie_carte' ? String(fieldvalue).replace(',','.') : saisie_carte;
    let saisie_ticket_fv = activeField==='saisie_ticket' ? String(fieldvalue).replace(',','.') : saisie_ticket;
    let saisie_cheque_fv = activeField==='saisie_cheque' ? String(fieldvalue).replace(',','.') : saisie_cheque;
    let saisie_especes_fv = activeField==='saisie_especes' ? String(fieldvalue).replace(',','.') : saisie_especes;
    let saisie_avoir_fv = activeField==='saisie_avoir' ? String(fieldvalue).replace(',','.') : saisie_avoir;


    // récup de la ventilation par moyen de paiement (TR - avoirs émis)
    // NB. pour récupérer le total TR, il faut aller chercher periode_z.periode.ventilation.moyen.find(m=>m.moyen==='ticket').valeur
    const _ventilation = this.getVentilation(periode_z.periode);
    const { especes, carte, ticket, cheque, avoir } = _ventilation;

    // total des encaissements (on soustrait les avoirs émis du total des TR)
    const _encaissement = Object.values(_ventilation).reduce((a,b)=>a+b,0);
    
    const { ecart_especes, ecart_carte, ecart_ticket, ecart_cheque, ecart_avoir } = this.getEcarts(periode_z.periode);

    let ecart_especes_fv = !ecart_especes ? (saisie_especes_fv ? saisie_especes_fv - especes : 0) : ecart_especes;
    let ecart_carte_fv = !ecart_carte ? (saisie_carte_fv ? saisie_carte_fv - carte : 0) : ecart_carte;
    let ecart_ticket_fv = !ecart_ticket ? (saisie_ticket_fv ? saisie_ticket_fv - ticket : 0) : ecart_ticket;
    let ecart_cheque_fv = !ecart_cheque ? (saisie_cheque_fv ? saisie_cheque_fv - cheque : 0) : ecart_cheque;
    let ecart_avoir_fv = !ecart_avoir ? (saisie_avoir_fv ? saisie_avoir_fv - avoir : 0) : ecart_avoir;



    // la valeur doit être une chaîne avec
    const prelevement_fv =
      activeField === "saisie_prelevement"
        ? String(fieldvalue).replace(",", ".")
        : saisie_prelevement;


//    const comptage_fv = comptage ? comptage.especes : 0;
    const comptage_fv = _ventilation ? _ventilation.especes + ecart_especes_fv : 0;



    const fdcaisse_new = 
      prelevement_fv!==null 
      ? devise(periode_z.periode.fdcaisse + (comptage_fv - Number(String(prelevement_fv).replace(",", "."))))
      : devise(periode_z.periode.fdcaisse + comptage_fv)
      ;




    const __cannotCloture = (
      !this.checkComptage(periode_z.periode) ||
      saisie_prelevement === null ||
      saisie_prelevement === "" ||
      periode_z.standby > 0 ||
      periode_z.cmdtoarchive.length === 0
    );

    return (
      <div className="Cloture container">
        <div className="MainZone">
          <div className="clo-top">
            <StdButton identifier="btnretour" elementclass="btnretour" key="btnretour" text={ strings.general.dialog.back } onClick={ () => { history.push(paths.CLOTURE) }} />
            <div className="zone-selecteur">
              <div className="label">
                {strings.modules.cloture.selection.caisse}
              </div>
              <FormControl variant="outlined" className="selecteur-caisse">
                <Select
                  value={selection_caisse.id}
                  onChange={this.selectCaisse}
                  className="selecteur selecteur-caisse-select"
                >
                  {Object.values(caisses).map((cash) => (
                    <MenuItem key={`cashitm${cash.id}`} value={cash.id}>
                      {cash.nom}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <div className="label">
                {strings.modules.cloture.selection.vendeur}
              </div>
              <FormControl variant="outlined" className="selecteur-vendeur">
                <Select
                  value={selection_operator.id}
                  onChange={this.selectVendeur}
                  className="selecteur selecteur-vendeur-select"
                >
                  {Object.values(operators).map((ope) => (
                    <MenuItem key={`opeitm${ope.id}`} value={ope.id}>
                      {ope.nom}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </div>
            <div className="periode">
              <div className="titre">{strings.modules.cloture.selection.titre}</div>
              <div className="dates">
                { `${strings.modules.cloture.selection.debut} 
                   ${format(periode.debut, "d MMM yyyy (HH'h'mm)", { locale: frLocale })} 
                   ${strings.modules.cloture.selection.fin} 
                   ${ format(periode.fin, "d MMM yyyy (HH'h'mm)", { locale: frLocale })}
                `}
              </div>
            </div>
          </div>
         
          <div className="clo-main">
            <div className="clo-gauche">
              <div className="clo-gauche-top">
                <div className="cptitem cptitem-caption">
                  <div className="balance-label">{ strings.modules.cloture.comptage.captions.balance }</div>
                  <div className="ecarts-label">{ strings.modules.cloture.comptage.captions.ecarts }</div>
                  <div className="motif-label">{ strings.modules.cloture.comptage.captions.motif }</div>
                </div>
                <div className={ `cptitem cptitem-esp${(ecart_especes_fv!==0 ? (motif_especes ? ' warning' : ' error') : '')}`}>
                  <div className="item-label">
                    <EspecesIcon htmlColor="#ffffff" />
                    { strings.modules.cloture.comptage.moyens.especes }
                  </div>
                  <div className="valeur valeur-static">{ `${devise(especes)} €` }</div>
                  <div className="valeur valeur-input" onClick={()=>{ this.startSaisie('saisie_especes') }}>
                    <div className="label">{ strings.modules.cloture.comptage.saisie.caption }</div>
                    <div className="input">{ `${(saisie_especes_fv!=='' ? devise(saisie_especes_fv)+' €' : '')}` }</div>
                  </div>
                  {(ecart_especes_fv!==0) && (<>
                    <div className="ecart">{ `${ecart_especes_fv>0 ? '+':''} ${devise(ecart_especes_fv)} €` }</div>
                    <div className="motif" onClick={()=>{ this.openMotifModal('motif_especes') }}>{ motif_especes }</div>
                  </>)}
                  {(ecart_especes_fv===0) && (<div className="ecart">-</div>)}
                </div>
                <div className={ `cptitem cptitem-cb${(ecart_carte_fv!==0 ? (motif_carte ? ' warning' : ' error') : '')}` }>
                  <div className="item-label">
                    <CarteIcon htmlColor="#ffffff" />
                    { strings.modules.cloture.comptage.moyens.carte }
                  </div>
                  <div className="valeur valeur-static">{ `${devise(carte)} €` }</div>
                  <div className="valeur valeur-input" onClick={()=>{ this.startSaisie('saisie_carte') }}>
                    <div className="label">{ strings.modules.cloture.comptage.saisie.caption }</div>
                    <div className="input">{ `${(saisie_carte_fv!=='' ? devise(saisie_carte_fv)+' €' : '')}` }</div>
                  </div>
                  {(ecart_carte_fv!==0) && (<>
                    <div className="ecart">{ `${ecart_carte_fv>0 ? '+':''} ${devise(ecart_carte_fv)} €` }</div>
                    <div className="motif" onClick={()=>{ this.openMotifModal('motif_carte') }}>{ motif_carte }</div>
                  </>)}
                  {(ecart_carte_fv===0) && (<div className="ecart">-</div>)}
                </div>
                <div className={ `cptitem cptitem-tr${(ecart_ticket_fv!==0 ? (motif_ticket ? ' warning' : ' error') : '')}` }>
                  <div className="item-label">
                    <TicketIcon htmlColor="#ffffff" />
                    { strings.modules.cloture.comptage.moyens.ticket }
                  </div>
                  <div className="valeur valeur-static">{ `${devise(ticket)} €` }</div>
                  <div className="valeur valeur-input" onClick={()=>{ this.startSaisie('saisie_ticket') }}>
                    <div className="label">{ strings.modules.cloture.comptage.saisie.caption }</div>
                    <div className="input">{ `${(saisie_ticket_fv!=='' ? devise(saisie_ticket_fv)+' €' : '')}` }</div>
                  </div>
                  {(ecart_ticket_fv!==0) && (<>
                    <div className="ecart">{ `${ecart_ticket_fv>0 ? '+':''} ${devise(ecart_ticket_fv)} €` }</div>
                    <div className="motif" onClick={()=>{ this.openMotifModal('motif_ticket') }}>{ motif_ticket }</div>
                  </>)}
                  {(ecart_ticket_fv===0) && (<div className="ecart">-</div>)}
                </div>
                <div className={ `cptitem cptitem-chq${(ecart_cheque_fv!==0 ? (motif_cheque ? ' warning' : ' error') :'')}` }>
                  <div className="item-label">
                    <ChequeIcon htmlColor="#ffffff" />
                    { strings.modules.cloture.comptage.moyens.cheque }
                  </div>
                  <div className="valeur valeur-static">{ `${devise(cheque)} €` }</div>
                  <div className="valeur valeur-input" onClick={()=>{ this.startSaisie('saisie_cheque') }}>
                    <div className="label">{ strings.modules.cloture.comptage.saisie.caption }</div>
                    <div className="input">{ `${(saisie_cheque_fv!=='' ? devise(saisie_cheque_fv)+' €' : '')}` }</div>
                  </div>
                  {(ecart_cheque_fv!==0) && (<>
                    <div className="ecart">{ `${ecart_cheque_fv>0 ? '+':''} ${devise(ecart_cheque_fv)} €` }</div>
                    <div className="motif" onClick={()=>{ this.openMotifModal('motif_cheque') }}>{ motif_cheque }</div>
                  </>)}
                  {(ecart_cheque_fv===0) && (<div className="ecart">-</div>)}
                </div>
                <div className={ `cptitem cptitem-avr${(ecart_avoir_fv!==0 ? (motif_avoir ? ' warning' : ' error') : '')}` }>
                  <div className="item-label">
                    <QRCodeIcon htmlColor="#ffffff" />
                    { strings.modules.cloture.comptage.moyens.avoir }
                  </div>
                  <div className="valeur valeur-static">{ `${devise(avoir)} €` }</div>
                  <div className="valeur valeur-input" onClick={()=>{ this.startSaisie('saisie_avoir') }}>
                    <div className="label">{ strings.modules.cloture.comptage.saisie.caption }</div>
                    <div className="input">{ `${(saisie_avoir_fv!=='' ? devise(saisie_avoir_fv)+' €' : '')}` }</div>
                  </div>
                  {(ecart_avoir_fv!==0) && (<>
                    <div className="ecart">{ `${ecart_avoir_fv>0 ? '+':''} ${devise(ecart_avoir_fv)} €` }</div>
                    <div className="motif" onClick={()=>{ this.openMotifModal('motif_avoir') }}>{ motif_avoir }</div>
                  </>)}
                  {(ecart_avoir_fv===0) && (<div className="ecart">-</div>)}
                </div>

              </div>{/* -- /.clo-gauche-top -- */}

              <div className="clo-gauche-btm">
                <div key={`total-encaissement`} className="total-encaissement">
                  <label>{strings.modules.cloture.comptage.especes.total_encaissement}</label>
                  <div className="input">{`${devise(
                    _encaissement
                  )} €`}</div>
                </div>
                <div key={`total-fonddecaisse`} className="total-fdc">
                  <label>{strings.modules.cloture.comptage.especes.total_fdcaisse}</label>
                  <div className="input">{`${devise(
                    periode_z.periode.fdcaisse
                  )} €`}</div>
                </div>
                <div key={`total-caisse-theo`} className="total-caisse">
                  <label>{strings.modules.cloture.comptage.especes.total_montant}</label>
                  <div className="input">{`${devise(
                    periode_z.periode.fdcaisse + _encaissement
                  )} €`}</div>
                </div>
              </div>{/* -- /.clo-gauche-btm -- */}
            
            </div>{/* -- /.clo-gauche -- */}
          

            <div className="clo-droite">

              <div className="clo-droite-top">
                <StdButton 
                  identifier="btncomptcaisse" 
                  elementclass="btncomptcaisse" 
                  key="btncomptcaisse" 
                  text={ strings.modules.cloture.comptage.actions.outilcomptage } 
                  onClick={ this.openCountTool } 
                />
                <StdButton 
                  identifier="btncompttr" 
                  elementclass="btncompttr" 
                  key="btncompttr" 
                  text={ strings.modules.cloture.comptage.actions.outilcomptagetr } 
                  onClick={ this.openCountTRTool } 
                />
              </div>
              {/* -- /.clo-droite-top -- */}

              <div className="clo-droite-mid">
                <div 
                  key={`prelevement`} 
                  className="prelevementField"
                  onClick={() => {
                    this.startSaisie("saisie_prelevement");
                  }}
                >
                  <div className="valeur-input editable strong">
                    <label>{strings.modules.cloture.prelevement}</label>
                    <div className="input">{`${
                      prelevement_fv!=='' ? devise(prelevement_fv) + " €" : ""
                    }`}</div>
                  </div>
                </div>
                <div key={`fonddecaisse-new`} className="valeur-input">
                  <label>{strings.modules.cloture.fond_de_caisse}</label>
                  <div className="input">{`${fdcaisse_new} €`}</div>
                </div>
              </div>{/* -- /.clo-droite-mid -- */}

              <div className="clo-droite-btm">
                <StdButton
                  identifier="btncloture"
                  elementclass="btncloture"
                  key="btncloture"
                  text={ strings.modules.cloture.cloture_z }
                  disabled={ __cannotCloture }
                  onClick={() => {
                    this.prepareCloture(
                      Number(String(prelevement_fv).replace(",", ".")),
                      Number(String(fdcaisse_new).replace(",", ".")),
                      periode_z.periode
                    );
                  }}
                />
              </div>{/* -- /.clo-droite-btm -- */}
              
            </div>{/* -- /.clo-droite -- */}
          </div>{/* -- /.clo-main -- */}
        </div>{/* -- /.MainZone -- */}
      
        <CountTool 
          open={counttoolOpen} 
          fdcaisse={periode_z.periode.fdcaisse}
          especes={especes}
          onValidate={ this.validateCountTool } 
          closeHandler={this.closeCountTool} 
        />

        <CountTRTool
          open={counttrtoolOpen}
          ticket={ticket}
          onValidate={this.validateCountTRTool}
          closeHandler={this.closeCountTRTool}
        />
        <NumberKeyboard
          clasName="ClotureKeyboard"
          open={keyboardOpen}
          numbersOnly={false}
          buttonHandler={this.keyboardButtonHandler}
          inner={true}
          closeHandler={this.closeKeyboard}
        />
        <MotifModal
          open={motifOpen}
          closeHandler={this.closeMotifModal}
          fieldname={motifField}
          setMotif={this.setMotif}
        />
      </div>
    );
  }
}
export default Cloture;


