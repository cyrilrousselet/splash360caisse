import React from 'react';
import PropTypes from 'prop-types';

import LocalizedStrings from 'react-localization';
import {data} from '../../constants/translations';

import TopZone from '../../containers/TopZone';
import LoadingSpinner from './../common/LoadingSpinner';
import { Table, TableHead, TableCell, TableBody, TableRow, Modal, Fab } from '@material-ui/core';
import StdButton from './../common/StdButton';
import CrossIcon from './../common/icon/CrossIcon';
import HistoriqueIcon from './../common/icon/HistoriqueIcon';
import LabelledField from './../common/LabelledField';
import CloseIcon from './../common/icon/CloseIcon';
import SwitchCheckbox from './../common/SwitchCheckbox';

import 'date-fns';
import { format, startOfToday } from "date-fns";
import DateFnsUtils from '@date-io/date-fns';
import frLocale from "date-fns/locale/fr";
import MapIcon from './../common/icon/MapIcon';

let strings = new LocalizedStrings(data);


const clients_data = [
  {
    clientid: '123',
    nom: 'Rousselet',
    prenom: 'Cyril',
    adresse1: 'Lieu-dit Croazic',
    adresse2: '',
    codepostal: '29630',
    ville: 'Saint-Jean-du-Doigt',
    batiment: '',
    etage: '',
    complement: 'maison en bois',
    email: 'cyril@aqua-forte.net',
    tel1: '0663000561',
    tel2: '',
    remarque: 'pas de code',
    inscription: '2019-08-01',
    bloque: false,
    fidelite: {
      achats: 1097.5, points: 110, utilises: 50
    }
  },
  {
    clientid: '150',
    nom: 'Clerriot',
    prenom: 'Ulysse',
    adresse1: '43 avenue Carnot',
    adresse2: '',
    codepostal: '78700',
    ville: 'Conflans-Sainte-Honorine',
    batiment: 'A',
    etage: '2',
    complement: 'code: 123A1',
    email: 'hello@aqua-forte.net',
    tel1: '0139194493',
    tel2: '0134900930',
    remarque: '',
    inscription: '2019-12-22',
    bloque: false,
    fidelite: {
      achats: 500, points: 200, utilises: 20
    }
  },
  {
    clientid: '158',
    nom: 'Dupont',
    prenom: 'Yann',
    adresse1: '127 rue Compans',
    adresse2: '',
    codepostal: '75019',
    ville: 'Paris',
    batiment: 'B',
    etage: '1',
    complement: 'code: 1769B',
    email: 'ydup@gmail.com',
    tel1: '0654667678',
    tel2: '',
    remarque: '',
    inscription: '2019-11-27',
    bloque: false,
    fidelite: {
      achats: 0, points: 0, utilises: 0
    }
  },
  {
    clientid: '170',
    nom: 'Saquet',
    prenom: 'Frodon',
    adresse1: '15 rue de la Butte',
    adresse2: '',
    codepostal: '95260',
    ville: 'Beaumont-sur-Oise',
    batiment: 'H',
    etage: '5',
    complement: 'code: 67A56',
    email: 'hobbit@gmail.com',
    tel1: '0654667878',
    tel2: '',
    remarque: '',
    inscription: '2019-11-28',
    bloque: false,
    fidelite: {
      achats: 0, points: 0, utilises: 0
    }
  }
];


