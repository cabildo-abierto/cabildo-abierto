import {PollEditState} from "@/components/writing/poll/edit-poll";
import {$Typed} from "@atproto/api";
import {ArCabildoabiertoEmbedPoll} from "@cabildo-abierto/api";


export function pollEditStateToFirstView(poll: PollEditState): $Typed<ArCabildoabiertoEmbedPoll.View> {
    const choices = poll.choices.filter(c => c.trim().length > 0)

    return {
        $type: "ar.cabildoabierto.embed.poll#view",
        key: "unpublished", // se completa al guardar el contenido
        poll: {
            $type: "ar.cabildoabierto.embed.poll#poll",
            description: poll.description,
            choices: choices.map(c => {
                return {
                    $type: "ar.cabildoabierto.embed.poll#pollChoice",
                    label: c
                }
            })
        },
        votes: poll.votes ?? choices.map(c => 0)
    }
}