import React from 'react';
import PropTypes from 'prop-types';

import LocalizedStrings from 'react-localization';
import {data} from '../constants/translations';
import TopZone from '../containers/TopZone';
import LoadingSpinner from './common/LoadingSpinner';
import { AppBar, Tabs, Tab, Typography, Box } from '@material-ui/core';

let strings = new LocalizedStrings(data);

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

class Menu extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      openTab:0
    }
    this.handleChangeTab = this.handleChangeTab.bind(this);

  }

  handleChangeTab(event, newValue) {
    this.setState({openTab: newValue});
  };


 render() {

  const { catalogue, categories, ingredients, ingredientTypes } = this.props;
  const { openTab } = this.state;


  const a11yProps = (index) => {
    return {
      id: `simple-tab-${index}`,
      'aria-controls': `simple-tabpanel-${index}`,
    };
  }

  return (
    <div className="Menu container">
      <TopZone />
      <div className="MainZone">
          <div className="listes">
            <AppBar position="static">
              <Tabs value={openTab} onChange={this.handleChangeTab} aria-label="simple tabs">
                {categories.map((cat,i) => (
                  <Tab label={cat.nom} {...a11yProps(i)} />
                ))}
              </Tabs>
            </AppBar>
            {categories.map((cat,i) => (
              <TabPanel key={ `panel-${i}` } className="panel" value={openTab} index={i}>
              {cat.nom}
              </TabPanel>
            ))}
          </div>
      </div>
    </div>
    );
  }
}
export default Menu;

// Cloture.propTypes = {
//   catalogue: PropTypes.array,
//   loading: PropTypes.bool,
//   error: PropTypes.string,
//   getAllActive: PropTypes.func
// }