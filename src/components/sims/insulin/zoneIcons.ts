import { AlertTriangle, ShieldCheck, Skull, type LucideIcon } from 'lucide-react';
import type { ZoneId } from './model';

/**
 * Ícone de cada faixa da régua. A cor sozinha não basta (daltonismo): o formato
 * repete a leitura "seguro / atenção / perigo" de verde, amarelo e vermelho.
 */
export const ZONE_ICONS: Record<ZoneId, LucideIcon> = {
    green: ShieldCheck,
    yellow: AlertTriangle,
    red: Skull,
};
