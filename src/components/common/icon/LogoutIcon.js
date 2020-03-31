import React from 'react';
import { SvgIcon } from "@material-ui/core";

export default function LogoutIcon(props) {
  return (
    <SvgIcon {...props}>
      <g>
        <path d="M0,2.8l0,18.5c0,1.5,1.2,2.6,2.6,2.6h18.5c1.5,0,2.6-1.2,2.6-2.6V16l-2.6,2.5v2.7H2.6V2.8h18.5v2.8L23.8,8V2.8
          c0-1.5-1.2-2.6-2.6-2.6H2.6C1.2,0.1,0,1.3,0,2.8z"/>
        <polygon points="15.5,16.7 17.4,18.6 24,12 17.4,5.4 15.5,7.3 18.9,10.7 6.2,10.7 6.2,13.3 18.9,13.3 			"/>
      </g>
    </SvgIcon>
  );
}