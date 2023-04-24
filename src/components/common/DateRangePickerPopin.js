import { Fab, Modal } from "@material-ui/core";
import { DateRangePicker } from "materialui-daterange-picker";
import React from "react";
import CloseIcon from "./icon/CloseIcon";
import StdButton from "./StdButton";
import LocalizedStrings from 'react-localization';
import {data} from '../../constants/translations';

let strings = new LocalizedStrings(data);

const DateRangePickerPopin = (props) => {
  const { startDate, endDate, open, validate, closeHandler } = props;
  const [dateRange, setDateRange] = React.useState({startDate: new Date(startDate), endDate: new Date(endDate)});
  const [dataNotChanged, setDataNotChanged] = React.useState(true);


  return (
    <Modal open={open}>
      <div className="DateRangePickerPopin">
        <div className="Modal-container">
          <div className="body">
            <DateRangePicker
            open={true}
            definedRanges={[]}
            initialDateRange={{startDate, endDate}}
            onChange={(range) => {
              setDataNotChanged(false);
              console.log(dataNotChanged);
              console.log('DateRangePickerPopin', range);
              setDateRange(range)
            }}
            />
          </div>
          <div className="footer">
            <StdButton identifier="none" elementclass="DateRangePickerPopin-select" icon={ false } noStroke={true} text={ strings.general.dialog.select } onClick={() => { validate(dateRange) }} />
          </div>
        </div>
        <Fab aria-label="close" size="small" className="close-button" onClick={ closeHandler }>
          <CloseIcon />
        </Fab>
      </div>
    </Modal>
  );
}

export default DateRangePickerPopin;