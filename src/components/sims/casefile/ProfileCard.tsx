import { motion } from 'framer-motion';
import { MessageCircleQuestion } from 'lucide-react';
import { RichText } from './RichText';
import { CARD_BG, type CaseData } from './types';

interface ProfileCardProps {
    readonly data: CaseData;
    readonly step: number;
    readonly revealed: boolean;
}

/** Relato curto ganha corpo maior, para a coluna não ficar com área vazia. */
const bodySize = (data: CaseData): string => {
    const chars = data.profile.paragraphs.reduce((n, p) => n + p.reduce((m, t) => m + t.text.length, 0), 0);
    if (chars <= 70) return 'text-[21px] leading-[1.45]';
    if (chars <= 120) return 'text-[17px] leading-[1.45]';
    return 'text-[15px] leading-[1.45]';
};

/** Coluna 1 do prontuário: identificação, relato e a pergunta para a turma. */
export const ProfileCard = ({ data, step, revealed }: ProfileCardProps) => {
    const Icon = data.icon;
    const asking = step === 0;
    const body = `${bodySize(data)} text-gray-100`;
    return (
        <div className="rounded-2xl border border-white/10 px-4 py-3.5 flex flex-col gap-2.5 min-h-0" style={CARD_BG}>
            <div className="flex items-center gap-3">
                <div className="shrink-0 w-10 h-10 rounded-xl flex items-center justify-center"
                    style={{ background: `${data.accent}22`, border: `1px solid ${data.accent}77` }}>
                    <Icon size={22} color={data.accent} strokeWidth={1.8} />
                </div>
                <div className="min-w-0">
                    <div className="font-mono text-[14px] uppercase tracking-wider" style={{ color: data.accent }}>{data.caseNumber}</div>
                    <div className="font-mono text-[14px] uppercase tracking-wider text-gray-300">Prontuário · Relato</div>
                </div>
            </div>
            <div className="flex-1 min-h-0 flex flex-col justify-center gap-2.5">
                <div className="font-display text-[18px] font-semibold leading-snug text-white">{data.profile.headline}</div>
                <div className="space-y-2">
                    {data.profile.paragraphs.map((parts, i) => (
                        <RichText key={i} parts={parts} step={step} revealed={revealed} className={body} />
                    ))}
                </div>
            </div>
            <motion.div className="rounded-xl px-3 py-2.5 border"
                animate={{
                    borderColor: asking ? `${data.accent}aa` : 'rgba(255,255,255,0.12)',
                    background: asking ? `${data.accent}1f` : 'rgba(255,255,255,0.03)',
                }}
                transition={{ duration: 0.5 }}>
                <div className="flex items-center gap-2 font-mono text-[14px] uppercase tracking-wider" style={{ color: asking ? data.accent : '#D1D5DB' }}>
                    <MessageCircleQuestion size={15} />
                    Pergunta para a turma
                </div>
                <div className={`mt-1 font-display font-semibold leading-snug text-white ${asking ? 'text-[17px]' : 'text-[15px]'}`}>
                    {data.profile.question}
                </div>
            </motion.div>
        </div>
    );
};
