import {redirect} from "next/navigation";

export default async function TopicTitleEditPage({params}: {params: Promise<{id: string; editId: string}>}) {
    const {id, editId} = await params;
    redirect(`/tema/${encodeURIComponent(id)}/titulo#propuesta-${encodeURIComponent(editId)}`);
}
