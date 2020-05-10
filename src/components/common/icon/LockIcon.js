import React from 'react';
import { SvgIcon } from "@material-ui/core";

export default function LockIcon(props) {
  return (
    <SvgIcon {...props}>
      <path d="M18.9,10.8h-0.9V7.9C17.9,4.7,15.3,2,12,2S6.1,4.7,6.1,7.9v2.8H5.1c-1,0-1.9,0.8-1.9,1.9v7.5c0,1,0.8,1.9,1.9,1.9h13.8c1,0,1.9-0.8,1.9-1.9v-7.5C20.8,11.6,19.9,10.8,18.9,10.8z M14.8,10.8H9.2V7.9c0-1.6,1.3-2.8,2.8-2.8s2.8,1.3,2.8,2.8V10.8z"/>
    </SvgIcon>
  );
}