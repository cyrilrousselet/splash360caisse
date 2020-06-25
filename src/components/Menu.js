import React from 'react';
import PropTypes from 'prop-types';

import LocalizedStrings from 'react-localization';
import {data} from '../constants/translations';
import TopZone from '../containers/TopZone';
import LoadingSpinner from './common/LoadingSpinner';
import { AppBar, Tabs, Tab, Typography, Box, Select, FormControl, InputLabel, MenuItem, ExpansionPanel, ExpansionPanelSummary, ExpansionPanelDetails, ListItem, ListItemText, ListItemSecondaryAction, Switch, ListItemIcon, List, FormControlLabel, Checkbox } from '@material-ui/core';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import LensIcon from '@material-ui/icons/Lens';
import CheckBoxOutlineBlankIcon from '@material-ui/icons/CheckBoxOutlineBlank';
import CheckBoxIcon from '@material-ui/icons/CheckBox';
import {devise} from '../helpers/toolbox';
import { withStyles } from '@material-ui/core/styles';


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
      openTab: 0,
      catalogue: null
    }
    this.handleChangeTab = this.handleChangeTab.bind(this);
    this.handleChangeCategorie = this.handleChangeCategorie.bind(this);
    this.changeDispoProduit = this.changeDispoProduit.bind(this);
    this.editProduit = this.editProduit.bind(this);
    this.changeDispoIngredient = this.changeDispoIngredient.bind(this);
    this.editIngredient = this.editIngredient.bind(this);
    this.getProduit = this.getProduit.bind(this);

  }
  componentDidMount() {
    this.props.getCatalogue();
    this.props.getAllTickets();
  }

  handleChangeTab(event, newValue) {
    this.setState({openTab: newValue});
  };

  handleChangeCategorie(event) {
    this.setState({categorie:event.target.value});
  }

  changeDispoProduit(id) {
    console.log('changeDispoProduit()', id);
    const produit = this.getProduit(id);
    this.props.updateProduit({produit_id:id, update:{active:produit.active==1?0:1}});
  }
  editProduit(id) {
    console.log('editProduit()', id);
  }
  changeDispoIngredient(id) {
    console.log('changeDispoIngredient()', id);
    const {ingredients} = this.props;
    const ingredient = ingredients[id];
    this.props.updateIngredient({ingredient_id:id, update:{active:ingredient.active==1?0:1}});
  }
  editIngredient(id) {
    console.log('editIngredient()', id);
  }

  getProduit(id) {
    const {catalogue} = this.props;
    let produit = {};
    Object.values(catalogue).forEach(grp => {
      const p = grp.produits.find(p=>p.id==id);
      if (p!==undefined) {
        produit = p;
        return;
      }
    });
    return produit;
  }

 render() {

  const { catalogue, categories, ingredients, ingredientTypes, tickets } = this.props;
  const { openTab, categorie } = this.state;

  const defCat = categorie || categories[0].categorie_id;

  const tickList = Object.values(tickets).filter(tck=> (['commande','partiel','principal']).indexOf(tck.template)!==-1 && tck.imprimantes.length>0);

  const inglist = Object.entries(ingredientTypes).map(([typid,type]) => {
    const ing = type.ingredients.map(ingid => ingredients[ingid]);
    return {
      ...type,
      id: typid,
      ingredients: ing
    }
  });

  let prdlist = [];
  Object.entries(catalogue).forEach(([groupid, groupe]) => {
      if (groupe.categorie==defCat) {
        prdlist.push({...groupe, groupe_id: groupid})
      }
    });

  console.log(prdlist);

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
              <div className="catalogue">
                <div className="catalogue-label">{ `${strings.modules.menu.catalogue} :` }</div>
                <FormControl variant="filled" className={"catalogues-selector"}>
                  <Select
                    labelId="demo-simple-select-filled-label"
                    id="demo-simple-select-filled"
                    value={defCat}
                    onChange={this.handleChangeCategorie}
                    >{categories.map((cat,i) => (
                      <MenuItem key={`cat${i}`} value={cat.categorie_id}>{cat.nom}</MenuItem>
                      ))}
                  </Select>
                </FormControl> 
              </div>
              <Tabs value={openTab} onChange={this.handleChangeTab} aria-label="simple tabs">
                <Tab label={ strings.modules.menu.produits} {...a11yProps(0)} />
                <Tab label={ strings.modules.menu.ingredients} {...a11yProps(1)} />
              </Tabs>
            </AppBar>
            <TabPanel key={ `panel-produits` } className="panel" value={openTab} index={0}>
              <MenuListe key="liste-produits" data={prdlist} type="produits" openEdit={this.editProduit} tickets={tickList} changeDispo={this.changeDispoProduit} />
            </TabPanel>
            <TabPanel key={ `panel-ingredients` } className="panel" value={openTab} index={1}>
              <MenuListe  key="liste-ingredients" data={inglist} type="ingredients" openEdit={this.editIngredient} tickets={tickList} changeDispo={this.changeDispoIngredient} />
            </TabPanel>
          </div>
      </div>
    </div>
    );
  }
}
export default Menu;


