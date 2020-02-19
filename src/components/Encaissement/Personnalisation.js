import React from 'react';
import PropTypes from 'prop-types';

import { Modal, Fab, List, ListItem, Button } from '@material-ui/core';
import CloseIcon from '../common/icon/CloseIcon';

import LocalizedStrings from 'react-localization';
import {data} from '../../constants/translations';
import LoadingSpinner from '../common/LoadingSpinner';
let strings = new LocalizedStrings(data);




const IngredientBtn = ({ id, nom, supplement, step, addIng, removeIng }) => (
  <Button
    className="IngredientBtn"
    id={id}
    step={ step }
    onClick={ () => addIng(id) }
  ><div>{ nom }</div>
  {supplement>0 && <div>{ supplement.replace('.',',') }&nbsp;€</div>}
  </Button>
);



class Personnalisation extends React.Component {


  render() {
    
    const { open, closePersonnalisation, contClass, stepObject, step, item, ingredientTypes, addIngredient } = this.props;

    if (null==stepObject || Object.entries(stepObject).length==0) return <LoadingSpinner />;

    if(null==ingredientTypes || Object.entries(ingredientTypes).length==0) return <LoadingSpinner />;

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
                  <div className="igtype" key={id}>
                    { Object.entries(ingredientTypes).length>1 && <div className="igtype-nom">{ type.nom }</div> }
                    <div className="igtype-liste">
                      { type.ingredients.map(ingredient => 
                      <IngredientBtn 
                      id={ingredient.id}
                      nom={ingredient.nom}
                      supplement={ingredient.supplement} 
                      step={step}
                      addIng={()=>{ addIngredient({itemid: item, stepid: step, ingredientid: ingredient.id, quantite: 1}) }} 
                      removeIng={()=>{ console.log(`remove ${ingredient.id}`)}} 
                      key={ingredient.id}
                      />
                      )}
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