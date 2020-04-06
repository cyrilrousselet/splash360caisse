import React from 'react';

import LocalizedStrings from 'react-localization';
import {data} from '../../constants/translations';

import { Modal, Fab, FormControl, Select, MenuItem } from '@material-ui/core';
import CloseIcon from '../common/icon/CloseIcon';
import InfoIcon from '@material-ui/icons/Info';
import StdButton from '../common/StdButton';
import { devise, htmlentities } from './../../helpers/toolbox';
import LabelledField from '../common/LabelledField';
import NumberKeyboard from '../common/NumberKeyboard';

let strings = new LocalizedStrings(data);



class Comptage extends React.Component {


  constructor(props) {
    super(props);
    this.state = {
      saisie_carte: '',
      saisie_ticket: '',
      saisie_cheque: '',
      saisie_especes: '',
      keyboardOpen: false,
      fieldval: '',
      activeField: null
    }
    this.startSaisie = this.startSaisie.bind(this);
    this.keyboardButtonHandler = this.keyboardButtonHandler.bind(this);
    this.closeKeyboard = this.closeKeyboard.bind(this);
  }

  


  startSaisie(field) {
    this.setState({keyboardOpen: true, fieldval:this.state[field], activeField: field});
  }

  // action on buttons (fill in passphrase)
  keyboardButtonHandler(text) {
    const { fieldval } = this.state;
    if (text!=='c') {
      this.setState({fieldval: fieldval+text});
    } else {
      this.setState({fieldval: fieldval.slice(0,-1)});
    }
  }

  closeKeyboard() {
    const { fieldval, activeField } = this.state;
    this.setState({keyboardOpen: false, [activeField]:fieldval.replace(',','.')});
  }


