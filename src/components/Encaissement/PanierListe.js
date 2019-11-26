import React from 'react';
import PropTypes from 'prop-types';

import StdButton from '../common/StdButton';

import LocalizedStrings from 'react-localization';
import {data} from '../../constants/translations';
import { List, ListItem, ListItemText } from '@material-ui/core';
let strings = new LocalizedStrings(data);

class PanierListe extends React.Component {

  constructor(props) {
    super(props);
  }

  render () {

    const { items } = this.props;
    const [selectedIndex, setSelectedIndex] = React.useState(null);

    const handleListItemClick = (event, index) => {
        setSelectedIndex(index);
    }

    return (
        <div className="PanierListe">
            <div className="Liste">
                <div className="Header"></div>
                <div className="wrapper">
                    <List>
                    { items.map((itm,i) => 
                        <PanierListeItem
                            id={ i } 
                            key={ i }
                            itemid={ itm.itemid }
                            nom={ itm.nom }
                            quantite={ itm.quantite }
                            prix={ itm.prix }
                            commentaire={ itm.commentaire!=='' }
                            selected={ selectedIndex==i }
                            ingredients={ itm.ingredients }
                            _onClick={ handleListItemClick } />
                    )}
                    </List>
                </div>
            </div>
        </div>
    );
  }

}

export default PanierListe;

PanierListe.propTypes = {
    items: PropTypes.array.isRequired
};



export const PanierListeItem = ({id, itemid, nom, quantite, prix, commentaire, selected, ingredients, _onClick}) => (
    <ListItem 
        button 
        selected={ selected }
        onClick={ event => _onClick(event, id) }
    >
        <div className="nom">{nom}</div> 
        <div className="quantite">{quantite}</div> 
        <div className="prix">{prix}</div>
    </ListItem>
);

PanierListeItem.propTypes = {
    id: PropTypes.number.isRequired,
    itemid: PropTypes.string.isRequired,
    nom: PropTypes.string.isRequired,
    quantite: PropTypes.number,
    prix: PropTypes.number,
    commentaire: PropTypes.bool,
    selected: PropTypes.bool,
    ingredients: PropTypes.array,
    _onClick: PropTypes.func
};

