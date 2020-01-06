import React from 'react';
import { SvgIcon } from "@material-ui/core";

export default function PrinterIcon(props) {
  return (
    <SvgIcon {...props} viewBox="0 0 16 17">
        <path fill="#4A4A4A" d="M16,4h-3.5V0h-9v4H0v8h3.5v4.5h9V12H16V4z M4.5,1h7v4.1h-7V1z M11.5,15.5h-7v-7h7V15.5z"/>
        <rect fill="#4A4A4A" x="5.5" y="10" width="5" height="1"/>
        <rect fill="#4A4A4A" x="5.5" y="12" width="5" height="1"/>
    </SvgIcon>
  );
}