import React from 'react';

import {data} from '../../constants/translations';
import LocalizedStrings from 'react-localization';
import LabelledField from '../common/LabelledField';
import SwitchCheckbox from '../common/SwitchCheckbox';
import StdButton from '../common/StdButton';
import AddIcon from '../common/icon/AddIcon';
import { Typography, Select, FormControl, MenuItem, Accordion, AccordionSummary, AccordionDetails, ListItem, ListItemText, ListItemSecondaryAction, ListItemIcon, List, Modal, Fab } from '@material-ui/core';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import LensIcon from '@material-ui/icons/Lens';
import CloseIcon from '../common/icon/CloseIcon';
import Clavier from '../common/Clavier';
// import Logger from '../../helpers/Logger';
import logger from '../../helpers/Logger';
import EditIcon from '../common/icon/EditIcon';
import CrossIcon from '../common/icon/CrossIcon';
import Swal from 'sweetalert2';

// const logger = new Logger();

let strings = new LocalizedStrings(data);


class Tables extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      salleId: null,
      salle: null,
      salleEditOpen: false,
      tableId: null,
      table: null,
      tableEditOpen: false
    }
    this.openSalleEdit = this.openSalleEdit.bind(this);
    this.closeSalleEdit = this.closeSalleEdit.bind(this);
    this.openTableEdit = this.openTableEdit.bind(this);
    this.closeTableEdit = this.closeTableEdit.bind(this);
    this.removeSalle = this.removeSalle.bind(this);
    this.removeTable = this.removeTable.bind(this);
  }

  componentDidMount() {
    this.props.getSallesList();
  }

  openSalleEdit(salleId=null) {
    logger.info('openSalleEdit('+salleId+')');
    const {salles} = this.props;
    if (salleId) {
      this.setState({salleEditOpen: true, salleId: salleId, salle: salles[salleId]});
    } else {
      this.setState({salleEditOpen: true});
    }
  }
  closeSalleEdit() {
    this.setState({salleEditOpen: false, salleId: null, salle: null});
  }
  openTableEdit(salleId, tableId=null) {
    logger.info('openTableEdit('+salleId+', '+tableId+')');
    const {salles} = this.props;
    if (tableId) {
      this.setState({tableEditOpen: true, salleId: salleId, tableId: tableId, table: salles[salleId].tables.find(t=>t.tableId===tableId)});
    } else {
      this.setState({tableEditOpen: true, salleId: salleId});
    }
  }
  closeTableEdit() {
    this.setState({tableEditOpen: false, salleId: null, tableId: null, table: null});
  }
  removeSalle(salleId) {
    logger.info('removeSalle()', salleId);

    const {salles, deleteSalle} = this.props;

    if (salles[salleId].tables && salles[salleId].tables.length>0) {

      Swal.fire({
        title: strings.modules.parametres.submodules.tables.salles.suppression.erreur.titre,
        text: strings.modules.parametres.submodules.tables.salles.suppression.erreur.texte,
        focusConfirm: true,
        showCancelButton: false,
        customClass: 'deleteerror',
        confirmButtonText: strings.general.dialog.back,
        buttonsStyling: false 
      });
    } else {
      Swal.fire({
        title: strings.modules.parametres.submodules.tables.salles.suppression.alerte.titre,
        text: strings.modules.parametres.submodules.tables.salles.suppression.alerte.texte,
        focusConfirm: true,
        showCancelButton: true,
        customClass: 'deleteconfirm',
        confirmButtonText: strings.general.dialog.delete,
        cancelButtonText: strings.general.dialog.cancel,
        buttonsStyling: false 
      })
      .then((result) => {
        if (result.value) {
          deleteSalle({salleId:salleId});
          this.closeSalleEdit();
        }
      });
    }


  }
  removeTable(salleId, tableId) {
    logger.info('removeTable()', tableId);

    const {salles, deleteTable} = this.props;

    const table = salles[salleId].tables.find(t=>t.tableId===tableId);
    if (table.status!=='free') {

      Swal.fire({
        title: strings.modules.parametres.submodules.tables.tables.suppression.erreur.titre,
        text: strings.modules.parametres.submodules.tables.tables.suppression.erreur.texte,
        focusConfirm: true,
        showCancelButton: false,
        customClass: 'deleteerror',
        confirmButtonText: strings.general.dialog.back,
        buttonsStyling: false 
      });
    } else {
      Swal.fire({
        title: strings.modules.parametres.submodules.tables.tables.suppression.alerte.titre,
        text: strings.modules.parametres.submodules.tables.tables.suppression.alerte.texte,
        focusConfirm: true,
        showCancelButton: true,
        customClass: 'deleteconfirm',
        confirmButtonText: strings.general.dialog.delete,
        cancelButtonText: strings.general.dialog.cancel,
        buttonsStyling: false 
      })
      .then((result) => {
        if (result.value) {
          deleteTable({salleId:salleId, tableId:tableId});
          this.closeTableEdit();
        }
      });
    }
  }

  render() {
    const { salleId, salle, salleEditOpen, tableId, table, tableEditOpen, clavier } = this.state;
    const { salles, activation, updateValeur, updateSalle, addSalle, updateTable, addTable } = this.props;


    logger.info('salleEditOpen', salleEditOpen);

    return(
      <div className="Tables subcontent">
        <div className="wrapper">
          <div className="sub-section">
            <div className="subttl">{ strings.modules.parametres.submodules.tables.activation }</div>
            <SwitchCheckbox 
              isChecked={ activation } 
              className="switch-activation"
              labelLeft={ true } 
              key={`activation`}
              name={ 'activation' } 
              onChange={ (name, isChecked)=>{
                updateValeur({
                  domaine: 'commandes',
                  cle: 'gestion_tables',
                  valeur: isChecked
                })
              } } 
              label={ '' } 
            />
          </div>
          <div className={`liste-zone${((activation===true)?'':' inactive')}`}>
            <div className={ `sub-section`}>
              <div className="subttl">{ strings.modules.parametres.submodules.tables.salles.liste.titre }</div>
              <Fab aria-label="addtype" size="small" disabled={!activation} className="addsalle-button" onClick={ ()=>{ this.openSalleEdit() } }>
                <AddIcon htmlColor="#ffffff" />
              </Fab>
            </div>
            <SalleListe data={Object.values(salles)} openEdit={this.openSalleEdit} editOpen={tableEditOpen} removeSalle={this.removeSalle} removeTable={this.removeTable} openTable={this.openTableEdit} />
          </div>
        </div>
        <SalleModal salleId={salleId} salle={salle} clavierOpen={clavier} open={salleEditOpen} closeHandler={this.closeSalleEdit} updateSalle={updateSalle} addSalle={addSalle} />
        <TableModal salleId={salleId} tableId={tableId} table={table} clavierOpen={clavier} open={tableEditOpen} closeHandler={this.closeTableEdit} updateTable={updateTable} addTable={addTable} />
        {/* <SalleModal salleId={salleId} salle={salle} clavierOpen={false} open={salleEditOpen} closeHandler={this.closeSalleEdit} updateSalle={updateSalle} addSalle={addSalle} /> */}
      </div>
    );

  }

}


