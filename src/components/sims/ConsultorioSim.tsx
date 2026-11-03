import { motion } from 'framer-motion';
import { useSlideSteps } from '../../store/useSlideSteps';
import { ACTIONS } from './medico/data';

/** Fechamento clínico: cinco ações, reveladas uma a uma; a atual fica em destaque. */
export default function ConsultorioSim() {
    const { step } = useSlideSteps(ACTIONS.length);

    return (
        <ol className="not-prose w-full flex flex-col gap-3 list-none p-0 m-0">
            {ACTIONS.map((a, i) => {
                const shown = i <= step;
                const active = i === step;
                return (
                    <motion.li
                        key={a.title}
                        initial={false}
                        animate={{ opacity: shown ? 1 : 0, x: shown ? 0 : -24 }}
                        transition={{ duration: 0.4 }}
                        className={`flex items-center gap-6 rounded-2xl border px-6 py-4 ${
                            active ? 'border-brand-red bg-brand-crimson/25' : 'border-white/15 bg-white/[0.04]'
                        }`}
                    >
                        <span className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center font-display text-2xl font-semibold ${active ? 'bg-brand-red text-white' : 'bg-white/10 text-gray-100'}`}>
                            {i + 1}
                        </span>
                        <div>
                            <p className="font-display text-[1.6rem] leading-tight font-semibold text-white">{a.title}</p>
                            <p className="text-[1.15rem] leading-snug text-gray-200 mt-1">{a.text}</p>
                        </div>
                    </motion.li>
                );
            })}
        </ol>
    );
}
