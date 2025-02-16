import {SmallTopicProps} from "../../app/lib/definitions";
import {useState} from "react";
import {getTopicTitle} from "../topic/utils";
import {CustomLink as Link} from "../custom-link";
import {articleUrl} from "../utils";
import Button from "@mui/material/Button";
import PersonIcon from "@mui/icons-material/Person";

export const TrendingArticlesSlider = ({trendingArticles}: {
    trendingArticles: SmallTopicProps[]}) => {
    const [hovering, setHovering] = useState<number>(undefined)

    return (
        <div
            className="flex flex-col overflow-y-scroll max-h-[350px] no-scrollbar space-y-3"
        >
            {trendingArticles.map((topic, index) => {

                const title = getTopicTitle(topic)
                return <Link href={articleUrl(topic.id)} draggable={false}
                             className="flex flex-col justify-between border rounded mx-4 text-center sm:text-sm text-xs text-[0.72rem]"
                             key={topic.id}
                             onMouseLeave={() => {setHovering(undefined)}}
                             onMouseEnter={() => {/*preload("/api/entity/"+entity.id, fetcher);*/ setHovering(index)}}
                >
                    <Button
                        color="inherit"
                        size="small"
                        sx={{
                            textTransform: "none",
                            display: "flex",
                            flexDirection: "column",
                            justifyContent: "center",
                            height: "100%",
                            minHeight: "64px",
                            borderRadius: "0",
                        }}
                    >
                        <div className="flex items-center justify-center px-2 font-bold">
                        <span className={"overflow-hidden " + (hovering == index ? "line-clamp-none" : "line-clamp-2")}>
                            {title}
                        </span>
                        </div>

                        <div
                            className="text-[var(--text-light)] text-xs sm:text-sm flex items-end justify-end px-1 w-full"
                        >
                            <div title="La cantidad de usuarios que participaron en la discusión.">{topic.score[0]} <PersonIcon fontSize="inherit"/></div>
                        </div>
                    </Button>
                </Link>
            })}
        </div>
    );
}