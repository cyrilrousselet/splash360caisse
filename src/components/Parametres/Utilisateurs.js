import React from 'react';

import {remote} from 'electron';
import LocalizedStrings from 'react-localization';
import {data} from '../../constants/translations';
import { Table, TableCell, TableRow, TableHead, TableBody, Modal, Fab, Paper } from '@material-ui/core';
import AddIcon from '../common/icon/AddIcon';
import CloseIcon from '../common/icon/CloseIcon';
import StdButton from '../common/StdButton';
import LabelledField from '../common/LabelledField';
import SwitchCheckbox from '../common/SwitchCheckbox';
import Swal from 'sweetalert2';

import Popper from '@material-ui/core/Popper';
import PillButton from '../common/PillButton';
import DeliveryIcon from '../common/icon/DeliveryIcon';
import Clavier from '../common/Clavier';
import logger from '../../helpers/Logger';
import { format } from 'date-fns';
let strings = new LocalizedStrings(data);

const {app, dialog} = remote;
const win = remote.getCurrentWindow();
const passphrase_length = 6; // nombre de caractères pour l'identifiant

let identifiant_tmo = -1; // id de timeout pour corriger la longueur de l'identifiant (EditUtilisateurPopin)

const dialogOptions = {
  title: strings.modules.parametres.submodules.utilisateurs.export.destination,
  defaultPath: `${ app.getPath('desktop') }/`,
  buttonLabel: strings.modules.parametres.submodules.utilisateurs.export.bouton
}

class EditUtilisateurPopin extends React.Component {
  constructor(props) {
    super(props);
    logger.info(props);
    this.state = {
      focusInput: 'nom',
      user_id: null,
      nom: null,
      identifiant: null, 
      taux_horaire: null,
      status: 'active',
      livreur: null,
      coordonnees: null,
      droits: '',
      error_nom: false,
      error_identifiant: false
    }
    this.supprimerUtilisateur = this.supprimerUtilisateur.bind(this);
    this.updateValue = this.updateValue.bind(this);
    this.updateDroit = this.updateDroit.bind(this);
    this.saveUtilisateur = this.saveUtilisateur.bind(this);
    this.checkAllDroits = this.checkAllDroits.bind(this);
    this.checkIdentifiant = this.checkIdentifiant.bind(this);
    this.getValues = this.getValues.bind(this);
    this.resetPopin = this.resetPopin.bind(this);
    this.setFocus = this.setFocus.bind(this);
    this.onKeyboardChange = this.onKeyboardChange.bind(this);
  }

  componentDidMount() {
    const st = {
      user_id: this.props.utilisateur && this.props.utilisateur.user_id,
      nom: this.props.utilisateur && this.props.utilisateur.nom,
      identifiant: this.props.utilisateur && this.props.utilisateur.identifiant, 
      first: this.props.utilisateur && this.props.utilisateur.first,
      droits: this.props.utilisateur && this.props.utilisateur.droits,
      livreur: this.props.utilisateur && this.props.utilisateur.livreur,
      coordonnees: this.props.utilisateur && this.props.utilisateur.coordonnees,
      taux_horaire: this.props.utilisateur && this.props.utilisateur.taux_horaire
    }
    logger.info('componentDidMount', st);
    
    this.setState(st);
  }

  updateValue(value) {
    logger.info(value);
    this.setState(value);
  }

  updateStatus(status) {

    logger.info('updateStatus', status);
    this.setState({...status});

  }


  supprimerUtilisateur() {

    const { nom } = this.getValues();
    const self = this;

    Swal.fire({
      title: strings.modules.parametres.submodules.utilisateurs.edition.suppression.confirm.titre,
      text: strings.modules.parametres.submodules.utilisateurs.edition.suppression.confirm.texte.replace('%NOM%', nom),
      showCancelButton: true,
      focusCancel: true,
      focusConfirm: false
    }).then((result)=> {
      if (result.value) {
        self.setState({
          status: 'deleted'
        });
        self.saveUtilisateur();
      }
    });

  }

