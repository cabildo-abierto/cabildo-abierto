import { CircularProgress } from '@mui/material';


const LoadingSpinner = () => {
  return <div className="flex items-center justify-center h-full w-full">
    <div className="my-2">
      <CircularProgress size="30px" color="primary"/>
    </div>
  </div>
}


export default LoadingSpinner;
