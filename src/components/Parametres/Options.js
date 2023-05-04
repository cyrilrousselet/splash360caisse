import React from 'react';
import {data} from '../../constants/translations';
import LocalizedStrings from 'react-localization';
import SwitchCheckbox from '../common/SwitchCheckbox';
import LoadingSpinner from '../common/LoadingSpinner';
import { FormControl, FormHelperText, InputLabel, MenuItem, Select } from '@material-ui/core';

let strings = new LocalizedStrings(data);

class Options extends React.Component {
 render() {
  
  const { data, langues, updateValeur } = this.props;

  if (data===null || data===undefined) return <LoadingSpinner />

  let _scndelangues = langues;
  if (langues.length>1) {
    // _scndelangues = langues.filter(l => l.code!==strings.getLanguage());
  }

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

          {(_scndelangues.length>0) && (
            <div className="option-i18n">
            <>
            <div className="subttl">{ strings.modules.parametres.submodules.options.i18n.main_titre }</div>
            <FormControl fullWidth variant="outlined" className="selecteur-group selecteur-langue">
              <InputLabel className="select-label">{ strings.modules.parametres.submodules.options.i18n.main_label }</InputLabel>
              <Select value={data.ticketlangue} onChange={(event) => { updateValeur({domaine: 'options', cle:'ticketlangue', valeur: event.target.value}) }} className="selecteur selecteur-langue">
                  {_scndelangues.filter(l=>l.code!=='ar').map((langue) => (
                  <MenuItem key={ `lgitm-${langue.code}`} value={ langue.code }>{ langue.nom }</MenuItem>
                  ))}
              </Select>
            </FormControl>
            </>
            <>
            <div className="subttl">{ strings.modules.parametres.submodules.options.i18n.titre }</div>
            <FormControl fullWidth variant="outlined" className="selecteur-group selecteur-langue">
              <InputLabel className="select-label">{ strings.modules.parametres.submodules.options.i18n.label }</InputLabel>
              <Select value={data.secondelangue} onChange={(event) => { updateValeur({domaine: 'options', cle:'secondelangue', valeur: event.target.value}) }} className="selecteur selecteur-langue">
                <MenuItem key={ `lgitm-null`} value={ null }>{ strings.modules.parametres.submodules.options.i18n.aucun }</MenuItem>  
                  {langues.filter(l=>l.code!==strings.getLanguage()).map((langue) => (
                  <MenuItem key={ `lgitm-${langue.code}`} value={ langue.code }>{ langue.nom }</MenuItem>
                  ))}
              </Select>
              <FormHelperText>{ strings.modules.parametres.submodules.options.i18n.helper }</FormHelperText>
            </FormControl>
            </>
            </div>
          )}
        </div>
      </div>
    </div>
  );
 }
};

export default Options;