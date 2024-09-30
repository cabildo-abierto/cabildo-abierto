import { listOrder, listOrderDesc } from "./utils"

export type ConversationStateProps = {id: string, date: string, seen: boolean}

type ChatSelectorProps = {
    users: ConversationStateProps[],
    selected: string,
    setSelected: (u: string) => void
}

export const ChatSelector = ({users, selected, setSelected}: ChatSelectorProps) => {

    const comp = (a: ConversationStateProps, b: ConversationStateProps) => {
        function ord(x: ConversationStateProps){
            return [x.date == null ? 0 : 1, x.seen ? 0 : 1, new Date(x.date).getTime()]
        }

        return listOrderDesc({score: ord(a)}, {score: ord(b)})
    }

    users = users.sort(comp)
    return <div className="y-space-1">
        {users.map(({id}, index) => {
            const className = "content-container px-4 py-1 " + (selected == id ? "bg-[var(--secondary-light)]" : "")

            return <button
                key={index}
                className={className}
                onClick={() => {setSelected(id)}}
            >
                @{id}
            </button>
        })}
    </div>
}