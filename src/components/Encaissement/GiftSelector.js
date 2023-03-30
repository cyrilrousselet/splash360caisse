import { Fab, Modal } from "@material-ui/core";
import React from "react";
import LocalizedStrings from "react-localization";
import { data } from "../../constants/translations";
// import Logger from "../../helpers/Logger";
import logger from "../../helpers/Logger";
import { commandeServices } from "../../services/commande/commandeServices";
import CloseIcon from "../common/icon/CloseIcon";
import MinusIcon from "../common/icon/MinusIcon";
import LoadingSpinner from "../common/LoadingSpinner";
import StdButton from "../common/StdButton";
import LodashId from "lodash-id";

import {MODES} from '../../constants/commandeModes';

let strings = new LocalizedStrings(data);
// const logger = new Logger();

const ProduitBtn = ({ id, nom, prix, composition, color, onClick, disabled, symbolemonnaie }) => (
  <div
    className={ `ProduitBtn${disabled ? ' btn-disabled' :''} ${color}` }
    id={id}
    composition={ composition }
    onClick={ () => {  if (!disabled) onClick(id)} }
  ><div className="btnlabel">
    <div className="nom">{ nom }</div>
    <div className="supplt">{ Number(prix).toFixed(2).replace('.',',') }&nbsp;{symbolemonnaie}</div>
    </div>
  </div>
);

class GiftSelector extends React.Component {
  constructor(props) {
    super(props);
    this.addItem = this.addItem.bind(this);
  }


  addItem(payload) {
    const itemid = 'gift_'+LodashId.createId();
    this.props.addProduit({...payload, itemid});

    const {valeur, nom, operation} = this.props.gift;

    this.props.addDiscount({valeur, nom, operation, item:itemid, ingredient: null});

    this.props.closeSelector();
  }

  render() {
    const {
      open,
      contClass,
      layout,
      closeSelector,
      productsList,
      mode,
      monnaie
    } = this.props;

   

    return (
      <Modal open={open}>
        <div className={`GiftSelector ${contClass} ${(layout==='narrow' ? 'personnalisation-narrow' : 'personnalisation-normal')}`}>
          <div className="Modal-container">
            <div className="header">
              <div className="title">{ strings.modules.encaissement.gift.input.titre }</div>
            </div>
            <div className="body">
              <div className="modal-wrapper">
                <div className="igtype-liste">
                  { productsList && productsList.map(prd => 
                    <ProduitBtn 
                      key={ prd.id } 
                      id={ prd.id } 
                      nom={ prd.nom } 
                      prix={ prd.prixArray[MODES[mode]].ttc } 
                      color={ prd.color }
                      disabled={ prd.active===0 }
                      composition={prd.composition}
                      onClick={ () => this.addItem({produitid: prd.id, nom: prd.nom, legende: prd.legende, prix: Number(prd.prixArray[MODES[mode]].ttc), puht: Number(prd.prixArray[MODES[mode]].ht), composition: prd.composition, compo: prd.compo, customizable: prd.customizable, tva_id:prd.tvaArray[MODES[mode]] }) } />
                  )}
                </div>
              </div>
            </div>
            <div className="footer">
            </div>
          </div>
          <Fab
            aria-label="close"
            size="small"
            className="close-button"
            onClick={closeSelector}
          >
            <CloseIcon />
          </Fab>
        </div>
      </Modal>
    );
  }
}

export default GiftSelector;
