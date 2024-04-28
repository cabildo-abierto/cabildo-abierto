export default function DiscussionList({discussions}) {
    return (
        <div>
            {discussions.map((card, index) => (
                <div key={index} className="bg-white rounded-lg shadow-md p-4 mb-4">
                    <h2 className="text-lg font-semibold text-gray-800 mb-2">{card.title}</h2>
                    <p className="text-gray-600">{card.description}</p>
                </div>
            ))}
        </div>
    );
};