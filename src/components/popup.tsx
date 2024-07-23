import { useState } from "react";

import { Unstable_Popup as BasePopup } from '@mui/base/Unstable_Popup';

function Popup({panel, trigger}: any) {
  const [open, setOpen] = useState<boolean>(false);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setOpen(!open)
  };

  return <>
    {trigger(handleClick)}
    <BasePopup id="simple-popper" open={open}>
      {panel(() => {setOpen(false)})}
    </BasePopup>
  </>
}

export default Popup