class ClientModal extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      clientid: props.client && props.client.clientid,
      nom: props.client && props.client.nom,
      prenom: props.client && props.client.prenom,
      adresse1: props.client && props.client.adresse1,
      adresse2: props.client && props.client.adresse2,
      codepostal: props.client && props.client.codepostal,
      ville: props.client && props.client.ville,
      batiment: props.client && props.client.batiment,
      etage: props.client && props.client.etage,
      complement: props.client && props.client.complement,
      email: props.client && props.client.email,
      tel1: props.client && props.client.tel1,
      tel2: props.client && props.client.tel2,
      remarque: props.client && props.client.remarque,
      inscription: props.client && props.client.inscription,
      bloque: props.client && props.client.bloque,
      achats: props.client && props.client.fidelite.achats,
      points: props.client && props.client.fidelite.points,
      utilises: props.client && props.client.fidelite.utilises
    }

  }

  
  updateValue(value) {
    this.setState(value);
  }

  render() {

    const { client, editOpen, closeHandler } = this.props;

    const mapid = client ? `map-${ client.clientid}`: 'map-none';

    const clientid = (client && client.clientid)==null ? '' : client.clientid;
    const inscription = (client && client.inscription)==null ? startOfToday() : new Date(client.inscription);

    return (
      <Modal open={ editOpen } >
        <div className="ClientModal">
          <div className="Modal-container">
            <div className="body">
              <div className="col">
                <div className="title">{client==null ? strings.modules.clients.edition.ajouter : strings.modules.clients.edition.editer }</div>
                <div className="section-fidelite">
                  <LabelledField 
                      id={ `clientid` }
                      name={ `clientid` }
                      className="fieldclientid"
                      value={ clientid } 
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
                      value={ format(inscription, "d MMM yyyy", { locale: this.locale }) } 
                      placeholder='' 
                      type='text' 
                      readOnly={ true } 
                      onChange={ console.log }
                      label={ strings.modules.clients.edition.inscription }
                  />
                  <SwitchCheckbox 
                    isChecked={ (client!==null && client.bloque) } 
                    key={ `bloque` }
                    name={ 'bloque' } 
                    className="check-bloque"
                    small={ true }
                    onChange={ console.log } 
                    label={ strings.modules.clients.edition.bloquer } 
                  />
                  <div className="fid">
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
                  </div>
                </div>
                <div className="section-fiche">  
                  <LabelledField 
                      id={ `nom` }
                      name={ `nom` }
                      className="fieldnom"
                      value={ client && client.nom } 
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
                      value={ client && client.prenom } 
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
                      value={ client && client.adresse1 } 
                      placeholder='' 
                      type='text' 
                      readOnly={ false } 
                      onChange={(val)=>{ this.updateValue({adresse1:val.value}) }}
                      label={ strings.modules.clients.edition.adresse1 }
                  />
                  <LabelledField 
                      id={ `adresse2` }
                      name={ `adresse2` }
                      className="fieldadresse2"
                      value={ client && client.adresse2 } 
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
                      value={ client && client.batiment } 
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
                      value={ client && client.etage } 
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
                      value={ client && client.email } 
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
                      value={ client && client.codepostal } 
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
                      value={ client && client.ville } 
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
                      value={ client && client.tel1 } 
                      placeholder='' 
                      type='text' 
                      readOnly={ false } 
                      onChange={(val)=>{ this.updateValue({tel1:val.value}) }}
                      label={ strings.modules.clients.edition.tel1 }
                  />
                  <LabelledField 
                      id={ `tel2` }
                      name={ `tel2` }
                      className="fieldtel2"
                      value={ client && client.tel2 } 
                      placeholder='' 
                      type='text' 
                      readOnly={ false } 
                      onChange={(val)=>{ this.updateValue({tel2:val.value}) }}
                      label={ strings.modules.clients.edition.tel2 }
                  />
                  <div className="remarque">
                    <label>{ strings.modules.clients.edition.remarque }</label>
                    <textarea value={ client && client.remarque }></textarea>
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
                identifier="modal-save" 
                elementclass="save" 
                icon={ false } 
                text={ strings.general.dialog.save } 
                onClick={closeHandler} 
              />
            </div>
          </div>
          <Fab aria-label="close" size="small" className="close-button" onClick={ closeHandler }>
            <CloseIcon />
          </Fab>
        </div>
      </Modal>
    );

  }

}


