import React from 'react';

import LocalizedStrings from 'react-localization';
import {data} from '../../constants/translations';
import { Table, TableCell, TableRow, TableHead, TableBody, Modal, Fab, Paper, Typography } from '@material-ui/core';
import AddIcon from '../common/icon/AddIcon';
import CloseIcon from '../common/icon/CloseIcon';
import StdButton from '../common/StdButton';
import LabelledField from '../common/LabelledField';
import SwitchCheckbox from '../common/SwitchCheckbox';

import Popper from '@material-ui/core/Popper';
import PillButton from '../common/PillButton';
let strings = new LocalizedStrings(data);

const passphrase_length = 6; // nombre de caractères pour l'identifiant

let identifiant_tmo = -1; // id de timeout pour corriger la longueur de l'identifiant (EditUtilisateurPopin)


class EditUtilisateurPopin extends React.Component {
  constructor(props) {
    super(props);
    console.log(props);
    this.state = {
      user_id: null,
      nom: '',
      identifiant: '', 
      droits: '',
      error_nom: false,
      error_identifiant: false
    }
    this.updateValue = this.updateValue.bind(this);
    this.updateDroit = this.updateDroit.bind(this);
    this.saveUtilisateur = this.saveUtilisateur.bind(this);
    this.checkAllDroits = this.checkAllDroits.bind(this);
    this.checkIdentifiant = this.checkIdentifiant.bind(this);
    this.getValues = this.getValues.bind(this);
    this.resetPopin = this.resetPopin.bind(this);
  }

  componentDidMount() {
    const st = {
      user_id: this.props.utilisateur && this.props.utilisateur.user_id,
      nom: this.props.utilisateur && this.props.utilisateur.nom,
      identifiant: this.props.utilisateur && this.props.utilisateur.identifiant, 
      first: this.props.utilisateur && this.props.utilisateur.first,
      droits: this.props.utilisateur && this.props.utilisateur.droits
    }
    console.log('componentDidMount', st);
    
    this.setState(st);
  }

  updateValue(value) {
    console.log(value);
    this.setState(value);
  }

  updateDroit(droit) {

    console.log('updateDroit', droit);

    let { droits } = this.props.utilisateur || {droits:{}};

    // si aucun droit n'est défini (cas d'un nouvel utilisateur)
    // on crée un objet à partir de clés
    if (Object.keys(droits).length==0) {
      Object.keys(strings.modules.parametres.submodules.utilisateurs.edition.droits).map( drt => { droits[drt] = false; });
    } 
      
    const sdroits = this.state.droits;

    const vdroits = {};
    if (Object.keys(droits).length>0) {
      // on passe en revue les droits
      Object.entries(droits).map(([k,v]) => {
        vdroits[k] = (sdroits && null!=sdroits[k]) ? sdroits[k] : v; 
      });
    }

    this.setState({droits:{...vdroits, ...droit}});
  }


  checkIdentifiant(valeur) {

    // uniquement des chiffres
    valeur = valeur.replace(/[^0-9]+/g, '');
    let memeident = [];

    // tronque l'identifiant s'il fait plus de 6 caractères (au bout de 1,5 sec)
    if (identifiant_tmo!=-1) clearTimeout(identifiant_tmo);
    identifiant_tmo = setTimeout(()=>{
      const trimmed = valeur.substr(0,passphrase_length);
      memeident = Object.entries(this.props.identifiants).find(([id,ident]) => (id!=this.props.utilisateur.user_id && trimmed==ident));
      this.setState({error_identifiant: (memeident && memeident.length>0), identifiant: trimmed});
      identifiant_tmo = -1;
    },1500);

    memeident = Object.entries(this.props.identifiants).find(([id,ident]) => (id!=this.props.utilisateur.user_id && valeur==ident));
    this.setState({error_identifiant: (memeident && memeident.length>0), identifiant: valeur});
  }



