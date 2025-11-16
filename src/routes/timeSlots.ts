import { Router, Request, Response } from 'express';
import { supabase } from '../config/database';

const router = Router();

//(rota pública)
router.get('/', async (req: Request, res: Response) => {
  try {
    const { data: timeSlots, error } = await supabase
      .from('time_slots')
      .select('*')
      .eq('is_active', true)
      .order('id', { ascending: true });

    if (error) {
      console.error('Erro ao buscar time slots:', error);
      return res.status(500).json({ error: 'Erro ao buscar horários' });
    }

    res.json({ timeSlots });
  } catch (error) {
    console.error('Erro ao buscar time slots:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

export default router;
