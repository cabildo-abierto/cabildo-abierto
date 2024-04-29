import prisma from '../../lib/prisma';

export default async function handler(req, res) {
    console.log('register request');

    if (req.method === 'POST') {
        try {
            const { name, email, password, confirmPassword } = req.body;
            const newUser = await prisma.user.create({
                data: {
                    name,
                    email,
                    password
                },
            });
            res.writeHead(302, { Location: '/' });
            res.end()
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Registration failed' });
        }
    } else {
        res.status(405).json({ error: 'Method not allowed' });
    }
}