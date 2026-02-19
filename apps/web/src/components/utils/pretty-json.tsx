

export const PrettyJSON = ({ data }: { data: any }) => {
    return <pre
        onWheel={e => e.stopPropagation()}
        style={{ whiteSpace: "pre-wrap", wordBreak: "break-word" }}
    >
        {JSON.stringify(data, null, 2)}
    </pre>
}