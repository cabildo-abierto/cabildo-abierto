import {useEffect} from "react";
import {IconButton} from "../../../modules/ui-utils/src/icon-button";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import {CloseButton} from "../../../modules/ui-utils/src/close-button";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import {emptyChar} from "@/utils/utils";
import {ViewImage} from "@atproto/api/src/client/types/app/bsky/embed/images";
import {ATProtoImage} from "@/components/images/atproto-image";


const FullscreenImageViewer = ({
                                          images,
                                          viewing,
                                          setViewing,
                                          className = ""
                                      }: {
    images: (ViewImage | string)[]
    viewing: number | null
    setViewing: (i: number | null) => void
    className?: string
}) => {
    useEffect(() => {
        if (viewing === null) return;

        const handleKeyDown = (e) => {
            if (e.key === 'Escape') {
                setViewing(null);
            } else if (e.key === 'ArrowLeft' && viewing > 0) {
                setViewing(viewing - 1);
            } else if (e.key === 'ArrowRight' && viewing < images.length - 1) {
                setViewing(viewing + 1);
            }
        };

        window.addEventListener('keydown', handleKeyDown);

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [viewing, images.length, setViewing]);

    if (viewing === null) {
        return null;
    }

    return (
        <div
            onClick={(e) => {
                setViewing(null)
                e.stopPropagation();
            }}
            className="bg-black bg-opacity-50 inset-0 h-screen w-screen fixed z-[1021] flex justify-center items-center"
        >
            <div className={"fixed inset-0 flex items-center justify-center z-[1022]"}>
                <div className={"flex items-between"}>
                    <div className="w-24 px-2 flex justify-end items-center">
                        {viewing > 0 ? (
                            <IconButton onClick={(e) => {
                                e.stopPropagation();
                                setViewing(viewing - 1);
                            }}>
                                <ArrowBackIosNewIcon/>
                            </IconButton>
                        ) : null}
                    </div>
                    <div className={"w-[800px] flex justify-center"}>
                    <ATProtoImage
                        img={images[viewing]}
                        className={"z-[3000] object-cover " + className}
                        onClick={(e) => {
                            e.stopPropagation();
                            e.preventDefault()
                        }}
                    />
                    </div>
                    <div className="w-24 px-2 z-[1022] flex flex-col justify-between items-center mt-4">
                        <CloseButton onClose={() => {
                            setViewing(null)
                        }}/>

                        {viewing < images.length - 1 ? (
                            <IconButton
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setViewing(viewing + 1);
                                }}
                            >
                                <ArrowForwardIosIcon/>
                            </IconButton>
                        ) : <div>{emptyChar}</div>}

                        <div>{emptyChar}</div>
                    </div>
                </div>
            </div>
        </div>
    );
};


export default FullscreenImageViewer