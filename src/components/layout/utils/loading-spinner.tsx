import {CircularProgress} from '@mui/material';


const LoadingSpinner = ({size = "30px", className = "my-2"}: { className?: string, size?: string }) => {
    return <div className="flex items-center justify-center h-full w-full">
        <div className={className + " text-[var(--text-light)]"}>
            <CircularProgress size={size} color="inherit"/>
        </div>
    </div>
}


export default LoadingSpinner;
