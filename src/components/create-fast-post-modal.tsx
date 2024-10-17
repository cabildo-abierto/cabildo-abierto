import { useRouter } from "next/navigation";
import { useState } from "react";
import { useSWRConfig } from "swr";
import { createEntity } from "../actions/entities";
import { useUser } from "../app/hooks/user";
import { CreateAccountLink } from "./create-account-link";
import StateButton from "./state-button";
import TickButton from "./tick-button";
import { articleUrl } from "./utils";
import { ErrorMsg, validEntityName } from "./write-button";
import { BaseFullscreenPopup } from "./base-fullscreen-popup";
import { WritePanelMainFeed } from "./write-panel-main-feed";



export const CreateFastPostModal = ({ onClose }: { onClose: () => void }) => {

    return <BaseFullscreenPopup closeButton={true} onClose={onClose}>
        <div className="w-[315px] sm:w-128">
            <WritePanelMainFeed/>
        </div>
    </BaseFullscreenPopup>
};