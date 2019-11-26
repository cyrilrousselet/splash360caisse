import React from 'react';
import { SvgIcon } from "@material-ui/core";

export default function TicketIcon(props) {
  return (
    <SvgIcon {...props}>
        <path fill="#ffffff" d="M17.1,15h3.2c0.9,0,1.6-0.7,1.6-1.6v-0.6c0-0.9-0.7-1.6-1.6-1.6h-3.2c-0.9,0-1.6,0.7-1.6,1.6v0.6C15.5,14.3,16.2,15,17.1,15z M16.1,12.8c0-0.5,0.4-0.9,0.9-0.9h3.2c0.5,0,0.9,0.4,0.9,0.9v0.6c0,0.5-0.4,0.9-0.9,0.9h-3.2c-0.5,0-0.9-0.4-0.9-0.9V12.8z"/>
        <path fill="#ffffff" d="M0,7.1v9.8h24V7.1H0z M1.3,8.4h3.2v7.3H1.3V8.4z M22.7,15.6H5.1V8.4h17.7V15.6z"/>
    </SvgIcon>
  );
}