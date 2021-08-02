import React from 'react';

import LocalizedStrings from 'react-localization';
import {data} from '../../constants/translations';
import LabelledField from '../common/LabelledField';
import { Fab, List, ListItem } from '@material-ui/core';
import AddIcon from '../common/icon/AddIcon';
import SwitchCheckbox from '../common/SwitchCheckbox';
// import _ from 'lodash';
import LoadingSpinner from '../common/LoadingSpinner';
import logger from '../../helpers/Logger';

let strings = new LocalizedStrings(data);

const tva_data = [
  {nom: 'TVA 1', valeur: '10'},
  {nom: 'TVA 2', valeur: '5.5'},
  {nom: 'TVA 3', valeur: '20'},
  {nom: 'TVA 4', valeur: '0'}
];
const moyens_data = [
  {nom: 'Espèces', identifiant:'especes'},
  {nom: 'Carte bleue', identifiant:'carte'},
  {nom: 'Ticket Restaurant', identifiant:'ticket'},
  {nom: 'Cheque', identifiant:'cheque'},
];
const happyhour_data = {
  debut: '18:00',
  fin: '22:00',
  remise: '10',
  jours: [0,1,2,3,4,5,6]
};
const fidelite_data = {
  activation: true,
  valeur: 1,
  seuil: 0
};



class Financier extends React.Component {


  constructor(props) {
    super(props);
    // this.state = {
      // moyen: null,
      // moyenEditOpen: true
    // }
    this.openMoyenEdit = this.openMoyenEdit.bind(this);
    // this.closeMoyenEdit = this.closeMoyenEdit.bind(this);
  }


  componentDidMount() {
    this.props.getAll();
  }

  openMoyenEdit(id:null) {

  }
  // closeMoyenEdit() {
  //   this.setState({moyenEditOpen: false});
  // }


