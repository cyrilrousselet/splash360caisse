import React from 'react';
import {data} from '../../constants/translations';
import LocalizedStrings from 'react-localization';
import LabelledField from '../common/LabelledField';
import SwitchCheckbox from '../common/SwitchCheckbox';
import Swal from 'sweetalert2';
import { List, ListItem, ListItemText, ListItemSecondaryAction, ListItemIcon, Input, Modal, Fab, TextField } from '@material-ui/core';
import { Container, Draggable } from 'react-smooth-dnd';
import DragHandleIcon from "@material-ui/icons/DragHandle";
import DeleteIcon from "@material-ui/icons/Delete";
import { move } from 'lodash-move';
import EditIcon from '../common/icon/EditIcon';
import CloseIcon from '../common/icon/CloseIcon';
import StdButton from '../common/StdButton';
import AddIcon from '../common/icon/AddIcon';
let strings = new LocalizedStrings(data);



function DiscountEditModal (props) {
  const {id, discount, editOpen, closeHandler, updateDiscount, saveDiscount} = props;

  return(
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
                  className="edit-input"
                  value={Number(String(discount).slice(0,-1))}
                  option={String(discount).substr(-1,1)}
                  options={['€','%']}
                  onChange={updateDiscount}
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
  )
}


class CommandesDiscount extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      editing: null,
      editdiscount: ''
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

  editDiscount(id, msg) {
    this.setState({
      editing: id,
      editdiscount: msg
    })
  };

  closeEdit() {
    this.setState({
      editing: null,
      editdiscount: ''
    });
  }

  updateDiscount(val) {
    const {value, option} = val;

    if (!isNaN(parseInt(value)) || option==undefined) {
      this.setState({
        editdiscount: Math.abs(value)+option
      });
    }
  }



  saveDiscount(id) {

    const { data, updateValeur } = this.props;
    const {discount_predefini} = data;
    const {editdiscount} = this.state;

    if (editdiscount!=='') {

      let dsc = {id: new Date().getTime(), valeur: editdiscount};
      let nvdiscount_predefini = discount_predefini || [];

      // nouveau commentaire
      if (id===-1) {
        nvdiscount_predefini = [...nvdiscount_predefini, dsc];
      } else {
        const dscIndex = nvdiscount_predefini.findIndex(d=>d.id==id);
        dsc = nvdiscount_predefini[dscIndex];
        nvdiscount_predefini[dscIndex] = {...dsc, valeur: editdiscount};
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
    const { data, updateValeur, getAll } = this.props;
    const { discount_predefini } = data;
    const { editing, editdiscount } = this.state;

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
              { discount_predefini && discount_predefini.map(({id, valeur}) => (
                <Draggable key={`dsc${id}`}>
                  <ListItem>
                    <ListItemText primary={valeur} />
                    <ListItemSecondaryAction>
                      <ListItemIcon className="edit">
                        <EditIcon onClick={() => { this.editDiscount(id, valeur) }} />
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
        discount={editdiscount}
        editOpen={editing!==null}
        closeHandler={this.closeEdit}
        updateDiscount={this.updateDiscount}
        saveDiscount={this.saveDiscount}
      />
    </div>
    );
  }
};

export default CommandesDiscount;