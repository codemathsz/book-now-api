import { Router, Request, Response } from 'express';
import { body, query } from 'express-validator';
import { supabase } from '../config/database';
import { authenticate, authorize } from '../middlewares/auth';
import { handleValidationErrors } from '../middlewares/validation';
import { CreateReservationDTO, AvailabilityResponse } from '../types';

const router = Router();
router.use(authenticate);

// GET /api/reservations - Minhas reservas (usuário comum)
router.get('/', async (req: Request, res: Response) => {
    try {
        const { data: reservations, error } = await supabase
            .from('reservations')
            .select(`
        *,
        time_slots (
          label,
          start_time,
          end_time
        )
      `)
            .eq('user_id', req.user!.userId)
            .eq('status', 'active')
            .order('date', { ascending: true })
            .order('time_slot_id', { ascending: true });

        if (error) {
            console.error('Erro ao buscar reservas:', error);
            return res.status(500).json({ error: 'Erro ao buscar reservas' });
        }

        res.json({ reservations });
    } catch (error) {
        console.error('Erro ao buscar reservas:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});

// GET /api/reservations/all?date=YYYY-MM-DD - Todas as reservas (admin only)
router.get(
    '/all',
    authorize(['admin']),
    [
        query('date').optional().isISO8601().withMessage('Data inválida (use YYYY-MM-DD)'),
        handleValidationErrors,
    ],
    async (req: Request, res: Response) => {
        try {
            const { date } = req.query;

            let query = supabase
                .from('reservations')
                .select(`
          *,
          users!inner (
            name,
            email
          ),
          time_slots!inner (
            label,
            start_time,
            end_time
          )
        `)
                .order('date', { ascending: true })
                .order('time_slot_id', { ascending: true });

            // Filtrar por data se fornecida
            if (date) {
                query = query.eq('date', date);
            }

            const { data: reservations, error } = await query;

            if (error) {
                console.error('Erro ao buscar todas as reservas:', error);
                return res.status(500).json({ error: 'Erro ao buscar reservas' });
            }

            res.json({ reservations });
        } catch (error) {
            console.error('Erro ao buscar todas as reservas:', error);
            res.status(500).json({ error: 'Erro interno do servidor' });
        }
    }
);

router.get(
    '/availability',
    [
        query('date').isISO8601().withMessage('Data inválida (use YYYY-MM-DD)'),
        handleValidationErrors,
    ],
    async (req: Request, res: Response) => {
        try {
            const { date } = req.query;

            const { data: timeSlots, error: timeSlotsError } = await supabase
                .from('time_slots')
                .select('*')
                .eq('is_active', true)
                .order('id', { ascending: true });

            if (timeSlotsError) {
                console.error('Erro ao buscar time slots:', timeSlotsError);
                return res.status(500).json({ error: 'Erro ao buscar horários' });
            }

            const { data: reservations, error: reservationsError } = await supabase
                .from('reservations')
                .select('time_slot_id')
                .eq('date', date)
                .eq('status', 'active');

            if (reservationsError) {
                console.error('Erro ao buscar reservas:', reservationsError);
                return res.status(500).json({ error: 'Erro ao buscar reservas' });
            }

            const reservationCounts: Record<number, number> = {};
            reservations?.forEach((r) => {
                reservationCounts[r.time_slot_id] = (reservationCounts[r.time_slot_id] || 0) + 1;
            });

            const availability: AvailabilityResponse[] = timeSlots!.map((slot) => {
                const reserved = reservationCounts[slot.id] || 0;
                const available = slot.max_tables - reserved;

                return {
                    time_slot_id: slot.id,
                    label: slot.label,
                    start_time: slot.start_time,
                    end_time: slot.end_time,
                    available_tables: available,
                    max_tables: slot.max_tables,
                    is_available: available > 0,
                };
            });

            res.json({ date, availability });
        } catch (error) {
            console.error('Erro ao verificar disponibilidade:', error);
            res.status(500).json({ error: 'Erro interno do servidor' });
        }
    }
);

router.post(
    '/',
    [
        body('time_slot_id').isInt({ min: 1 }).withMessage('ID do time slot inválido'),
        body('date').isISO8601().withMessage('Data inválida (use YYYY-MM-DD)'),
        handleValidationErrors,
    ],
    async (req: Request, res: Response) => {
        try {
            const { time_slot_id, date }: CreateReservationDTO = req.body;
            const userId = req.user!.userId;

            // Check if the user already has a reservation
            const { data: existingReservation } = await supabase
                .from('reservations')
                .select('id')
                .eq('user_id', userId)
                .eq('time_slot_id', time_slot_id)
                .eq('date', date)
                .eq('status', 'active')
                .single();

            if (existingReservation) {
                return res.status(400).json({ error: 'Você já tem uma reserva neste horário' });
            }

            // Check if the user already has 2 appointment
            const { data: userReservationsToday, error: countError } = await supabase
                .from('reservations')
                .select('id')
                .eq('user_id', userId)
                .eq('date', date)
                .eq('status', 'active');

            if (countError) {
                console.error('Erro ao contar reservas:', countError);
                return res.status(500).json({ error: 'Erro ao verificar reservas' });
            }

            if (userReservationsToday && userReservationsToday.length >= 2) {
                return res.status(400).json({ error: 'Você já atingiu o limite de 2 reservas por dia' });
            }

            // Check table availability
            const { data: reservationsInSlot, error: slotError } = await supabase
                .from('reservations')
                .select('table_number')
                .eq('time_slot_id', time_slot_id)
                .eq('date', date)
                .eq('status', 'active');

            if (slotError) {
                console.error('Erro ao buscar reservas do horário:', slotError);
                return res.status(500).json({ error: 'Erro ao verificar disponibilidade' });
            }

            const { data: timeSlot } = await supabase
                .from('time_slots')
                .select('max_tables')
                .eq('id', time_slot_id)
                .single();

            const maxTables = timeSlot?.max_tables || 6;

            if (reservationsInSlot && reservationsInSlot.length >= maxTables) {
                return res.status(400).json({ error: 'Não há mesas disponíveis neste horário' });
            }

            const usedTables = new Set(reservationsInSlot?.map((r) => r.table_number) || []);
            let tableNumber = 1;
            while (usedTables.has(tableNumber) && tableNumber <= maxTables) {
                tableNumber++;
            }

            const { data: newReservation, error: insertError } = await supabase
                .from('reservations')
                .insert([
                    {
                        user_id: userId,
                        time_slot_id,
                        date,
                        table_number: tableNumber,
                        status: 'active',
                    },
                ])
                .select(`
          *,
          time_slots (
            label,
            start_time,
            end_time
          )
        `)
                .single();

            if (insertError) {
                console.error('Erro ao criar reserva:', insertError);
                return res.status(500).json({ error: 'Erro ao criar reserva' });
            }

            res.status(201).json({
                message: 'Reserva criada com sucesso',
                reservation: newReservation,
            });
        } catch (error) {
            console.error('Erro ao criar reserva:', error);
            res.status(500).json({ error: 'Erro interno do servidor' });
        }
    }
);

router.delete('/:id', async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const userId = req.user!.userId;

        // Check if the reservation belongs to the user
        const { data: reservation, error: fetchError } = await supabase
            .from('reservations')
            .select('*')
            .eq('id', id)
            .eq('user_id', userId)
            .eq('status', 'active')
            .single();

        if (fetchError || !reservation) {
            return res.status(404).json({ error: 'Reserva não encontrada' });
        }

        // (soft delete)
        const { error: updateError } = await supabase
            .from('reservations')
            .update({ status: 'cancelled', updated_at: new Date().toISOString() })
            .eq('id', id);

        if (updateError) {
            console.error('Erro ao cancelar reserva:', updateError);
            return res.status(500).json({ error: 'Erro ao cancelar reserva' });
        }

        res.json({ message: 'Reserva cancelada com sucesso' });
    } catch (error) {
        console.error('Erro ao cancelar reserva:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});

export default router;