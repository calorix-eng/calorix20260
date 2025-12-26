import React from 'react';
import { XIcon } from './components/icons/XIcon';
import { StarIcon } from './components/icons/StarIcon';
import { ChartBarIcon } from './components/icons/ChartBarIcon';
import { SparklesIcon } from './components/icons/SparklesIcon';
import { BookOpenIcon } from './components/icons/BookOpenIcon';

interface GoPremiumModalProps {
    onClose: () => void;
    onUpgrade: () => void;
}

const GoPremiumModal: React.FC<GoPremiumModalProps> = ({ onClose, onUpgrade }) => {
    
    const Feature: React.FC<{ icon: React.ReactNode; title: string; description: string }> = ({ icon, title, description }) => (
        <div className="flex items-start space-x-4">
            <div className="flex-shrink-0 bg-accent-green/10 text-accent-green rounded-full p-2">
                {icon}
            </div>
            <div>
                <h4 className="font-bold text-light-text dark:text-dark-text">{title}</h4>
                <p className="text-sm text-gray-500 dark:text-gray-400">{description}</p>
            </div>
        </div>
    );

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4" onClick={onClose}>
            <div className="bg-light-card dark:bg-dark-card rounded-2xl shadow-2xl w-full max-w-md" onClick={e => e.stopPropagation()}>
                <div className="p-6 text-center border-b border-gray-200 dark:border-gray-700 relative">
                     <button onClick={onClose} className="absolute top-4 right-4 p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600">
                        <XIcon />
                    </button>
                    <div className="w-16 h-16 mx-auto bg-yellow-400/20 rounded-full flex items-center justify-center mb-4">
                        <StarIcon className="w-10 h-10 text-yellow-500" />
                    </div>
                    <h2 className="text-3xl font-bold font-display text-gray-800 dark:text-white">Seja calorix Premium</h2>
                    <p className="mt-2 text-gray-600 dark:text-gray-300">Desbloqueie todo o potencial do calorix com recursos exclusivos.</p>
                </div>
                
                <div className="p-8 space-y-6">
                    <Feature 
                        icon={<ChartBarIcon className="w-6 h-6" />}
                        title="Relatórios Avançados"
                        description="Analise gráficos detalhados sobre suas calorias, macros e hidratação para otimizar sua jornada."
                    />
                    <Feature 
                        icon={<BookOpenIcon className="w-6 h-6" />}
                        title="Receitas Exclusivas da IA"
                        description="Acesse um livro de receitas premium com pratos sofisticados e saudáveis criados pela nossa IA."
                    />
                     <Feature 
                        icon={<SparklesIcon className="w-6 h-6" />}
                        title="Recomendações Personalizadas"
                        description="Receba sugestões ainda mais inteligentes e personalizadas para atingir suas metas mais rápido."
                    />
                </div>

                <div className="p-6 pt-0">
                    <button
                        onClick={onUpgrade}
                        className="w-full flex items-center justify-center space-x-2 bg-yellow-400 text-yellow-900 p-4 rounded-lg font-bold hover:bg-yellow-500 transition-colors text-lg"
                    >
                        <span>Fazer Upgrade Agora</span>
                    </button>
                     <p className="text-xs text-gray-400 text-center mt-3">Isso é uma simulação. Nenhuma cobrança será feita.</p>
                </div>
            </div>
        </div>
    );
};

export default GoPremiumModal;
