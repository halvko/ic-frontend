import { Component, Show, createMemo } from 'solid-js';
import type { TaskState } from '../dataLayer';

export interface TaskProps {
  taskState: TaskState;
  onToggle: (taskId: string) => void;
  onEdit?: (taskId: string) => void;
  onDelete?: (taskId: string) => void;
  onAddDependency?: (taskId: string) => void;
  showDependencies?: boolean;
  showDependents?: boolean;
  compact?: boolean;
}

const Task: Component<TaskProps> = (props) => {
  const task = () => props.taskState.task;
  const isActionable = () => props.taskState.isActionable;
  const dependents = () => props.taskState.dependents;
  const dependencies = () => task().dependencies;

  // Compute visual state
  const visualState = createMemo(() => {
    if (task().done) return 'completed';
    if (isActionable()) return 'actionable';
    return 'blocked';
  });

  const stateClasses = () => {
    const base = 'p-4 border rounded-lg transition-all duration-200';
    switch (visualState()) {
      case 'completed':
        return `${base} bg-green-50 border-green-200 text-green-800`;
      case 'actionable':
        return `${base} bg-blue-50 border-blue-200 text-blue-800 shadow-sm`;
      case 'blocked':
        return `${base} bg-gray-50 border-gray-200 text-gray-600`;
      default:
        return base;
    }
  };

  const statusIcon = () => {
    switch (visualState()) {
      case 'completed':
        return '✓';
      case 'actionable':
        return '▶';
      case 'blocked':
        return '⏸';
      default:
        return '';
    }
  };

  return (
    <div class={stateClasses()}>
      {/* Main task content */}
      <div class="flex items-center gap-3">
        <input
          type="checkbox"
          checked={task().done}
          disabled={!isActionable() && !task().done}
          onChange={() => props.onToggle(task().id)}
          class="w-4 h-4 rounded border-2 transition-colors"
          classList={{
            'border-green-400 bg-green-100': task().done,
            'border-blue-400 bg-blue-50': !task().done && isActionable(),
            'border-gray-300 bg-gray-100 cursor-not-allowed':
              !task().done && !isActionable(),
          }}
        />

        <div class="flex-1 min-w-0">
          <div class="flex items-center gap-2">
            <span class="text-sm font-medium">{statusIcon()}</span>
            <h3
              class="font-semibold text-sm"
              classList={{
                'line-through': task().done,
              }}
            >
              {task().title}
            </h3>
          </div>

          <Show when={task().description}>
            <p class="text-sm text-gray-600 mt-1">{task().description}</p>
          </Show>
        </div>

        {/* Action buttons */}
        <div class="flex gap-1">
          <Show when={props.onEdit}>
            <button
              onClick={() => props.onEdit!(task().id)}
              class="p-1 rounded hover:bg-gray-200 transition-colors"
              title="Edit task"
            >
              ✏️
            </button>
          </Show>

          <Show when={props.onAddDependency}>
            <button
              onClick={() => props.onAddDependency!(task().id)}
              class="p-1 rounded hover:bg-gray-200 transition-colors"
              title="Add dependency"
            >
              🔗
            </button>
          </Show>

          <Show when={props.onDelete}>
            <button
              onClick={() => props.onDelete!(task().id)}
              class="p-1 rounded hover:bg-red-200 transition-colors text-red-600"
              title="Delete task"
              disabled={dependents().length > 0}
            >
              🗑️
            </button>
          </Show>
        </div>
      </div>

      {/* Dependencies and dependents info */}
      <Show
        when={
          !props.compact && (props.showDependencies || props.showDependents)
        }
      >
        <div class="mt-3 pt-3 border-t border-gray-200">
          <Show when={props.showDependencies && dependencies().length > 0}>
            <div class="mb-2">
              <span class="text-xs font-medium text-gray-500">Depends on:</span>
              <div class="flex flex-wrap gap-1 mt-1">
                {dependencies().map((depId) => (
                  <span class="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                    {depId}
                  </span>
                ))}
              </div>
            </div>
          </Show>

          <Show when={props.showDependents && dependents().length > 0}>
            <div>
              <span class="text-xs font-medium text-gray-500">Blocks:</span>
              <div class="flex flex-wrap gap-1 mt-1">
                {dependents().map((depId) => (
                  <span class="px-2 py-1 bg-yellow-100 text-yellow-700 text-xs rounded">
                    {depId}
                  </span>
                ))}
              </div>
            </div>
          </Show>
        </div>
      </Show>

      {/* Status explanation for blocked tasks */}
      <Show when={visualState() === 'blocked' && !props.compact}>
        <div class="mt-2 p-2 bg-gray-100 rounded text-xs text-gray-600">
          This task is blocked because it depends on incomplete tasks.
        </div>
      </Show>
    </div>
  );
};

export default Task;
