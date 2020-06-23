import React from 'react';

import {data} from '../../constants/translations';
import LocalizedStrings from 'react-localization';
import LabelledField from '../common/LabelledField';
import SwitchCheckbox from '../common/SwitchCheckbox';
import StdButton from '../common/StdButton';
import fs from 'fs';
import mkdirp from 'mkdirp';
import { remote }  from 'electron';
const { app, dialog } = remote;
let strings = new LocalizedStrings(data);

const data_ent = {
  denomination: 'Aqua Forte sarl',
  enseigne: 'Strink',
  adresse: '36 rue de Primel',
  code_postal: '29630',
  ville: 'Plougasnou',
  telephone: '02 57 65 01 00',
  siret: '80045733500019',
  ape: '6202A',
  tva: 'FR53800457335',
  ca: 0,
  auto_update: false,
  clavier: false,
  message_ticket: 'Bon appétit, merci de votre visite et à bientôt !'
};

const general_fields = ['denomination', 'enseigne', 'adresse', 'code_postal', 'ville', 'telephone', 'siret', 'ape', 'tva', 'restaurant_id'];
const general_switch = ['auto_update'];

class Entreprise extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      message_ticket: data_ent.message_ticket
    }
    this.messageHandler = this.messageHandler.bind(this);
    this.browseHandle = this.browseHandle.bind(this);
  }

  componentDidMount() {
    this.props.getAll();
  }

messageHandler(e) {
  this.setState({message_ticket:e.target.value});
}



checkDirectorySync(directory) {  
  try {
    fs.statSync(directory);
  } catch(e) {
    mkdirp.sync(directory);
  }
}


browseHandle(e) {
  dialog.showOpenDialog((fileNames) => {
    // fileNames is an array that contains all the selected
    if(fileNames === undefined){
        console.log("No file selected");
        return;
    }

    const platform = process.platform=='darwin' ? 'darwin' : 'win';

    const path_ar = fileNames[0].split(platform=='darwin'?'/':'\\');
    const file_ar = path_ar.pop().split('.');
    file_ar[file_ar.length-2] += `_${new Date().getTime()}`;
    this.checkDirectorySync(`${app.getPath('userData')}/userdata`);


    const newFileName = file_ar.join('.');

    fs.copyFile(fileNames[0], `${app.getPath('userData')}/userdata/${newFileName}`, () => {
      console.log('file copied');
      this.props.updateValeur({
        domaine:'entreprise', 
        cle:'ticket_logo', 
        valeur: `${app.getPath('userData')}/userdata/${newFileName}`
      });
    });

  });
}

