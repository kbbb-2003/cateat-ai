'use client';

import { Badge } from '@/components/ui/badge';
import { PRESET_ACTIONS, type ActionCategory } from '@/lib/data/video-actions';

interface ActionTagSelectorProps {
  selectedActions: string[];
  onSelectionChange: (actions: string[]) => void;
}

export function ActionTagSelector({
  selectedActions,
  onSelectionChange,
}: ActionTagSelectorProps) {
  const toggleAction = (actionId: string) => {
    if (selectedActions.includes(actionId)) {
      onSelectionChange(selectedActions.filter((id) => id !== actionId));
    } else {
      onSelectionChange([...selectedActions, actionId]);
    }
  };

  return (
    <div className="space-y-4">
      {PRESET_ACTIONS.map((category: ActionCategory) => (
        <div key={category.id}>
          <h4 className="text-sm font-medium text-gray-700 mb-2">
            {category.label}
          </h4>
          <div className="flex flex-wrap gap-2">
            {category.actions.map((action) => {
              const isSelected = selectedActions.includes(action.id);
              return (
                <Badge
                  key={action.id}
                  variant={isSelected ? 'default' : 'outline'}
                  className={`cursor-pointer transition-colors ${
                    isSelected
                      ? 'bg-amber-500 hover:bg-amber-600 text-white'
                      : 'hover:bg-gray-100'
                  }`}
                  onClick={() => toggleAction(action.id)}
                >
                  {action.label}
                </Badge>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
