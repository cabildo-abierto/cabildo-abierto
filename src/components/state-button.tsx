"use client";

import LoadingButton from '@mui/lab/LoadingButton';
import { ReactNode, useEffect, useState } from 'react';
import { AcceptButtonPanel } from './accept-button-panel';

type StateButtonProps = {
  handleClick: StateButtonClickHandler;
  variant?: "text" | "contained" | "outlined";
  className?: string
  color?: "primary" | "secondary" | "error"
  size?: "small" | "medium" | "large",
  text1: ReactNode;
  text2?: ReactNode;
  startIcon?: ReactNode;
  textClassName?: string;
  disabled?: boolean;
  disableElevation?: boolean
};

export type StateButtonClickHandler = () => Promise<{ error?: string; stopResubmit?: boolean }>;

const StateButton: React.FC<StateButtonProps> = ({
  handleClick,
  variant = "contained",
  color = "primary",
  textClassName = "",
  startIcon,
  text1,
  text2,
  size,
  disabled = false,
  disableElevation = false,
}) => {
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(undefined)

    async function onClick(e) {
        e.stopPropagation()
        e.preventDefault()
        setLoading(true)
    }

    useEffect(() => {
        async function submit(){
            const result = await handleClick()
            if(result.error){
                setError(result.error)
            }
            if(!result.stopResubmit){
              setLoading(false)
            }
        }

        if(loading){
            submit()
        }
    }, [loading])

    return <><LoadingButton
      loading={loading}
      startIcon={startIcon}
      loadingIndicator={text2}
      variant={variant}
      color={color}
      size={size}
      onClick={onClick}
      disabled={disabled}
      disableElevation={disableElevation}
      sx={{
          textTransform: 'none'
      }}
    >
      <div className={textClassName}>
        {text1}
      </div>
    </LoadingButton>
      {error && <AcceptButtonPanel
        onClose={() => {setError(undefined)}}
      >
        {error}  
      </AcceptButtonPanel>}
    </>
};

export default StateButton;
