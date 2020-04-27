import React from 'react';
import PropTypes from 'prop-types';
import ParametresPeripheriquesImpressionCont from './../../containers/ParametresPeripheriquesImpressionCont';
import PeripheriquesPaiement from './PeripheriquesPaiement';
import PeripheriquesAffichage from './PeripheriquesAffichage';
import { Tabs, Tab, Box, AppBar, Typography } from '@material-ui/core';

import LocalizedStrings from 'react-localization';
import {data} from '../../constants/translations';


let strings = new LocalizedStrings(data);


const a11yProps = (index) => {
  return {
    id: `simple-tab-${index}`,
    'aria-controls': `simple-tabpanel-${index}`,
  };
}


function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <Typography
      component="div"
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && <Box p={3}>{children}</Box>}
    </Typography>
  );
}

TabPanel.propTypes = {
  children: PropTypes.node,
  index: PropTypes.any.isRequired,
  value: PropTypes.any.isRequired,
};



class Peripheriques extends React.Component {

constructor(props) {
  super(props);
  this.state = {
    section: 0
  }
  this.handleChangeTab = this.handleChangeTab.bind(this);
}

handleChangeTab(event, newValue) {
  this.setState({section: newValue});
};


 render() {

  const { section } = this.state;

  return (
   <div className="Peripheriques subcontent">
    <AppBar position="static">
      <Tabs value={section} onChange={this.handleChangeTab} aria-label="simple tabs example">
        <Tab label={ strings.modules.parametres.submodules.peripheriques.impression.titre } {...a11yProps(0)} />
        <Tab label={ strings.modules.parametres.submodules.peripheriques.paiement.titre } {...a11yProps(1)} />
        <Tab label={ strings.modules.parametres.submodules.peripheriques.affichage.titre } {...a11yProps(2)} />
      </Tabs>
    </AppBar>
    <TabPanel key="impression-panel" className="panel" value={section} index={0}>
      <ParametresPeripheriquesImpressionCont className="impression" id="impression" />
    </TabPanel>
    <TabPanel key="paiement-panel" className="panel" value={section} index={1}>
      <PeripheriquesPaiement className="paiement" id="paiement" />
    </TabPanel>
    <TabPanel key="affichage-panel" className="panel" value={section} index={2}>
      <PeripheriquesAffichage className="affichage" id="affichage" />
    </TabPanel>
   </div>
  );
 }
};

export default Peripheriques;