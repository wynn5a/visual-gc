
import React from 'react';
import { LogEntry } from '../types';
import { Terminal, AlertCircle, CheckCircle, Info, AlertTriangle } from 'lucide-react';

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
    </div>
);

const EventLogBody: React.FC<{ logs: LogEntry[] }> = ({ logs }) => (
    <div className="flex-1 overflow-y-auto p-3 space-y-1 font-mono text-xs bg-slate-950/30">
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
                Click <span className="text-emerald-400">Play</span> to begin
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
        <div className={`flex items-start gap-2 p-2 rounded-md ${config.bgClass}`}>
            <Icon size={12} className={`shrink-0 mt-0.5 ${config.iconColor}`} />
            <span className={`flex-1 ${config.textColor}`}>{log.message}</span>
            <span className="text-slate-600 shrink-0 text-[10px]">{log.timestamp}</span>
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
