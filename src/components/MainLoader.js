import React from 'react';

import {data} from '../constants/translations';
import LocalizedStrings from 'react-localization';
import LoadingSpinner from './common/LoadingSpinner';

let strings = new LocalizedStrings(data);

class MainLoader extends React.Component {
  

  constructor(props) {
    super(props);
  }

  componentDidMount() {

    console.log('MainLoader.componentDidMount()');
    
      // this.props.getParametres();
      // this.props.getCommandesList();
      // this.props.getCatalogue();
      // this.props.getCurrentPeriode();
      // this.props.getCloturesList();
  }

  render() {
    const { paramLoaded, paramLoading, catLoaded, catLoading, cmdLoaded, cmdLoading, cloLoaded, cloLoading, sseInit } = this.props;

    if (!paramLoaded) {
      this.props.getParametres();
    }
    if (paramLoaded && !sseInit) {
      this.props.initSSE();
    }
    if (paramLoaded && !catLoaded && !catLoading) {
      this.props.getCatalogue();
    }
    if (paramLoaded && catLoaded && !cmdLoaded && !cmdLoading) {
      this.props.getCommandesList();
    }
    if (paramLoaded && catLoaded && cmdLoaded && !cloLoaded && !cloLoading) {
      this.props.getCloturesList();
//      this.props.getCurrentPeriode();
    }
    if (paramLoaded && catLoaded && cmdLoaded && cloLoaded) {
      this.props.loadingComplete();
    }
    return (      
      <LoadingSpinner className="MainLoader-loading" />
    );
  }
}

export default MainLoader;