  getValues() {
    
    const { droits, nom, identifiant } = this.props.utilisateur || {droits:{}, nom:null, identifiant:null};
    console.log('getValues()', this.props.utilisateur);
    console.log('getValues() droits', droits);
    // si aucun droit n'est défini (cas d'un nouvel utilisateur)
    // on crée un objet à partir de clés
    if (Object.keys(droits).length==0) {
      console.log('remplissage des droits à partir de clés');
      Object.keys(strings.modules.parametres.submodules.utilisateurs.edition.droits).map( drt => { droits[drt] = false; });
    }
    
    const sdroits = this.state.droits;

    const vdroits = {};
    if (Object.keys(droits).length>0) {
      // on passe en revue les droits
      Object.entries(droits).map(([k,v]) => {
        vdroits[k] = (sdroits && null!=sdroits[k]) ? sdroits[k] : v; 
      });
    } 

    let droitsactifs = Object.values(vdroits).filter(drt=>drt);
    let all = Object.keys(vdroits).length == droitsactifs.length;

    const snom = this.state.nom;
    const sidentifiant = this.state.identifiant;

    return {
      droits: vdroits,
      nom: snom || nom,
      identifiant: sidentifiant || identifiant,
      allchecked: all
    }
  }

  resetPopin() {
    const droits = {};
    const st = {
      user_id: null,
      nom: '',
      identifiant: '', 
      droits: droits,
      error_nom: false,
      error_identifiant: false
    }
    this.setState(st);
  }
  
  saveUtilisateur() {
    const user_id = this.props.utilisateur && this.props.utilisateur.user_id || null;
    this.props.saveUtilisateur(user_id, this.state);
    this.resetPopin();
    this.props.closeHandler();
  }

  checkAllDroits(droits) {
    console.log('checkAllDroits : ', droits);

    if (droits!==null) {

      let droitsactifs = Object.values(droits).filter(drt=>drt);
      let all = Object.keys(droits).length == droitsactifs.length;
      console.log(Object.keys(droits).length+' == '+droitsactifs.length);
      Object.keys(droits).forEach(k=>{ droits[k] = !all });
      console.log(droits);  
      this.setState({droits:droits});
    }
    console.log('<== checkAllDroits');

  }

