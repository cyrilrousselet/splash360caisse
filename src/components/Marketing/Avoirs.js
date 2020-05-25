import React from 'react';
import { format, isBefore, endOfDay, endOfToday, compareDesc } from 'date-fns';
import frLocale from "date-fns/locale/fr";
import { devise } from "../../helpers/toolbox";
import { Table, TableRow, TableCell, TableHead, TableBody } from '@material-ui/core';
import LocalizedStrings from 'react-localization';
import {data} from '../../constants/translations';
let strings = new LocalizedStrings(data);


class Avoirs extends React.Component {

  componentDidMount() {
    this.props.getAvoirsList();
  }


 render() {

  const { avoirs } = this.props;

  avoirs.sort((a,b) => {
    let da = new Date(a.limite), db = new Date(b.limite);
    return compareDesc(da, db);
  });

  return (
   <div className="Avoirs subcontent">
     <div className="wrapper">
      <Table stickyHeader size="small" aria-label="a dense table">
        <TableHead>
          <TableRow>
            <TableCell key={`hd-code`} className="liste-code">{ strings.modules.marketing.submodules.avoirs.liste.code }</TableCell>
            <TableCell key={`hd-valeur`} className="liste-valeur">{ strings.modules.marketing.submodules.avoirs.liste.valeur }</TableCell>
            <TableCell key={`hd-limite`} className="liste-limite">{ strings.modules.marketing.submodules.avoirs.liste.limite }</TableCell>
            <TableCell key={`hd-status`} className="liste-status">{ strings.modules.marketing.submodules.avoirs.liste.status.nom }</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {avoirs.map((row, i) => (
            <TableRow key={row.id} className={` ${((i%2)?'odd':'even')}${ (row.burnt?' burnt':'')}${ (isBefore(endOfDay(new Date(row.limite)), endOfToday()) ? ' perime' : '' ) }` }>
              <TableCell key={`avr-code`} className={ `liste-code` }>{ row.code }</TableCell>
              <TableCell key={`avr-valeur`} className="liste-valeur">{ `${devise(row.valeur)} €` }</TableCell>
              <TableCell key={`avr-limite`} className="liste-limite">{ format(new Date(row.limite), "d MMM yyyy", { locale: frLocale }) }</TableCell>
              <TableCell key={`avr-status`} className="liste-status">{ (row.burnt ? strings.modules.marketing.submodules.avoirs.liste.status.burnt : (isBefore(endOfDay(new Date(row.limite)), endOfToday()) ? strings.modules.marketing.submodules.avoirs.liste.status.perime : strings.modules.marketing.submodules.avoirs.liste.status.valide )) }</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
   </div>
  );
 }
};

export default Avoirs;