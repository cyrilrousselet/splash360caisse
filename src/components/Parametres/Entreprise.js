import React from 'react';

import {data} from '../../constants/translations';
import LocalizedStrings from 'react-localization';
import LabelledField from '../common/LabelledField';
import SwitchCheckbox from '../common/SwitchCheckbox';
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
  auto_update: true,
  clavier: false,
  avoirs: false,
  service: false,
  heure_fin: '00:00',
  message_ticket: 'Bon appétit, merci de votre visite et à bientôt !'
};

const general_fields = ['denomination', 'enseigne', 'adresse', 'code_postal', 'ville', 'telephone', 'siret', 'ape', 'tva', 'restaurant_id'];
const general_switch = ['auto_update', 'clavier', 'avoirs', 'service'];

class Entreprise extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      message_ticket: data_ent.message_ticket
    }
    this.messageHandler = this.messageHandler.bind(this);
  }

  componentDidMount() {
    this.props.getAll();
  }

messageHandler(e) {
  this.setState({message_ticket:e.target.value});
}

 render() {

  const { message_ticket } = this.state;
  const { data, updateValeur, getAll } = this.props;

  console.log(strings.modules.parametres.submodules.entreprise.options.label.auto_update);

  return (
    <div className="Entreprise subcontent">
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
      </div>
    </div>
  );
 }
};

export default Entreprise;