import { Router, Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { body } from 'express-validator';
import { supabase } from '../config/database';
import { config } from '../config';
import { handleValidationErrors } from '../middlewares/validation';
import { authenticate } from '../middlewares/auth';
import { RegisterDTO, LoginDTO } from '../types';

const router = Router();

router.post(
    '/register',
    [
        body('email').isEmail().withMessage('Email inválido'),
        body('name').trim().notEmpty().withMessage('Nome é obrigatório'),
        body('password').isLength({ min: 6 }).withMessage('Senha deve ter no mínimo 6 caracteres'),
        handleValidationErrors,
    ],
    async (req: Request, res: Response) => {
        try {
            const { email, name, password }: RegisterDTO = req.body;

            // verify if exists
            const { data: existingUser } = await supabase
                .from('users')
                .select('id')
                .eq('email', email)
                .single();

            if (existingUser) {
                return res.status(400).json({ error: 'Email já cadastrado' });
            }

            const hashedPassword = await bcrypt.hash(password, 10);

            const { data: newUser, error } = await supabase
                .from('users')
                .insert([
                    {
                        email,
                        name,
                        password: hashedPassword,
                        role: 'user',
                    },
                ])
                .select('id, email, name, role, created_at')
                .single();

            if (error) {
                console.error('Erro ao criar usuário:', error);
                return res.status(500).json({ error: 'Erro ao criar usuário' });
            }

            const token = jwt.sign(
                { userId: newUser.id, email: newUser.email, role: newUser.role } as any,
                config.jwt.secret,
                { expiresIn: config.jwt.expiresIn } as any
            );

            // Definir cookie httpOnly
            res.cookie('token', token, {
                httpOnly: true, // Não acessível via JavaScript
                secure: config.nodeEnv === 'production', // HTTPS apenas em produção
                sameSite: config.nodeEnv === 'production' ? 'strict' : 'lax',
                maxAge: 7 * 24 * 60 * 60 * 1000 // 7 dias
            });

            res.status(201).json({
                message: 'Usuário criado com sucesso',
                user: {
                    id: newUser.id,
                    email: newUser.email,
                    name: newUser.name,
                    role: newUser.role,
                }
            });
        } catch (error) {
            console.error('Erro no registro:', error);
            res.status(500).json({ error: 'Erro interno do servidor' });
        }
    }
);

router.post(
    '/login',
    [
        body('email').isEmail().withMessage('Email inválido'),
        body('password').notEmpty().withMessage('Senha é obrigatória'),
        handleValidationErrors,
    ],
    async (req: Request, res: Response) => {
        try {
            const { email, password }: LoginDTO = req.body;

            const { data: user, error } = await supabase
                .from('users')
                .select('*')
                .eq('email', email)
                .single();

            if (error || !user) {
                return res.status(401).json({ error: 'Credenciais inválidas' });
            }

            const isPasswordValid = await bcrypt.compare(password, user.password);

            if (!isPasswordValid) {
                return res.status(401).json({ error: 'Credenciais inválidas' });
            }

            const token = jwt.sign(
                { userId: user.id, email: user.email, role: user.role } as any,
                config.jwt.secret,
                { expiresIn: config.jwt.expiresIn } as any
            );

            // Definir cookie httpOnly
            res.cookie('token', token, {
                httpOnly: true, // Não acessível via JavaScript
                secure: config.nodeEnv === 'production', // HTTPS apenas em produção
                sameSite: config.nodeEnv === 'production' ? 'strict' : 'lax',
                maxAge: 7 * 24 * 60 * 60 * 1000 // 7 dias
            });

            res.json({
                message: 'Login realizado com sucesso',
                user: {
                    id: user.id,
                    email: user.email,
                    name: user.name,
                    role: user.role,
                }
            });
        } catch (error) {
            console.error('Erro no login:', error);
            res.status(500).json({ error: 'Erro interno do servidor' });
        }
    }
);

router.get('/me', authenticate, async (req: Request, res: Response) => {
    try {
        const { data: user, error } = await supabase
            .from('users')
            .select('id, email, name, role, created_at')
            .eq('id', req.user!.userId)
            .single();

        if (error || !user) {
            return res.status(404).json({ error: 'Usuário não encontrado' });
        }

        res.json({ user });
    } catch (error) {
        console.error('Erro ao buscar usuário:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});

// POST /api/auth/logout
router.post('/logout', authenticate, (req: Request, res: Response) => {
    // Limpar cookie
    res.clearCookie('token', {
        httpOnly: true,
        secure: config.nodeEnv === 'production',
        sameSite: config.nodeEnv === 'production' ? 'strict' : 'lax'
    });

    res.json({ message: 'Logout realizado com sucesso' });
});

export default router;
