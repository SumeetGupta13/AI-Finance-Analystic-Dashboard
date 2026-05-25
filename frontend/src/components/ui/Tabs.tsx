import { cn } from '../../utils/cn';

type Tab = {
  value: string;
  label: string;
};

type TabsProps = {
  tabs: Tab[];
  value: string;
  onChange: (value: string) => void;
};

export default function Tabs({ tabs, value, onChange }: TabsProps) {
  return (
    <div className="inline-flex rounded-md border border-white/10 bg-white/[0.05] p-1">
      {tabs.map((tab) => (
        <button
          key={tab.value}
          type="button"
          onClick={() => onChange(tab.value)}
          className={cn(
            'h-9 rounded px-4 text-sm font-semibold text-white/56 transition',
            value === tab.value ? 'bg-white/12 text-white shadow-lg' : 'hover:text-white'
          )}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