export default Tables;





class SalleModal extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      nom: null,
      couleur: null
    };
    this.updateSalle = this.updateSalle.bind(this);
    this.resetPopin = this.resetPopin.bind(this);
    this.changeHandler = this.changeHandler.bind(this);
    this.onKeyboardChange = this.onKeyboardChange.bind(this);
    this.handleChangeCouleur = this.handleChangeCouleur.bind(this);
  }

  updateSalle() {
    const { salleId, salle, updateSalle, addSalle } = this.props;
    const { nom, couleur } = this.state;

    logger.info('updateSalle('+salleId+')',nom, couleur);

    let nnom = '';
    let ncouleur = couleur!==null ? couleur : salle.couleur;
    

    nnom = nom!==null ? nom : salle.nom;

    if (salleId!==null) {
      updateSalle({salleId:salleId, update:{nom:nnom, couleur:ncouleur}});
    } else {
      addSalle({nom:nnom, couleur:ncouleur});
    }
    

    this.resetPopin();
    this.props.closeHandler();

  }
  resetPopin() {
    this.setState({nom:null, couleur:null});
  }
  changeHandler(params) {
   logger.info('SalleModal.changeHandler()',params);
    this.setState({nom: params.value});
  }
  onKeyboardChange(input) {
    logger.info("Valeur Input changed", input);
    this.setState({ nom:input });
  };
  handleChangeCouleur(event) {
    this.setState({couleur:event.target.value});
  }

  render() {

    const { salle, closeHandler, open, clavierOpen } = this.props;
    const { nom, couleur } = this.state;

    logger.info('SalleModal', open);

    let vnom = '';
    let vcouleur = '';
    if (salle) {
      vnom = nom==null ? salle.nom : nom;
      vcouleur = couleur==null ? salle.couleur : couleur;
    }



    const readytosave = true;

    const mode = salle ? 'edit':'new';

    return (
      <div>
      <Modal
      open={open}
      >
      <div className={ `SalleModal`}>
        <div className="Modal-container">
          <div className="header">
            <div className="title">{ strings.modules.parametres.submodules.tables.salles.edition[mode].titre }</div>
          </div>
          <div className="body">
            <div className="form-group">
                <LabelledField
                    label={ strings.modules.parametres.submodules.tables.salles.edition.nom}
                    name="nom"
                    className="nom-input"
                    value={vnom}
                    type="text"
                    onChange={this.changeHandler}
                  />
            </div>
            <div className="form-group color">
              <div className="label color-label">{ strings.modules.parametres.submodules.tables.salles.edition.couleur }</div>
              <FormControl variant="filled" className={"color-selector"}>
                <Select
                  labelId="demo-simple-select-filled-label"
                  id="demo-simple-select-filled"
                  value={vcouleur}
                  onChange={this.handleChangeCouleur}
                  >{Object.entries(strings.modules.parametres.submodules.tables.salles.edition.couleurs).map(([cle,val],i) => (
                    <MenuItem key={`coul${i}`} value={cle}>{<LensIcon htmlColor={val} />}</MenuItem>
                    ))}
                </Select>
              </FormControl> 
            </div>
          </div>
          <div className="footer">
            <StdButton
              identifier="modal-save" 
              elementclass="save" 
              icon={ false } 
              disabled={ !readytosave }
              text={ strings.general.dialog.save } 
              onClick={this.updateSalle} 
            />
          </div>
        </div>
        <Fab aria-label="close" size="small" className="close-button" onClick={ ()=>{this.resetPopin(); closeHandler()} }>
          <CloseIcon />
        </Fab>
      </div>
    </Modal>  
    {(clavierOpen && open) && <Clavier onChange={this.onKeyboardChange} className="ClavierSalle" defaultLayout="numeric" baseClass="KBComment" inputName="valeur" inputVal={vnom} open={open && clavierOpen} />}
    </div>
    );
  }

}



