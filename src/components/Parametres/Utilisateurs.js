import React from 'react';

import LocalizedStrings from 'react-localization';
import {data} from '../../constants/translations';
import { Table, TableCell, TableRow, TableHead, TableBody, Modal, Fab } from '@material-ui/core';
import AddIcon from '../common/icon/AddIcon';
import CloseIcon from '../common/icon/CloseIcon';
import StdButton from '../common/StdButton';
import LabelledField from '../common/LabelledField';
import SwitchCheckbox from '../common/SwitchCheckbox';
let strings = new LocalizedStrings(data);

const users_data = [
  {
    nom: 'Lakhdar',
    passe: '111111',
    first: false,
    droits: { clients: true, stocks: true, statistiques: true, parametres: true, menu: true, cloture: true, marketing: true, depenses: true, plannings: true, remise: true }
  },
  {
    nom: 'Ramzi',
    passe: '222222',
    first: false,
    droits: { clients: true, stocks: true, statistiques: true, parametres: true, menu: true, cloture: true, marketing: true, depenses: true, plannings: true, remise: true }
  },
  {
    nom: 'Cyril',
    passe: '333333',
    first: false,
    droits: { clients: true, stocks: false, statistiques: false, parametres: true, menu: true, cloture: false, marketing: false, depenses: true, plannings: true, remise: true }
  }
];


class EditUtilisateurPopin extends React.Component {
  constructor(props) {
    super(props);
    console.log(props);
    this.state = {
      nom: props.utilisateur && props.utilisateur.nom,
      identifiant: props.utilisateur && props.utilisateur.passe, 
      first: props.utilisateur && props.utilisateur.first,
      droits: props.utilisateur && props.utilisateur.droits
    }
    this.updateValue = this.updateValue.bind(this);
    this.updateDroit = this.updateDroit.bind(this);
    this.saveUtilisateur = this.saveUtilisateur.bind(this);
    this.checkAllDroits = this.checkAllDroits.bind(this);
  }


  updateValue(value) {
    this.setState(value);
  }
  updateDroit(droit) {
    let {droits} = this.state;
    droits = {...droits, droit};
    this.setState({droits:droits});
  }
  saveUtilisateur() {
    this.props.saveUtilisateur(this.state);
    this.props.closeHandler();
  }
  checkAllDroits() {
    const { droits } = this.state;
    console.log(droits);
    let cpt = 0;
    Object.values(droits).forEach(val=> {
      if (val===true) cpt++;
    });
    let all = Object.keys(droits).length==cpt;
    const _ndroits = Object.entries(droits).map(entry => Object.assign(entry, !all));

    this.setState({droits:_ndroits});

  }

  render() {
    const { utilisateur, editOpen, closeHandler } = this.props;
    const { nom, passe, first, droits } = this.state;

    return (
      <Modal open={ editOpen } >
        <div className="EditUserModal">
          <div className="Modal-container">
            <div className="header">
              <div className="title">{utilisateur==null ? strings.modules.parametres.submodules.utilisateurs.edition.ajouter : strings.modules.parametres.submodules.utilisateurs.edition.editer }</div>
            </div>
            <div className="body">
              <LabelledField 
                  id={ `nom` }
                  name={ `nom` }
                  className="fieldnom"
                  value={ utilisateur && utilisateur.nom } 
                  placeholder='' 
                  type='text' 
                  readOnly={ false } 
                  onChange={(val)=>{ this.updateValue({nom:val.value}) }}
                  label={ strings.modules.parametres.submodules.utilisateurs.liste.nom }
              />
              <LabelledField 
                  id={ `passe` }
                  name={ `passe` }
                  className="fieldpasse"
                  value={ utilisateur && utilisateur.passe } 
                  placeholder='' 
                  type='text' 
                  readOnly={ false } 
                  onChange={(val)=>{ this.updateValue({passe:val.value}) }}
                  label={ strings.modules.parametres.submodules.utilisateurs.liste.passe }
              />
              <SwitchCheckbox 
                    isChecked={utilisateur && utilisateur.first } 
                    key="first"
                    name="first" 
                    className="first"
                    small={ true }
                    onChange={ console.log } 
                    label={ strings.modules.parametres.submodules.utilisateurs.edition.first } 
                  />
              <div className="droits-wrapper">
                <div className="subttl" onClick={this.checkAllDroits}>{ strings.modules.parametres.submodules.utilisateurs.liste.droits }</div>
                { Object.keys(strings.modules.parametres.submodules.utilisateurs.edition.droits).map((field, i) => (
                  <SwitchCheckbox 
                    isChecked={utilisateur && utilisateur.droits[field] } 
                    labelLeft={ true } 
                    key={`${field}-${i}`}
                    name={ field } 
                    onChange={ console.log } 
                    label={ strings.modules.parametres.submodules.utilisateurs.edition.droits[field] } 
                  />
                ))}
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



function TableUtilisateurs(props) {
  const { liste, id, openEdit, ...other } = props;

  return (
    <Table stickyHeader size="small" key={id} aria-label="a dense table">
      <TableHead>
        <TableRow>
          <TableCell key={`${id}-hd-nom`} className="liste-nom">{ strings.modules.parametres.submodules.utilisateurs.liste.nom }</TableCell>
          <TableCell key={`${id}-hd-passe`} className="liste-passe">{ strings.modules.parametres.submodules.utilisateurs.liste.passe }</TableCell>
          <TableCell key={`${id}-hd-droits`} className="liste-droits">{ strings.modules.parametres.submodules.utilisateurs.liste.droits }</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {users_data.map((row, i) => (
          <TableRow key={row.id} className={(i%2)?'odd':'even'}>
            <TableCell key={`${i}-nom`} className="liste-nom"><div onClick={ () => { openEdit(i) } }>{ row.nom }</div></TableCell>
            <TableCell key={`${i}-passe`} className="liste-passe">{ row.passe }</TableCell>
            <TableCell key={`${i}-droits`} className="liste-droits"></TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
} 



class Utilisateurs extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      utilisateur: null,
      editOpen: false
    };

    this.openEdit = this.openEdit.bind(this);
    this.closeEdit = this.closeEdit.bind(this);
    this.saveUser = this.saveUser.bind(this);
  }

  openEdit(usrid=null) {
    console.log(usrid);
    if (usrid!==null) {
      this.setState({utilisateur:users_data[usrid], editOpen: true});
    }
    else {
      this.setState({editOpen: true});
    }
  }
  closeEdit() {
    this.setState({utilisateur: null, editOpen: false});
  }
  saveUser(type) {
    console.log(type);
  //  this.setState({editOpen: false});
  }

 render() {

  const { utilisateur, editOpen } = this.state;

  return (
   <div className="Utilisateurs subcontent">
    <div className="subttl">{ strings.modules.parametres.submodules.utilisateurs.liste.titre }</div>
    <Fab aria-label="adduser" size="small" className="adduser-button" onClick={ ()=>{ this.openEdit() } }>
      <AddIcon htmlColor="#ffffff" />
    </Fab>
    <div className="table-wrapper">
      <TableUtilisateurs liste={users_data} id='usersliste' openEdit={this.openEdit} />
    </div>
    <EditUtilisateurPopin utilisateur={utilisateur} editOpen={editOpen} closeHandler={this.closeEdit} saveUtilisateur={this.saveUser} />
  </div>
  );
 }
};

export default Utilisateurs;