 render() {

  // const { moyenEditOpen, moyen } = this.state;
  // const { moyen } = this.state;
  const { data, updateValeur } = this.props;

  if (undefined===data) return <LoadingSpinner />;

  // on déplace le dimanche en fin de semaine
  let dimanche = strings.general.jours[0];
  let jours = strings.general.jours.slice(1)
  jours.push(dimanche);
  
  return (
    <div className="Financier subcontent">
      <div className="subcontent-wrapper">
        <div className="col">
          <div className="section">
            <div className="subttl">{ strings.modules.parametres.submodules.financier.tva.titre }</div>
            { tva_data.map((field,i)=>(
              <LabelledField 
                id={ `tva-${i}` }
                key={ `tva-${i}` }
                name={ `tva-${i}` }
                value={ field.valeur } 
                placeholder={ field.nom } 
                type='number' 
                readOnly={ false } 
                onChange={()=>{logger.info('click')}}
                label={ field.nom }
                postvalue='%'
              />
            ))}
          </div>
          <div className="section">
            <div className="subttl">{ strings.modules.parametres.submodules.financier.moyen.titre }</div>
            <Fab aria-label="addmoyen" size="small" className="addmoyen-button" onClick={ ()=>{ this.openMoyenEdit() } }>
              <AddIcon htmlColor="#ffffff" />
            </Fab>
            <List disablePadding className="liste-moyens">
              { moyens_data.map((moyen,i)=> (
                <ListItem
                key={ `moyen-${i}` }
                button 
                disableGutters
                onClick={ () => this.openMoyenEdit(i) }
                >
                  <div className="moyen-nom">{ moyen.nom }</div>
                  <div className="moyen-identifiant">{ moyen.identifiant }</div>
              </ListItem>
              ))}
            </List>
          </div>

        <div className="section">
          <div className="subttl">{ strings.modules.parametres.submodules.financier.fonddecaisse.titre }</div>
          <SwitchCheckbox
            isChecked={ data.fonddecaisse_activation } 
            key="fonddecaisse-activation"
            name="fonddecaisse_activation" 
            className="fonddecaisse-activation" 
            onChange={ (name, isChecked)=>{
              updateValeur({
                domaine: 'financier',
                cle: name,
                valeur: isChecked
              })
            } } 
            label={ strings.modules.parametres.submodules.financier.fonddecaisse.activation } 
          />
          <LabelledField 
              id={ `fonddecaisse-montant` }
              key={ `fonddecaisse-montant` }
              name={ `fonddecaisse_montant` }
              value={ data.fonddecaisse_montant } 
              placeholder=''
              type='number' 
              readOnly={ false } 
              onSubmit={(name,value) => {
                updateValeur({
                  domaine: 'financier',
                  cle: name,
                  valeur: value
                })
              }}
              onChange={(value,option)=>void(0)}
              label={ strings.modules.parametres.submodules.financier.fonddecaisse.montant }
              postvalue='€'
            />
        </div>

        </div>
        <div className="col">
        <div className="section">
          <div className="subttl">{ strings.modules.parametres.submodules.financier.happyhours.titre }</div>
          <LabelledField 
            id={ `happyhour-debut` }
            key={ `happyhour-debut` }
            name={ `happyhour-debut` }
            className="happyhour-heure"
            value={ happyhour_data.debut } 
            type='text' 
            readOnly={ false } 
            onChange={()=>{logger.info('click')}}
            label={ strings.modules.parametres.submodules.financier.happyhours.debut }
            />
          <LabelledField 
            id={ `happyhour-fin` }
            key={ `happyhour-fin` }
            name={ `happyhour-fin` }
            className="happyhour-heure"
            value={ happyhour_data.fin } 
            type='text' 
            readOnly={ false } 
            onChange={()=>{logger.info('click')}}
            label={ strings.modules.parametres.submodules.financier.happyhours.fin }
          />
          <div className="liste-jours">
          { jours.map((jour,i) => (
            <SwitchCheckbox
              isChecked={ i in happyhour_data.jours } 
              key={ `happyhour-jour-${ i }` }
              name={ `happyhour-jour-${ i }` } 
              className="happyhour-jour" 
              onChange={ logger.info } 
              labelLeft={ true }
              small={ true }
              label={ jour } 
            />
            ))}
          </div>
          <LabelledField 
              id={ `happyhour-remise` }
              key={ `happyhour-remise` }
              name={ `happyhour-remise` }
              value={ happyhour_data.remise } 
              placeholder=''
              type='number' 
              readOnly={ false } 
              onChange={()=>{logger.info('click')}}
              label={ strings.modules.parametres.submodules.financier.happyhours.remise }
              postvalue='%'
            />
        </div>
          <div className="section section-vente_commande">
            <SwitchCheckbox
              isChecked={ !data.hasOwnProperty('vente_commande') || data.vente_commande===true } 
              key="vente_commande"
              name="vente_commande" 
              className="vente_commande" 
              onChange={ (name, isChecked)=>{
                updateValeur({
                  domaine: 'financier',
                  cle: name,
                  valeur: isChecked
                })
              }  } 
              label={ strings.modules.parametres.submodules.financier.livraison.titre } 
            />
            <div className="caption livraison-caption">{ strings.modules.parametres.submodules.financier.livraison.caption }</div>
          </div>
        <div className="section">
          <div className="subttl">{ strings.modules.parametres.submodules.financier.fidelite.titre }</div>
          <SwitchCheckbox
            isChecked={ data.fidelite_activation } 
            key="fidelite-activation"
            name="fidelite_activation" 
            className="fidelite-activation" 
            onChange={ (name, isChecked)=>{
              updateValeur({
                domaine: 'financier',
                cle: name,
                valeur: isChecked
              })
            } } 
            label={ strings.modules.parametres.submodules.financier.fidelite.activation } 
          />

          <LabelledField 
            id={ `fidelite-valeur` }
            key={ `fidelite-valeur` }
            name={ `fidelite-valeur` }
            className={ `fidelite-valeur` }
            value={ fidelite_data.valeur } 
            placeholder=''
            type='number' 
            disabled={ !data.fidelite_activation }
            readOnly={ !data.fidelite_activation } 
            onChange={()=>{logger.info('click')}}
            label={ strings.modules.parametres.submodules.financier.fidelite.valeur }
            postvalue='€'
          />

          <LabelledField 
            id={ `fidelite-seuil` }
            key={ `fidelite-seuil` }
            name={ `fidelite-seuil` }
            className={ `fidelite-seuil` }
            value={ fidelite_data.seuil } 
            placeholder=''
            type='number' 
            disabled={ !data.fidelite_activation }
            readOnly={ !data.fidelite_activation } 
            onChange={()=>{logger.info('click')}}
            label={ strings.modules.parametres.submodules.financier.fidelite.seuil.split(';')[0] }
            postvalue={ strings.modules.parametres.submodules.financier.fidelite.seuil.split(';')[1] }
          />
        </div>
      </div>
      </div>
    </div>
  );
 }
};

export default Financier;