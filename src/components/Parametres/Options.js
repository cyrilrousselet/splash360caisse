import React from 'react';
import {data} from '../../constants/translations';
import LocalizedStrings from 'react-localization';
import SwitchCheckbox from '../common/SwitchCheckbox';
import LoadingSpinner from '../common/LoadingSpinner';

let strings = new LocalizedStrings(data);

class Options extends React.Component {
 render() {
  
  const { data, updateValeur } = this.props;

  if (data===null || data===undefined) return <LoadingSpinner />

  return (
    <div className="Options subcontent"> 
      <div className="wrapper">
        <div className="col">
          <div className="subttl">{ strings.modules.parametres.submodules.options.encaissement_layout.titre }</div>

          <SwitchCheckbox 
            isChecked={ (data.encaissement_layout===undefined) ? false : data.encaissement_layout==='narrow' } 
            labelLeft={ true } 
            key={`encaissement_layout`}
            name={ `encaissement_layout` } 
            onChange={ (name, isChecked)=>{
              updateValeur({
                domaine: 'options',
                cle: name,
                valeur: isChecked ? 'narrow' : 'normal'
              })
            } } 
            label={ strings.modules.parametres.submodules.options.encaissement_layout.valeur } 
          />
          <div className="subttl">{ strings.modules.parametres.submodules.options.kds_product_color.titre }</div>

          <SwitchCheckbox 
            isChecked={ (data.kds_product_color===undefined) ? false : data.kds_product_color } 
            labelLeft={ true } 
            key={`kds_product_color`}
            name={ `kds_product_color` } 
            onChange={ (name, isChecked)=>{
              updateValeur({
                domaine: 'options',
                cle: name,
                valeur: isChecked
              })
            } } 
            label={ strings.modules.parametres.submodules.options.kds_product_color.valeur } 
          />
        </div>
      </div>
    </div>
  );
 }
};

export default Options;