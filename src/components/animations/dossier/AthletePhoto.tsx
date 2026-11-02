import { useState } from 'react';

interface AthletePhotoProps {
    readonly src: string;
    readonly name: string;
    readonly className?: string;
    /** Tamanho da fonte das iniciais quando a foto não carrega. */
    readonly initialsSize: number;
}

const initials = (name: string): string =>
    name.split(/\s+/).filter(Boolean).map(w => w[0]).slice(0, 2).join('').toUpperCase();

/** Foto local do atleta; se faltar o arquivo, mostra as iniciais (a aula pode rodar offline). */
export const AthletePhoto = ({ src, name, className = '', initialsSize }: AthletePhotoProps) => {
    const [failed, setFailed] = useState(false);
    if (failed) {
        return (
            <div className={`flex items-center justify-center bg-slate-800 font-display font-bold text-slate-200 ${className}`} style={{ fontSize: initialsSize }} aria-label={name}>
                {initials(name)}
            </div>
        );
    }
    return (
        <img src={src} alt={name} draggable={false} onError={() => setFailed(true)}
            className={`object-cover object-top ${className}`} referrerPolicy="no-referrer" />
    );
};
