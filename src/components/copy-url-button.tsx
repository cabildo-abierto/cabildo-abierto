import { useState } from 'react';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';

export const CopyUrlButton = () => {
  const [isCopied, setIsCopied] = useState(false);

  const copyToClipboard = async () => {
    try {
      const currentUrl = window.location.href; // Get the current URL
      await navigator.clipboard.writeText(currentUrl); // Copy the URL to the clipboard
      setIsCopied(true); // Update the button state to indicate success
      setTimeout(() => setIsCopied(false), 2000); // Reset the state after 2 seconds
    } catch (err) {
      console.error('Error al copiar: ', err);
    }
  };

  return (
    <button onClick={copyToClipboard} className="gray-btn w-64">
        <div className="py-1 flex items-center space-x-2 justify-center">
            <ContentCopyIcon fontSize="inherit"/> <div>{isCopied ? '¡Copiado!' : 'Copiar link'}</div>
        </div>
    </button>
  );
};

export default CopyUrlButton;
