import React from 'react';

import LocalizedStrings from 'react-localization';
import {data} from '../../constants/translations';

import { Modal, Fab, FormControl, Select, MenuItem, List, Paper, TableContainer, Table, TableHead, TableRow, TableCell, TableBody, TableFooter } from '@material-ui/core';
import CloseIcon from '../common/icon/CloseIcon';
import InfoIcon from '@material-ui/icons/Info';
import StdButton from '../common/StdButton';
import LabelledField from '../common/LabelledField';

import Swal from 'sweetalert2';
import { useState } from 'react';
import { format } from 'date-fns';
import DateFnsUtils from '@date-io/date-fns';
import frLocale from "date-fns/locale/fr";
import MapIcon from './../common/icon/MapIcon';
import { th } from 'date-fns/locale';
import PlusIcon from '../common/icon/PlusIcon';
import Autocomplete from '@material-ui/lab/Autocomplete';
import TextField from '@material-ui/core/TextField';

let strings = new LocalizedStrings(data);

const EMAIL_REG = new RegExp('^[0-9a-z._-]+@{1}[0-9a-z.-]{2,}[.]{1}[a-z]{2,5}$','i');



class FicheClient extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      innermode: null,
      client_id: null,
      nom: '', 
      prenom: '',
      email: '', 
      telephone: '', 
      telephone2: '',
      adresse: '', 
      adresse2: '',
      batiment: '', 
      etage: '',
      codepostal: '', 
      ville: '',
      commentaire: '',
      inscription: new Date().getTime()
    };
    this.getValeurs = this.getValeurs.bind(this);
    this.updateValue = this.updateValue.bind(this);
    this.resetPopin = this.resetPopin.bind(this);
    this.saveClient = this.saveClient.bind(this);
    this.handleSelect = this.handleSelect.bind(this);
    this.closePopin = this.closePopin.bind(this);
    this.gotoFiche = this.gotoFiche.bind(this);
  }

  componentDidMount() {
    this.props.getAll();
  }

  getValeurs() {
    const { client_id, nom, prenom,
      email, telephone, telephone2,
      adresse, adresse2, batiment, etage, codepostal, ville,
      commentaire, inscription } = this.props.client || { client_id: null, nom: '', prenom: '',
                                                          email: '', telephone: '', telephone2: '',
                                                          adresse: '', adresse2: '', batiment: '', etage: '', codepostal: '', ville: '',
                                                          commentaire: '', inscription: new Date().getTime() };

    const sclient_id = this.state.client_id;
    const snom = this.state.nom;
    const sprenom = this.state.prenom;
    const semail = this.state.email;
    const stelephone = this.state.telephone;
    const stelephone2 = this.state.telephone2;
    const sadresse = this.state.adresse;
    const sadresse2 = this.state.adresse2;
    const sbatiment = this.state.batiment;
    const setage = this.state.etage;
    const scodepostal = this.state.codepostal;
    const sville = this.state.ville;
    const scommentaire = this.state.commentaire;
    const sinscription = this.state.inscription;

    return {
      client_id: sclient_id || client_id,
      nom: snom || nom,
      prenom: sprenom || prenom,
      email: semail || email,
      telephone: stelephone || telephone,
      telephone2: stelephone2 || telephone2,
      adresse: sadresse || adresse,
      adresse2: sadresse2 || adresse2,
      batiment: sbatiment || batiment,
      etage: setage || etage,
      codepostal: scodepostal || codepostal,
      ville: sville || ville,
      commentaire: scommentaire || commentaire,
      inscription: sinscription || inscription
    }

  }


  updateValue(value) {
    console.log('updateValue', value);
    this.setState(value);
  }
  resetPopin() {
    const st = { 
      innermode: null,
      client_id: null,
      nom: '', 
      prenom: '',
      email: '', 
      telephone: '', 
      telephone2: '',
      adresse: '', 
      adresse2: '',
      batiment: '', 
      etage: '',
      codepostal: '', 
      ville: '',
      commentaire: '',
      inscription: new Date().getTime()
    };
    this.setState(st);
  }

  saveClient(selection=false) {
    const { createClient, updateClient, closeHandler, client, contexte } = this.props;
    const client_id = this.props.client && this.props.client.client_id || null;
    let params = this.getValeurs();
    params = {...params, autoselect:selection};

    // si on modifie la fiche client depuis l'Encaissement,
    // on demande la mise à jour des infos du client pour la commande en cours
    if (contexte=="encaissement" && client) {
      params = {...params, autoselect:true};
    }
    if (client_id==null) { 
      createClient(params);
    } else {
      updateClient(params);
    }
    this.resetPopin();
    closeHandler();
  }

  handleSelect() {

    const { selectClient, client, closeHandler, mode } = this.props;

    const client_id = client && client.client_id || null;
    if (client_id==null) { 
      this.saveClient(true);
    } else {
      if (mode=='fiche') {
        selectClient(null);
        this.resetPopin();
        closeHandler();
      } else {
        selectClient(client);
      }
    }
  }


  closePopin() {
    const {closeHandler} = this.props;
    this.resetPopin();
    closeHandler();
  }

  gotoFiche() {
    this.setState({innermode:'fiche'});
  }

  getRecherche(value) {
     console.log('recherche', value);
     this.setState({innermode:'fiche', ...value});
  }


  render() {

    const {open, client, mode, clients} = this.props;
    const {
      client_id,
      nom, prenom,
      email, telephone, telephone2,
      adresse, adresse2,
      batiment, etage,
      codepostal, ville,
      commentaire,
      inscription
    } = this.getValeurs();

    const readytovalidate = nom!=='' && prenom!=='' && (telephone!=='' || EMAIL_REG.test(email));
    const mapid = 'map-none';

    const vmode = this.state.innermode || mode;

    console.log('clients', clients);

    return (
      <Modal open={open}>
        <div className="FicheClient">
          { vmode==='recherche' && (<div className="Modal-container recherche">
            <div className="recherche-cont">
              <Fab size="small" onClick={this.gotoFiche}>
                <PlusIcon />
              </Fab>
              <div className="titre">{ strings.modules.clients.edition.rechercher }</div>
              <Autocomplete
                className="recherche-input"
                id="clt-recherche"
                options={clients}
                onChange={(event, newValue) => {
                  this.getRecherche(newValue);
                }}
                getOptionLabel={(option) => option.prenom+' '+option.nom+' '+option.telephone}
                renderOption={(option) => (
                    <React.Fragment>
                      { option.prenom+' '+option.nom+' '+option.telephone }
                    </React.Fragment>
                  )}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label={ strings.modules.clients.edition.input }
                      variant="filled"
                      inputProps={{
                        ...params.inputProps,
                        autoComplete: 'new-password'
                      }}
                    />
                  )}
                />
            </div>
          </div>)}
          { vmode==='fiche' && (<div className="Modal-container">
            <div className="body"><div className="col">
                <div className="title">{client_id==null ? strings.modules.clients.edition.ajouter : strings.modules.clients.edition.editer }</div>
                <div className="section-fidelite">
                  <LabelledField 
                      id={ `clientid` }
                      name={ `clientid` }
                      className="fieldclientid"
                      value={ client_id } 
                      placeholder='' 
                      type='text' 
                      readOnly={ true } 
                      onChange={ console.log }
                      label={ strings.modules.clients.edition.code }
                  />
                  <LabelledField 
                      id={ `inscription` }
                      name={ `inscription` }
                      className="fieldinscription"
                      value={ format(inscription, "d MMM yyyy", { locale: frLocale }) } 
                      placeholder='' 
                      type='text' 
                      readOnly={ true } 
                      onChange={ console.log }
                      label={ strings.modules.clients.edition.inscription }
                  />
                  {/* <SwitchCheckbox 
                    isChecked={ (client!==null && client.bloque) } 
                    key={ `bloque` }
                    name={ 'bloque' } 
                    className="check-bloque"
                    small={ true }
                    onChange={ console.log } 
                    label={ strings.modules.clients.edition.bloquer } 
                  /> */}
                  {/* <div className="fid">
                    <LabelledField 
                        id={ `achats` }
                        name={ `achats` }
                        className="fieldachats"
                        value={ client && client.fidelite.achats } 
                        placeholder='' 
                        type='text' 
                        readOnly={ true } 
                        onChange={ console.log }
                        label={ strings.modules.clients.edition.total }
                    />
                    <LabelledField 
                        id={ `points` }
                        name={ `points` }
                        className="fieldpoints"
                        value={ client && client.fidelite.points } 
                        placeholder='' 
                        type='text' 
                        readOnly={ true } 
                        onChange={ console.log }
                        label={ strings.modules.clients.edition.points }
                    />
                    <LabelledField 
                        id={ `utilises` }
                        name={ `utilises` }
                        className="fieldutilises"
                        value={ client && client.fidelite.utilises } 
                        placeholder='' 
                        type='text' 
                        readOnly={ true } 
                        onChange={ console.log }
                        label={ strings.modules.clients.edition.utilises }
                    />
                  </div> */}
                </div>
                <div className="section-fiche">  
                  <LabelledField 
                      id={ `nom` }
                      name={ `nom` }
                      className="fieldnom"
                      value={ nom } 
                      placeholder='' 
                      type='text' 
                      readOnly={ false } 
                      onChange={(val)=>{ this.updateValue({nom:val.value}) }}
                      label={ strings.modules.clients.edition.nom }
                  />
                  <LabelledField 
                      id={ `prenom` }
                      name={ `prenom` }
                      className="fieldprenom"
                      value={ prenom } 
                      placeholder='' 
                      type='text' 
                      readOnly={ false } 
                      onChange={(val)=>{ this.updateValue({prenom:val.value}) }}
                      label={ strings.modules.clients.edition.prenom }
                  />
                  <LabelledField 
                      id={ `adresse1` }
                      name={ `adresse1` }
                      className="fieldadresse1"
                      value={ adresse } 
                      placeholder='' 
                      type='text' 
                      readOnly={ false } 
                      onChange={(val)=>{ this.updateValue({adresse:val.value}) }}
                      label={ strings.modules.clients.edition.adresse1 }
                  />
                  <LabelledField 
                      id={ `adresse2` }
                      name={ `adresse2` }
                      className="fieldadresse2"
                      value={ adresse2 } 
                      placeholder='' 
                      type='text' 
                      readOnly={ false } 
                      onChange={(val)=>{ this.updateValue({adresse2:val.value}) }}
                      label={ strings.modules.clients.edition.adresse2 }
                  />
                  <LabelledField 
                      id={ `batiment` }
                      name={ `batiment` }
                      className="fieldbatiment"
                      value={ batiment } 
                      placeholder='' 
                      type='text' 
                      readOnly={ false } 
                      onChange={(val)=>{ this.updateValue({batiment:val.value}) }}
                      label={ strings.modules.clients.edition.batiment }
                  />
                  <LabelledField 
                      id={ `etage` }
                      name={ `etage` }
                      className="fieldetage"
                      value={ etage } 
                      placeholder='' 
                      type='text' 
                      readOnly={ false } 
                      onChange={(val)=>{ this.updateValue({etage:val.value}) }}
                      label={ strings.modules.clients.edition.etage }
                  />
                  <LabelledField 
                      id={ `email` }
                      name={ `email` }
                      className="fieldemail"
                      value={ email } 
                      placeholder='' 
                      type='text' 
                      readOnly={ false } 
                      onChange={(val)=>{ this.updateValue({email:val.value}) }}
                      label={ strings.modules.clients.edition.email }
                  />
                  <LabelledField 
                      id={ `codepostal` }
                      name={ `codepostal` }
                      className="fieldcodepostal"
                      value={ codepostal } 
                      placeholder='' 
                      type='text' 
                      readOnly={ false } 
                      onChange={(val)=>{ this.updateValue({codepostal:val.value}) }}
                      label={ strings.modules.clients.edition.codepostal }
                  />
                  <LabelledField 
                      id={ `ville` }
                      name={ `ville` }
                      className="fieldville"
                      value={ ville } 
                      placeholder='' 
                      type='text' 
                      readOnly={ false } 
                      onChange={(val)=>{ this.updateValue({ville:val.value}) }}
                      label={ strings.modules.clients.edition.ville }
                  />
                  <LabelledField 
                      id={ `tel1` }
                      name={ `tel1` }
                      className="fieldtel1"
                      value={ telephone } 
                      placeholder='' 
                      type='text' 
                      readOnly={ false } 
                      onChange={(val)=>{ this.updateValue({telephone:val.value}) }}
                      label={ strings.modules.clients.edition.tel1 }
                  />
                  <LabelledField 
                      id={ `tel2` }
                      name={ `tel2` }
                      className="fieldtel2"
                      value={ telephone2 } 
                      placeholder='' 
                      type='text' 
                      readOnly={ false } 
                      onChange={(val)=>{ this.updateValue({ttelephone2:val.value}) }}
                      label={ strings.modules.clients.edition.tel2 }
                  />
                  <div className="remarque">
                    <label>{ strings.modules.clients.edition.remarque }</label>
                    <textarea value={ commentaire } onChange={(event)=>{this.updateValue({commentaire:event.target.value}) }} />
                  </div>
                </div>
              </div>
              <div className="col">
                <div className={ `map ${ mapid }` }>
                  <MapIcon className="emptymap"/>
                </div>
              </div>
            </div>
            <div className="footer">
              <StdButton 
                identifier="modal-select" 
                elementclass={ `select${((client_id&&client)?' unselect':'')}` } 
                icon={ false } 
                disabled={ !readytovalidate }
                text={ client_id ? client ? strings.modules.clients.edition.unselect : strings.general.dialog.select : strings.modules.clients.edition.save_select } 
                onClick={this.handleSelect} 
              />
              <StdButton 
                identifier="modal-save" 
                elementclass="save" 
                icon={ false } 
                disabled={ !readytovalidate }
                text={ strings.general.dialog.save } 
                onClick={this.saveClient} 
              />
            </div>
          </div>)}
          <Fab aria-label="close" size="small" className="close-button" onClick={ this.closePopin }>
            <CloseIcon />
          </Fab>
        </div>
      </Modal>
    );
  }

}
export default FicheClient;