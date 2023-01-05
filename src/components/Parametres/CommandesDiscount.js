import React from 'react';
import {data} from '../../constants/translations';
import LocalizedStrings from 'react-localization';
import LabelledField from '../common/LabelledField';
import Swal from 'sweetalert2';
import { List, ListItem, ListItemText, ListItemSecondaryAction, ListItemIcon, Modal, Fab } from '@material-ui/core';
import { Container, Draggable } from 'react-smooth-dnd';
import DragHandleIcon from "@material-ui/icons/DragHandle";
import DeleteIcon from "@material-ui/icons/Delete";
import EditIcon from '../common/icon/EditIcon';
import CloseIcon from '../common/icon/CloseIcon';
import StdButton from '../common/StdButton';
import AddIcon from '../common/icon/AddIcon';
import Clavier from '../common/Clavier';
import LodashId from 'lodash-id';
import logger from '../../helpers/Logger';
let strings = new LocalizedStrings(data);



function DiscountEditModal (props) {
  const {id, discount, nom='', editOpen, clavierOpen, closeHandler, updateDiscount, saveDiscount, symbolemonnaie} = props;


  const onChangeHandler = (val) => {
    let opt = symbolemonnaie;
    if ( String(discount).includes('%')) {
      opt = '%';
    }
    updateDiscount({value:val, option:opt, nom:nom});
  }
  const getOption = (str) => {
    return String(str).includes('%') ? '%' : symbolemonnaie;
  }

  return(
    <div>
      <Modal open={ editOpen } >
        <div className="DiscountEditModal">
          <div className="Modal-container">
            <div className="header">
              <div className="title">{id===-1 ? strings.modules.parametres.submodules.commandes.discount.popin.new : strings.modules.parametres.submodules.commandes.discount.popin.edit }</div>
            </div>
            <div className="body">
              <div className="edit-zone">
                {/* <TextField className="edit-input" defaultValue={discount} onChange={updateDiscount} variant="filled" /> */}
                <LabelledField 
                  className="editnom-input"
                  name="editnom-input"
                  type="text"
                  value={nom}
                  onChange={({value}) => {updateDiscount('nom', value)}}
                />
                <LabelledField 
                  className="edit-input"
                  name="edit-input"
                  type="number"
                  value={ String(discount).includes('%') ? Number(String(discount).slice(0,-1)) : Number(String(discount).slice(0,-symbolemonnaie.length))}
                  // option={String(discount).substr(-1,1)}
                  option={getOption(discount)}
                  options={[symbolemonnaie,'%']}
                  onChange={(val) => {updateDiscount('valeur',val)}}
                />
              </div>
            </div>
            <div className="footer">
              <StdButton 
                identifier="modal-save" 
                elementclass="save" 
                icon={ false } 
                text={ strings.general.dialog.save } 
                onClick={() => { saveDiscount(id) }} 
              />
            </div>
            <Fab aria-label="close" size="small" className="close-button" onClick={ closeHandler }>
              <CloseIcon />
            </Fab>
          </div>
        </div>
      </Modal>
      {(clavierOpen && editOpen) && <Clavier defaultLayout="numeric" onChange={onChangeHandler} className="ClavierParamCmdDiscount" baseClass="KBParamCmdDiscount" inputName="edit-input" inputVal={Number(String(discount).slice(0,-1))} open={editOpen && clavierOpen} />}
    </div>
  )
}


