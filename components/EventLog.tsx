
import React from 'react';
import { LogEntry } from '../types';

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
    <div className="p-3 bg-slate-900/80 border-b border-slate-800 flex justify-between items-center">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
            Event Log
            <span className="bg-slate-800 text-slate-500 px-1.5 rounded-full text-[10px]">{count}</span>
        </h3>
    </div>
);

const EventLogBody: React.FC<{ logs: LogEntry[] }> = ({ logs }) => (
    <div className="flex-1 overflow-y-auto p-3 space-y-2 font-mono text-xs custom-scrollbar">
        {logs.length === 0 ? (
            <EmptyLogState />
        ) : (
            logs.map((log) => <LogEntryItem key={log.id} log={log} />)
        )}
    </div>
);

const EmptyLogState: React.FC = () => (
    <div className="h-full flex flex-col items-center justify-center text-slate-600 italic">
        <p>Ready to start...</p>
    </div>
);

interface LogEntryItemProps {
    log: LogEntry;
}

const LogEntryItem: React.FC<LogEntryItemProps> = ({ log }) => {
    const typeColorClass = getLogTypeColor(log.type);

    return (
        <div className="flex gap-2 animate-in fade-in slide-in-from-left-2 duration-300">
            <span className="text-slate-600 shrink-0 select-none">[{log.timestamp}]</span>
            <span className={`break-words ${typeColorClass}`}>
                {log.message}
            </span>
        </div>
    );
};

/**
 * Returns the CSS class for log entry text based on type
 */
const getLogTypeColor = (type: LogEntry['type']): string => {
    switch (type) {
        case 'error':
            return 'text-red-400 font-bold';
        case 'warn':
            return 'text-amber-400';
        case 'success':
            return 'text-emerald-400';
        case 'info':
        default:
            return 'text-slate-300';
    }
};
