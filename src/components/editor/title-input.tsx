export const TitleInput = ({ onChange }: any) => {
    const handleChange = (e: any) => {
        onChange(e.target.value);
    };

    return (
        <input
            type="text"
            onChange={handleChange}
            placeholder="Algún título..."
            className="ck-content"
            style={{
                width: '100%',
                padding: '10px',
                fontSize: '32px',
                borderRadius: '5px',
                outline: 'none',
                fontWeight: 'bold'
            }}
        />
    );
};