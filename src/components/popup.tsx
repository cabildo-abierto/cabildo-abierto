import { useState } from "react";

import { Unstable_Popup as BasePopup } from '@mui/base';

function Popup({panel, trigger}: {panel: any, trigger: (handleClick: any) => any}) {
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