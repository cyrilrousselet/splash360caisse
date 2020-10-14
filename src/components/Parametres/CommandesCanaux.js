import React from 'react';
import {data} from '../../constants/translations';
import LocalizedStrings from 'react-localization';
import LabelledField from '../common/LabelledField';
import SwitchCheckbox from '../common/SwitchCheckbox';
import Swal from 'sweetalert2';
let strings = new LocalizedStrings(data);

class CommandesCanaux extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      uuid:null
    };
    this.updatePOS = this.updatePOS.bind(this);
    this.updateUUID = this.updateUUID.bind(this);
  }

  updatePOS(value) {
    const { data, updateValeur, setPOS} = this.props;
    if (data.store_id) {
      updateValeur({
        domaine: 'commandes',
        cle: 'pos_integration_enabled',
        valeur: value
      });
      setPOS();
    } else {
      Swal.fire({
        title: strings.modules.parametres.submodules.commandes.canaux.uber.alerte.enable_noid.titre,
        text: strings.modules.parametres.submodules.commandes.canaux.uber.alerte.enable_noid.texte,
        showCancelButton: false,
        focusConfirm: true
      });
    }
  }

  updateUUID(value) {
    const { data, updateValeur, setPOS } = this.props;
    if (value==='' && data.pos_integration_enabled) {
      Swal.fire({
        title: strings.modules.parametres.submodules.commandes.canaux.uber.alerte.noid_enable.titre,
        text: strings.modules.parametres.submodules.commandes.canaux.uber.alerte.noid_enable.texte,
        showCancelButton: true,
        focusCancel: true,
        focusConfirm: false,
        confirmButtonText: strings.modules.parametres.submodules.commandes.canaux.uber.alerte.noid_enable.force
      })
      .then(result=>{
        if (result.value) {
          this.setState({uuid:value});
          
          updateValeur({
            domaine: 'commandes',
            cle: 'store_id',
            valeur: value
          });
          updateValeur({
            domaine: 'commandes',
            cle: 'pos_integration_enabled',
            valeur: false
          });
          setPOS();
        }
      });
    } else {
      updateValeur({
        domaine: 'commandes',
        cle: 'store_id',
        valeur: value
      });
      setPOS();
    }
  }


  render() {
    const { data, updateValeur } = this.props;
    const { uuid }  = this.state;
    const v_uuid = uuid || data.store_id;

    return (
    <div className="CommandesCanaux sectioncontent">
      <div className="wrapper">
        <div className="providerGroup">
          <div className="subttl">{ strings.modules.parametres.submodules.commandes.canaux.uber.titre }</div>

          <LabelledField 
                id={ `store_id` }
                key={ `store_id` }
                name={ `store_id` }
                value={ v_uuid } 
                type='text' 
                onSubmit={(name,value) => {
                  this.updateUUID(value)
                }}
                onChange={(value,option)=>void(0)}
                label={ strings.modules.parametres.submodules.commandes.canaux.uber.store_id }
              />

          <SwitchCheckbox 
            isChecked={ data.hasOwnProperty('pos_integration_enabled') && data.pos_integration_enabled } 
            labelLeft={ false } 
            key={`pos_integration_enabled`}
            name={ `pos_integration_enabled` } 
            onChange={ (name, isChecked)=>{
              this.updatePOS(isChecked)
            } } 
            label={ strings.modules.parametres.submodules.commandes.canaux.uber.pos_integration_enabled }
          />

          <SwitchCheckbox 
            isChecked={ data.auto_accept_order } 
            labelLeft={ false } 
            key={`auto_accept_order`}
            name={ `auto_accept_order` } 
            onChange={ (name, isChecked)=>{
              updateValeur({
                domaine: 'commandes',
                cle: name,
                valeur: isChecked
              })
            } } 
            label={ strings.modules.parametres.submodules.commandes.canaux.uber.auto_accept_order }
          />
        </div>
      </div>
    </div>
    );
  }
};

export default CommandesCanaux;