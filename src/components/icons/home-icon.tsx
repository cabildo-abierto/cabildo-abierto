
import HomeIcon from '@mui/icons-material/Home';

export const CabildoIcon = ({className, fontSize}: {className?: string, fontSize?: "small" | "inherit"}) => {
    return <HomeIcon fontSize={fontSize}/>
    //return <i className={"icon cabildo "+className}/>
    /*return <div className={className}>
        <CabildoSVG height={23} width={23}/>
    </div>*/
}