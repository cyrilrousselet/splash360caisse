import React from 'react';

import TopZone from '../../containers/TopZone';
import SelecteurCont from '../../containers/SelecteurCont';
import PanierCont from '../../containers/PanierCont';
import ReglementCont from '../../containers/ReglementCont';

class Encaissement extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      reglementOpen: false
    };
    this.openReglement = this.openReglement.bind(this);
    this.closeReglement = this.closeReglement.bind(this);
  }

  openReglement() {
    this.setState({reglementOpen: true});
  }
  closeReglement() {
    this.setState({reglementOpen: false});
  }

 render () {
    return (
      <div className="Encaissement container">
        <TopZone />
        <div className="MainZone">
          <SelecteurCont />
          <PanierCont openReglement={ this.openReglement } open={ this.state.reglementOpen } />
          <ReglementCont open={ this.state.reglementOpen } closeReglement={ this.closeReglement } />
        </div>
      </div>
    );
   }
}

export default Encaissement;