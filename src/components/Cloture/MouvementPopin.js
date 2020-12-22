import { FormControl, Modal, Select, MenuItem, Fab, TextField } from '@material-ui/core';
import React from 'react';
import CloseIcon from '../common/icon/CloseIcon';
import StdButton from '../common/StdButton';




import LocalizedStrings from 'react-localization';
import {data} from '../../constants/translations';
import Logger from '../../helpers/Logger';
import Calculette from '../Encaissement/Calculette';
import {devise} from '../../helpers/toolbox';
import { format } from 'date-fns';
import frLocale from "date-fns/locale/fr";

const logger = new Logger();

let strings = new LocalizedStrings(data);

const external = ["Coffre", "Banque"];



class MouvementPopin extends React.Component {


  constructor(props) {
    super(props);
    this.state = {
      origine: null,
      destination: null,
      montant: 0,
      motif: ""
    }

    this._saveMouvement = this._saveMouvement.bind(this);
    this._selectCaisse = this._selectCaisse.bind(this);
    this._selectExternal = this._selectExternal.bind(this);
    this._calculetteClick = this._calculetteClick.bind(this);
    this._deleteCalculette = this._deleteCalculette.bind(this);
    this._motifChangeHandler = this._motifChangeHandler.bind(this);
  }

  _saveMouvement() {
    const {mouvement, type, saveMouvement, caisse} = this.props;
    const { 
      origine,
      destination,
      montant,
      motif
    } = this.state;

    let _debit = type==="entree" ? 0 : montant*100;
    let _credit = type==="entree" ? montant*100 : 0;
    let _montant = type==="ouverture" ? montant*100 : null;
    let _origine;
    let _destination = type==="entree" ? destination.uniqid : destination;

    if (type==="ouverture") {
      if (mouvement!==null) {
        const _ecart =  (montant * 100) - mouvement.lastMontant;
        if (_ecart >= 0) {
          _credit = _ecart;
          _debit = 0;
        } else {
          _credit = 0;
          _debit = _ecart;
        }
      } else {
        _credit = 0;
        _debit = 0;
      }
      _montant = montant * 100;

      _origine = origine;
      _destination = caisse.uniqid;
    
    } else {
      _origine = type==="entree" ? origine : origine.uniqid;
    }

    saveMouvement({
      ...mouvement,
      lastMontant: null,
      lastCreatedAt: null,
      origine: _origine,
      destination: _destination,
      debit: _debit,
      credit: _credit,
      montant: _montant,
      type: type,
      detail: motif
    });
  }


  _selectCaisse(event) {

    const {caisses, type} = this.props;

    const selcaisse = caisses.find( (c) => c.uniqid===event.target.value )

    if (type === "entree") {
      this.setState({destination: selcaisse});
    } else {
      this.setState({origine: selcaisse});
    }
    logger.log('_selectCaisse', (type === "entree") ? `-> ${ selcaisse.nom}` : `${ selcaisse.nom} ->`);
  }

  _selectExternal(event) {

    const {type} = this.props;


    if (type === "entree") {
      this.setState({origine: event.target.value});
    } else {
      this.setState({destination: event.target.value});
    }
    logger.log('_selectExternal', (type === "entree") ? `${ event.target.value } ->` : `-> ${ event.target.value }` );
  }

  _calculetteClick(value) {
    let __t = this.state.montant;
    let __i = true;
    switch (value) {
      case "c":
        __t = 0;
        __i = false;
        break;
      case "00":
        __t *= 100;
        break;
      case "0":
        __t *= 10;
        break;
      default:
        __t = __t * 10 + value / 100;
    }
    this.setState({ montant: __t, input: __i });
  }

  _deleteCalculette() {
    this.setState({ montant: 0, input: false });
  }

  _motifChangeHandler(event) {
     this.setState({motif:String(event.target.value).toUpperCase()});
   }

