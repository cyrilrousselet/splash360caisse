import { Button, Snackbar } from '@material-ui/core';
import { Alert, AlertTitle } from '@material-ui/lab';
import React from 'react';

import LocalizedStrings from 'react-localization';
import {data} from '../constants/translations';
import Logger from '../helpers/Logger';
import { format } from 'date-fns';
import frLocale from "date-fns/locale/fr";

const strings = new LocalizedStrings(data);
const logger = new Logger();



class Notifier extends React.Component {




  render() {
    const { stack, denyOrder, acceptOrder } = this.props;

    // const stack = [
    //   {
    //     id: 0,
    //     display_id: 'e5d',
    //     estimated_ready_for_pickup_at: 1614005616778
    //   },
    //   {
    //     id: 1,
    //     display_id: 'e9a',
    //     estimated_ready_for_pickup_at: 1614005720233
    //   }
    // ];

    logger.log('notifier L', stack.length);

    return (
      <>
      {stack && stack.map((order,i) => (
        <Snackbar
          key={ `order-${order.display_id}` }
          anchorOrigin={{
            vertical:'top', 
            horizontal:'right',
          }}
          open={true}
        >
          <Alert 
            severity="warning"
            variant="filled"
            action= {
              <>
                <Button onClick={() => { denyOrder(order) }}>{ strings.general.dialog.deny }</Button>
                <Button onClick={() => { acceptOrder(order) }}>{ strings.general.dialog.accept }</Button>
              </>
            }
          >
            <AlertTitle>{ strings.notification.accept.uber.titre}</AlertTitle>
            { strings.notification.accept.uber.detail.replace('%NUMERO%',order.display_id).replace('%DATEHEURE%', format(new Date(order.estimated_ready_for_pickup_at), "d MMM yyyy à HH:mm", { locale: frLocale })) }
          </Alert>
        </Snackbar>
      ))}
      </>
    );
  }

}

export default Notifier;


//title: strings.notification.accept.uber.titre,
            //   html: strings.notification.accept.uber.texte+'<br />'+strings.notification.accept.uber.detail.replace('%NUMERO%',reponse.order.display_id).replace('%DATEHEURE%', format(new Date(reponse.order.estimated_ready_for_pickup_at), "d MMM yyyy à HH:mm", { locale: frLocale })),
            //   focusConfirm: true,
            //   showCancelButton: true,
            //   customClass: 'ubernotification',
            //   allowOutsideClick: false,
            //   allowEscapeKey: false,
            //   confirmButtonText: strings.general.dialog.accept,
            //   cancelButtonText: strings.general.dialog.deny,
            //   buttonsStyling: false 