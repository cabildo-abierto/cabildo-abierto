import { ReactNode, useState } from "react";
import CloseIcon from '@mui/icons-material/Close';
import { Unstable_Popup as BasePopup } from '@mui/base';

function Popup({Panel, Trigger}: {Panel: React.FC<any>, Trigger: React.FC<any>}) {
  const [open, setOpen] = useState<boolean>(false);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setOpen(!open)
  };

  return <>
    {<Trigger onClick={handleClick}/>}
    <BasePopup id="simple-popper" open={open}>
        <div className="h-screen w-screen bg-gray-800 bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white rounded-lg max-w-md">
              <div className="flex justify-end">
                <button
                    onClick={() => {setOpen(false)}}
                >
                    <CloseIcon/>
                </button>
              </div>
              <div className="px-8 mb-4">
                <Panel onClose={() => {setOpen(false)}}/>
              </div>
            </div>
        </div>
    </BasePopup>
  </>
}

export default Popup