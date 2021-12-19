import React from 'react';
import {data} from '../../constants/translations';
import LocalizedStrings from 'react-localization';
// import SwitchCheckbox from '../common/SwitchCheckbox';
import LoadingSpinner from '../common/LoadingSpinner';
import StdButton from '../common/StdButton';
import { endOfYear, startOfYear } from 'date-fns';
import { Table, TableCell, TableRow, TableHead, TableBody } from '@material-ui/core';
import CheckCircleIcon from '@material-ui/icons/CheckCircle';
// import format from 'date-fns/format';
import { remote } from 'electron';

const { app, dialog } = remote;
const win = remote.getCurrentWindow();

let strings = new LocalizedStrings(data);

const dialogOptions = {
  title: strings.modules.parametres.submodules.fiscal.archive.destination,
  defaultPath: `${ app.getPath('desktop') }/`,
  buttonLabel: strings.modules.parametres.submodules.fiscal.archive.exporter
}

class Fiscal extends React.Component {

  constructor(props) {
    super(props);
    this.generateArchive = this.generateArchive.bind(this);
    this.exportArchive = this.exportArchive.bind(this);
  }
  componentDidMount() {
    this.props.getArchivesFiscales();
  }

  generateArchive(intervalle) {
    this.props.archiveFiscale(intervalle, startOfYear(new Date()), endOfYear(new Date()));
  }

  async exportArchive(filename) {
    const __opt = {
      ...dialogOptions,
      defaultPath: dialogOptions.defaultPath + filename
    };
    
    const __target = await dialog.showSaveDialog(win, __opt);
    console.log('⬇️ Export Archive Fiscale : ',__target.filePath);
    
    this.props.exportArchive(__target.filePath, filename);
  }

 

  render() {
  
    const { data, archives_fiscales, checkArchive } = this.props;

    if (data===null || data===undefined) return <LoadingSpinner />

    return (
      <div className="Fiscal subcontent"> 
        <div className="wrapper">
          <div className="subttl">{ strings.modules.parametres.submodules.fiscal.archive.titre }</div>
          <div className="col">
            <StdButton 
              identifier={`archive-annuelle`} 
              elementclass={`archive-annuelle`} 
              icon={false} noStroke={true} 
              text={`${strings.modules.parametres.submodules.fiscal.archive.bouton }`} 
              disabled={false} 
              onClick={() => { this.generateArchive('annee'); }} 
            />
          </div>
        </div>
        <Table stickyHeader size="small" key="paramfiscalarchives" aria-label="a dense table">
          <TableHead>
            <TableRow>
              <TableCell key={`archives-hd-annee`} className="liste-annee">{ strings.modules.parametres.submodules.fiscal.archive.entetes.annee }</TableCell>
              <TableCell key={`archives-hd-fichier`} className="liste-fichier">{ strings.modules.parametres.submodules.fiscal.archive.entetes.fichier }</TableCell>
              <TableCell key={`archives-hd-caisse`} className="liste-caisse">{ strings.modules.parametres.submodules.fiscal.archive.entetes.caisse }</TableCell>
              <TableCell key={`archives-hd-ouverture`} className="liste-ouverture">{ strings.modules.parametres.submodules.fiscal.archive.entetes.ouverture }</TableCell>
              <TableCell key={`archives-hd-cloture`} className="liste-cloture">{ strings.modules.parametres.submodules.fiscal.archive.entetes.cloture }</TableCell>
              <TableCell key={`archives-hd-actions`} className="liste-actions"></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {archives_fiscales && archives_fiscales.map((row, i) => {

              const p = row.periode.split('|');
              const debut = p[0].substring(0,4)+"-"+p[0].substring(4,6)+"-"+p[0].substring(6,8)+' '+p[0].substring(8,10)+':'+p[0].substring(10,12)+':'+p[0].substring(12,14);      
              const fin = p[1].substring(0,4)+"-"+p[1].substring(4,6)+"-"+p[1].substring(6,8)+' '+p[1].substring(8,10)+':'+p[1].substring(10,12)+':'+p[1].substring(12,14);      

              return (row.status!=='deleted' && row.status!=='superuser') && (<TableRow key={row.id} className={(i%2)?'odd':'even'}>
                <TableCell key={`${i}-annee`} className={ `liste-annee` }>{ p[0].substring(0,4) }</TableCell>
                <TableCell key={`${i}-fichier`} className={ `liste-fichier` }><div onClick={()=>{this.exportArchive(row['TAG-ARC-DOC']) }}>{ row['TAG-ARC-DOC'] }</div></TableCell>
                <TableCell key={`${i}-caisse`} className="liste-caisse">{ row['TAG-ARC-CAI-NID'] }</TableCell>
                <TableCell key={`${i}-ouverture`} className="liste-ouverture">{ debut }</TableCell>
                <TableCell key={`${i}-cloture`} className="liste-cloture">{ fin }</TableCell>
                <TableCell key={`${i}-actions`} className="liste-actions">
                  <StdButton key={`${i}-check`} identifier='btncheck' elementclass={ `action action-check${(row.verif===undefined ? '' : (row.verif===true ? ' valid' : ' nonvalid') ) }` } icon={ <CheckCircleIcon htmlColor="#ffffff" /> } disabled={row.unavailable} noStroke={true} text={ '' } onClick={ () => { checkArchive(row['TAG-ARC-DOC']) } } />
                </TableCell>
              </TableRow>);
            })}
          </TableBody>
        </Table>
      </div>
    );
  }
};

export default Fiscal;