  render() {
    const { utilisateur, editOpen, closeHandler } = this.props;
    const { nom, identifiant, droits, allchecked } = this.getValues();
    console.log("utilisateur: ",this.state)
 
    // const a_nom = nom || utilisateur && utilisateur.nom;
    // const a_identifiant = identifiant || utilisateur && utilisateur.identifiant;
    // const a_droits = droits || utilisateur && utilisateur.droits;
    console.log("droits",droits)

    const incomplete = !nom || !identifiant || identifiant.length<passphrase_length || this.state.error_identifiant;
    console.log('incomplete', incomplete);

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
                  value={ nom } 
                  placeholder='' 
                  type='text' 
                  readOnly={ false } 
                  onChange={(val)=>{ this.updateValue({nom:val.value}) }}
                  label={ strings.modules.parametres.submodules.utilisateurs.liste.nom }
              />
              <LabelledField 
                  id={ `identifiant` }
                  name={ `identifiant` }
                  className={ `fieldpasse ${(this.state.error_identifiant ? ' erreur' : '')}` }
                  value={ identifiant } 
                  placeholder='' 
                  type='text' 
                  maxLength={passphrase_length}
                  readOnly={ false } 
                  onChange={(val)=>{ this.checkIdentifiant(val.value) }}
                  label={ strings.modules.parametres.submodules.utilisateurs.liste.passe }
              />
              {/* <SwitchCheckbox 
                    isChecked={utilisateur && utilisateur.first } 
                    key="first"
                    name="first" 
                    className="first"
                    small={ true }
                    onChange={ console.log } 
                    label={ strings.modules.parametres.submodules.utilisateurs.edition.first } 
                  /> */}
              <div className="droits-wrapper">
                <div className={ `subttl${allchecked?' allchecked':''}`} onClick={() => { this.checkAllDroits(droits) }}>{ strings.modules.parametres.submodules.utilisateurs.liste.droits }</div>
                <div className="sep"></div>
                { Object.keys(strings.modules.parametres.submodules.utilisateurs.edition.droits).map((field, i) => (
                  <SwitchCheckbox 
                    isChecked={ droits && (droits[field]==true) } 
                    labelLeft={ true } 
                    key={`${field}-${i}`}
                    name={ field } 
                    onChange={ (name,checked) => { this.updateDroit(Object.fromEntries([[name, checked]])) }} 
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
                disabled={ incomplete }
                text={ strings.general.dialog.save } 
                onClick={this.saveUtilisateur} 
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




export function DroitsPopper(props) {
  const [anchorEl, setAnchorEl] = React.useState(null);

  const handleClick = (txt,event) => {
    setAnchorEl(anchorEl ? null : event.currentTarget);
  };

  const getDroits = (droits) => {
    let listedroits = [];
    for(let [key,value] of Object.entries(droits)) {
      if (value===true) listedroits.push(key);
    }
    return listedroits;
  }

  const open = Boolean(anchorEl);
  const id = open ? `simple-popper-${props.id}` : undefined;

  return (
    <div>
      <PillButton onClick={handleClick} elementclass="droits-btn" id={id} text={ strings.modules.parametres.submodules.utilisateurs.liste.droits } />
      <Popper id={id} className="Parametres-Utilisateurs-Popper" open={open} anchorEl={anchorEl} placement="left-start">
          <Paper><div className="popper-cont">

            <ul>
          {
            getDroits(props.droits).map(drt=>(
              <li>{ strings.modules.parametres.submodules.utilisateurs.liste.droits_liste[drt] }</li>
              ))
            }
        </ul>
            </div>
            </Paper>
      </Popper>
    </div>
  );
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
        {liste.map((row, i) => (
          <TableRow key={row.id} className={(i%2)?'odd':'even'}>
            <TableCell key={`${i}-nom`} className="liste-nom"><div onClick={ () => { openEdit(i) } }>{ row.nom }</div></TableCell>
            <TableCell key={`${i}-passe`} className="liste-passe">{ row.identifiant }</TableCell>
            <TableCell key={`${i}-droits`} className="liste-droits"><DroitsPopper id={`drt${i}`} droits={row.droits}></DroitsPopper></TableCell>
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

  componentDidMount() {
    this.props.getAll();
  }

  openEdit(usrid=null) {
    console.log('openEdit '+usrid);
    const {users} = this.props;
    if (usrid!==null) {
      this.setState({utilisateur:users[usrid], editOpen: true});
    }
    else {
      this.setState({editOpen: true});
    }
  }
  closeEdit() {
    this.setState({utilisateur: null, editOpen: false});
  }
  saveUser(id, valeurs) {
    if (id) {
      this.props.updateUser({user_id:id, data:valeurs});
    }
    else {
      this.props.createUser(valeurs);
    }
  //  this.setState({editOpen: false});
  }

 render() {

  const { utilisateur, editOpen } = this.state;
  const { users } = this.props;

  const identifiants = {};
  users.forEach(usr=>{
    identifiants[usr.user_id] = usr.identifiant;
  })


  return (
   <div className="Utilisateurs subcontent">
    <div className="subttl">{ strings.modules.parametres.submodules.utilisateurs.liste.titre }</div>
    <Fab aria-label="adduser" size="small" className="adduser-button" onClick={ ()=>{ this.openEdit() } }>
      <AddIcon htmlColor="#ffffff" />
    </Fab>
    <div className="table-wrapper">
      <TableUtilisateurs liste={users} id='usersliste' openEdit={this.openEdit} />
    </div>
    <EditUtilisateurPopin utilisateur={utilisateur} editOpen={editOpen} identifiants={identifiants} closeHandler={this.closeEdit} saveUtilisateur={this.saveUser} />
  </div>
  );
 }
};

export default Utilisateurs;