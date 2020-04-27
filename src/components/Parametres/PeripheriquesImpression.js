import React from 'react';
import { Table, TableHead, TableRow, TableCell, TableBody, Fab, Modal, FormControl, Select, MenuItem } from '@material-ui/core';

import LocalizedStrings from 'react-localization';
import {data} from '../../constants/translations';
import AddIcon from '../common/icon/AddIcon';
import LabelledField from '../common/LabelledField';
import CloseIcon from '../common/icon/CloseIcon';
import SwitchCheckbox from '../common/SwitchCheckbox';
import StdButton from '../common/StdButton';


let strings = new LocalizedStrings(data);


class EditImprimantePopin extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      printer_id: null,
      nom: '',
      connexion: '',
      param: '',
      encoding: '',
      pardefaut: false,
      fallback: null
    }

    this.updateValue = this.updateValue.bind(this);
    this.getValues = this.getValues.bind(this);
    this.saveImprimante = this.saveImprimante.bind(this);
    this.resetPopin = this.resetPopin.bind(this);
  }

  componentDidMount() {
    const st = {
      printer_id: this.props.imprimante && this.props.imprimante.printer_id,
      nom: this.props.imprimante && this.props.imprimante.nom,
      connexion: this.props.imprimante && this.props.imprimante.connexion,
      param: this.props.imprimante && this.props.imprimante.param,
      encoding: this.props.imprimante && this.props.imprimante.encoding,
      pardefaut: this.props.imprimante && this.props.imprimante.pardefaut,
      fallback: this.props.imprimante && this.props.imprimante.fallback
    }
    console.log('componentDidMount', st);
    this.setState(st);
  }

  updateValue(value) {
    console.log('updateValue', value);
    this.setState(value);
  }

  getValues() {
    const { printer_id, nom, connexion, param, encoding, pardefaut, fallback } = this.props.imprimante || {printer_id:null, nom:null, connexion:null, param:null, encoding:null, pardefaut:false, fallback:null};
    
    const sprinter_id = this.state.printer_id;
    const snom = this.state.nom;
    const sconnexion = this.state.connexion;
    const sparam = this.state.param;
    const sencoding = this.state.encoding;
    const spardefaut = this.state.pardefaut;
    const sfallback = this.state.fallback;
    
    return {
      printer_id: sprinter_id || printer_id,
      nom: snom || nom,
      connexion: sconnexion || connexion,
      param: sparam || param,
      encoding: sencoding || encoding,
      pardefaut: spardefaut || pardefaut,
      fallback: sfallback || fallback
    };
  }


  resetPopin() {
    const droits = {};
    const st = {
      printer_id: null,
      nom: '',
      connexion: null,
      param: '',
      encoding: null,
      pardefaut: false,
      fallback: null
    }
    this.setState(st);
  }
  
  saveImprimante() {

    const printer_id = this.props.imprimante && this.props.imprimante.printer_id || null;
    let state = this.state;

    this.props.saveImprimante(printer_id, state);
    this.resetPopin();
    this.props.closeHandler();

  }

  render() {

    const { imprimante, editOpen, closeHandler, allprinters } = this.props;
    const { printer_id, nom, connexion, param, encoding, pardefaut, fallback } = this.getValues();


    console.log('render connexion', connexion);

    const incomplete = !nom || connexion==null;

    return (
      <Modal open={ editOpen } >
        <div className="EditImprimanteModal">
          <div className="Modal-container">
            <div className="header">
              <div className="title">{ imprimante==null ? strings.modules.parametres.submodules.peripheriques.impression.imprimantes.edition.new : strings.modules.parametres.submodules.peripheriques.impression.imprimantes.edition.edit }</div>
            </div>
            <div className="body">
              <LabelledField
                id="nom"
                name="nom"
                className="fieldnom"
                value={ nom }
                placeholder=""
                type="text"
                readOnly={ false }
                onChange={(val)=>{ this.updateValue({nom:val.value}) }}
                label={ strings.modules.parametres.submodules.peripheriques.impression.imprimantes.edition.nom }
              />
              <SwitchCheckbox 
                isChecked={ pardefaut } 
                key="pardefaut"
                name="pardefaut" 
                className="pardefaut"
                small={ true }
                labelLeft={ true }
                onChange={ (name,checked) => { this.updateValue(Object.fromEntries([[name, checked]])) }} 
                label={ strings.modules.parametres.submodules.peripheriques.impression.imprimantes.edition.default } 
              />
              <FormControl variant="outlined" className="selecteur-group selecteur-connexion">
                <div className="select-label">{ strings.modules.parametres.submodules.peripheriques.impression.imprimantes.edition.connexion }</div>
                <Select value={connexion} onChange={(event) => { this.updateValue({connexion: event.target.value}) }} className="selecteur selecteur-connexion">
                  {Object.entries(strings.modules.parametres.submodules.peripheriques.impression.imprimantes.edition.connexion_liste).map(([conid, conval]) => (
                    <MenuItem key={ `cashitm${conid}`} value={ conid }>{ conval }</MenuItem>
                    ))}
                </Select>
              </FormControl>
              <LabelledField
                id="param"
                name="param"
                className="fieldparam"
                value={ param }
                placeholder=""
                type="text"
                readOnly={ false }
                onChange={(val)=>{ this.updateValue({param:val.value}) }}
                label={ strings.modules.parametres.submodules.peripheriques.impression.imprimantes.edition.parametre }
              />
              <FormControl variant="outlined" className="selecteur-group selecteur-encodage">
                <div className="select-label">{ strings.modules.parametres.submodules.peripheriques.impression.imprimantes.edition.encodage }</div>
                <Select value={encoding} onChange={(event) => { this.updateValue({encoding: event.target.value}) }} className="selecteur selecteur-encodage">
                  {Object.entries(strings.modules.parametres.submodules.peripheriques.impression.imprimantes.edition.encodage_liste).map(([encid, encval]) => (
                    <MenuItem key={ `cashitm${encid}`} value={ encid }>{ encval }</MenuItem>
                    ))}
                </Select>
              </FormControl>
              <FormControl variant="outlined" className="selecteur-group selecteur-fallback">
                <div className="select-label">{ strings.modules.parametres.submodules.peripheriques.impression.imprimantes.edition.fallback }</div>
                <Select value={fallback} onChange={(event) => { this.updateValue({fallback: event.target.value}) }} className="selecteur selecteur-fallback">
                <MenuItem key={ `cashitmnull`} value=''>{ strings.modules.parametres.submodules.peripheriques.impression.imprimantes.edition.no_fallback }</MenuItem>
                  {allprinters.map(prnt => (
                    prnt.id!=printer_id  && <MenuItem key={ `cashitm${prnt.id}`} value={ prnt.id }>{ prnt.nom }</MenuItem>
                    ))}
                </Select>
              </FormControl>
            </div>
            <div className="footer">
              <StdButton 
                identifier="modal-save" 
                elementclass="save" 
                icon={ false } 
                disabled={ incomplete }
                text={ strings.general.dialog.save } 
                onClick={this.saveImprimante} 
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





function ListeImpression(props) {
  const { liste, type, id, openEdit, ...other } = props;


  return (
    <Table stickyHeader size="small" key={id} aria-label="a dense table">
      <TableHead>
        <TableRow>
          <TableCell key={`${id}-hd-nom`} className="liste-nom">{ strings.modules.parametres.submodules.peripheriques.impression[type].liste.nom }</TableCell>
          <TableCell key={`${id}-hd-type`} className="liste-type">{ strings.modules.parametres.submodules.peripheriques.impression[type].liste.type }</TableCell>
          <TableCell key={`${id}-hd-param`} className="liste-param">{ strings.modules.parametres.submodules.peripheriques.impression[type].liste.parametre }</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {liste.map((row, i) => (
          <TableRow key={row.id} className={(i%2)?'odd':'even'}>
            <TableCell key={`${i}-imp-nom`} className={ `liste-nom` }><div onClick={ () => { openEdit(row.id) } }>{ row.nom }</div></TableCell>
            <TableCell key={`${i}-imp-connexion`} className="liste-type">{ row.type }</TableCell>
            <TableCell key={`${i}-param`} className="liste-param">{row.param}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
} 



class PeripheriquesImpression extends React.Component {

  constructor(props) {
    super(props);
    
    this.state = {
      imprimante: null,
      editImprimanteOpen: false,
      ticket: null,
      editTicketOpen: false
    };

    this.openImprimanteEdit = this.openImprimanteEdit.bind(this);
    this.closeImprimanteEdit = this.closeImprimanteEdit.bind(this);
    this.saveImprimante = this.saveImprimante.bind(this);
    this.openTicketEdit = this.openTicketEdit.bind(this);
    this.closeTicketEdit = this.closeTicketEdit.bind(this);
    this.saveTicket = this.saveTicket.bind(this);

  }


  componentDidMount() {
    this.props.getAllImprimantes();
    this.props.getAllTickets();
  }

  openImprimanteEdit(impid=null) {
    console.log('openImprimanteEdit '+impid);
    const {imprimantes} = this.props;
    if (impid!==null) {
      this.setState({imprimante:imprimantes[impid], editImprimanteOpen:true});
    }
    else {
      this.setState({editImprimanteOpen: true});
    }
  }
  closeImprimanteEdit() {
    this.setState({imprimante: null, editImprimanteOpen: false});
  }
  saveImprimante(id, valeurs) {
    if (id) {
      this.props.updateImprimante({printer_id:id, data:valeurs});
    }
    else {
      this.props.createImprimante(valeurs);
    }
  }


  openTicketEdit(tckid=null) {
    console.log('openTicketEdit '+tckid);
    const {tickets} = this.props;
    if (tckid!==null) {
      this.setState({ticket:tickets[tckid], editTicketOpen:true});
    }
    else {
      this.setState({editTicketOpen: true});
    }
  }
  closeTicketEdit() {
    this.setState({ticket: null, editTicketOpen: false});
  }
  saveTicket(id, valeurs) {
    if (id) {
      this.props.updateTicket({ticket_id:id, data:valeurs});
    }
    else {
      this.props.createTicket(valeurs);
    }
  }


  render() {

    const { imprimante, editImprimanteOpen, ticket, editTicketOpen } = this.state;
    const { imprimantes, tickets } = this.props;

    const imprimantes_liste = Object.values(imprimantes).map(imp => {
      return {
        nom: imp.nom,
        id: imp.printer_id,
        type: imp.connexion,
        param: imp.param
      };
    });
    const tickets_liste = Object.values(tickets).map(tck => {
      const printlist = tck.imprimantes.map(i=>imprimantes[i].nom);
      return {
        nom: tck.nom,
        id: tck.ticket_id,
        type: tck.template,
        param: printlist.join(', ')
      };
    });

    return (
    <div className="PeripheriquesImpression sectioncontent">
      <div className="Imprimantes">
        <div className="subttl">{ strings.modules.parametres.submodules.peripheriques.impression.imprimantes.titre }</div>
        <Fab aria-label="addprinter" size="small" className="addprinter-button" onClick={ ()=>{ this.openImprimanteEdit() } }>
          <AddIcon htmlColor="#ffffff" />
        </Fab>
        <div className="table-wrapper">
          {imprimantes && <ListeImpression liste={imprimantes_liste} type="imprimantes" id='printersliste' openEdit={this.openImprimanteEdit} />}
        </div>
      </div>
      <div className="Tickets">
        <div className="subttl">{ strings.modules.parametres.submodules.peripheriques.impression.tickets.titre }</div>
        <Fab aria-label="addticket" size="small" className="addticket-button" onClick={ ()=>{ this.openTicketEdit() } }>
          <AddIcon htmlColor="#ffffff" />
        </Fab>
        <div className="table-wrapper">
          {tickets && <ListeImpression liste={tickets_liste} type="tickets" id='ticketsliste' openEdit={this.openTicketEdit} />}
        </div>
      </div>
      <EditImprimantePopin imprimante={imprimante} editOpen={editImprimanteOpen} allprinters={imprimantes_liste} closeHandler={this.closeImprimanteEdit} saveImprimante={this.saveImprimante} />
    </div>
   );
  }
};

export default PeripheriquesImpression;