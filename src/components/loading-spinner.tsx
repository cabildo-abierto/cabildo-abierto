import { CircularProgress } from '@mui/material';


const LoadingSpinner = ({size="30px"}: {size?: string}) => {
  return <div className="flex items-center justify-center h-full w-full">
    <div className="my-2">
      <CircularProgress size={size} color="primary"/>
    </div>
  </div>
}


export default LoadingSpinner;
