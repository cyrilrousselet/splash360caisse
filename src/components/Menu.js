import React from 'react';
import PropTypes from 'prop-types';

import LocalizedStrings from 'react-localization';
import {data} from '../constants/translations';
import TopZone from '../containers/TopZone';
import LoadingSpinner from './common/LoadingSpinner';
import { AppBar, Tabs, Tab, Typography, Box, Select, FormControl, InputLabel, MenuItem, ExpansionPanel, ExpansionPanelSummary, ExpansionPanelDetails, ListItem, ListItemText, ListItemSecondaryAction, Switch, ListItemIcon, List, FormControlLabel, Checkbox, Modal, TextField, Fab } from '@material-ui/core';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import LensIcon from '@material-ui/icons/Lens';
import CheckBoxOutlineBlankIcon from '@material-ui/icons/CheckBoxOutlineBlank';
import CheckBoxIcon from '@material-ui/icons/CheckBox';
import {devise} from '../helpers/toolbox';
import { withStyles } from '@material-ui/core/styles';
import StdButton from './common/StdButton';
import CloseIcon from './common/icon/CloseIcon';
import Clavier from './common/Clavier';
import LabelledField from './common/LabelledField';


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





class MenuItemModal extends React.Component {

    constructor(props) {
      super(props);
      this.state = {
        valeur: null,
        couleur: null
      };
      this.updateItem = this.updateItem.bind(this);
      this.resetPopin = this.resetPopin.bind(this);
      this.changeHandler = this.changeHandler.bind(this);
      this.onKeyboardChange = this.onKeyboardChange.bind(this);
      this.handleChangeCouleur = this.handleChangeCouleur.bind(this);
    }
  
    updateItem() {
      const { id, type, item, updateItem } = this.props;
      const { valeur, couleur } = this.state;
  
      console.log('updateItem('+type+')',valeur, couleur);

      let nvaleur = 0;
      let ncouleur = couleur!==null ? couleur : item.color;
      
      if (type=='ingredient') {
        nvaleur = valeur!==null ? valeur : item.supplement;
        console.log('updateItem ingredient');
        updateItem({ingredient_id:id, update:{supplement:nvaleur, color:ncouleur}})
      }
      else if (type=='produit') {
        nvaleur = valeur!==null ? valeur : item.prix;
        console.log('updateItem produit');
        updateItem({produit_id:id, update:{prix:nvaleur, color:ncouleur}})
      }

      this.resetPopin();
      this.props.closeHandler();
  
    }
    resetPopin() {
      this.setState({valeur:null, couleur:null});
    }
    changeHandler(params) {
     // console.log('CommentModal.changeHandler()', event.target.value);
      this.setState({valeur: params.value});
    }
    onKeyboardChange(input) {
      console.log("Valeur Input changed", input);
      this.setState({ valeur:input });
    };
    handleChangeCouleur(event) {
      this.setState({couleur:event.target.value});
    }
  
    render() {
  
      const { id, item, type, closeHandler, open, clavierOpen } = this.props;
      const { valeur, couleur } = this.state;
  
      let vvaleur = '';
      let vcouleur = '';
      if (item) {
        vvaleur = valeur==null ? (type=='ingredient') ? item.supplement : item.prix : valeur;
        vcouleur = couleur==null ? item.color : couleur;
      }
  
    //  const __mttl = (ingredient) ? 'titre_ing' : (item) ? 'titre_itm' : 'titre_cmd';
  
      if (item==null) return false;

      const readytosave = true;
  
      return (
        <div>
        <Modal
        open={open}
        >
        <div className={ `MenuItemModal`}>
          <div className="Modal-container">
            <div className="header">
              <div className="title">{ strings.modules.menu.edit[type].titre }</div>
            </div>
            <div className="body">
              <div className="item-nom">{ item.nom }</div>
              <div className="form-group">
                  <LabelledField
                      label={ strings.modules.menu.edit[type].valeur}
                      name="valeur"
                      className="valeur-input"
                      value={vvaleur}
                      postvalue="€"
                      onChange={this.changeHandler}
                    />
              </div>
              <div className="form-group color">
                <div className="label color-label">{ strings.modules.menu.edit[type].couleur }</div>
                <FormControl variant="filled" className={"color-selector"}>
                  <Select
                    labelId="demo-simple-select-filled-label"
                    id="demo-simple-select-filled"
                    value={vcouleur}
                    onChange={this.handleChangeCouleur}
                    >{Object.entries(strings.modules.menu.edit.couleurs).map(([cle,val],i) => (
                      <MenuItem key={`coul${i}`} value={cle}>{<LensIcon htmlColor={val} />}</MenuItem>
                      ))}
                  </Select>
                </FormControl> 
              </div>
            </div>
            <div className="footer">
              <StdButton
                identifier="modal-save" 
                elementclass="save" 
                icon={ false } 
                disabled={ !readytosave }
                text={ strings.general.dialog.save } 
                onClick={this.updateItem} 
              />
            </div>
          </div>
          <Fab aria-label="close" size="small" className="close-button" onClick={ ()=>{this.resetPopin(); closeHandler()} }>
            <CloseIcon />
          </Fab>
        </div>
      </Modal>  
      {(clavierOpen && open) && <Clavier onChange={this.onKeyboardChange} className="ClavierMenuItem" defaultLayout="numeric" baseClass="KBComment" inputName="valeur" inputVal={vvaleur} open={open && clavierOpen} />}
      </div>
      );
    }
  
  }
  



