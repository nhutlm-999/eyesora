import React, { useState } from 'react';
import { ChevronDown, AlertCircle } from 'lucide-react';
import RecommendationCard from './RecommendationCard.jsx';

const RecommendationGroup = ({ title, items, defaultOpen = true, onViewList, iconColor = 'text-gray-700' }) => {
    const [open, setOpen] = useState(defaultOpen);

    if (!items || items.length === 0) return null;

    return (
        <section className="space-y-2.5">
            <button
                type="button"
                onClick={() => setOpen(!open)}
                className="w-full flex items-center justify-between text-xs font-bold uppercase tracking-wider text-gray-700 py-1 border-b border-gray-100 hover:text-gray-900 transition-colors"
            >
                <div className="flex items-center gap-1.5">
                    <AlertCircle className={`w-4 h-4 ${iconColor}`} />
                    <span>{title} ({items.length})</span>
                </div>
                <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
            </button>

            {open && (
                <div className="space-y-2.5 pt-1">
                    {items.map((it, idx) => (
                        <RecommendationCard
                            key={`${it.code}-${it.scopeName}-${idx}`}
                            item={it}
                            onViewList={onViewList}
                        />
                    ))}
                </div>
            )}
        </section>
    );
};

export default RecommendationGroup;
