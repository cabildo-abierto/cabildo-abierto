import { getUsersByLocation } from "../../actions/users";
import ArgentinaMap from "../../components/map";
import { ThreeColumnsLayout } from "../../components/three-columns";




export default async function Page(){
    const {usersByLocation, error} = await getUsersByLocation()

    const center = <div className="flex justify-center mt-16">
        <ArgentinaMap usersByLocation={usersByLocation}/>
    </div>

    return <ThreeColumnsLayout center={center}/>
}