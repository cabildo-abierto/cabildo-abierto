import { useState, useEffect } from 'react';
import { resendConfirmationEmail } from '../actions/auth';
import StateButton from './state-button';

const ResendEmailButton = ({ email, initializeSent=false }: { email: string, initializeSent?: boolean }) => {
  const [lastSent, setLastSent] = useState<undefined | Date>(initializeSent ? new Date() : undefined);
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (lastSent) {
      interval = setInterval(() => {
        const elapsedSeconds = Math.floor((new Date().getTime() - lastSent.getTime()) / 1000);
        setSeconds(elapsedSeconds);
      }, 1000);
    }
    
    return () => {
      if (interval) clearInterval(interval); // Clear the interval on unmount or if the timer is reset
    };
  }, [lastSent]);

  if (!lastSent || seconds >= 30) {
    return (
      <StateButton
        disableElevation={true}
        handleClick={async () => {
          const {error} = await resendConfirmationEmail(email);
          if(error) return error
          setLastSent(new Date());
          setSeconds(0);
          return {}
        }}
        text1="Reenviar mail"
        text2="Reenviando..."
      />
    );
  } else {
    return (
      <span className="">
        Podés volver a enviar el mail en {30 - seconds} segundos.
      </span>
    );
  }
};

export default ResendEmailButton;
