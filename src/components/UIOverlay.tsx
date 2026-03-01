import React from 'react';
import { useStore } from '../store/useStore';
import { STEPS } from '../data/steps';
import { ChevronRight, ChevronLeft, RefreshCw, Info } from 'lucide-react';

export const UIOverlay: React.FC = () => {
    const { currentStep, isAnimating, hoveredObject, loaded, nextStep, prevStep, setStep } = useStore();
    const stepData = STEPS[currentStep];

    return (
        <div className="absolute inset-0 pointer-events-none z-10 flex flex-col justify-between">
            {/* Loading Screen */}
            <div
                className={`absolute inset-0 bg-bg-dark flex flex-col items-center justify-center z-50 transition-opacity duration-1000 ${loaded ? 'opacity-0 pointer-events-none' : 'opacity-100 pointer-events-auto'}`}
            >
                <div className="relative w-16 h-16 animate-spin">
                    <div className="absolute top-0 left-0 w-4 h-4 rounded-full bg-accent" />
                    <div className="absolute bottom-0 right-0 w-4 h-4 rounded-full bg-accent2" />
                </div>
                <p className="mt-6 text-sm tracking-widest text-gray-400 uppercase">Synthesizing 3D Environment</p>
            </div>

            {/* Header */}
            <header className="fixed top-6 w-full text-center">
                <h1 className="text-xl md:text-2xl font-semibold tracking-wide bg-gradient-to-br from-accent to-accent2 bg-clip-text text-transparent">
                    Testosterone Mechanism in Muscle Cell
                </h1>
                <p className="text-xs text-gray-500 mt-2 tracking-widest uppercase">
                    Drag to Rotate • Scroll to Zoom • Select Structures
                </p>
            </header>

            {/* Info Panel & Legend */}
            <aside className="fixed right-4 md:right-8 top-1/2 -translate-y-1/2 w-80 glass-panel rounded-2xl p-6 pointer-events-auto transition-all duration-300">
                <div className="mb-4">
                    <span className="inline-block px-3 py-1 text-[10px] font-mono tracking-widest text-accent bg-accent/10 rounded-full mb-3">
                        {stepData.badge}
                    </span>
                    <h2 className="text-xl font-medium text-white leading-tight mb-3">
                        {stepData.title}
                    </h2>
                    <p className="text-sm text-gray-400 leading-relaxed">
                        {stepData.description}
                    </p>
                </div>

                {/* Dynamic Context (Hover Info) */}
                <div className={`mt-6 p-4 rounded-xl bg-white/5 border border-white/10 transition-colors duration-300 ${hoveredObject ? 'border-accent/50 bg-accent/5' : ''}`}>
                    <div className="flex items-center gap-2 mb-2">
                        <Info size={14} className={hoveredObject ? 'text-accent' : 'text-gray-500'} />
                        <span className="text-xs font-semibold text-gray-300 uppercase tracking-wider">
                            {hoveredObject ? hoveredObject.name : 'Structure Details'}
                        </span>
                    </div>
                    <p className="text-xs text-gray-500 leading-relaxed">
                        {hoveredObject ? hoveredObject.info : 'Hover over any 3D structure in the scene to view its specific biological function.'}
                    </p>
                </div>

                {/* Legend */}
                <div className="mt-6 pt-5 border-t border-white/10 grid grid-cols-2 gap-3">
                    <div className="flex items-center gap-2 text-[10px] text-gray-400"><div className="w-2 h-2 rounded-full bg-t-green" /> Testosterone</div>
                    <div className="flex items-center gap-2 text-[10px] text-gray-400"><div className="w-2 h-2 rounded-full bg-ar-orange" /> AR</div>
                    <div className="flex items-center gap-2 text-[10px] text-gray-400"><div className="w-2 h-2 rounded-full bg-dna-purple" /> Nucleus / DNA</div>
                    <div className="flex items-center gap-2 text-[10px] text-gray-400"><div className="w-2 h-2 rounded-full bg-mrna-pink" /> mRNA</div>
                    <div className="flex items-center gap-2 text-[10px] text-gray-400"><div className="w-2 h-2 rounded-full bg-prot-yellow" /> Proteins</div>
                    <div className="flex items-center gap-2 text-[10px] text-gray-400"><div className="w-2 h-2 rounded-full bg-red-600" /> Organelles</div>
                </div>
            </aside>

            {/* Timeline Controls */}
            <footer className="fixed bottom-8 w-full flex justify-center pointer-events-auto">
                <div className="glass-panel px-6 py-4 rounded-full flex items-center gap-4">
                    <button
                        onClick={prevStep}
                        disabled={currentStep === 0 || isAnimating}
                        className="p-2 text-gray-400 hover:text-white disabled:opacity-30 transition-colors"
                    >
                        <ChevronLeft size={20} />
                    </button>

                    <div className="flex items-center gap-3">
                        {STEPS.map((step, i) => (
                            <React.Fragment key={step.id}>
                                {i > 0 && (
                                    <div className="w-8 h-px bg-white/20 relative overflow-hidden">
                                        <div className={`absolute inset-0 bg-accent transition-transform duration-700 ease-in-out ${i <= currentStep ? 'translate-x-0' : '-translate-x-full'}`} />
                                    </div>
                                )}
                                <button
                                    onClick={() => setStep(i)}
                                    disabled={isAnimating}
                                    className={`w-10 h-10 rounded-full flex items-center justify-center text-xs font-semibold transition-all duration-300
                    ${currentStep === i
                                            ? 'bg-accent/20 text-white border-2 border-accent shadow-[0_0_15px_rgba(0,212,255,0.4)] scale-110'
                                            : i < currentStep
                                                ? 'bg-white/5 border border-accent/40 text-accent hover:bg-accent/10'
                                                : 'bg-white/5 border border-white/10 text-gray-500 hover:border-white/30 hover:text-gray-300'
                                        }`}
                                >
                                    {i === 0 ? <RefreshCw size={14} /> : i}
                                </button>
                            </React.Fragment>
                        ))}
                    </div>

                    <button
                        onClick={nextStep}
                        disabled={currentStep === STEPS.length - 1 || isAnimating}
                        className="p-2 text-gray-400 hover:text-white disabled:opacity-30 transition-colors"
                    >
                        <ChevronRight size={20} />
                    </button>
                </div>
            </footer>
        </div>
    );
};
