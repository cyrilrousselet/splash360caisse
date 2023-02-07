import React from 'react';
import { Table, TableHead, TableRow, TableCell, TableBody, Fab, Modal, FormControl, Select, MenuItem } from '@material-ui/core';

import LocalizedStrings from 'react-localization';
import {data} from '../../constants/translations';
import AddIcon from '../common/icon/AddIcon';
import LabelledField from '../common/LabelledField';
import CloseIcon from '../common/icon/CloseIcon';
import SwitchCheckbox from '../common/SwitchCheckbox';
import StdButton from '../common/StdButton';
import CheckIcon from '@material-ui/icons/Check';
import logger from '../../helpers/Logger';


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
    logger.info('componentDidMount', st);
    this.setState(st);
  }

  updateValue(value) {
    logger.info('updateValue', value);
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

    const printer_id = (this.props.imprimante && this.props.imprimante.printer_id) || null;
    let state = this.state;

    this.props.saveImprimante(printer_id, state);
    this.resetPopin();
    this.props.closeHandler();

  }

  render() {

    const { imprimante, editOpen, closeHandler, allprinters } = this.props;
    const { printer_id, nom, connexion, param, encoding, pardefaut, fallback } = this.getValues();


    logger.info('render connexion', connexion);

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
                value={ nom || '' }
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
                value={ param || '' }
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
                    prnt.id!==printer_id  && <MenuItem key={ `cashitm${prnt.id}`} value={ prnt.id }>{ prnt.nom }</MenuItem>
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


class EditTicketPopin extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      ticket_id: null,
      nom: null,
      template: null,
      imprimantes: null,
      kds: null,
      indirect: null,
      variante: 1
    }

    this.updateValue = this.updateValue.bind(this);
    this.getValues = this.getValues.bind(this);
    this.saveTicket = this.saveTicket.bind(this);
    this.resetPopin = this.resetPopin.bind(this);
    this.updateImprimantesSelection = this.updateImprimantesSelection.bind(this);
  }

  componentDidMount() {
    const st = {
      ticket_id: this.props.ticket && this.props.ticket.ticket_id,
      nom: this.props.ticket && this.props.ticket.nom,
      template: this.props.ticket && this.props.ticket.template,
      imprimantes: this.props.ticket && this.props.ticket.imprimantes,
      kds: this.props.ticket && this.props.ticket.kds,
      indirect: this.props.ticket && this.props.ticket.indirect,
      variante: this.props.ticket && this.props.ticket.variante,
    }
    logger.info('componentDidMount', st);
    this.setState(st);
  }

  updateValue(value) {
    logger.info('updateValue', value);
    this.setState(value);
  }

  updateImprimantesSelection(value) {
    const { imprimantes } = this.getValues();
    let idx = imprimantes.findIndex(prnt=>prnt===value);
    logger.info('updateImprimantesSelection', value);
    if (idx===-1) {
      this.setState({imprimantes:[...imprimantes, value]});
    } else {
     // const __upd = imprimantes.splice(idx,1);
      this.setState({imprimantes: imprimantes.filter(imp=>imp!==value)});
    }
  }

  getValues() {
    const { ticket_id, nom, template, imprimantes, kds, indirect, variante } = this.props.ticket || {ticket_id:null, nom:null, template:null, imprimantes:[], kds:null, indirect:null, variante:1};
    
    const sticket_id = this.state.ticket_id;
    const snom = this.state.nom;
    const stemplate = this.state.template;
    const simprimantes = this.state.imprimantes;
    const skds = this.state.kds;
    const sindirect = this.state.indirect;
    const svariante = this.state.variante;
    
    return {
      ticket_id: sticket_id || ticket_id,
      nom: snom || nom,
      template: stemplate || template,
      imprimantes: simprimantes || imprimantes,
      kds: skds==null ? kds : skds,
      indirect: sindirect==null ? indirect : sindirect,
      variante: svariante==null ? variante : svariante
    };
  }


  resetPopin() {
    const st = {
      ticket_id: null,
      nom: null,
      template: null,
      imprimantes: null,
      kds: null,
      indirect: null,
      variante: 1
    }
    this.setState(st);
  }
  
  saveTicket() {

    const ticket_id = (this.props.ticket && this.props.ticket.ticket_id) || null;
    let state = this.state;

    this.props.saveTicket(ticket_id, state);
    this.resetPopin();
    this.props.closeHandler();

  }

  render() {

    const { ticket, editOpen, closeHandler, allprinters } = this.props;
    const { ticket_id, nom, template, imprimantes, kds, indirect, variante } = this.getValues();

    const incomplete = !nom || template===null;

    const isImprimanteEnabled = (id) => {
      return imprimantes.indexOf(id)>-1;
    }

    return (
      <Modal open={ editOpen } >
        <div className="EditTicketModal">
          <div className="Modal-container">
            <div className="header">
              <div className="title">{ ticket==null ? strings.modules.parametres.submodules.peripheriques.impression.tickets.edition.new : strings.modules.parametres.submodules.peripheriques.impression.tickets.edition.edit+' #'+ticket_id }</div>
            </div>
            <div className="body">
              {(ticket && ticket.ticket_id!=='tck1') && (<LabelledField
                id="nom"
                name="nom"
                className="fieldnom"
                value={ nom }
                placeholder=""
                type="text"
                readOnly={ false }
                onChange={(val)=>{ this.updateValue({nom:val.value}) }}
                label={ strings.modules.parametres.submodules.peripheriques.impression.tickets.edition.nom }
              />)}
              {(ticket && ticket.ticket_id!=='tck1') && (<FormControl variant="outlined" className="selecteur-group selecteur-template">
                <div className="select-label">{ strings.modules.parametres.submodules.peripheriques.impression.tickets.edition.template }</div>
                <Select value={template} onChange={(event) => { this.updateValue({template: event.target.value}) }} className="selecteur selecteur-template">
                  {Object.entries(strings.modules.parametres.submodules.peripheriques.impression.tickets.edition.template_liste).map(([tplid, tplval]) => (
                    <MenuItem key={ `cashitm${tplid}`} value={ tplid }>{ tplval }</MenuItem>
                    ))}
                </Select>
              </FormControl>)}
              {(template && (["partiel","principal"]).includes(template)) && (
                <div className="template-variante">
                <SwitchCheckbox 
                    isChecked={ (variante===null || variante===undefined) ? false : variante===2 } 
                    key={ `tpl-variante` }
                    name={ `variante` } 
                    className="tpl-variante"
                    small={ true }
                    labelLeft={ false }
                    onChange={ (name,checked) => { this.updateValue({[name]: checked?2:1}) }} 
                    label={ strings.modules.parametres.submodules.peripheriques.impression.tickets.edition.template_variante } 
                    />
              </div>
              )}
              {(ticket && ticket.ticket_id!=='tck1') && (<div className="imprimantes-liste">
                <div className="liste-label">{ strings.modules.parametres.submodules.peripheriques.impression.tickets.edition.imprimantes }</div>
                <div className="liste-liste">
                  {allprinters.map(prnt => (
                      <SwitchCheckbox 
                      isChecked={ isImprimanteEnabled(prnt.id) } 
                      key={ `select-${prnt.id}` }
                      name={ prnt.id } 
                      className="imprimante-checkbox"
                      small={ true }
                      labelLeft={ false }
                      onChange={ (name,checked) => { this.updateImprimantesSelection(name) }} 
                      label={ prnt.nom } 
                      />
                    ))}
                </div>
              </div>)}
              <div className="kds">
              {(ticket && ticket.ticket_id!=='tck1') && (<div className="kds-activation">
                  <div className="liste-label">{ strings.modules.parametres.submodules.peripheriques.impression.tickets.edition.kds }</div>
                  <div className="liste-liste">
                    <SwitchCheckbox 
                      isChecked={ (kds===null || kds===undefined) ? false : kds } 
                      key={ `select-kds` }
                      name={ `kds` } 
                      className="kds-checkbox"
                      small={ true }
                      labelLeft={ false }
                      onChange={ (name,checked) => { this.updateValue({[name]: checked}) }} 
                      label={ strings.modules.parametres.submodules.peripheriques.impression.tickets.edition.kds_active } 
                      />
                  </div>
                </div>)}
                <div className="indirect">
                  <div className={ `liste-label${((kds || (ticket && ticket.ticket_id==='tck1'))?'':' disabled')}`}>{ strings.modules.parametres.submodules.peripheriques.impression.tickets.edition.indirect }</div>
                  <div className="liste-liste">
                    <SwitchCheckbox 
                      isChecked={ (indirect===null || indirect===undefined) ? false : indirect } 
                      key={ `select-indirect` }
                      name={ `indirect` } 
                      className="indirect-checkbox"
                      disabled={!kds && (ticket && ticket.ticket_id!=='tck1')}
                      small={ true }
                      labelLeft={ false }
                      onChange={ (name,checked) => { this.updateValue({[name]: checked}) }} 
                      label={ strings.modules.parametres.submodules.peripheriques.impression.tickets.edition.indirect_active } 
                      />
                  </div>
                </div>
              </div>
            </div>
            <div className="footer">
              <StdButton 
                identifier="modal-save" 
                elementclass="save" 
                icon={ false } 
                disabled={ incomplete }
                text={ strings.general.dialog.save } 
                onClick={this.saveTicket} 
              />
            </div>
          </div>
          <Fab aria-label="close" size="small" className="close-button" onClick={ () => { this.resetPopin(); closeHandler() }}>
            <CloseIcon />
          </Fab>
        </div>
      </Modal>
    );
  }
}




