"use client"

import { ReactNode, useEffect, useState } from "react";
import CloseIcon from '@mui/icons-material/Close';
import { Modal as BaseModal } from '@mui/base';
import {styled, css} from "@mui/system";


function Popup({Panel, Trigger}: {Panel: React.FC<any>, Trigger: React.FC<any>}) {
  const [open, setOpen] = useState<boolean>(false);
  const [anchor, setAnchor] = useState<null | HTMLElement>(null);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setOpen(true)
    setAnchor(anchor ? null : event.currentTarget);
  };

  useEffect(() => {
    // Disable scroll when the popup is open
    document.body.style.overflow = open ? 'hidden' : 'auto';

    // Clean up scroll behavior on component unmount or when popup closes
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [open]);

  return <>
      {<Trigger onClick={handleClick}/>}
      <Modal
        open={open}
        onClose={() => {setOpen(false)}}
      >
        <div className="bg-[var(--background)] border border-[var(--accent)] rounded">
          <div className="flex justify-end px-1">
            <button
                onClick={() => {setOpen(false)}}
            >
                <CloseIcon/>
            </button>
          </div>
          <div className="px-8 py-4">
            <Panel onClose={() => {setOpen(false)}}/>
          </div>
          </div>
      </Modal>
  </>
}

export default Popup


const Modal = styled(BaseModal)`
  position: fixed;
  z-index: 1300;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
`;