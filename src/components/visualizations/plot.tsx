import {Main as Visualization} from "@/lex-api/types/ar/cabildoabierto/embed/visualization"
import {DatasetView} from  "@/lex-api/types/ar/cabildoabierto/data/dataset"
import {PrettyJSON} from "../../../modules/ui-utils/src/pretty-json";
// Definir librería de gráficos e implementar en base a eso


export const Plot = ({
     dataset,
     visualization,
     width="600px"
 }: {
    dataset: DatasetView;
    visualization: Visualization;
    width?: number | string;
}) => {
    return <PrettyJSON data={visualization}/>
};