class Menu extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      openTab: 0,
      catalogue: null,
      itemId: false,
      editItem: null,
      editOpen: false,
      editType: null
    }
    this.handleChangeTab = this.handleChangeTab.bind(this);
    this.handleChangeCategorie = this.handleChangeCategorie.bind(this);
    this.changeDispoProduit = this.changeDispoProduit.bind(this);
    this.editProduit = this.editProduit.bind(this);
    this.changeDispoIngredient = this.changeDispoIngredient.bind(this);
    this.editIngredient = this.editIngredient.bind(this);
    this.getProduit = this.getProduit.bind(this);
    this.changeNoPrintGroupe = this.changeNoPrintGroupe.bind(this);
    this.changeNoPrintType = this.changeNoPrintType.bind(this);

    this.openEdit = this.openEdit.bind(this);
    this.closeEdit = this.closeEdit.bind(this);
    this.updateMenuItem = this.updateMenuItem.bind(this);

  }
  componentDidMount() {
    this.props.getCatalogue();
    this.props.getAllTickets();
    this.props.getParametres();
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
  changeNoPrintGroupe(groupeId,ticketId) {
    const {catalogue, updateGroupe} = this.props;
    const groupe = catalogue[groupeId];
    const noprint = groupe.noprint;

    if (noprint.indexOf(ticketId)==-1) {
      updateGroupe({groupe_id:groupeId, update:{noprint:[...noprint, ticketId]}});
    } else {
      updateGroupe({groupe_id:groupeId, update:{noprint:noprint.filter(t=>t!=ticketId)}});
    }
  }
  changeNoPrintType(typeId,ticketId) {
    const {ingredientTypes, updateIngredientType} = this.props;
    const type = ingredientTypes[typeId];
    const noprint = type.noprint;

    if (noprint.indexOf(ticketId)==-1) {
      updateIngredientType({type_id:typeId, update:{noprint:[...noprint, ticketId]}});
    } else {
      updateIngredientType({type_id:typeId, update:{noprint:noprint.filter(t=>t!=ticketId)}});
    }
  }

  openEdit(type, itemId) {

    const { ingredients } = this.props;
    let item = {}
    if (type=='ingredient') {
      item = ingredients[itemId];
    }
    else if (type=='produit') {
      item = this.getProduit(itemId);
    }

    this.setState({editType:type, itemId:itemId, editItem:item, editOpen:true});
    
  }

  closeEdit() {
    this.setState({editType:null, itemId:null, editItem:null, editOpen:false});
  }

  updateMenuItem(params) {
    console.log('updateMenuItem()',params)
    const {editType} = this.state;
    if (editType=='ingredient') {
      this.props.updateIngredient(params);
    }
    else if (editType=='produit') {
      this.props.updateProduit(params);
    }
  }

 render() {

  const { catalogue, categories, ingredients, ingredientTypes, tickets, clavier } = this.props;
  const { openTab, categorie, itemId, editItem, editOpen, editType } = this.state;

  const defCat = categorie || categories[0].categorie_id;

  const tickList = Object.values(tickets).filter(tck=> (['partiel','principal']).indexOf(tck.template)!==-1 && tck.imprimantes.length>0);

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
              <MenuListe key="liste-produits" data={prdlist} type="produits" openEdit={this.editProduit} tickets={tickList} changeDispo={this.changeDispoProduit} changeNoPrint={this.changeNoPrintGroupe} editOpen={this.openEdit} />
            </TabPanel>
            <TabPanel key={ `panel-ingredients` } className="panel" value={openTab} index={1}>
              <MenuListe  key="liste-ingredients" data={inglist} type="ingredients" openEdit={this.editIngredient} tickets={tickList} changeDispo={this.changeDispoIngredient} changeNoPrint={this.changeNoPrintType} editOpen={this.openEdit} />
            </TabPanel>
          </div>
      </div>
      <MenuItemModal id={itemId} type={editType} item={editItem} clavierOpen={clavier} open={editOpen} closeHandler={this.closeEdit} updateItem={this.updateMenuItem} />
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

  const {data, type, changeDispo, openEdit, tickets, changeNoPrint, editOpen} = props;

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
                  checked={cont.noprint.indexOf(tck.ticket_id)==-1}
                  onClick={(e)=>{ e.stopPropagation();}}
                  onChange={(e) => { changeNoPrint(type=='produits'?cont.groupe_id:cont.id, tck.ticket_id) }}
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
              <ListItemText id={p.id} onClick={ () => { editOpen('produit', p.id) } } primary={p.nom} secondary={ `${devise(Number(p.prix))} €`} />
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
              <ListItemText id={n.id} onClick={ () => { editOpen('ingredient', n.id) } } primary={n.nom} secondary={`${devise(Number(n.supplement))} €` } />
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