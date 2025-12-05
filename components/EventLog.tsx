
import React from 'react';
import { LogEntry } from '../types';
import { Terminal, AlertCircle, CheckCircle, Info, AlertTriangle, Zap } from 'lucide-react';

interface EventLogProps {
    logs: LogEntry[];
}

export const EventLog: React.FC<EventLogProps> = ({ logs }) => {
    return (
        <div className="flex-1 flex flex-col min-h-0 border-t border-slate-800">
            <EventLogHeader count={logs.length} />
            <EventLogBody logs={logs} />
        </div>
    );
};

const EventLogHeader: React.FC<{ count: number }> = ({ count }) => (
    <div className="p-3 bg-slate-900/80 backdrop-blur-sm border-b border-slate-800 flex justify-between items-center">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
            <Terminal size={12} className="text-slate-500" />
            GC Event Log
            <span className="bg-slate-800 text-slate-500 px-1.5 py-0.5 rounded-full text-[10px]">{count}</span>
        </h3>
        {count > 0 && (
            <span className="text-[10px] text-slate-600 flex items-center gap-1">
                <Zap size={10} />
                Live events
            </span>
        )}
    </div>
);

const EventLogBody: React.FC<{ logs: LogEntry[] }> = ({ logs }) => (
    <div className="flex-1 overflow-y-auto p-3 space-y-1.5 font-mono text-xs custom-scrollbar bg-slate-950/30">
        {logs.length === 0 ? (
            <EmptyLogState />
        ) : (
            logs.map((log) => <LogEntryItem key={log.id} log={log} />)
        )}
    </div>
);

const EmptyLogState: React.FC = () => (
    <div className="h-full flex flex-col items-center justify-center text-slate-600 p-6">
        <div className="bg-slate-800/50 rounded-xl p-4 text-center">
            <Terminal size={24} className="mx-auto mb-2 text-slate-600" />
            <p className="text-slate-400 text-sm font-medium">Ready to start</p>
            <p className="text-slate-600 text-xs mt-1">
                Click <span className="text-emerald-400">Play</span> to begin allocation
            </p>
        </div>
    </div>
);

interface LogEntryItemProps {
    log: LogEntry;
}

const LogEntryItem: React.FC<LogEntryItemProps> = ({ log }) => {
    const config = getLogConfig(log.type);
    const Icon = config.icon;

    return (
        <div className={`flex gap-2 p-2 rounded-lg ${config.bgClass} transition-colors animate-in fade-in slide-in-from-left-2 duration-300`}>
            <Icon size={12} className={`shrink-0 mt-0.5 ${config.iconColor}`} />
            <div className="flex-1 min-w-0">
                <span className={`break-words ${config.textColor}`}>
                    {formatLogMessage(log.message)}
                </span>
            </div>
            <span className="text-slate-600 shrink-0 text-[10px] select-none">{log.timestamp}</span>
        </div>
    );
};

/**
 * Format log message to highlight important terms
 */
function formatLogMessage(message: string): React.ReactNode {
    // Highlight numbers and percentages
    const parts = message.split(/(\d+(?:\.\d+)?%?|\bEden\b|\bSurvivor\b|\bOld\b|\bHumongous\b|\bSTW\b|\bYoung GC\b|\bMixed GC\b|\bZGC\b)/g);

    return parts.map((part, i) => {
        if (/^\d+(?:\.\d+)?%?$/.test(part)) {
            return <span key={i} className="text-cyan-300 font-medium">{part}</span>;
        }
        if (part === 'Eden') {
            return <span key={i} className="text-emerald-400 font-medium">{part}</span>;
        }
        if (part === 'Survivor') {
            return <span key={i} className="text-cyan-400 font-medium">{part}</span>;
        }
        if (part === 'Old') {
            return <span key={i} className="text-amber-400 font-medium">{part}</span>;
        }
        if (part === 'Humongous') {
            return <span key={i} className="text-purple-400 font-medium">{part}</span>;
        }
        if (part === 'STW' || part === 'Young GC' || part === 'Mixed GC') {
            return <span key={i} className="text-red-400 font-medium">{part}</span>;
        }
        if (part === 'ZGC') {
            return <span key={i} className="text-indigo-400 font-medium">{part}</span>;
        }
        return part;
    });
}

interface LogConfig {
    icon: React.FC<{ size: number; className?: string }>;
    iconColor: string;
    textColor: string;
    bgClass: string;
}

/**
 * Returns the configuration for log entry styling based on type
 */
function getLogConfig(type: LogEntry['type']): LogConfig {
    switch (type) {
        case 'error':
            return {
                icon: AlertCircle,
                iconColor: 'text-red-400',
                textColor: 'text-red-300',
                bgClass: 'bg-red-500/5 hover:bg-red-500/10 border-l-2 border-red-500/50'
            };
        case 'warn':
            return {
                icon: AlertTriangle,
                iconColor: 'text-amber-400',
                textColor: 'text-amber-300',
                bgClass: 'bg-amber-500/5 hover:bg-amber-500/10 border-l-2 border-amber-500/50'
            };
        case 'success':
            return {
                icon: CheckCircle,
                iconColor: 'text-emerald-400',
                textColor: 'text-emerald-300',
                bgClass: 'bg-emerald-500/5 hover:bg-emerald-500/10 border-l-2 border-emerald-500/50'
            };
        case 'info':
        default:
            return {
                icon: Info,
                iconColor: 'text-slate-500',
                textColor: 'text-slate-300',
                bgClass: 'bg-slate-800/20 hover:bg-slate-800/40'
            };
    }
}
