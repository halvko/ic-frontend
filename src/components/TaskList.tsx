import { Component, For, createMemo, createSignal } from 'solid-js';
import type { TaskState } from '../dataLayer';
import Task from './Task';

export interface TaskListProps {
  tasks: TaskState[];
  onToggleTask: (taskId: string) => void;
  onEditTask?: (taskId: string) => void;
  onDeleteTask?: (taskId: string) => void;
  onAddDependency?: (taskId: string) => void;
  title?: string;
  showDependencies?: boolean;
  showDependents?: boolean;
  compact?: boolean;
  emptyMessage?: string;
  sortBy?: 'title' | 'created' | 'updated' | 'dependencies';
  groupBy?: 'none' | 'status' | 'dependencies';
}

type TaskFilter = 'all' | 'actionable' | 'blocked' | 'completed';

const TaskList: Component<TaskListProps> = (props) => {
  const [filter, setFilter] = createSignal<TaskFilter>('all');
  const [searchTerm, setSearchTerm] = createSignal('');

  // Filter and search tasks
  const filteredTasks = createMemo(() => {
    let tasks = props.tasks;

    // Apply status filter
    switch (filter()) {
      case 'actionable':
        tasks = tasks.filter((state) => !state.task.done && state.isActionable);
        break;
      case 'blocked':
        tasks = tasks.filter(
          (state) => !state.task.done && !state.isActionable,
        );
        break;
      case 'completed':
        tasks = tasks.filter((state) => state.task.done);
        break;
      case 'all':
      default:
        // No additional filtering
        break;
    }

    // Apply search filter
    const search = searchTerm().toLowerCase();
    if (search) {
      tasks = tasks.filter(
        (state) =>
          state.task.title.toLowerCase().includes(search) ||
          (state.task.description &&
            state.task.description.toLowerCase().includes(search)),
      );
    }

    return tasks;
  });

  // Sort tasks
  const sortedTasks = createMemo(() => {
    const tasks = [...filteredTasks()];

    switch (props.sortBy) {
      case 'title':
        return tasks.sort((a, b) => a.task.title.localeCompare(b.task.title));
      case 'created':
        return tasks.sort(
          (a, b) => a.task.createdAt.getTime() - b.task.createdAt.getTime(),
        );
      case 'updated':
        return tasks.sort(
          (a, b) => b.task.updatedAt.getTime() - a.task.updatedAt.getTime(),
        );
      case 'dependencies':
        return tasks.sort(
          (a, b) => a.task.dependencies.length - b.task.dependencies.length,
        );
      default:
        // Default: actionable first, then by creation date
        return tasks.sort((a, b) => {
          if (a.isActionable && !b.isActionable) return -1;
          if (!a.isActionable && b.isActionable) return 1;
          return a.task.createdAt.getTime() - b.task.createdAt.getTime();
        });
    }
  });

  // Group tasks
  const groupedTasks = createMemo(() => {
    const tasks = sortedTasks();

    if (props.groupBy === 'status') {
      const groups = {
        actionable: tasks.filter(
          (state) => !state.task.done && state.isActionable,
        ),
        blocked: tasks.filter(
          (state) => !state.task.done && !state.isActionable,
        ),
        completed: tasks.filter((state) => state.task.done),
      };
      return groups;
    } else if (props.groupBy === 'dependencies') {
      const groups = {
        noDeps: tasks.filter((state) => state.task.dependencies.length === 0),
        withDeps: tasks.filter((state) => state.task.dependencies.length > 0),
      };
      return groups;
    } else {
      return { all: tasks };
    }
  });

  const filterOptions: {
    value: TaskFilter;
    label: string;
    count: () => number;
  }[] = [
    {
      value: 'all',
      label: 'All Tasks',
      count: () => props.tasks.length,
    },
    {
      value: 'actionable',
      label: 'Actionable',
      count: () =>
        props.tasks.filter((state) => !state.task.done && state.isActionable)
          .length,
    },
    {
      value: 'blocked',
      label: 'Blocked',
      count: () =>
        props.tasks.filter((state) => !state.task.done && !state.isActionable)
          .length,
    },
    {
      value: 'completed',
      label: 'Completed',
      count: () => props.tasks.filter((state) => state.task.done).length,
    },
  ];

  const renderTaskGroup = (groupName: string, tasks: TaskState[]) => (
    <div class="space-y-2">
      {props.groupBy !== 'none' && (
        <h4 class="text-sm font-semibold text-gray-700 uppercase tracking-wide border-b pb-1">
          {groupName} ({tasks.length})
        </h4>
      )}
      <For each={tasks}>
        {(taskState) => (
          <Task
            taskState={taskState}
            onToggle={props.onToggleTask}
            onEdit={props.onEditTask}
            onDelete={props.onDeleteTask}
            onAddDependency={props.onAddDependency}
            showDependencies={props.showDependencies}
            showDependents={props.showDependents}
            compact={props.compact}
          />
        )}
      </For>
    </div>
  );

  return (
    <div class="space-y-4">
      {/* Header */}
      {props.title && (
        <h2 class="text-xl font-bold text-gray-900">{props.title}</h2>
      )}

      {/* Controls */}
      <div class="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        {/* Search */}
        <div class="flex-1 max-w-sm">
          <input
            type="text"
            placeholder="Search tasks..."
            value={searchTerm()}
            onInput={(e) => setSearchTerm(e.currentTarget.value)}
            class="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Filter buttons */}
        <div class="flex gap-2 flex-wrap">
          <For each={filterOptions}>
            {(option) => (
              <button
                onClick={() => setFilter(option.value)}
                class="px-3 py-1 text-sm rounded-full transition-colors"
                classList={{
                  'bg-blue-500 text-white': filter() === option.value,
                  'bg-gray-200 text-gray-700 hover:bg-gray-300':
                    filter() !== option.value,
                }}
              >
                {option.label}
                <span class="ml-1 text-xs opacity-75">({option.count()})</span>
              </button>
            )}
          </For>
        </div>
      </div>

      {/* Tasks */}
      <div class="space-y-6">
        {Object.entries(groupedTasks()).map(([groupName, tasks]) => {
          if (tasks.length === 0) return null;

          // Format group names for display
          const displayName =
            groupName === 'all'
              ? ''
              : groupName === 'noDeps'
                ? 'Independent Tasks'
                : groupName === 'withDeps'
                  ? 'Dependent Tasks'
                  : groupName.charAt(0).toUpperCase() + groupName.slice(1);

          return renderTaskGroup(displayName, tasks);
        })}

        {/* Empty state */}
        {filteredTasks().length === 0 && (
          <div class="text-center py-12">
            <div class="text-gray-400 text-6xl mb-4">📝</div>
            <h3 class="text-lg font-medium text-gray-900 mb-2">
              {searchTerm() ? 'No matching tasks' : 'No tasks yet'}
            </h3>
            <p class="text-gray-500">
              {props.emptyMessage ||
                (searchTerm()
                  ? 'Try adjusting your search terms'
                  : 'Create your first task to get started')}
            </p>
          </div>
        )}
      </div>

      {/* Summary stats */}
      {props.tasks.length > 0 && (
        <div class="pt-4 border-t border-gray-200">
          <div class="flex gap-6 text-sm text-gray-600">
            <span>Total: {props.tasks.length}</span>
            <span>
              Actionable:{' '}
              {props.tasks.filter((s) => !s.task.done && s.isActionable).length}
            </span>
            <span>
              Blocked:{' '}
              {
                props.tasks.filter((s) => !s.task.done && !s.isActionable)
                  .length
              }
            </span>
            <span>
              Completed: {props.tasks.filter((s) => s.task.done).length}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default TaskList;
