"use client"

import {useState} from "react";
import {BaseTextField} from "@/components/utils/base/base-text-field";

export const AdminCache = () => {
    const [tag, setTag] = useState("");

    return <div className="flex flex-col items-center mt-8">

        <div className="py-8 flex flex-col items-center space-y-2 w-64 text-center">

            <div className={"flex items-center space-x-2 w-90"}>
                <div className={"w-48"}>
                    <BaseTextField
                        placeholder={"tag"}
                        value={tag}
                        onChange={(e) => {
                            setTag(e.target.value)
                        }}
                    />
                </div>
            </div>

        </div>
    </div>
}