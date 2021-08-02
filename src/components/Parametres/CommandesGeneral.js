import React from 'react';

import LocalizedStrings from 'react-localization';
import {data} from '../../constants/translations';
import SwitchCheckbox from '../common/SwitchCheckbox';

import { Table, TableCell, TableRow, TableHead, TableBody, Modal, Fab } from '@material-ui/core';
import LabelledField from '../common/LabelledField';
import StdButton from '../common/StdButton';
import CloseIcon from '../common/icon/CloseIcon';
import AddIcon from '../common/icon/AddIcon';
import logger from '../../helpers/Logger';
let strings = new LocalizedStrings(data);

const data_types = [
  {nom: 'sur place', identifiant:'surplace', frais:'0.00 €', remise:'0 %', activation: true},
  {nom: 'à emporter', identifiant:'emporter', frais:'0.00 €', remise:'15 %', activation: true},
  {nom: 'livraison', identifiant:'livraison', frais:'3.50 €', remise:'0 %', activation: true},
];

function TableTypes(props) {
  const { liste, id, openEdit } = props;

  return (
    <Table stickyHeader size="small" key={id} aria-label="a dense table">
      <TableHead>
        <TableRow>
          <TableCell key={`${id}-hd-nom`} className="liste-nom">{ strings.modules.parametres.submodules.commandes.general.types.label.nom }</TableCell>
          <TableCell key={`${id}-hd-abreviation`} className="liste-identifiant">{ strings.modules.parametres.submodules.commandes.general.types.label.identifiant }</TableCell>
          <TableCell key={`${id}-hd-frais`} className="liste-frais">{ strings.modules.parametres.submodules.commandes.general.types.label.frais }</TableCell>
          <TableCell key={`${id}-hd-remise`} className="liste-remise">{ strings.modules.parametres.submodules.commandes.general.types.label.remise }</TableCell>
          <TableCell key={`${id}-hd-activation`} className="liste-activation">{ strings.modules.parametres.submodules.commandes.general.types.label.activation }</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {liste.map((row, i) => (
          <TableRow key={ `${id}-cmd-${i}`} className={(i%2)?'odd':'even'}>
            <TableCell key={`${i}-nom`} className="liste-nom"><div onClick={ () => { openEdit(i) } }>{ row.nom }</div></TableCell>
            <TableCell key={`${i}-abreviation`} className="liste-identifiant">{ row.identifiant }</TableCell>
            <TableCell key={`${i}-frais`} className="liste-frais">{ row.frais }</TableCell>
            <TableCell key={`${i}-remise`} className="liste-remise">{ row.remise }</TableCell>
            <TableCell key={`${i}-activation`} className="liste-activation">
              <SwitchCheckbox 
                isChecked={ row.activation } 
                key={`${i}-activation-switch`}
                name={ 'activation' } 
                onChange={ logger.info } 
                label="" 
              />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
} 



class EditTypePopin extends React.Component {
  constructor(props) {
    super(props);
    logger.info(props);
    this.state = {
      nom: props.commandtype && props.commandtype.nom,
      identifiant: props.commandtype && props.commandtype.identifiant, 
      frais: props.commandtype && props.commandtype.frais, 
      remise: props.commandtype && props.commandtype.remise
    }
    this.updateValue = this.updateValue.bind(this);
    this.saveType = this.saveType.bind(this);
  }


  updateValue(value) {
    this.setState(value);
  }
  saveType() {
    this.props.saveType(this.state);
    this.props.closeHandler();
  }

  render() {
    const { commandtype, editOpen, closeHandler } = this.props;

    return (
      <Modal open={ editOpen } >
        <div className="EditTypeModal">
          <div className="Modal-container">
            <div className="header">
              <div className="title">{ commandtype==null ? strings.modules.parametres.submodules.commandes.general.types.label.ajouter : strings.modules.parametres.submodules.commandes.general.types.label.editer }</div>
            </div>
            <div className="body">
              <LabelledField 
                  id={ `nom` }
                  name={ `nom` }
                  className="fieldnom"
                  value={ commandtype && commandtype.nom } 
                  placeholder='' 
                  type='text' 
                  readOnly={ false } 
                  onChange={(val)=>{ this.updateValue({nom:val.value}) }}
                  label={ strings.modules.parametres.submodules.commandes.general.types.label.nom }
              />
              <LabelledField 
                  id={ `identifiant` }
                  name={ `identifiant` }
                  className="fieldidentifiant"
                  value={ commandtype && commandtype.identifiant } 
                  placeholder='' 
                  type='text' 
                  readOnly={ false } 
                  onChange={(val)=>{ this.updateValue({identifiant:val.value}) }}
                  label={ strings.modules.parametres.submodules.commandes.general.types.label.identifiant }
              />
              <LabelledField 
                  id={ `frais` }
                  name={ `frais` }
                  className="fieldfrais"
                  value={ commandtype && commandtype.frais.replace(/(\s)?(€|%)/,'') } 
                  placeholder='' 
                  type='text' 
                  options={['€','%']}
                  optionvalue={ commandtype && commandtype.frais.match(/(€|%)/)[0] } 
                  readOnly={ false } 
                  onChange={(val)=>{ this.updateValue({frais:`${val.value} ${val.option}`}) }}
                  label={ strings.modules.parametres.submodules.commandes.general.types.label.frais }
              />
              <LabelledField 
                  id={ `remise` }
                  name={ `remise` }
                  className="fieldremise"
                  value={ commandtype && commandtype.remise.replace(/(\s)?(€|%)/,'') } 
                  placeholder='' 
                  type='text' 
                  options={['€','%']}
                  optionvalue={ commandtype && commandtype.remise.match(/(€|%)/)[0] } 
                  readOnly={ false } 
                  onChange={(val)=>{ this.updateValue({remise:`${val.value} ${val.option}`}) }}
                  label={ strings.modules.parametres.submodules.commandes.general.types.label.remise }
              />
            </div>
            <div className="footer">
              <StdButton 
                identifier="modal-save" 
                elementclass="save" 
                icon={ false } 
                text={ strings.general.dialog.save } 
                onClick={this.saveType} 
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

class CommandesGeneral extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      commandtype: null,
      editOpen: false,
      currentNumero: 23890982
    };

    this.openEdit = this.openEdit.bind(this);
    this.closeEdit = this.closeEdit.bind(this);
    this.saveType = this.saveType.bind(this);
    this.numerotationHexaUpdate = this.numerotationHexaUpdate.bind(this);
  }
  componentDidMount() {
    this.props.getAll();
  }
 
  openEdit(typeid=null) {
    logger.info(typeid);
    if (typeid!==null) {
      this.setState({commandtype:data_types[typeid], editOpen: true});
    }
    else {
      this.setState({editOpen: true});
    }
  }
  closeEdit() {
    this.setState({editOpen: false});
  }
  saveType(type) {
    logger.info(type);
  //  this.setState({editOpen: false});
  }
  numerotationHexaUpdate(isChecked) {
    const { updateValeur, data } = this.props;
    const { numerotation_max } = data;
    let nummax = isChecked ? parseInt(numerotation_max) + 1000 : parseInt(numerotation_max) - 1000;
    logger.info(numerotation_max, nummax);
    updateValeur([
      {
        domaine: 'commandes',
        cle: 'numerotation_start',
        valeur: isChecked ? '1000' : '1'
      },
      {
        domaine: 'commandes',
        cle: 'numerotation_max',
        valeur: nummax.toString()
      },
      {
        domaine: 'commandes',
        cle: 'numerotation_hex',
        valeur: isChecked
      }
    ]);
  }

  render() {

    const { commandtype, editOpen } = this.state;
    const { data, lastnumero, updateValeur, resetNumero, options } = this.props;

    const num_not_editable = options.role==='secondary';

    const currnum = lastnumero ? lastnumero.value : data.numerotation_start;
   
    return (
      <div className="CommandesGeneral sectioncontent">
        <div className="subttl">{ strings.modules.parametres.submodules.commandes.general.types.nom }</div>
        <Fab aria-label="addtype" size="small" className="addtype-button" onClick={ ()=>{ this.openEdit() } }>
          <AddIcon htmlColor="#ffffff" />
        </Fab>
        <div className="main-wrapper">
          <div className="table-wrapper">
            <TableTypes liste={data_types} id='typesliste' openEdit={this.openEdit} />
          </div>
          <div className="subttl">{ strings.modules.parametres.submodules.commandes.general.numero.nom }</div>
          <div className="numero-wrapper">
            <LabelledField 
                id={ `numerotation_start` }
                name={ `numerotation_start` }
                className="fieldnumerotation_start"
                value={ data.numerotation_start } 
                placeholder='1' 
                type='text' 
                readOnly={ num_not_editable } 
                onChange={(value,option)=>void(0)}
                onSubmit={(name,value) => {
                  updateValeur({
                    domaine: 'commandes',
                    cle: name,
                    valeur: value
                  })
                }}
                label={ strings.modules.parametres.submodules.commandes.general.numero.label.debut }
              />
              <LabelledField 
                  id={ `numerotation_max` }
                  name={ `numerotation_max` }
                  className="fieldnumerotation_max"
                  value={ data.numerotation_max } 
                  placeholder='1' 
                  type='text' 
                  readOnly={ num_not_editable } 
                  onChange={(value,option)=>void(0)}
                  onSubmit={(name,value) => {
                    updateValeur({
                      domaine: 'commandes',
                      cle: name,
                      valeur: value
                    })
                  }}
                  label={ strings.modules.parametres.submodules.commandes.general.numero.label.max }
                />
            <div className="currentnum-wrapper">
              <LabelledField
                id={ `compteur` }
                name={ `compteur` }
                className="fieldcompteur"
                value={ currnum } 
                placeholder='0' 
                type='text' 
                readOnly={ true } 
                onChange={()=>{logger.info('click')}}
                label={ strings.modules.parametres.submodules.commandes.general.numero.label.compteur }
                />
              {!num_not_editable && <div className="btn-reset" onClick={()=>{ resetNumero() }}>{ strings.modules.parametres.submodules.commandes.general.numero.label.reset }</div>}
            </div>
            <SwitchCheckbox
              isChecked={ data.numerotation_hex===undefined ? false : data.numerotation_hex } 
              key={`numerotation_hex`}
              name={ `numerotation_hex` } 
              labelLeft={ true }
              onChange={ (name, isChecked) => {
                this.numerotationHexaUpdate(isChecked);
              } } 
              label={ strings.modules.parametres.submodules.commandes.general.numero.label.hexa } 
            />
          </div>
          <div className="ligne-wrapper">
            <div className="bipper-wrapper">
              <div className="subttl">{ strings.modules.parametres.submodules.commandes.general.bippers.nom }</div>
              <SwitchCheckbox
                isChecked={ data.active_bippers===undefined ? false : data.active_bippers } 
                key={`active_bippers`}
                name={ `active_bippers` } 
                labelLeft={ true }
                onChange={ (name, isChecked) => {
                // this.numerotationHexaUpdate(isChecked);
                  updateValeur({
                    domaine: 'commandes',
                    cle: 'active_bippers',
                    valeur: isChecked
                  })
                } } 
                label={ strings.modules.parametres.submodules.commandes.general.bippers.label.activation } 
              />
            </div>
            <div className="printstandby-wrapper">
              <div className="subttl">{ strings.modules.parametres.submodules.commandes.general.printstandby.nom }</div>
              <SwitchCheckbox
                isChecked={ data.print_standby===undefined ? false : data.print_standby } 
                key={`print_standby`}
                name={ `print_standby` } 
                labelLeft={ true }
                onChange={ (name, isChecked) => {
                // this.numerotationHexaUpdate(isChecked);
                  updateValeur({
                    domaine: 'commandes',
                    cle: 'print_standby',
                    valeur: isChecked
                  })
                } } 
                label={ strings.modules.parametres.submodules.commandes.general.printstandby.label.activation } 
              />
            </div>
          </div>
        </div>
        <EditTypePopin commandtype={commandtype} editOpen={editOpen} closeHandler={this.closeEdit} saveType={this.saveType} />
      </div>
    );
  }
};

export default CommandesGeneral;






