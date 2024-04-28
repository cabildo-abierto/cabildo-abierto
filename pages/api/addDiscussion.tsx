import prisma from '../../lib/prisma';

export default async function handler(req, res) {
    if (req.method === 'POST') {
        try {
            const { title, content, authorId } = req.body;
            const newPost = await prisma.post.create({
                data: {
                    title,
                    content,
                    published: true, // New posts are published by default
                    authorId,
                },
            });
            res.status(201).json(newPost);
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Error adding discussion in API' });
        }
    } else {
        res.status(405).json({ error: 'Method not allowed' });
    }
}