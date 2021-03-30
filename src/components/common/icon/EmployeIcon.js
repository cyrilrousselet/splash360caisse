import React from 'react';
import { SvgIcon } from "@material-ui/core";

export default function EmployeIcon(props) {
  return (
    <SvgIcon {...props} viewBox="0 0 24 24">
    <path d="M12,12c3.3,0,6-2.7,6-6s-2.7-6-6-6S6,2.7,6,6S8.7,12,12,12z M16.5,13.5l-2.2,9l-1.5-6.4l1.5-2.6H9.8l1.5,2.6l-1.5,6.4
	l-2.2-9c-3.3,0.2-6,2.9-6,6.3v2c0,1.2,1,2.2,2.2,2.2h16.5c1.2,0,2.2-1,2.2-2.2v-2C22.5,16.4,19.8,13.7,16.5,13.5L16.5,13.5z"/>
    </SvgIcon>
  );
}