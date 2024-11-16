"use client";

import LoadingButton from '@mui/lab/LoadingButton';
import { useEffect, useState } from 'react';
import { AcceptButtonPanel } from './accept-button-panel';

type StateButtonProps = {
  handleClick: StateButtonClickHandler;
  variant?: "text" | "contained" | "outlined";
  className?: string
  color?: "primary" | "secondary"
  size?: "small" | "medium" | "large",
  text1: React.ReactNode;
  text2?: React.ReactNode;
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
            console.log("result", result)
            if(result.error){
                setError(result.error)
            }
            setLoading(false)
        }

        if(loading){
            submit()
        }
    }, [loading])

    return <><LoadingButton
      loading={loading}
      loadingIndicator={text2 ? text2 : text1}
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
