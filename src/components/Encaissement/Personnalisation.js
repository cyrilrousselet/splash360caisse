import React from 'react';
import PropTypes from 'prop-types';

import { Modal, Fab, List, ListItem, Button } from '@material-ui/core';
import CloseIcon from '../common/icon/CloseIcon';
import { commandeServices } from '../../services/commande/commandeServices';

import LocalizedStrings from 'react-localization';
import {data} from '../../constants/translations';
import LoadingSpinner from '../common/LoadingSpinner';
import MinusIcon from '../common/icon/MinusIcon';
import PlusIcon from '../common/icon/PlusIcon';
import StdButton from '../common/StdButton';
import { getWeekYearWithOptions } from 'date-fns/fp';
let strings = new LocalizedStrings(data);




const IngredientBtn = ({ id, nom, supplement, step, addIng, removeIng, qte, withbuttons, disabled }) => (
  <div
    className={`IngredientBtn${withbuttons ? ' with-qtebtn' :''}${disabled ? ' btn-disabled' :''}`}
    id={id}
    step={ step }
    onClick={ (e) => { e.stopPropagation(); if(!disabled) addIng(id)} }
  ><div className="btnlabel">
    <div className="nom">{ nom }</div>
  {supplement>0 && <div className="supplt">{ Number(supplement).toFixed(2).replace('.',',') }&nbsp;€</div>}
    </div>
  {qte>0 && <div className="qte-label">{qte}</div>}
  {withbuttons && (
    <div className="qte-btn">
      {(qte>0 && <Fab aria-label="remove" size="small" className="moins" onClick={(e) => { e.stopPropagation(); removeIng(id)}}>
        <MinusIcon htmlColor="#ffffff" />
      </Fab>)}
      {/* <Fab aria-label="add" size="small" className="plus" disabled={false} onClick={(e) => { e.stopPropagation(); addIng(id)}}>
        <PlusIcon htmlColor="#ffffff" />
      </Fab> */}
    </div>
  )}
  </div>
);



class Personnalisation extends React.Component {

  constructor(props) {
    super(props);
    this.getIngredientQuantity = this.getIngredientQuantity.bind(this);
    this.gotoPreviousStep = this.gotoPreviousStep.bind(this);
  }

  /**
   * Retourne la quantité choisie pour l'ingrédient passé en paramètre
   * 
   * @param {*} ingredientid id de l'ingrédient
   */
  getIngredientQuantity(ingredientid) {
    const { itemIngredients } = this.props;
    const ingredient = itemIngredients.find(ing=>ing.ingredient==ingredientid);
    if (null==ingredient) return 0; 
    return ingredient.qte;
  }

  /**
   * Définit si le nombre maximum de choix d'ingrédient a été atteint par type
   * 
   * @param {*} steptypes liste des regles du step
   * @param {*} itming    liste des ingredients de l'item de commande
   * @returns un objet ayant comme propriétés l'id de chaque type et comme valeur un booléen (true = nombre max atteint)
   */
  isIngredientTypeMaxnum(steptypes, itming) {

    let intypes = {}, typeMax = {};
    let max, num, typeing;
    for (let [key, value] of Object.entries(steptypes)) {
      max = commandeServices.getRuleValues(value.regle).max;
      typeing = itming.filter(ing=>ing.type==key);
      num = 0;
      typeing.forEach(ing=> { num += ing.qte });
      intypes[key] = {max, num};
    }

    // si le type est global
    if (Object.values(steptypes)[0].regle.indexOf('g')!=-1) {
      // on additionne le nbr d'ingredients de tous les types
      let allnum = 0;
      Object.values(intypes).forEach(value => {
        allnum += value.num;
      });
      for (let [key, value] of Object.entries(intypes)) {
        typeMax[key] = allnum>=value.max;
      }
    }
    // sinon on teste individuellement les types
    else {
      for (let [key, value] of Object.entries(intypes)) {
        console.log(value.num+'>='+value.max);
        typeMax[key] = value.num>=value.max;
      }
    }

    return typeMax;
  }

