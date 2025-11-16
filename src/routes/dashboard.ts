import { Router, Request, Response } from 'express';
import { query } from 'express-validator';
import { supabase } from '../config/database';
import { authenticate, authorize } from '../middlewares/auth';
import { handleValidationErrors } from '../middlewares/validation';
import { DashboardOverview } from '../types';

const router = Router();

router.use(authenticate);
router.use(authorize(['admin']));

// GET /api/dashboard/overview?date=YYYY-MM-DD
router.get(
    '/overview',
    [
        query('date').isISO8601().withMessage('Data inválida (use YYYY-MM-DD)'),
        handleValidationErrors,
    ],
    async (req: Request, res: Response) => {
        try {
            const { date } = req.query as { date: string };

            const { data: reservations, error: reservationsError } = await supabase
                .from('reservations')
                .select('id, time_slot_id, status')
                .eq('date', date);

            if (reservationsError) {
                console.error('Erro ao buscar reservas:', reservationsError);
                return res.status(500).json({ error: 'Erro ao buscar reservas' });
            }

            const { data: timeSlots, error: timeSlotsError } = await supabase
                .from('time_slots')
                .select('*')
                .eq('is_active', true)
                .order('id', { ascending: true });

            if (timeSlotsError) {
                console.error('Erro ao buscar time slots:', timeSlotsError);
                return res.status(500).json({ error: 'Erro ao buscar horários' });
            }

            // calc statistics
            const totalReservations = reservations?.filter((r) => r.status === 'active').length || 0;
            const totalCancelled = reservations?.filter((r) => r.status === 'cancelled').length || 0;

            const reservationCounts: Record<number, number> = {};
            reservations
                ?.filter((r) => r.status === 'active')
                .forEach((r) => {
                    reservationCounts[r.time_slot_id] = (reservationCounts[r.time_slot_id] || 0) + 1;
                });

            const slots = timeSlots!.map((slot) => {
                const reserved = reservationCounts[slot.id] || 0;
                return {
                    time_slot_id: slot.id,
                    label: slot.label,
                    reserved_tables: reserved,
                    available_tables: slot.max_tables - reserved,
                    max_tables: slot.max_tables,
                };
            });

            const overview: DashboardOverview = {
                date,
                total_reservations: totalReservations,
                total_cancelled: totalCancelled,
                slots,
            };

            res.json(overview);
        } catch (error) {
            console.error('Erro ao buscar overview:', error);
            res.status(500).json({ error: 'Erro interno do servidor' });
        }
    }
);

// GET /api/dashboard/reservations?date=YYYY-MM-DD
router.get(
    '/reservations',
    [
        query('date').isISO8601().withMessage('Data inválida (use YYYY-MM-DD)'),
        handleValidationErrors,
    ],
    async (req: Request, res: Response) => {
        try {
            const { date } = req.query;

            const { data: reservations, error } = await supabase
                .from('reservations')
                .select(`
          *,
          users (
            name,
            email
          ),
          time_slots (
            label,
            start_time,
            end_time
          )
        `)
                .eq('date', date)
                .order('time_slot_id', { ascending: true })
                .order('table_number', { ascending: true });

            if (error) {
                console.error('Erro ao buscar reservas:', error);
                return res.status(500).json({ error: 'Erro ao buscar reservas' });
            }

            res.json({ date, reservations });
        } catch (error) {
            console.error('Erro ao buscar reservas:', error);
            res.status(500).json({ error: 'Erro interno do servidor' });
        }
    }
);

export default router;