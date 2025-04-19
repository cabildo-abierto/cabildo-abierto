export const fetcher = (...args: Parameters<typeof fetch>) => fetch(...args).then(res => res.json())

export const fetcherWithCredentials = async (...args: Parameters<typeof fetch>) => {
    const [resource, config = {}] = args;

    const res = await fetch(resource, {
        ...config,
        credentials: 'include'
    });

    return await res.json();
};