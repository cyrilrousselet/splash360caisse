import React from 'react';
import PropTypes from 'prop-types';
import ParametresCommandesGeneralCont from './../../containers/ParametresCommandesGeneralCont';
import ParametresCommandesCommentairesCont from '../../containers/ParametresCommandesCommentairesCont';
import ParametresCommandesCanauxCont from './../../containers/ParametresCommandesCanauxCont';
import ParametresCommandesDiscountCont from '../../containers/ParametresCommandesDiscountCont';
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



class Commandes extends React.Component {

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
   <div className="Commandes subcontent">
    <AppBar position="static">
      <Tabs value={section} onChange={this.handleChangeTab} aria-label="simple tabs example">
        <Tab label={ strings.modules.parametres.submodules.commandes.general.titre } {...a11yProps(0)} />
        <Tab label={ strings.modules.parametres.submodules.commandes.commentaires.titre } {...a11yProps(1)} />
        <Tab label={ strings.modules.parametres.submodules.commandes.canaux.titre } {...a11yProps(2)} />
        <Tab label={ strings.modules.parametres.submodules.commandes.discount.titre } {...a11yProps(2)} />
      </Tabs>
    </AppBar>
    <TabPanel key="general-panel" className="panel" value={section} index={0}>
      <ParametresCommandesGeneralCont className="general" id="general" />
    </TabPanel>
    <TabPanel key="commentaires-panel" className="panel" value={section} index={1}>
      <ParametresCommandesCommentairesCont className="commentaires" id="commentaires" />
    </TabPanel>
    <TabPanel key="canaux-panel" className="panel" value={section} index={2}>
      <ParametresCommandesCanauxCont className="providers" id="providers" />
    </TabPanel>
    <TabPanel key="discount-panel" className="panel" value={section} index={3}>
      <ParametresCommandesDiscountCont className="providers" id="providers" />
    </TabPanel>
   </div>
  );
 }
};

export default Commandes;