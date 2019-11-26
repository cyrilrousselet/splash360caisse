import React from 'react';
import { SvgIcon } from "@material-ui/core";

export default function ChequeIcon(props) {
  return (
    <SvgIcon {...props}>
        <path fill="#ffffff" d="M24,17.3H0V6.7h24V17.3z M1.3,16h21.3V8H1.3V16z"/>
        <rect x="3" y="9.3" fill="#ffffff" width="11.3" height="0.7"/>
        <rect x="3" y="11.3" fill="#ffffff" width="11.3" height="0.7"/>
        <rect x="3" y="13.3" fill="#ffffff" width="8.7" height="0.7"/>
        <path fill="#ffffff" d="M21,13.7h-4.7v-3.3H21V13.7z M17,13h3.3v-2H17V13z"/>
    </SvgIcon>
  );
}