const IOSSwitch = withStyles((theme) => ({
  root: {
    width: 42,
    height: 26,
    padding: 0,
    margin: theme.spacing(1),
  },
  switchBase: {
    padding: 1,
    '&$checked': {
      transform: 'translateX(16px)',
      color: theme.palette.common.white,
      '& + $track': {
        backgroundColor: '#52d869',
        opacity: 1,
        border: 'none',
      },
    },
    '&$focusVisible $thumb': {
      color: '#52d869',
      border: '6px solid #fff',
    },
  },
  thumb: {
    width: 24,
    height: 24,
  },
  track: {
    borderRadius: 26 / 2,
    border: `1px solid ${theme.palette.grey[400]}`,
    backgroundColor: theme.palette.grey[50],
    opacity: 1,
    transition: theme.transitions.create(['background-color', 'border']),
  },
  checked: {},
  focusVisible: {},
}))(({ classes, ...props }) => {
  return (
    <Switch
      focusVisibleClassName={classes.focusVisible}
      disableRipple
      classes={{
        root: classes.root,
        switchBase: classes.switchBase,
        thumb: classes.thumb,
        track: classes.track,
        checked: classes.checked,
      }}
      {...props}
    />
  );
});



function MenuListe(props) {

  const {data, type, changeDispo, openEdit, tickets, ...other} = props;

  const mliste = data.map((cont,i) => (
    <ExpansionPanel key={`panel${i}`}>
      <ExpansionPanelSummary
        expandIcon={<ExpandMoreIcon />}
        aria-controls={ `panel${i}-content` }
        id={ `panel${i}-header` }
        className="cont-header"
        >
          <div className="cont-nom">
            <Typography className="cont-title">{ cont.nom }</Typography>
          </div>
          <div className="cont-print">
            {tickets.map(tck=>
              <FormControlLabel
              control={
                <Checkbox
                  icon={<CheckBoxOutlineBlankIcon htmlColor="#7FAD3B" fontSize="small" />}
                  checkedIcon={<CheckBoxIcon  htmlColor="#7FAD3B" fontSize="small" />}
                  checked={true}
                  onClick={(e)=>{ e.stopPropagation(); console.log('check')}}
                  name="checkedB"
                  color="primary"
                />
              }
              label={tck.nom}
            />
            )}
          </div>
        </ExpansionPanelSummary>
        <ExpansionPanelDetails>
          <List className="panel-liste" key={ `panel${i}-liste` }>
          { cont.produits && cont.produits.map((p,i) => ( 
            <ListItem className={`item ${((i%2)?'odd':'even')}`}>
              <ListItemIcon>
                <LensIcon className={`couleur ${p.color}`} />
              </ListItemIcon>
              <ListItemText id={p.id} primary={p.nom} secondary={ `${devise(Number(p.prix))} €`} />
              <ListItemSecondaryAction>
                <IOSSwitch
                  edge="end"
                  onChange={(e)=>{changeDispo(p.id)}}
                  checked={p.active}
                />
              </ListItemSecondaryAction>
            </ListItem>
          ))}
          { cont.ingredients && cont.ingredients.map((n,i) => (
            <ListItem className={`item ${((i%2)?'odd':'even')}`}>
              <ListItemIcon>
                <LensIcon className={`couleur ${n.color}`} />
              </ListItemIcon>
              <ListItemText id={n.id} primary={n.nom} secondary={`${devise(Number(n.supplement))} €` } />
              <ListItemSecondaryAction>
                <IOSSwitch
                  edge="end"
                  onChange={(e)=>{changeDispo(n.id)}}
                  checked={n.active}
                />
              </ListItemSecondaryAction>
            </ListItem>
          ))}
          </List>
        </ExpansionPanelDetails>
    </ExpansionPanel>
  ));


  return (<div className="liste-wrapper">{ mliste }</div>);
}