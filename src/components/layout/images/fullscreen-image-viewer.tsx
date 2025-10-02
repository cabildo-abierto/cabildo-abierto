import {useEffect} from "react";
import {IconButton} from "../../../../modules/ui-utils/src/icon-button";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import {CloseButton} from "../../../../modules/ui-utils/src/close-button";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import {ATProtoImage} from "@/components/layout/images/atproto-image";
import {createPortal} from "react-dom";
import {useLayoutConfig} from "@/components/layout/layout-config-context";
import {AppBskyEmbedImages} from "@atproto/api"

const FullscreenImageViewer = ({
                                   images,
                                   viewing,
                                   setViewing,
                                   maxHeight,
                                   maxWidth,
                                   className = "h-full object-contain bg-black bg-opacity-20"
                               }: {
    images: (AppBskyEmbedImages.ViewImage | string)[]
    maxHeight?: number | string
    maxWidth?: number | string
    viewing: number | null
    setViewing: (i: number | null) => void
    className?: string
}) => {
    const {isMobile} = useLayoutConfig()

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

    return createPortal(<div
        onClick={(e) => {
            setViewing(null)
            e.stopPropagation()
        }}
        className="bg-black bg-opacity-50 inset-0 h-screen w-screen fixed z-[2999] flex justify-center items-center"
    >
        <div className={"h-[80vh] flex justify-center items-center relative"}>
            <ATProtoImage
                img={images[viewing]}
                maxHeight={maxHeight ?? "80vh"}
                maxWidth={maxWidth ?? (isMobile ? "100vw" : "80vw")}
                className={"z-[3000] " + className}
                onClick={(e) => {
                    e.stopPropagation()
                    e.preventDefault()
                }}
            />
            <div className="absolute z-[3001] left-2 top-1/2">
                {viewing > 0 ? (
                    <div className={""}>
                        <IconButton onClick={(e) => {
                            e.stopPropagation();
                            setViewing(viewing - 1);
                        }}>
                            <ArrowBackIosNewIcon/>
                        </IconButton>
                    </div>
                ) : null}
            </div>
            <div className="absolute z-[3001] right-2 top-1/2">
                {viewing < images.length - 1 && (
                    <div className={""}>
                        <IconButton
                            onClick={(e) => {
                                e.stopPropagation();
                                setViewing(viewing + 1);
                            }}
                        >
                            <ArrowForwardIosIcon/>
                        </IconButton>
                    </div>
                )}
            </div>
            <div className="absolute z-[3001] right-2 top-2">
                <CloseButton
                    onClose={() => {
                    setViewing(null)
                    }}
                    hoverColor={"transparent"}
                    iconColor={"white-text"}
                />
            </div>
        </div>
    </div>, document.body)
};


export default FullscreenImageViewer