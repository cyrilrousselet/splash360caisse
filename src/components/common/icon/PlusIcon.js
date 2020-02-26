import React from 'react';
import { SvgIcon } from "@material-ui/core";

export default function PlusIcon(props) {
    return (
      <SvgIcon {...props}>
          <polygon points="14.5,9.5 14.5,1 9.5,1 9.5,9.5 1,9.5 1,14.5 9.5,14.5 9.5,23 14.5,23 14.5,14.5 23,14.5 23,9.5 "/>
      </SvgIcon>
    );
  }