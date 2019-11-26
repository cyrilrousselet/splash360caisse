import React from 'react';
import { SvgIcon } from "@material-ui/core";

export default function CrossIcon(props) {
  return (
    <SvgIcon {...props}>
        <polygon fill="#FE485F" points="15.5,12 21.5,6 18,2.5 12,8.5 6,2.5 2.5,6 8.5,12 2.5,18 6,21.5 12,15.5 18,21.5 21.5,18 "/>
    </SvgIcon>
  );
}