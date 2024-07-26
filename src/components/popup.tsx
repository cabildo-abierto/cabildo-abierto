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
        aria-labelledby="unstyled-modal-title"
        aria-describedby="unstyled-modal-description"
        open={open}
        onClose={() => {setOpen(false)}}
      >
        <ModalContent>
          <div className="flex justify-end px-1">
            <button
                onClick={() => {setOpen(false)}}
            >
                <CloseIcon/>
            </button>
          </div>
          <div className="px-8 mb-4">
            <Panel onClose={() => {setOpen(false)}}/>
          </div>
        </ModalContent>
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


const blue = {
  200: '#99CCFF',
  300: '#66B2FF',
  400: '#3399FF',
  500: '#007FFF',
  600: '#0072E5',
  700: '#0066CC',
};

const grey = {
  50: '#F3F6F9',
  100: '#E5EAF2',
  200: '#DAE2ED',
  300: '#C7D0DD',
  400: '#B0B8C4',
  500: '#9DA8B7',
  600: '#6B7A90',
  700: '#434D5B',
  800: '#303740',
  900: '#1C2025',
};



const ModalContent = styled('div')(
  ({ theme }) => css`
    font-family: 'IBM Plex Sans', sans-serif;
    font-weight: 500;
    text-align: start;
    position: relative;
    display: flex;
    flex-direction: column;
    gap: 8px;
    overflow: hidden;
    background-color: ${theme.palette.mode === 'dark' ? grey[900] : '#fff'};
    border-radius: 8px;
    border: 1px solid ${theme.palette.mode === 'dark' ? grey[700] : grey[200]};
    box-shadow: 0 4px 12px
      ${theme.palette.mode === 'dark' ? 'rgb(0 0 0 / 0.5)' : 'rgb(0 0 0 / 0.2)'};
    padding: 24px;
    color: ${theme.palette.mode === 'dark' ? grey[50] : grey[900]};
  `,
);