function ListeImpression(props) {
  const { liste, type, id, openEdit } = props;


  return (
    <Table stickyHeader size="small" key={id} aria-label="a dense table">
      <TableHead>
        <TableRow>
        {type==='tickets' && <TableCell key={`${id}-hd-id`} className="liste-id">{ strings.modules.parametres.submodules.peripheriques.impression[type].liste.id }</TableCell> }
          <TableCell key={`${id}-hd-nom`} className="liste-nom">{ strings.modules.parametres.submodules.peripheriques.impression[type].liste.nom }</TableCell>
          <TableCell key={`${id}-hd-type`} className="liste-type">{ strings.modules.parametres.submodules.peripheriques.impression[type].liste.type }</TableCell>
          <TableCell key={`${id}-hd-param`} className="liste-param">{ strings.modules.parametres.submodules.peripheriques.impression[type].liste.parametre }</TableCell>
          {type==='tickets' && <TableCell key={`${id}-hd-kds`} className="liste-kds">{ strings.modules.parametres.submodules.peripheriques.impression.tickets.liste.kds }</TableCell>}
          {type==='tickets' && <TableCell key={`${id}-hd-indirect`} className="liste-indirect">{ strings.modules.parametres.submodules.peripheriques.impression.tickets.liste.indirect }</TableCell>}
        </TableRow>
      </TableHead>
      <TableBody>
        {liste.map((row, i) => (
          <TableRow key={row.id} className={` ${((i%2)?'odd':'even')}${ (row.disabled?' disabled':'')}` }>
            {type==='tickets' && <TableCell key={`${i}-imp-id`} className={ `liste-id` }><div onClick={ () => { openEdit(row.id) } }>{ row.id }</div></TableCell> }
            <TableCell key={`${i}-imp-nom`} className={ `liste-nom` }><div onClick={ () => { openEdit(row.id) } }>{ row.nom }</div></TableCell>
            <TableCell key={`${i}-imp-connexion`} className="liste-type">{ row.type }</TableCell>
            <TableCell key={`${i}-param`} className="liste-param">{row.param}</TableCell>
            {type==='tickets' && <TableCell key={`${i}-kds`} className="liste-kds">{row.kds && <CheckIcon htmlColor="#7FAD3B" />}</TableCell>}
            {type==='tickets' && <TableCell key={`${i}-indirect`} className="liste-indirect">{row.indirect && <CheckIcon htmlColor="#7FAD3B" />}</TableCell>}
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
    logger.info('openImprimanteEdit '+impid);
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
    logger.info('openTicketEdit '+tckid);
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
        param: imp.param,
        disabled: false
      };
    });
    let tickets_liste = Object.values(tickets).map(tck => {
      const printlist = tck.imprimantes.map(i=>imprimantes[i].nom);
        return {
          nom: tck.nom,
          id: tck.ticket_id,
          type: tck.template,
          param: printlist.join(', '),
          weight: tck.weight,
          disabled: printlist.length===0 && !tck.kds,
          kds: tck.kds,
          indirect: tck.indirect,
        };
    });
    tickets_liste = tickets_liste.sort((a,b)=>a.weight-b.weight);
    tickets_liste = tickets_liste.filter(tck=>(['cloture_x','cloture_z','avoir','uber','deliveroo']).indexOf(tck.type)===-1);

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
        {/* <Fab aria-label="addticket" size="small" className="addticket-button" onClick={ ()=>{ this.openTicketEdit() } }>
          <AddIcon htmlColor="#ffffff" />
        </Fab> */}
        <div className="table-wrapper">
          {tickets && <ListeImpression liste={tickets_liste} type="tickets" id='ticketsliste' openEdit={this.openTicketEdit} />}
        </div>
      </div>
    {/*  <StdButton 
        identifier="printtest" 
        elementclass="printtest" 
        icon={ false } 
        disabled={ false }
        text={ 'Print test' } 
        onClick={() => {this.props.printTest()}} 
      />
      */}
      <EditImprimantePopin imprimante={imprimante} editOpen={editImprimanteOpen} allprinters={imprimantes_liste} closeHandler={this.closeImprimanteEdit} saveImprimante={this.saveImprimante} />
      <EditTicketPopin ticket={ticket} editOpen={editTicketOpen} allprinters={imprimantes_liste} closeHandler={this.closeTicketEdit} saveTicket={this.saveTicket} />
    </div>
   );
  }
};

export default PeripheriquesImpression;