getLogoImg(filePath) {

  let buff = fs.readFileSync(filePath);
  return `data:image/png;base64, ${buff.toString('base64')}`;

}

 render() {

  const { message_ticket } = this.state;
  const { data, updateValeur, getAll } = this.props;

  console.log(strings.modules.parametres.submodules.entreprise.options.label.auto_update);

  return (
    <div className="Entreprise subcontent">
      <div className="wrapper">
        <div className="col">
          <div className="subttl">{ strings.modules.parametres.submodules.entreprise.general.titre }</div>
          { general_fields.map((field, i) => (
            <LabelledField 
              id={ `parament-${field}` }
              key={ `${field}-${i}` }
              name={ field }
              value={ data[field] || '' } 
              placeholder={ strings.modules.parametres.submodules.entreprise.general.placeholder[field] } 
              type='text' 
              readOnly={ true } 
              onChange={()=>{console.log('click')}}
              label={ strings.modules.parametres.submodules.entreprise.general.label[field] }
            />
          ))}
          <div className="subttl">{ strings.modules.parametres.submodules.entreprise.objectif.titre }</div>
          <LabelledField 
              id={ `parament-ca` }
              name={ `ca` }
              value={ data_ent.ca.toString() } 
              placeholder='0' 
              type='text' 
              readOnly={ false } 
              onChange={()=>{console.log('click')}}
              label={ strings.modules.parametres.submodules.entreprise.objectif.label.ca }
              postvalue='€'
            />
          <div className="caption ca-caption">{ strings.modules.parametres.submodules.entreprise.objectif.label.ca_caption }</div>
        </div>
        <div className="col">
          <div className="subttl">{ strings.modules.parametres.submodules.entreprise.options.titre }</div>
          { general_switch.map((field, i) => (
            <SwitchCheckbox 
              isChecked={ data_ent[field] } 
              labelLeft={ true } 
              key={`${field}-${i}`}
              name={ field } 
              onChange={ console.log } 
              label={ strings.modules.parametres.submodules.entreprise.options.label[field] } 
            />
          ))}
          <SwitchCheckbox 
            isChecked={ data.clavier } 
            labelLeft={ true } 
            key={`clavier`}
            name={ `clavier` } 
            onChange={ (name, isChecked)=>{
              updateValeur({
                domaine: 'entreprise',
                cle: name,
                valeur: isChecked
              })
            } } 
            label={ strings.modules.parametres.submodules.entreprise.options.label.clavier } 
          />
          <SwitchCheckbox 
            isChecked={ data.avoirs } 
            labelLeft={ true } 
            key={`avoirs`}
            name={ `avoirs` } 
            onChange={ (name, isChecked)=>{
              updateValeur({
                domaine: 'entreprise',
                cle: name,
                valeur: isChecked
              })
            } } 
            label={ strings.modules.parametres.submodules.entreprise.options.label.avoirs } 
          />
          <SwitchCheckbox 
            isChecked={ data.service } 
            labelLeft={ true } 
            key={`service`}
            name={ `service` } 
            onChange={ (name, isChecked)=>{
              updateValeur({
                domaine: 'entreprise',
                cle: name,
                valeur: isChecked
              })
            } } 
            label={ strings.modules.parametres.submodules.entreprise.options.label.service } 
          />
          <LabelledField 
              id={ `heure_fin` }
              name={ `heure_fin` }
              className="fieldheure_fin"
              value={ data.heure_fin } 
              placeholder='00:00' 
              type='text' 
              readOnly={ false }
              onSubmit={(name,value) => {
                updateValeur({
                  domaine: 'entreprise',
                  cle: name,
                  valeur: value
                })
              }}
              onChange={(value,option)=>void(0)}
              label={ strings.modules.parametres.submodules.entreprise.options.label.heure_fin }
            />
          <div className="caption heure-caption">{ strings.modules.parametres.submodules.entreprise.options.label.heure_fin_caption }</div>
          <div className="message-ticket">
            <label>{ strings.modules.parametres.submodules.entreprise.options.label.message_ticket }</label>
            <textarea onChange={this.messageHandler}>{ message_ticket }</textarea>
          </div>
          <div className="logo-ticket">
            <label>{ strings.modules.parametres.submodules.entreprise.options.label.logo_ticket }</label>
            <div className="caption ticket-caption">{ strings.modules.parametres.submodules.entreprise.options.label.logo_ticket_caption }</div>
            {data.ticket_logo && <div className="logo-ticket-image"><img src={this.getLogoImg(data.ticket_logo)} /></div>}
            <div className="logo-boutons">
              <StdButton identifier={`browse-logo`} elementclass={`browse-logo`} icon={false} noStroke={true} text={`${(data.ticket_logo?strings.modules.parametres.submodules.entreprise.options.label.logo_ticket_replace:strings.general.dialog.browse)}...`} disabled={false} onClick={this.browseHandle} />
              {data.ticket_logo && <StdButton identifier={`delete-logo`} elementclass={`delete-logo`} icon={false} noStroke={true} text={strings.general.dialog.delete} disabled={false} onClick={() => { updateValeur({domaine:'entreprise', cle:'ticket_logo', valeur:null})}} />}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
 }
};

export default Entreprise;