  render() {

    const { open, openComptcaisse, closeComptage, openCommandesListe, caisses, operators, selection_operator, selection_caisse, periode, commandes, validComptage } = this.props;


    const { saisie_carte, saisie_ticket, saisie_cheque, saisie_especes, keyboardOpen, fieldval, activeField } = this.state;
    

    // console.log("saisie_carte",saisie_carte);
    // console.log("saisie_ticket",saisie_ticket);
    // console.log("saisie_cheque",saisie_cheque);
    // console.log("saisie_especes",saisie_especes);

    let saisie_carte_fv = activeField=='saisie_carte' ? fieldval.replace(',','.') : saisie_carte;
    let saisie_ticket_fv = activeField=='saisie_ticket' ? fieldval.replace(',','.') : saisie_ticket;
    let saisie_cheque_fv = activeField=='saisie_cheque' ? fieldval.replace(',','.') : saisie_cheque;
    let saisie_especes_fv = activeField=='saisie_especes' ? fieldval.replace(',','.') : saisie_especes;


    let especes = 0,
        carte = 0,
        ticket = 0,
        cheque = 0;
    if (periode.ventilation && periode.ventilation.moyen) {
      const esp = periode.ventilation.moyen.find(moy=>moy.moyen=='especes');
      if (esp) especes = esp.valeur;
      const cb = periode.ventilation.moyen.find(moy=>moy.moyen=='carte');
      if (cb) carte = cb.valeur;
      const tr = periode.ventilation.moyen.find(moy=>moy.moyen=='ticket');
      if (tr) ticket = tr.valeur;
      const chq = periode.ventilation.moyen.find(moy=>moy.moyen=='cheque');
      if (chq) cheque = chq.valeur;
    }
    let mtcaisse = Number(periode.fdcaisse) + especes - Number(periode.depenses) - Number(periode.remboursements);

    const calculateComptage = () => {
      let totalcomptage = Number(saisie_especes) + Number(saisie_carte) + Number(saisie_ticket) + Number(saisie_cheque);
      validComptage(totalcomptage);
    }


    return(
      <Modal open={open}>
      <div className="ClotureComptage">
        <div className="Modal-container">
          <div className="header">
            <div className="title">{ strings.modules.cloture.comptage.titre }</div>
          </div>
          <div className="body">
            {/* <div className="selecteur">
               <div className="label">{ strings.modules.cloture.selection.caisse }</div>
              <FormControl variant="outlined" className="selecteur-cnt selecteur-caisse">
                <Select value={selection_caisse} onChange={this.selectCaisse} className="selecteur-sel selecteur-caisse-select">
                  {Object.values(caisses).map(cash => (
                    <MenuItem key={ `cashitm${cash.id}`} value={cash.id}>{cash.nom}</MenuItem>
                    ))}
                </Select>
              </FormControl>
              <div className="label">{ strings.modules.cloture.selection.vendeur }</div>
              <FormControl variant="outlined" className="selecteur-cnt selecteur-vendeur">
                <Select value={selection_operator} onChange={this.selectVendeur} className="selecteur-sel selecteur-vendeur-select">
                  {Object.values(operators).map(ope => (
                    <MenuItem key={ `opeitm${ope.id}`} value={ope.id}>{ope.nom}</MenuItem>
                    ))}
                </Select>
              </FormControl>
            </div> */}
            <div className="bloc bloc-especes">
              <div className="bloctitre">{ htmlentities(strings.modules.cloture.comptage.especes.titre) }</div>
              <div className="cptitems-liste">
                <div className="cptitem cptitem-fdc">
                  <div className="label">{ strings.modules.cloture.comptage.especes.total_fdcaisse }</div>
                  <div className="valeur">{ `${devise(periode.fdcaisse)} €` }</div>
                </div>
                <div className="cptitem cptitem-esp">
                  <div className="label">{ strings.modules.cloture.comptage.especes.total_especes }</div>
                  <div className="valeur">{ `${devise(especes)} €` }<Fab className="btn" size="small" onClick={ openCommandesListe }>
                    <InfoIcon />
                  </Fab></div>
                </div>
                <div className="cptitem cptitem-dep">
                  <div className="label">{ strings.modules.cloture.comptage.especes.total_depenses }</div>
                  <div className="valeur">{ `${devise(periode.depenses)} €` }</div>
                </div>
                <div className="cptitem cptitem-remb">
                  <div className="label">{ strings.modules.cloture.comptage.especes.total_rembourse }</div>
                  <div className="valeur">{ `${devise(periode.remboursements)} €` }</div>
                </div>
                <div className="cptitem cptitem-mnt">
                  <div className="label">{ strings.modules.cloture.comptage.especes.total_montant }</div>
                  <div className="valeur">{ `${devise(mtcaisse)} €` }</div>
                </div>
              </div>
            </div>
            <div className="bloc bloc-toutes">
              <div className="bloctitre">{ htmlentities(strings.modules.cloture.comptage.toutes.titre) }</div>
              <div className="cptitems-liste">
                <div className="cptitem cptitem-cb">
                  <div className="label">{ strings.modules.cloture.comptage.moyens.carte }</div>
                  <div className="valeur">{ `${devise(carte)} €` }
                    <Fab className="btn" size="small" onClick={ openCommandesListe }>
                      <InfoIcon />
                    </Fab>
                  </div>
                </div>
                <div className="cptitem cptitem-tr">
                  <div className="label">{ strings.modules.cloture.comptage.moyens.ticket }</div>
                  <div className="valeur">{ `${devise(ticket)} €` }
                    <Fab className="btn" size="small" onClick={ openCommandesListe }>
                      <InfoIcon />
                    </Fab>
                  </div>
                </div>
                <div className="cptitem cptitem-chq">
                  <div className="label">{ strings.modules.cloture.comptage.moyens.cheque }</div>
                  <div className="valeur">{ `${devise(cheque)} €` }
                    <Fab className="btn" size="small" onClick={ openCommandesListe }>
                      <InfoIcon />
                    </Fab>
                  </div>
                </div>
                <div className="cptitem cptitem-total">
                  <div className="label">{ strings.modules.cloture.comptage.toutes.total }</div>
                  <div className="valeur">{ `${devise(carte+ticket+cheque)} €` }</div>
                </div>
                <div className="cptitem cptitem-esp">
                  <div className="label">{ strings.modules.cloture.comptage.moyens.especes }</div>
                  <div className="valeur">{ `${devise(mtcaisse)} €` }</div>
                </div>
                <div className="cptitem cptitem-rec">
                  <div className="label">{ strings.modules.cloture.comptage.toutes.total_recu }</div>
                  <div className="valeur">{ `${devise(carte+ticket+cheque+mtcaisse)} €` }</div>
                </div>
              </div>
            </div>
            <div className="bloc bloc-saisie">
              <div className="bloccont">
                <div className="bloctitre">{ htmlentities(strings.modules.cloture.comptage.saisie.titre) }</div>
                <div className="cptitems-liste">
                  <div className="cptitem cptitem-cb">
                    <div className="label">{ strings.modules.cloture.comptage.moyens.carte }</div>
                    <div className="valeur" onClick={()=>{ this.startSaisie('saisie_carte') }}>{ `${(saisie_carte_fv ? devise(saisie_carte_fv)+' €' : '')}` }</div>
                  </div>
                  <div className="cptitem cptitem-tr">
                    <div className="label">{ strings.modules.cloture.comptage.moyens.ticket }</div>
                    <div className="valeur" onClick={() => { this.startSaisie('saisie_ticket') }}>{ `${(saisie_ticket_fv ? devise(saisie_ticket_fv)+' €' : '')}` }</div>
                  </div>
                  <div className="cptitem cptitem-chq">
                    <div className="label">{ strings.modules.cloture.comptage.moyens.cheque }</div>
                    <div className="valeur" onClick={() => { this.startSaisie('saisie_cheque') }}>{ `${(saisie_cheque_fv ? devise(saisie_cheque_fv)+' €' : '')}` }</div>
                  </div>
                  <div className="cptitem cptitem-esp">
                    <div className="label">{ strings.modules.cloture.comptage.moyens.especes }</div>
                    <div className="valeur" onClick={() => { this.startSaisie('saisie_especes') }}>{ `${(saisie_especes_fv ? devise(saisie_especes_fv)+' €' : '')}` }</div>
                  </div>
                </div>
                  <StdButton identifier="btncomptcaisse" elementclass="btncomptcaisse" key="btncomptcaisse" text={ strings.modules.cloture.comptage.actions.outilcomptage } onClick={ openComptcaisse } />
              </div>
              <StdButton identifier="btncomptverif" elementclass="btncomptverif" key="btncomptverif" disabled={saisie_carte=='' || saisie_cheque=='' || saisie_ticket=='' || saisie_especes==''} text={ strings.modules.cloture.comptage.actions.validation } onClick={ calculateComptage } />          
            </div>

          </div>
        </div>
        <Fab aria-label="close" size="small" className="close-button" onClick={ closeComptage }>
          <CloseIcon />
        </Fab>
        <NumberKeyboard open={keyboardOpen} numbersOnly={false} buttonHandler={this.keyboardButtonHandler} inner={true} closeHandler={this.closeKeyboard} />
      </div>
    </Modal>
    );

  }

}

export default Comptage;