  render() {

    const { mouvement, type, caisse, caisses, open, closeHandler } = this.props;
    const { montant, motif } = this.state;
    
    const _caisse = mouvement && (type==="entree" ? mouvement.destination : mouvement.origine);
    const _external = mouvement && (type==="entree" ? mouvement.origine : mouvement.destination);


    if (!type) {
      return false;
    }

    let _ecart = false;
    if (type==="ouverture" && mouvement) {
      if ((mouvement.lastMontant/100) !== montant) {
        _ecart = true;
      }
    }

    return (
      <Modal
        open={ open }
        >
        <div className={ `MouvementPopin mouvement-${type}` }>
          <div className="Modal-container">
            <div className="header">
              <div className="title">{ type && strings.modules.tresor.popin[type].titre }</div>
            </div>
            <div className={ `body type-${type}`}>
              <div className="zone-gauche">
                <div className="zone-sel-io">
                  <div className="sel-caisse">
                    <div className="label">
                      {strings.modules.tresor.popin[type].caisse}
                    </div>
                    {caisse===null && (<FormControl variant="outlined" className="selecteur-caisse">
                      <Select
                        defaultValue={_caisse ? _caisse.uniqid : undefined}
                        onChange={this._selectCaisse}
                        className="selecteur selecteur-caisse-select"
                      >
                        { caisses && caisses.map((cash) => (
                          <MenuItem key={`cashitm${cash.uniqid}`} value={cash.uniqid}>
                            {cash.nom}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>)}
                    {caisse && (<div className="selected-caisse">{ caisse.nom }</div>)}
                  </div>
                  <div className="sel-external">
                    <div className="label">
                      {strings.modules.tresor.popin[type].external}
                    </div>
                    <FormControl variant="outlined" className="selecteur-external">
                      <Select
                        defaultValue={_external ? _external : undefined}
                        onChange={this._selectExternal}
                        className="selecteur selecteur-external-select"
                      >
                        { external.map((ext) => (
                          <MenuItem key={`cashitm${ext}`} value={ext}>
                            {ext}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </div>
                
                </div>
                {(type!=='ouverture') && (
                <div className="zone-motif">
                  <div className="form-group">
                    <div className="label">{ strings.modules.tresor.popin.motif }</div>
                    <div className="valeur">
                      <TextField
                        multiline
                        id="texte"
                        value={motif}
                        rows={3}
                        rowsMax={3}
                        onChange={this._motifChangeHandler}
                        variant="filled"
                      />
                      <div className="caption">{ strings.modules.encaissement.commentaires.caption }</div>
                    </div>
                  </div>
                </div>
                )}
                {(type==="ouverture" && mouvement) && (
                  <div className="zone-precedent">
                  <div className="label">{ strings.modules.tresor.popin.ouverture.precedent }</div>
                  <div className="date">{ mouvement.createdAt && format(new Date(mouvement.lastCreatedAt), "d MMM yyyy à HH:mm", { locale: frLocale }) }</div>
                  <div className="montant">{ `${devise(mouvement.lastMontant/100)} €` }</div>
                  </div>
                )}
                {(type==="ouverture" && mouvement===null) && (
                  <div className="zone-precedent">
                  <div className="montant">{ strings.modules.tresor.popin.ouverture.none }</div>
                  </div>
                )}
              </div>
              <div className={ `zone-montant ${ _ecart && 'ecart' }`}>
                <div className="label">{ type && strings.modules.tresor.popin[type].montant }</div>
                <Calculette 
                  total={montant} 
                  buttonHandler={this._calculetteClick}
                  deleteHandler={this._deleteCalculette} 
                />
              </div>
            </div>
            <div className="footer">
              <div className={ `ftr-cont ftr-${type}`}>
              { (type !== "view" && type!=="ouverture") && (
                <StdButton identifier="none" elementclass="btncancel" icon={ false } noStroke={true} text={ strings.general.dialog.cancel } onClick={ closeHandler } />
               )}
              { (type !== "view") && ( 
               <StdButton identifier="none" elementclass="btnsave" icon={ false } noStroke={true} text={ strings.general.dialog.save } onClick={() => { this._saveMouvement() }} />
              )}
              { (type === "view") && (
                <StdButton identifier="none" elementclass="btnclose" icon={ false } noStroke={true} text={ strings.general.dialog.ok } onClick={ closeHandler } />
                )}
              </div>
            </div>
          </div>
          {(type !== "ouverture") && (<Fab aria-label="close" size="small" className="close-button" onClick={ closeHandler }>
            <CloseIcon />
          </Fab>)}
        </div>
      </Modal>
    );
  }
}



export default MouvementPopin;