class TableModal extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      nom: null
    };
    this.updateTable = this.updateTable.bind(this);
    this.resetPopin = this.resetPopin.bind(this);
    this.changeHandler = this.changeHandler.bind(this);
    this.onKeyboardChange = this.onKeyboardChange.bind(this);
  }

  updateTable() {
    const { salleId, tableId, table, updateTable, addTable } = this.props;
    const { nom } = this.state;

    logger.info('updateTable('+salleId+', '+tableId+')',nom);

    let nnom = '';
    
    nnom = nom!==null ? nom : table.nom;

    if (tableId!==null) {
      updateTable({salleId:salleId, tableId:tableId, update:{nom:nnom}});
    } else {
      addTable({salleId:salleId, nom:nnom});
    }
    

    this.resetPopin();
    this.props.closeHandler();

  }
  resetPopin() {
    this.setState({nom:null});
  }
  changeHandler(params) {
   logger.info('TableModal.changeHandler()',params);
    this.setState({nom: params.value});
  }
  onKeyboardChange(input) {
    logger.info("Valeur Input changed", input);
    this.setState({ nom:input });
  };

  render() {

    const { table, closeHandler, open, clavierOpen } = this.props;
    const { nom } = this.state;


    let vnom = '';
    if (table) {
      vnom = nom==null ? table.nom : nom;
    }



    const readytosave = true;

    const mode = table ? 'edit':'new';

    return (
      <div>
      <Modal
      open={open}
      >
      <div className={ `TableModal`}>
        <div className="Modal-container">
          <div className="header">
            <div className="title">{ strings.modules.parametres.submodules.tables.tables.edition[mode].titre }</div>
          </div>
          <div className="body">
            <div className="form-group">
                <LabelledField
                    label={ strings.modules.parametres.submodules.tables.salles.edition.nom}
                    name="nom"
                    className="nom-input"
                    value={vnom}
                    type="text"
                    onChange={this.changeHandler}
                  />
            </div>
          </div>
          <div className="footer">
            <StdButton
              identifier="modal-save" 
              elementclass="save" 
              icon={ false } 
              disabled={ !readytosave }
              text={ strings.general.dialog.save } 
              onClick={this.updateTable} 
            />
          </div>
        </div>
        <Fab aria-label="close" size="small" className="close-button" onClick={ ()=>{this.resetPopin(); closeHandler()} }>
          <CloseIcon />
        </Fab>
      </div>
    </Modal>  
    {(clavierOpen && open) && <Clavier onChange={this.onKeyboardChange} className="ClavierTable" defaultLayout="numeric" baseClass="KBComment" inputName="valeur" inputVal={vnom} open={open && clavierOpen} />}
    </div>
    );
  }

}




