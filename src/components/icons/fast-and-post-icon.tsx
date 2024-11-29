import { FastPostIcon } from "./fast-post-icon";
import { PostIcon } from "./post-icon";

export const FastAndPostIcon = () => {
    return (
        <span className="relative inline-block text-gray-900">
            <span className="absolute bottom-[-4px] right-[-5px]">
                <PostIcon />
            </span>
            <span className="absolute top-[-12px] left-[-3px]">
                <FastPostIcon />
            </span>
        </span>
    );
};