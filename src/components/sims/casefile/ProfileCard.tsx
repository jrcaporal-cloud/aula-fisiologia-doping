import { motion } from 'framer-motion';
import { MessageCircleQuestion } from 'lucide-react';
import { RichText } from './RichText';
import { CARD_BG, type CaseData } from './types';

interface ProfileCardProps {
    readonly data: CaseData;
    readonly step: number;
    readonly revealed: boolean;
}

/** Coluna 1 do prontuário: identificação, relato e a pergunta para a turma. */
export const ProfileCard = ({ data, step, revealed }: ProfileCardProps) => {
    const Icon = data.icon;
    const asking = step === 0;
    return (
        <div className="rounded-2xl border border-white/10 p-4 flex flex-col gap-3 min-h-0" style={CARD_BG}>
            <div className="flex items-center gap-3">
                <div className="shrink-0 w-11 h-11 rounded-xl flex items-center justify-center"
                    style={{ background: `${data.accent}22`, border: `1px solid ${data.accent}77` }}>
                    <Icon size={22} color={data.accent} strokeWidth={1.8} />
                </div>
                <div className="min-w-0">
                    <div className="font-mono text-[12px] uppercase tracking-widest" style={{ color: data.accent }}>{data.caseNumber}</div>
                    <div className="font-mono text-[12px] uppercase tracking-widest text-gray-300">Prontuário · Relato</div>
                </div>
            </div>
            <div className="font-display text-[17px] font-semibold leading-snug text-white">{data.profile.headline}</div>
            <div className="space-y-2.5">
                {data.profile.paragraphs.map((parts, i) => (
                    <RichText key={i} parts={parts} step={step} revealed={revealed} />
                ))}
            </div>
            <motion.div className="mt-auto rounded-xl p-3 border"
                animate={{
                    borderColor: asking ? `${data.accent}aa` : 'rgba(255,255,255,0.12)',
                    background: asking ? `${data.accent}1f` : 'rgba(255,255,255,0.03)',
                }}
                transition={{ duration: 0.5 }}>
                <div className="flex items-center gap-2 font-mono text-[12px] uppercase tracking-widest" style={{ color: asking ? data.accent : '#D1D5DB' }}>
                    <MessageCircleQuestion size={15} />
                    Pergunta para a turma
                </div>
                <div className={`mt-1 font-display font-semibold leading-snug text-white ${asking ? 'text-[16px]' : 'text-[14px]'}`}>
                    {data.profile.question}
                </div>
            </motion.div>
        </div>
    );
};