function SalleListe(props) {

  const {data, openEdit, removeSalle, removeTable, openTable} = props;

  const mliste = data.map((cont,i) => (
    <Accordion key={`panel${i}`}>
      <AccordionSummary
        expandIcon={<ExpandMoreIcon />}
        aria-controls={ `panel${i}-content` }
        id={ `panel${i}-header` }
        className="cont-header"
        >
          <ListItemIcon>
            <LensIcon className={`couleur ${cont.couleur}`} />
          </ListItemIcon>
          <div className="cont-nom">
            <Typography className="cont-title">{ cont.nom }</Typography>
          </div>
          <div className="actions">
            <Fab aria-label="addtable" size="small" className={`remove ${cont.salleId}`} onClick={()=>{openTable(cont.salleId)}}>
              <AddIcon />
            </Fab>
            <Fab aria-label="editsalle" size="small" className={`edit ${cont.salleId}`} onClick={()=>{openEdit(cont.salleId)}}>
              <EditIcon />
            </Fab>
            <Fab aria-label="removesalle" size="small" className={`remove ${cont.salleId}`} onClick={()=>{removeSalle(cont.salleId)}}>
              <CrossIcon />
            </Fab>
          </div>
        </AccordionSummary>
        <AccordionDetails>
          <List className="panel-liste" key={ `panel${i}-liste` }>
          { cont.tables && cont.tables.map((p,i) => ( 
            <ListItem key={i} className={`item ${((i%2)?'odd':'even')}`}>
              <ListItemText id={p.tableId} onClick={ () => { openTable(cont.salleId, p.tableId) } } primary={p.nom} />
              <ListItemSecondaryAction className="actions">
                <Fab aria-label="edittable" size="small" className={`edit ${p.tableId}`} onClick={()=>{openTable(cont.salleId, p.tableId)}}>
                  <EditIcon />
                </Fab>
                <Fab aria-label="removetable" size="small" className={`remove ${p.tableId}`} onClick={()=>{removeTable(cont.salleId, p.tableId)}}>
                  <CrossIcon />
                </Fab>
              </ListItemSecondaryAction>
            </ListItem>
          ))}
          </List>
        </AccordionDetails>
    </Accordion>
  ));


  return (<div className="liste-wrapper">{ mliste }</div>);
}