
import React from 'react';
import { LogEntry } from '../types';
import { Terminal, AlertCircle, CheckCircle, Info, AlertTriangle } from 'lucide-react';

interface EventLogProps {
    logs: LogEntry[];
}

export const EventLog: React.FC<EventLogProps> = ({ logs }) => {
    // On mobile, only show the last 3 logs to save space
    const isMobile = typeof window !== 'undefined' && window.innerWidth < 1024;
    const displayLogs = logs;

    return (
        <div className="flex flex-col min-h-0 max-h-20 lg:max-h-none lg:flex-1 border-t border-slate-800">
            <EventLogHeader count={logs.length} />
            <EventLogBody logs={displayLogs} />
        </div>
    );
};

const EventLogHeader: React.FC<{ count: number }> = ({ count }) => (
    <div className="px-2 py-1 lg:p-3 bg-slate-900/80 backdrop-blur-sm border-b border-slate-800 flex justify-between items-center shrink-0">
        <h3 className="text-[9px] lg:text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1 lg:gap-2">
            <Terminal size={10} className="text-slate-500 lg:w-3 lg:h-3" />
            Log
            <span className="bg-slate-800 text-slate-500 px-1 py-0.5 rounded-full text-[8px] lg:text-[10px]">{count}</span>
        </h3>
    </div>
);

const EventLogBody: React.FC<{ logs: LogEntry[] }> = ({ logs }) => (
    <div className="flex-1 overflow-y-auto px-1 py-0.5 lg:p-3 space-y-0 lg:space-y-1 font-mono text-[8px] lg:text-xs bg-slate-950/30">
        {logs.length === 0 ? (
            <EmptyLogState />
        ) : (
            logs.map((log) => <LogEntryItem key={log.id} log={log} />)
        )}
    </div>
);

const EmptyLogState: React.FC = () => (
    <div className="h-full flex items-center justify-center text-slate-600 py-1 lg:p-6">
        <p className="text-slate-500 text-[8px] lg:text-sm">Waiting...</p>
    </div>
);

interface LogEntryItemProps {
    log: LogEntry;
}

const LogEntryItem: React.FC<LogEntryItemProps> = ({ log }) => {
    const config = getLogConfig(log.type);
    const Icon = config.icon;

    return (
        <div className={`flex items-center gap-1 px-1 py-0.5 lg:gap-2 lg:p-2 rounded ${config.bgClass}`}>
            <Icon size={8} className={`shrink-0 ${config.iconColor} lg:w-3 lg:h-3`} />
            <span className={`flex-1 truncate ${config.textColor}`}>{log.message}</span>
            <span className="text-slate-600 shrink-0 text-[7px] lg:text-[10px] hidden lg:inline">{log.timestamp}</span>
        </div>
    );
};

interface LogConfig {
    icon: React.FC<{ size: number; className?: string }>;
    iconColor: string;
    textColor: string;
    bgClass: string;
}

/**
 * Simple log styling based on type only - no complex syntax highlighting
 */
function getLogConfig(type: LogEntry['type']): LogConfig {
    switch (type) {
        case 'error':
            return {
                icon: AlertCircle,
                iconColor: 'text-red-400',
                textColor: 'text-red-300',
                bgClass: 'bg-red-500/10'
            };
        case 'warn':
            return {
                icon: AlertTriangle,
                iconColor: 'text-amber-400',
                textColor: 'text-amber-200',
                bgClass: 'bg-amber-500/10'
            };
        case 'success':
            return {
                icon: CheckCircle,
                iconColor: 'text-emerald-400',
                textColor: 'text-emerald-300',
                bgClass: 'bg-emerald-500/10'
            };
        case 'info':
        default:
            return {
                icon: Info,
                iconColor: 'text-slate-500',
                textColor: 'text-slate-300',
                bgClass: 'bg-transparent'
            };
    }
}