class CommandesDiscount extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      editing: null,
      editdiscount: '',
      editnom: ''
    };
    this.onDrop = this.onDrop.bind(this);
    this.closeEdit = this.closeEdit.bind(this);
    this.updateDiscount = this.updateDiscount.bind(this);
    this.saveDiscount = this.saveDiscount.bind(this);
    this.editDiscount = this.editDiscount.bind(this);
    this.deleteDiscount = this.deleteDiscount.bind(this);
  }

  onDrop(params) {
    const { removedIndex, addedIndex } = params;
    const { data, updateValeur } = this.props;

    const {discount_predefini} = data;
  //  const listtosort = this.array_move(comment_predefini, removedIndex, addedIndex);
    
    updateValeur({
      domaine: 'commandes',
      cle: 'discount_predefini',
      valeur: this.array_move(discount_predefini, removedIndex, addedIndex)
    });

  }

  array_move(arr, old_index, new_index) {
    if (new_index >= arr.length) {
        var k = new_index - arr.length + 1;
        while (k--) {
            arr.push(undefined);
        }
    }
    arr.splice(new_index, 0, arr.splice(old_index, 1)[0]);
    return arr; // for testing
  }

  editDiscount(id, val, nom) {
    logger.info('editDiscount', id, val, nom);
    this.setState({
      editing: id,
      editdiscount: val,
      editnom: nom
    })
  };

  closeEdit() {
    this.setState({
      editing: null,
      editdiscount: ''
    });
  }



  updateDiscount(field, val) {
    if (field==='valeur') {
      const {value, option} = val;
      if (!isNaN(parseInt(value))) {
        this.setState({
          editdiscount: Math.abs(value)+option
        });
      }
    }
    else {
      this.setState({
        editnom: val
      });
    }  
  }



  saveDiscount(id) {

    const { data, updateValeur } = this.props;
    const {discount_predefini} = data;
    const {editdiscount, editnom} = this.state;
    logger.info("saveDiscount",'editnom', editnom);
    if (editdiscount!=='') {

      let dsc = {
        id: LodashId.createId(), 
        valeur: editdiscount, 
        nom: editnom,
        operation: -1,
        type: "discount"
      };
      let nvdiscount_predefini = discount_predefini || [];

      // nouveau commentaire
      if (id===-1) {
        nvdiscount_predefini = [...nvdiscount_predefini, dsc];
      } else {
        const dscIndex = nvdiscount_predefini.findIndex(d=>d.id===id);
        dsc = nvdiscount_predefini[dscIndex];
        nvdiscount_predefini[dscIndex] = {
          ...dsc, 
          valeur: editdiscount, 
          nom: editnom,
          operation: -1,
          type: "discount"
        };
      }

      updateValeur({
        domaine: 'commandes',
        cle:'discount_predefini',
        valeur: nvdiscount_predefini
      });
    }
    this.setState({
      editing:null,
      editdiscount: ''
    });

  }

  deleteDiscount(id) {
    const { data, updateValeur } = this.props;
    const {discount_predefini} = data;

    Swal.fire({
      title: strings.modules.parametres.submodules.commandes.discount.suppression.titre,
      text: strings.modules.parametres.submodules.commandes.discount.suppression.texte,
      showCancelButton: true,
      focusCancel: true,
      focusConfirm: false
    }).then((result)=> {
      if (result.value) {
        updateValeur({
          domaine: 'commandes',
          cle:'discount_predefini',
          valeur: discount_predefini.filter(d=>d.id!==id)
        });
      }
    });
  }

  render() {
    const { data, entreprise, monnaie } = this.props;
    const { discount_predefini } = data;
    const { editing, editdiscount, editnom } = this.state;
    const { clavier } = entreprise;

    return (
    <div className="CommandesDiscount sectioncontent">
      <div className="wrapper">
        <div className="providerGroup">
          <div className="subttl">{ strings.modules.parametres.submodules.commandes.discount.titre }</div>
          <Fab aria-label="adddsc" size="small" className="adddsc-button" onClick={ ()=>{ this.editDiscount(-1, '') } }>
            <AddIcon htmlColor="#ffffff" />
          </Fab>
          <List>
            <Container dragHandleSelector=".drag-handle" lockAxis="y" onDrop={ this.onDrop }>
              { discount_predefini && discount_predefini.map(({id, nom, valeur}) => (
                <Draggable key={`dsc${id}`}>
                  <ListItem>
                    <ListItemText primary={`${nom} (${valeur})`} />
                    <ListItemSecondaryAction>
                      <ListItemIcon className="edit">
                        <EditIcon onClick={() => { this.editDiscount(id, valeur, nom) }} />
                      </ListItemIcon>
                      <ListItemIcon className="delete">
                        <DeleteIcon onClick={() => { this.deleteDiscount(id) }} />
                      </ListItemIcon>
                      <ListItemIcon className="drag-handle">
                        <DragHandleIcon />
                      </ListItemIcon>
                    </ListItemSecondaryAction>
                  </ListItem>
                </Draggable>
              ))}
            </Container>
          </List>
        </div>
      </div>
      <DiscountEditModal
        className="editModal"
        id={editing} 
        nom={editnom}
        discount={editdiscount}
        editOpen={editing!==null}
        closeHandler={this.closeEdit}
        updateDiscount={this.updateDiscount}
        saveDiscount={this.saveDiscount}
        clavierOpen={clavier}
        symbolemonnaie={monnaie.symbole}
      />
    </div>
    );
  }
};

export default CommandesDiscount;