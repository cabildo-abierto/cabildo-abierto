import { useState, useEffect } from 'react';
import { resendConfirmationEmail } from '../actions/auth';

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
      <span
        className="ml-1 cursor-pointer underline hover:text-[var(--primary)]"
        onClick={() => {
          resendConfirmationEmail(email);
          setLastSent(new Date());
          setSeconds(0); // Reset the seconds counter when the email is resent
        }}
      >
        Reenviar mail.
      </span>
    );
  } else {
    return (
      <span className="ml-1">
        Podés volver a enviar el mail en {30 - seconds} segundos.
      </span>
    );
  }
};

export default ResendEmailButton;
