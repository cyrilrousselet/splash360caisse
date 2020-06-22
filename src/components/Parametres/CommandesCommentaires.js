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
import Clavier from '../common/Clavier';
let strings = new LocalizedStrings(data);



function CommentaireEditModal (props) {
  const {id, message, editOpen, closeHandler, clavierOpen, updateMessage, saveCommentaire} = props;

  const onKeyboardChange = (input) => {
    console.log('change',input);
  }

  return(
    <div>
      <Modal open={ editOpen } >
        <div className="CommentaireEditModal">
          <div className="Modal-container">
            <div className="header">
              <div className="title">{id===-1 ? strings.modules.parametres.submodules.commandes.commentaires.popin.new : strings.modules.parametres.submodules.commandes.commentaires.popin.edit }</div>
            </div>
            <div className="body">
              <div className="edit-zone">
                <TextField className="edit-input" value={message} onChange={updateMessage} variant="filled" />
              </div>
            </div>
            <div className="footer">
              <StdButton 
                identifier="modal-save" 
                elementclass="save" 
                icon={ false } 
                disabled={ message==='' }
                text={ strings.general.dialog.save } 
                onClick={() => { saveCommentaire(id) }} 
              />
            </div>
            <Fab aria-label="close" size="small" className="close-button" onClick={ closeHandler }>
              <CloseIcon />
            </Fab>
          </div>
        </div>
      </Modal>
      {(clavierOpen && editOpen) && <Clavier onChange={ (input) => { updateMessage({target:{value:input}}) } } className="ClavierParamCmdComment" baseClass="KBParamCmdComment" inputName="edit-input" inputVal={message} open={editOpen && clavierOpen} />}
      </div>
  )
}


class CommandesCommentaires extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      editing: null,
      editmessage: ''
    };
    this.onDrop = this.onDrop.bind(this);
    this.closeEdit = this.closeEdit.bind(this);
    this.updateMessage = this.updateMessage.bind(this);
    this.saveCommentaire = this.saveCommentaire.bind(this);
    this.editCommentaire = this.editCommentaire.bind(this);
    this.deleteCommentaire = this.deleteCommentaire.bind(this);
  }

  onDrop(params) {
    const { removedIndex, addedIndex } = params;
    const { data, updateValeur } = this.props;

    const {comment_predefini} = data;
  //  const listtosort = this.array_move(comment_predefini, removedIndex, addedIndex);
    
    updateValeur({
      domaine: 'commandes',
      cle: 'comment_predefini',
      valeur: this.array_move(comment_predefini, removedIndex, addedIndex)
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

  editCommentaire(id, msg) {
    this.setState({
      editing: id,
      editmessage: msg
    })
  };

  closeEdit() {
    this.setState({
      editing: null,
      editmessage: ''
    });
  }

  updateMessage(event) {
    const {value} = event.target;
    console.log('updateMessage',value);
   // if (value!=='') {
      this.setState({
        editmessage: String(value).toUpperCase()
      });
   // }
  }
  saveCommentaire(id) {

    const { data, updateValeur } = this.props;
    const {comment_predefini} = data;
    const {editmessage} = this.state;

    if (editmessage!=='') {

      let cmt = {id: new Date().getTime(), message: editmessage};
      let nvcomment_predefini = comment_predefini;

      // nouveau commentaire
      if (id===-1) {
        nvcomment_predefini = [...comment_predefini, cmt];
      } else {
        const cmtIndex = nvcomment_predefini.findIndex(c=>c.id==id);
        cmt = nvcomment_predefini[cmtIndex];
        nvcomment_predefini[cmtIndex] = {...cmt, message: editmessage};
      }


      updateValeur({
        domaine: 'commandes',
        cle:'comment_predefini',
        valeur: nvcomment_predefini
      });
    }
    this.setState({
      editing:null,
      editmessage: ''
    });

  }

  deleteCommentaire(id) {
    const { data, updateValeur } = this.props;
    const {comment_predefini} = data;

    Swal.fire({
      title: strings.modules.parametres.submodules.commandes.commentaires.suppression.titre,
      text: strings.modules.parametres.submodules.commandes.commentaires.suppression.texte,
      showCancelButton: true,
      focusCancel: true,
      focusConfirm: false
    }).then((result)=> {
      if (result.value) {
        updateValeur({
          domaine: 'commandes',
          cle:'comment_predefini',
          valeur: comment_predefini.filter(c=>c.id!==id)
        });
      }
    });
  }

  render() {
    const { data, updateValeur, getAll, entreprise } = this.props;
    const { comment_predefini } = data;
    const { editing, editmessage } = this.state;
    const { clavier } = entreprise;

    return (
    <div className="CommandesCommentaires sectioncontent">
      <div className="wrapper">
        <div className="providerGroup">
          <div className="subttl">{ strings.modules.parametres.submodules.commandes.commentaires.titre }</div>
          <Fab aria-label="addcmt" size="small" className="addcmt-button" onClick={ ()=>{ this.editCommentaire(-1, '') } }>
            <AddIcon htmlColor="#ffffff" />
          </Fab>
          <List>
            <Container dragHandleSelector=".drag-handle" lockAxis="y" onDrop={ this.onDrop }>
              { comment_predefini.map(({id, message}) => (
                <Draggable key={`cmt${id}`}>
                  <ListItem>
                    <ListItemText primary={message} />
                    <ListItemSecondaryAction>
                      <ListItemIcon className="edit">
                        <EditIcon onClick={() => { this.editCommentaire(id, message) }} />
                      </ListItemIcon>
                      <ListItemIcon className="delete">
                        <DeleteIcon onClick={() => { this.deleteCommentaire(id) }} />
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
      <CommentaireEditModal
        className="editModal"
        id={editing} 
        message={editmessage}
        editOpen={editing!==null}
        closeHandler={this.closeEdit}
        updateMessage={this.updateMessage}
        saveCommentaire={this.saveCommentaire}
        clavierOpen={clavier}
      />
    </div>
    );
  }
};

export default CommandesCommentaires;