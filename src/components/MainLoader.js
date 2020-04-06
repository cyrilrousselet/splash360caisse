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
      this.props.getCommandesList();
      this.props.getAllActive();
      this.props.getParametres();
      this.props.getCurrentPeriode();
  }

  render() {
    const { paramLoaded, catLoaded, periLoaded, cloLoaded } = this.props;

    if (paramLoaded && catLoaded && periLoaded && cloLoaded) {
      this.props.loadingComplete();
    }
    return (      
      <LoadingSpinner className="MainLoader-loading" />
    );
  }
}

export default MainLoader;