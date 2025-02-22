"use client";

import { LoadingButton } from '@mui/lab';
import { ReactNode, useEffect, useState } from 'react';
import { AcceptButtonPanel } from './ui-utils/accept-button-panel';

type StateButtonProps = {
  handleClick: StateButtonClickHandler;
  variant?: "text" | "contained" | "outlined";
  className?: string
  color?: "primary" | "secondary" | "error" | "inherit"
  size?: "small" | "medium" | "large",
  text1: ReactNode;
  text2?: ReactNode;
  startIcon?: ReactNode;
  textClassName?: string;
  disabled?: boolean;
  disableElevation?: boolean
  sx?: any
  fullWidth?: boolean
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
  fullWidth,
  sx
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
          textTransform: 'none',
          color: "var(--text)"
      , ...sx}}
      fullWidth={fullWidth}
    >
      <div className={textClassName}>
        {text1}
      </div>
    </LoadingButton>
      <AcceptButtonPanel
        open={Boolean(error)}
        onClose={() => {setError(undefined)}}
      >
          <div className={"text-[var(--text-light)]"}>
              {error}
          </div>
      </AcceptButtonPanel>
    </>
};

export default StateButton;
