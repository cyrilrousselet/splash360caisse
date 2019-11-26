import React from 'react';
import PropTypes from 'prop-types';

import { Tabs, TabLink, TabContent } from 'react-tabs-redux';
import {Button} from '@material-ui/core';
import LoadingSpinner from '../common/LoadingSpinner';

import LocalizedStrings from 'react-localization';
import {data} from '../../constants/translations';
let strings = new LocalizedStrings(data);

const ProduitBtn = ({ id, nom, prix, composition, onClick }) => (
  <Button
    className="ProduitBtn"
    id={id}
    composition={ composition }
    onClick={ () => onClick(id) }
  ><div>{ nom }</div><div>{ prix.replace('.',',') }&nbsp;€</div></Button>
);


class Selecteur extends React.Component {

  componentDidMount() {
    const { getAllActive } = this.props;
    getAllActive();
  }

  // action on buttons (fill in passphrase)
  buttonHandler(text) {
    console.log(`Produit #${text}`);
  }

  scrollTabBar(dir) {
    // if ('up'==dir) {
      
    // }
  }

  render() {

    const { catalogue, error, loading, addProduit } = this.props;
  
    let tlinks = [];
    let tcontents = [];
    
    for (let [key, value] of Object.entries(catalogue)) {
      tlinks.push({id: key, nom: value.nom});
      tcontents.push({parent: key, liste: value.produits});
    }


    if(loading) {
      return <LoadingSpinner />
    }

    if (undefined === catalogue) {
      return <div className="SelecteurEmpty">{ strings.modules.encaissement.selecteur.empty }</div>
    }
    
    return (
      <Tabs className="Selecteur">
        {error && <span className="error">{error}</span>}
        <div className="TabBar">
          {/* <div className="btn-up"></div> */}
            <div className="wrapper" ref={ this.barwrapper }>
              { tlinks.map(grp => 
              <TabLink to={ grp.id} key={grp.id}>{ grp.nom }</TabLink>
              )}
          </div>
          {/* <div className="btn-down"></div> */}
            
        </div>
        <div className="TabCont">
          {/* <div className="btn-up"></div> */}
          <div className="wrapper">
            { tcontents.map(cnt => 
            <TabContent for={ cnt.parent } key={cnt.parent}>
              { cnt.liste.map(prd => 
                <ProduitBtn 
                  key={ prd.id } 
                  id={ prd.id } 
                  nom={ prd.nom } 
                  prix={ prd.prix } 
                  composition={prd.composition}
                  onClick={ () => addProduit({produitid: prd.id, nom: prd.nom, prix: Number(prd.prix), composition: prd.composition }) } />
              )}
            </TabContent>
            )}
          </div>
          {/* <div className="btn-down"></div> */}
        </div>
      </Tabs>
    );
  }
}
export default Selecteur;
  
Selecteur.propTypes = {
  catalogue: PropTypes.object,
  loading: PropTypes.bool,
  error: PropTypes.string,
  getAllActive: PropTypes.func,
  addProduit: PropTypes.func
}