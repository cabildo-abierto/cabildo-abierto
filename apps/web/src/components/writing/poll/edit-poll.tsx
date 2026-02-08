import {BaseButton} from "@/components/utils/base/base-button";
import {BaseTextField} from "@/components/utils/base/base-text-field";
import {BaseTextArea} from "@/components/utils/base/base-text-area";
import {useEffect} from "react";
import {unique} from "@cabildo-abierto/utils";
import { Note } from "@/components/utils/base/note";


export type PollEditState = {
    choices: string[]
    description: string
}


export const EditPoll = ({poll, setPoll, onSave}: {
    poll: PollEditState
    setPoll: (s: PollEditState) => void
    onSave: () => void
}) => {
    const choices = poll.choices

    useEffect(() => {
        if(poll.choices.length == 0) {
            setPoll({...poll, choices: [""]})
        } else if(poll.choices[poll.choices.length-1].length > 0) {
            setPoll({...poll, choices: [...poll.choices, ""]})
        } else {
            for(let i = 0; i < poll.choices.length-1; i++) {
                if(poll.choices[i].length == 0) {

                    setPoll({
                        ...poll,
                        choices: [
                            ...poll.choices.slice(0, i),
                            ...poll.choices.slice(i+1),
                        ]
                    })
                }
            }
        }
    }, [poll])


    const validPoll = unique(poll.choices).length == poll.choices.length && poll.choices.length >= 3

    return (
        <div className="w-[400px] space-y-4">
            <div className="space-y-1">
                <BaseTextArea
                    value={poll.description}
                    onChange={e => {
                        setPoll({...poll, description: e.target.value})
                    }}
                    placeholder={"Descripción..."}
                />
            </div>

            <div className="flex flex-col gap-2">
                {choices.map((option, idx) => {
                    return (
                        <div
                            key={idx}
                            className={"space-y-1"}
                        >
                            <BaseTextField
                                size={"default"}
                                value={option}
                                placeholder={`Opción ${idx+1}...`}
                                onChange={e => {setPoll({...poll, choices: [...choices.slice(0, idx), e.target.value, ...choices.slice(idx+1)]})}}
                            />
                            {idx >= 1 && choices.slice(0, idx).some(c => c == option) && <Note className={"text-xs text-left px-0.5"}>
                                Esta opción está repetida.
                            </Note>}
                        </div>
                    )
                })}
            </div>

            <div className={"flex justify-end"}>
                <BaseButton
                    variant={"outlined"}
                    size={"small"}
                    disabled={!validPoll}
                    onClick={onSave}
                >
                    Guardar
                </BaseButton>
            </div>
        </div>
    )


}