class Clients extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      client: null,
      editOpen: false,
      historiqueOpen: false
    }
    this.openEdit = this.openEdit.bind(this);
    this.closeEdit = this.closeEdit.bind(this);
    this.openHistorique = this.openHistorique.bind(this);
    this.closeHistorique = this.closeHistorique.bind(this);
    
  }
  componentDidMount() {
    this.props.getClients();
  }


  openEdit(clientid=null) {
    console.log(clientid);
    if (clientid!==null) {
      const {clients} = this.props;
      this.setState({client:clients.filter(c=>c.client_id==clientid), editOpen: true});
    }
    else {
      this.setState({client:null, editOpen: true});
    }
  }
  closeEdit() {
    this.setState({editOpen: false});
  }

  openHistorique(clientid) {
    console.log(clientid);
  //  this.setState({client:clients_data[clientid], historiqueOpen: true});
  }
  closeHistorique() {
    this.setState({historiqueOpen: false});
  }

 render() {

  const { clients } = this.props;

  const { client, editOpen, historiqueOpen } = this.state;

  return (
    <div className="Clients container">
      <TopZone />
      <div className="MainZone">
        <div className="toolbar">
          <StdButton 
            identifier="adduser" 
            elementclass="adduser-btn" 
            icon={ false } 
            text={ strings.modules.clients.edition.ajouter } 
            onClick={() => { this.openEdit() }} 
          />
        </div>
        <div className="table-wrapper">
        <Table stickyHeader size="small" aria-label="a dense table">
            <TableHead>
              <TableRow>
                <TableCell key={`hd-nom`} className="liste-nom">{ strings.modules.clients.liste.nom }</TableCell>
                <TableCell key={`hd-prenom`} className="liste-prenom">{ strings.modules.clients.liste.prenom }</TableCell>
                <TableCell key={`hd-tel1`} className="liste-tel1">{ strings.modules.clients.liste.tel1 }</TableCell>
                <TableCell key={`hd-email`} className="liste-email">{ strings.modules.clients.liste.email }</TableCell>
                <TableCell key={`hd-codepostal`} className="liste-codepostal">{ strings.modules.clients.liste.codepostal }</TableCell>
                <TableCell key={`hd-ville`} className="liste-ville">{ strings.modules.clients.liste.ville }</TableCell>
                <TableCell key={`hd-actions`} className="liste-actions">{ strings.modules.clients.liste.actions }</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {clients.map((row, i) => (
                <TableRow key={row.clientid} className={(i%2)?'odd':'even'}>
                  <TableCell key={`${i}-nom`} className="liste-nom"><div onClick={ () => { this.openEdit(i) } }>{ row.nom }</div></TableCell>
                  <TableCell key={`${i}-prenom`} className="liste-prenom"><div onClick={ () => { this.openEdit(i) } }>{ row.prenom }</div></TableCell>
                  <TableCell key={`${i}-tel1`} className="liste-tel1">{ row.telephone }</TableCell>
                  <TableCell key={`${i}-email`} className="liste-email">{ row.email }</TableCell>
                  <TableCell key={`${i}-codepostal`} className="liste-codepostal">{ row.codepostal }</TableCell>
                  <TableCell key={`${i}-ville`} className="liste-ville">{ row.ville }</TableCell>
                  <TableCell key={`${i}-actions`} className="liste-actions">
                    <StdButton key={`${i}-supprimer`} identifier='supprimer' elementclass="action action-supprimer" icon={ <CrossIcon /> } noStroke={true} text='' onClick={() => { console.log('confirm suppr.') }} />
                    {/* <StdButton key={`${i}-historique`} identifier='historique' elementclass="action action-historique" icon={ <HistoriqueIcon /> } noStroke={true} text='' onClick={() => { this.openHistorique(i) }} /> */}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
      <ClientModal client={client} editOpen={editOpen} closeHandler={this.closeEdit} />
    </div>
    );
  }
}
export default Clients;

// Cloture.propTypes = {
//   catalogue: PropTypes.array,
//   loading: PropTypes.bool,
//   error: PropTypes.string,
//   getAllActive: PropTypes.func
// }