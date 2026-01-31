import {ArCabildoabiertoEmbedPoll} from "@cabildo-abierto/api";
import {post} from "@/components/utils/react/fetch";

export const Poll = ({poll}: {
    poll: ArCabildoabiertoEmbedPoll.Main
}) => {

    const choices = poll.choices

    async function onSelectOption(option: string) {
        const res = await post("/vote-poll/")
    }

    return <div className={"bg-red-500 p-2"}>
        <div className={"font-bold"}>
            {poll.description}
        </div>
        <div className={"flex flex-col space-y-2"}>
            {choices.map(option => {
                return <button
                    onClick={() => {
                        onSelectOption(option)
                    }}
                    key={option}
                    className={"w-32 bg-blue-500"}
                >
                    {option}
                </button>
            })}
        </div>
    </div>
}