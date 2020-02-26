import React from 'react';
import PropTypes from 'prop-types';

import { Modal, Fab, List, ListItem, Button } from '@material-ui/core';
import CloseIcon from '../common/icon/CloseIcon';

import LocalizedStrings from 'react-localization';
import {data} from '../../constants/translations';
import LoadingSpinner from '../common/LoadingSpinner';
import MinusIcon from '../common/icon/MinusIcon';
import PlusIcon from '../common/icon/PlusIcon';
let strings = new LocalizedStrings(data);




const IngredientBtn = ({ id, nom, supplement, step, addIng, removeIng, qte, withbuttons }) => (
  <div
    className={`IngredientBtn${withbuttons ? ' with-qtebtn' :''}`}
    id={id}
    step={ step }
    onClick={ (e) => { e.stopPropagation(); addIng(id)} }
  ><div className="btnlabel">
    <div className="nom">{ nom }</div>
  {supplement>0 && <div className="supplt">{ supplement.replace('.',',') }&nbsp;€</div>}
    </div>
  {qte>0 && <div className="qte-label">{qte}</div>}
  {withbuttons && (
    <div className="qte-btn">
      <Fab aria-label="remove" size="small" className="moins" disabled={qte==0} onClick={(e) => { e.stopPropagation(); removeIng(id)}}>
        <MinusIcon htmlColor="#ffffff" />
      </Fab>
      <Fab aria-label="add" size="small" className="plus" disabled={false} onClick={(e) => { e.stopPropagation(); addIng(id)}}>
        <PlusIcon htmlColor="#ffffff" />
      </Fab>
    </div>
  )}
  </div>
);



class Personnalisation extends React.Component {

  constructor(props) {
    super(props);
    this.getIngredientQuantity = this.getIngredientQuantity.bind(this);
  }

  getIngredientQuantity(ingredientid, regle) {
    const { itemIngredients } = this.props;
    const ingredient = itemIngredients.find(ing=>ing.ingredient==ingredientid);
    if (null==ingredient) return 0; 
    return ingredient.qte;
  }


  render() {
    
    const { open, closePersonnalisation, contClass, stepObject, step, item, ingredientTypes, addIngredient, removeIngredient, noIngredientForStep } = this.props;

    if (null==stepObject || Object.entries(stepObject).length==0) return <Modal open={open}><LoadingSpinner /></Modal>;

    if (null==ingredientTypes || Object.entries(ingredientTypes).length==0) return <Modal open={open}><LoadingSpinner /></Modal>;


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
                        withbuttons={!RegExp('^(\\?|\\{1\\}|\\{0\\}|\\{0,1\\})').test(type.regle)}
                        qte={this.getIngredientQuantity(ingredient.id, type.regle)}
                        addIng={()=>{ addIngredient({itemid: item, stepid: step, ingredientid: ingredient.id, quantite: 1}) }} 
                        removeIng={()=>{ removeIngredient({itemid: item, stepid: step, ingredientid: ingredient.id, quantite: 1}) }} 
                        key={ingredient.id}
                      />
                      )}

                      {RegExp('^(\\?|\\*|\\{0)').test(type.regle) && 
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
                      }
                    </div>
                  </div>
                )}
              </div>
            </div>
            <div className="footer">

            </div>
          </div>
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