  updateDroit(droit) {

    logger.info('updateDroit', droit);

    let { droits } = this.props.utilisateur || {droits:{}};

    // si aucun droit n'est défini (cas d'un nouvel utilisateur)
    // on crée un objet à partir de clés
    if (Object.keys(droits).length===0) {
      Object.keys(strings.modules.parametres.submodules.utilisateurs.edition.droits).forEach( drt => { droits[drt] = false; });
    } 
      
    const sdroits = this.state.droits;

    const vdroits = {};
    if (Object.keys(droits).length>0) {
      // on passe en revue les droits
      Object.entries(droits).forEach(([k,v]) => {
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
    if (identifiant_tmo>-1) clearTimeout(identifiant_tmo);
    identifiant_tmo = setTimeout(()=>{
      const trimmed = valeur.substr(0,passphrase_length);
      if (this.props.utilisateur) {
        memeident = Object.entries(this.props.identifiants).find(([id,ident]) => (id!==this.props.utilisateur.user_id && trimmed===ident));
      } else {
        memeident = Object.entries(this.props.identifiants).find(([id,ident]) => trimmed===ident);
      }
      this.setState({error_identifiant: (memeident && memeident.length>0), identifiant: trimmed});
      identifiant_tmo = -1;
    },1500);

    if (this.props.utilisateur) {
      memeident = Object.entries(this.props.identifiants).find(([id,ident]) => (id!==this.props.utilisateur.user_id && valeur===ident));
    } else {
      memeident = Object.entries(this.props.identifiants).find(([id,ident]) => valeur===ident);
    }
    this.setState({error_identifiant: (memeident && memeident.length>0), identifiant: valeur});
  }



  getValues() {
    
    const { droits, nom, identifiant, status, livreur, coordonnees, taux_horaire } = this.props.utilisateur || {droits:{}, nom:null, identifiant:null, status:'active', livreur:null, coordonnees:null, taux_horaire:null};
    logger.info('getValues()', this.props.utilisateur);
    logger.info('getValues() droits', droits);
    // si aucun droit n'est défini (cas d'un nouvel utilisateur)
    // on crée un objet à partir de clés
    if (Object.keys(droits).length===0) {
      logger.info('remplissage des droits à partir de clés');
      Object.keys(strings.modules.parametres.submodules.utilisateurs.edition.droits).forEach( drt => { droits[drt] = false; });
    }
    // si un nouveau droit a été ajouté depuis la création de l'utilisateur
    if (Object.keys(strings.modules.parametres.submodules.utilisateurs.edition.droits).length>Object.keys(droits).length) {
      const nvdrt = Object.keys(strings.modules.parametres.submodules.utilisateurs.edition.droits).filter(d=>Object.keys(droits).indexOf(d)===-1);
      nvdrt.forEach(d=>{ droits[d] = false});
    }
    
    const sdroits = this.state.droits;

    const vdroits = {};
    if (Object.keys(droits).length>0) {
      // on passe en revue les droits
      Object.entries(droits).forEach(([k,v]) => {
        vdroits[k] = (sdroits && null!==sdroits[k]) ? sdroits[k] : v; 
      });
    } 

    let droitsactifs = Object.values(vdroits).filter(drt=>drt);
    let all = Object.keys(vdroits).length === droitsactifs.length;

    const snom = this.state.nom;
    const sidentifiant = this.state.identifiant;
    const sstatus = this.state.status;
    const slivreur = this.state.livreur;
    const scoordonnees = this.state.coordonnees;
    const staux_horaire = this.state.taux_horaire;

    return {
      droits: vdroits,
      nom: snom!==null ? snom : nom,
      identifiant: sidentifiant!==null ? sidentifiant : identifiant,
      allchecked: all,
      status: sstatus!==null ? sstatus : status,
      livreur: slivreur!==null ? slivreur : livreur,
      coordonnees: scoordonnees!==null ? scoordonnees : coordonnees,
      taux_horaire: staux_horaire!==null ? staux_horaire : taux_horaire
    }
  }

  resetPopin() {
    const droits = {};
    const st = {
      focusInput: 'nom',
      user_id: null,
      nom: null,
      identifiant: null, 
      droits: droits,
      status: 'active',
      livreur: null,
      coordonnees: null,
      error_nom: false,
      error_identifiant: false,
      taux_horaire: null
    }
    this.setState(st);
  }
  
  saveUtilisateur() {
    const user_id = (this.props.utilisateur && this.props.utilisateur.user_id) || null;

    let state = this.state;

    // si aucun droit n'est défini (cas d'un nouvel utilisateur)
    // on crée un objet à partir de clés
    if (state.droits===null || state.droits===undefined || Object.keys(state.droits).length===0) {
      logger.info('remplissage des droits à partir de clés');
      let droits = {};
      Object.keys(strings.modules.parametres.submodules.utilisateurs.edition.droits).forEach( drt => { droits[drt] = false; });
      state = {...state, droits:droits};
    }
    logger.info('saveUtilisateur', state);

    this.props.saveUtilisateur(user_id, state);
    this.resetPopin();
    this.props.closeHandler();
  }

  checkAllDroits(droits) {
    logger.info('checkAllDroits : ', droits);

    if (droits!==null) {

      let droitsactifs = Object.values(droits).filter(drt=>drt);
      let all = Object.keys(droits).length === droitsactifs.length;
      logger.info(Object.keys(droits).length+' == '+droitsactifs.length);
      Object.keys(droits).forEach(k=>{ droits[k] = !all });
      logger.info(droits);  
      this.setState({droits:droits});
    }
    logger.info('<== checkAllDroits');

  }

  setFocus(event, obj) {
    logger.info('setFocus', event.target.name);
    if (obj) {
      this.setState({focusInput: obj.name});
    } else {
      this.setState({focusInput: event.target.name});
    }
  }

  onKeyboardChange(input) {
    const {focusInput} = this.state;
    this.setState({ [focusInput]:input });
    logger.info(`"${focusInput}" changed`, input);
  };


  render() {
    const { utilisateur, editOpen, closeHandler, clavierOpen } = this.props;
    const { nom, identifiant, droits, allchecked, status, livreur, coordonnees, taux_horaire } = this.getValues();
    logger.info("utilisateur: ", utilisateur);
    logger.info('status',status);
    const {focusInput} = this.state;
 
    // const a_nom = nom || utilisateur && utilisateur.nom;
    // const a_identifiant = identifiant || utilisateur && utilisateur.identifiant;
    // const a_droits = droits || utilisateur && utilisateur.droits;
    logger.info("droits",droits)

    const incomplete = !nom || !identifiant || identifiant.length<passphrase_length || this.state.error_identifiant;
    logger.info('incomplete', incomplete);


    const inputs = {
      'nom': nom,
      'identifiant': identifiant,
      'coordonnees': coordonnees,
      'taux_horaire': taux_horaire
    };

    return (
      <div>
      <Modal open={ editOpen } >
        <div className={`EditUserModal${(clavierOpen?' with-clavier':'')}`}>
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
                  readOnly={ clavierOpen } 
                  onClick={this.setFocus}
                  onChange={(val)=>{ this.updateValue({nom:val.value}) }}
                  label={ strings.modules.parametres.submodules.utilisateurs.liste.nom }
              />
              <LabelledField 
                  id={ `identifiant` }
                  name={ `identifiant` }
                  className={ `fieldpasse ${(this.state.error_identifiant ? ' erreur' : '')}` }
                  value={ identifiant } 
                  placeholder={ strings.modules.parametres.submodules.utilisateurs.liste.passe_placeholder } 
                  type='text' 
                  maxLength={passphrase_length}
                  readOnly={ clavierOpen } 
                  onClick={this.setFocus}
                  onChange={(val)=>{ this.checkIdentifiant(val.value) }}
                  label={ strings.modules.parametres.submodules.utilisateurs.liste.passe }
              />
              <div className="status-zone">
                <SwitchCheckbox 
                    isChecked={ status!=='disabled' } 
                    key="status"
                    name="status" 
                    className="status"
                    small={ true }
                    onChange={ (name,checked) => { this.updateStatus(Object.fromEntries([[name, checked?'active':'disabled']])) }} 
                    label={ strings.modules.parametres.submodules.utilisateurs.edition.status } 
                    />
              </div>
              <LabelledField 
                  id={ `coordonnees` }
                  name={ `coordonnees` }
                  className="fieldcoordonnees"
                  value={ coordonnees } 
                  placeholder='' 
                  type='text' 
                  readOnly={ clavierOpen } 
                  onClick={this.setFocus}
                  onChange={(val)=>{ this.updateValue({coordonnees:val.value}) }}
                  label={ strings.modules.parametres.submodules.utilisateurs.edition.coordonnees }
              />
              <SwitchCheckbox 
                  isChecked={ (livreur===null || livreur===undefined) ? false : livreur } 
                  key="livreur"
                  name="livreur" 
                  className="livreur"
                  small={ true }
                  onChange={ (name,checked) => { this.updateValue({livreur: checked}) }} 
                  label={ strings.modules.parametres.submodules.utilisateurs.edition.livreur } 
                />
              <LabelledField 
                  id={ `taux_horaire` }
                  name={ `taux_horaire` }
                  className={ `taux_horaire` }
                  value={ taux_horaire } 
                  type='number' 
                  readOnly={ clavierOpen } 
                  onClick={this.setFocus}
                  onChange={(val)=>{ this.updateValue({taux_horaire:val.value}) }}
                  label={ strings.modules.parametres.submodules.utilisateurs.edition.taux_horaire }
              />
              <div className="droits-wrapper">
                <div className={ `subttl${allchecked?' allchecked':''}`} onClick={() => { this.checkAllDroits(droits) }} title={ allchecked ? strings.general.check.aucun : strings.general.check.tous }>{ strings.modules.parametres.submodules.utilisateurs.liste.droits }</div>
                <div className="sep"></div>
                { Object.keys(strings.modules.parametres.submodules.utilisateurs.edition.droits).map((field, i) => (
                  <SwitchCheckbox 
                    isChecked={ droits && (droits[field]===true) } 
                    labelLeft={ true } 
                    key={`${field}-${i}`}
                    disabled={status==='disabled'}
                    name={ field } 
                    onChange={ (name,checked) => { this.updateDroit(Object.fromEntries([[name, checked]])) }} 
                    label={ strings.modules.parametres.submodules.utilisateurs.edition.droits[field] } 
                  />
                ))}
              </div>
            </div>
            <div className="footer">
              <StdButton 
                identifier="modal-suppr" 
                elementclass="suppr" 
                icon={ false } 
                disabled={ utilisateur===null || utilisateur===undefined }
                text={ strings.modules.parametres.submodules.utilisateurs.edition.suppression.bouton } 
                onClick={this.supprimerUtilisateur} 
              />
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
      { (clavierOpen && editOpen) && <Clavier onChange={this.onKeyboardChange} className="ClavierFicheClient" variant="permanent" baseClass="KBFicheClient" inputName={focusInput} inputVal={inputs[focusInput]} open={editOpen && clavierOpen} /> }
      </div>
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
      <PillButton onClick={handleClick} elementclass="droits-btn" id={id} text={ `${strings.modules.parametres.submodules.utilisateurs.liste.droits}...` } />
      <Popper id={id} className="Parametres-Utilisateurs-Popper" open={open} anchorEl={anchorEl} placement="left-start">
          <Paper><div className="popper-cont">

            <ul>
          {
            getDroits(props.droits).map((drt,i)=>(
              <li key={`droit-${i}`}>{ strings.modules.parametres.submodules.utilisateurs.liste.droits_liste[drt] }</li>
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
  const { liste, id, openEdit } = props;


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
          (row.status!=='deleted' && row.status!=='superuser') && (<TableRow key={row.id} className={(i%2)?'odd':'even'}>
            <TableCell key={`${i}-nom`} className={ `liste-nom${ (row.status && row.status==='disabled')?' user-disabled':''}` }><div onClick={ () => { openEdit(i) } }>{ row.nom }{ row.livreur && <DeliveryIcon className="delivery" /> }{ (row.livreur && row.coordonnees) && `(${row.coordonnees})` }</div></TableCell>
            <TableCell key={`${i}-passe`} className="liste-passe">{ row.identifiant }</TableCell>
            <TableCell key={`${i}-droits`} className="liste-droits"><DroitsPopper id={`drt${i}`} droits={row.droits}></DroitsPopper></TableCell>
          </TableRow>)
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
    this.exportListe = this.exportListe.bind(this);
  }

  componentDidMount() {
    this.props.getAll();
  }

  openEdit(usrid=null) {
    logger.info('openEdit '+usrid);
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
  }

  async exportListe() {

    const __opt = {
      ...dialogOptions,
      defaultPath: dialogOptions.defaultPath + `${ format(new Date(),'yyMMdd') }_Utilisateurs.csv`
    };
    
    const __target = await dialog.showSaveDialog(win, __opt);
    console.log('💾 ListeUtilisateurs : ',__target.filePath);
    
    this.props.exportListe(__target.filePath);
  }

 render() {

  const { utilisateur, editOpen } = this.state;
  const { users, clavier, updateValeur, options } = this.props;
  const { staffmeal_active, staffmeal_modifier } = options;

  const identifiants = {};
  users.forEach(usr=>{
    identifiants[usr.user_id] = usr.identifiant;
  })


  // const onChangeModifierHandler = (val) => {
  //   // let opt = '€';
  //   // if ((['€','%']).indexOf(String(staffmeal_modifier).substr(-1,1))>-1) opt = String(staffmeal_modifier).substr(-1,1);
  //   updateOption({domaine: 'options', cle:'staffmeal_modifier', valeur:val});
  // }
  const getOption = (str) => {
    const o = String(str).substr(-1,1);
    return ['€','%'].indexOf(o)>-1 ? o : '€';
  }

  return (
   <div className="Utilisateurs subcontent">
    <div className="subttl">{ strings.modules.parametres.submodules.utilisateurs.liste.titre }</div>
    <Fab aria-label="adduser" size="small" className="adduser-button" onClick={ ()=>{ this.openEdit() } }>
      <AddIcon htmlColor="#ffffff" />
    </Fab>
    <div className="table-wrapper">
      <TableUtilisateurs liste={users} id='usersliste' openEdit={this.openEdit} />
    </div>
    <StdButton 
      identifier="export" 
      elementclass="export" 
      icon={ false } 
      disabled={ users===null || users===undefined }
      text={ strings.modules.parametres.submodules.utilisateurs.export.bouton } 
      onClick={this.exportListe} 
    />
    <div className="staffmeal">
      <div className="subttl">{ strings.modules.parametres.submodules.utilisateurs.staffmeal.titre }</div>
      <div className="staffmeal-activation">
        <SwitchCheckbox 
          label={ strings.modules.parametres.submodules.utilisateurs.staffmeal.activation }
          isChecked={ staffmeal_active ? staffmeal_active : false }
          small={ true }
          labelLeft={ true }
          onChange={(name, val)=> {
            updateValeur({domaine: 'options', cle:'staffmeal_active', valeur:val});
          }}
        />
      </div>
      <div className="staffmeal-modifier">
        <LabelledField 
          className="edit-input"
          name="edit-input"
          type="number"
          value={staffmeal_modifier ? Number(String(staffmeal_modifier).substr(0, staffmeal_modifier.length-1)) : 0}
          option={getOption(staffmeal_modifier)}
          options={['€','%']}
          onChange={(val)=> {
          //  let opt = '€';
          //  if ((['€','%']).indexOf(String(val.value).substr(-1,1))>-1) opt = String(val.value).substr(-1,1);
          //  updateOption({domaine: 'options', cle:'staffmeal_modifier', valeur:val});
            updateValeur({domaine: 'options', cle:'staffmeal_modifier', valeur:val.value+val.option});
          }}
          label={ strings.modules.parametres.submodules.utilisateurs.staffmeal.modifier }
        />
      </div>
    </div>
    <EditUtilisateurPopin utilisateur={utilisateur} editOpen={editOpen} clavierOpen={clavier} identifiants={identifiants} closeHandler={this.closeEdit} saveUtilisateur={this.saveUser} />
  </div>
  );
 }
};

export default Utilisateurs;