  /**
   * récupère les id du step précédent (n-1) et du step d'avant (n-2) pour ouvrir le step précédent
   */
  gotoPreviousStep() {

    const { item, itemSteps, previousstep, openPersonnalisation } = this.props;
    
    const __nextStep = itemSteps.find(s => s.id==previousstep);
    let __stepIndex = itemSteps.findIndex(s=>s.id==previousstep);
    let __previd = (__stepIndex<=0 ) ? -1 : itemSteps[__stepIndex-1].id;

    openPersonnalisation(item, previousstep, __previd, __nextStep.validated, 'previousbtn');

  }



  render() {
    
    const { open, closePersonnalisation, contClass, stepObject, step, itemSteps, item, ingredientTypes, addIngredient, removeIngredient, noIngredientForStep, itemIngredients, completeStep, valide, previousstep, updateProduit } = this.props;

    if (null==stepObject || Object.entries(stepObject).length==0) return <Modal open={open}><LoadingSpinner /></Modal>;

    if (null==ingredientTypes || Object.entries(ingredientTypes).length==0) return <Modal open={open}><LoadingSpinner /></Modal>;

    const isTypesMax = this.isIngredientTypeMaxnum(ingredientTypes, itemIngredients);

    const onClickDelete = () => {
      updateProduit({itemid: item, quantite: 0});
      closePersonnalisation('popin');
    }

    return (
      <Modal
        open={open}
        >
        <div className={ `Personnalisation ${contClass}`}>
          <div className="Modal-container">
            <div className="header">
              <div className="title">{ stepObject.titre }</div>
            </div>
            <div className="body">
              <div className="modal-wrapper">
                {Object.entries(ingredientTypes).map(([id,type])=>
                  <div className="igtype" key={id} data-regle={type.regle}>
                    { Object.entries(ingredientTypes).length>1 && <div className="igtype-nom">{ type.nom }</div> }
                    <div className="igtype-liste">
                      { type.ingredients.map(ingredient => 
                      <IngredientBtn 
                        id={ingredient.id}
                        nom={ingredient.nom}
                        supplement={ingredient.supplement} 
                        step={step}
                        disabled={isTypesMax[id]}
                        withbuttons={!RegExp('^(\\?|\\{1\\}|\\{0\\}|\\{0,1\\})').test(type.regle)}
                        qte={this.getIngredientQuantity(ingredient.id)}
                        addIng={()=>{ addIngredient({itemid: item, stepid: step, ingredientid: ingredient.id, quantite: 1}) }} 
                        removeIng={()=>{ removeIngredient({itemid: item, stepid: step, ingredientid: ingredient.id, quantite: 1}) }} 
                        key={ingredient.id}
                      />
                      )}

                      {/* {RegExp('^(\\?|\\*|\\{0)').test(type.regle) && 
                        <IngredientBtn 
                          id={-1}
                          nom={strings.modules.encaissement.personnalisation.aucun}
                          supplement={0} 
                          step={step}
                          withbuttons={false}
                          qte={0}
                          addIng={()=>{ noIngredientForStep({itemid: item, stepid: step}) }} 
                          key={0}
                        />
                      } */}
                    </div>
                  </div>
                )}
              </div>
            </div>
            <div className="footer">
              {(this.props.previousstep!=-1) && <StdButton identifier="btnprecedent" elementclass="btnprecedent" key="btnprecedent" text={strings.modules.encaissement.personnalisation.precedent} onClick={ () => { this.gotoPreviousStep() }} />}
              <div className="intercalaire"></div>
              <StdButton identifier="btnsuivant" elementclass="btnsuivant" key="btnsuivant" text={strings.modules.encaissement.personnalisation.valider} disabled={!valide} onClick={ () => { completeStep({itemid: item, stepid: step}) }} />
            </div>
          </div>
          <Fab aria-label="close" size="small" className="close-button" onClick={ onClickDelete }>
            <CloseIcon />
          </Fab>
        </div>
      </Modal>
    );

  }

}

export default Personnalisation;

Personnalisation.propTypes = {
  open: PropTypes.bool,
  closePersonnalisation: PropTypes.func.isRequired,
}