import React from 'react';
import { Trophy, Bot } from 'lucide-react';

/**
 * UserBadge — Trophy icon cạnh tên user dựa trên số followers.
 * Props:
 *   followers (number) — Số followers của user, nhận từ API
 *   size      (number) — Kích thước icon (default: 16)
 */
const TIERS = [
    { min: 10000, color: '#FFD700', glow: 'rgba(255,215,0,0.7)', label: 'VIP',    vip: true  },
    { min: 1000,  color: '#C0C0C0', glow: 'rgba(192,192,192,0.5)', label: 'KOL',  vip: false },
    { min: 100,   color: '#CD7F32', glow: 'rgba(205,127,50,0.4)',   label: null,   vip: false },
];

const UserBadge = ({ role, followers = 0, size = 16 }) => {
    if (role === 'admin') {
        return (
            <span
                className="inline-flex items-center gap-0.5 flex-shrink-0"
                title="System Administrator"
            >
                <Bot
                    size={size}
                    strokeWidth={1.5}
                    className="text-cyan-500 fill-cyan-500/20 drop-shadow-[0_0_5px_rgba(6,182,212,0.5)] animate-in spin-in-12 duration-1000"
                />
            </span>
        );
    }

    const tier = TIERS.find(t => followers >= t.min);
    if (!tier) return null;

    return (
        <span
            className="inline-flex items-center gap-0.5 flex-shrink-0"
            title={`${followers.toLocaleString()} followers — ${tier.label || 'Rising Star'}`}
        >
            <Trophy
                size={size}
                strokeWidth={1.5}
                fill={tier.vip ? tier.color : 'none'}
                style={{
                    color: tier.color,
                    filter: `drop-shadow(0 0 ${tier.vip ? '6px' : '3px'} ${tier.glow})`,
                    animation: tier.vip ? 'pulse 2s ease-in-out infinite' : 'none',
                }}
            />
            {tier.label && (
                <span
                    className="text-[8px] font-black px-1 py-0.5 rounded leading-none"
                    style={{
                        color: tier.color,
                        border: `1px solid ${tier.color}44`,
                        background: `${tier.color}15`,
                        textShadow: tier.vip ? `0 0 6px ${tier.glow}` : 'none',
                        animation: tier.vip ? 'pulse 2s ease-in-out infinite' : 'none',
                    }}
                >
                    {tier.label}
                </span>
            )}
        </span>
    );
};

export default UserBadge;
