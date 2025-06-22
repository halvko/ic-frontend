import { Component, createSignal, For, Show } from 'solid-js';
import type { Task } from '../dataLayer';

export interface TaskFormProps {
  task?: Task; // If provided, we're editing; otherwise creating
  availableTasks?: Task[]; // For dependency selection
  onSubmit: (data: TaskFormData) => void;
  onCancel: () => void;
  isSubmitting?: boolean;
}

export interface TaskFormData {
  title: string;
  description?: string;
  dependencies: string[];
}

const TaskForm: Component<TaskFormProps> = (props) => {
  const [title, setTitle] = createSignal(props.task?.title || '');
  const [description, setDescription] = createSignal(
    props.task?.description || '',
  );
  const [selectedDependencies, setSelectedDependencies] = createSignal<
    string[]
  >(props.task?.dependencies || []);
  const [showDependencyPicker, setShowDependencyPicker] = createSignal(false);

  const isEditing = () => !!props.task;
  const isValid = () => title().trim().length > 0;

  // Available tasks for dependency selection (exclude self if editing)
  const availableForDependencies = () => {
    const available = props.availableTasks || [];
    if (isEditing()) {
      return available.filter((t) => t.id !== props.task!.id);
    }
    return available;
  };

  const handleSubmit = (e: Event) => {
    e.preventDefault();
    if (!isValid()) return;

    props.onSubmit({
      title: title().trim(),
      description: description().trim() || undefined,
      dependencies: selectedDependencies(),
    });
  };

  const toggleDependency = (taskId: string) => {
    setSelectedDependencies((prev) => {
      if (prev.includes(taskId)) {
        return prev.filter((id) => id !== taskId);
      } else {
        return [...prev, taskId];
      }
    });
  };

  const removeDependency = (taskId: string) => {
    setSelectedDependencies((prev) => prev.filter((id) => id !== taskId));
  };

  return (
    <div class="bg-white p-6 rounded-lg shadow-lg border max-w-md w-full">
      <h3 class="text-lg font-semibold text-gray-900 mb-4">
        {isEditing() ? 'Edit Task' : 'Create New Task'}
      </h3>

      <form onSubmit={handleSubmit} class="space-y-4">
        {/* Title field */}
        <div>
          <label
            for="title"
            class="block text-sm font-medium text-gray-700 mb-1"
          >
            Title *
          </label>
          <input
            id="title"
            type="text"
            value={title()}
            onInput={(e) => setTitle(e.currentTarget.value)}
            placeholder="Enter task title..."
            class="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            classList={{
              'border-red-300': !isValid() && title().length > 0,
            }}
            disabled={props.isSubmitting}
          />
          <Show when={!isValid() && title().length > 0}>
            <p class="text-red-500 text-xs mt-1">Title is required</p>
          </Show>
        </div>

        {/* Description field */}
        <div>
          <label
            for="description"
            class="block text-sm font-medium text-gray-700 mb-1"
          >
            Description
          </label>
          <textarea
            id="description"
            value={description()}
            onInput={(e) => setDescription(e.currentTarget.value)}
            placeholder="Optional description..."
            rows={3}
            class="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            disabled={props.isSubmitting}
          />
        </div>

        {/* Dependencies section */}
        <div>
          <div class="flex items-center justify-between mb-2">
            <label class="block text-sm font-medium text-gray-700">
              Dependencies
            </label>
            <Show when={availableForDependencies().length > 0}>
              <button
                type="button"
                onClick={() => setShowDependencyPicker(!showDependencyPicker())}
                class="text-xs text-blue-600 hover:text-blue-700"
                disabled={props.isSubmitting}
              >
                {showDependencyPicker() ? 'Hide' : 'Add Dependencies'}
              </button>
            </Show>
          </div>

          {/* Selected dependencies */}
          <Show when={selectedDependencies().length > 0}>
            <div class="mb-2">
              <div class="text-xs text-gray-500 mb-1">
                This task depends on:
              </div>
              <div class="flex flex-wrap gap-1">
                <For each={selectedDependencies()}>
                  {(depId) => {
                    const depTask = availableForDependencies().find(
                      (t) => t.id === depId,
                    );
                    return (
                      <span class="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                        {depTask?.title || `Task ${depId.slice(0, 8)}`}
                        <button
                          type="button"
                          onClick={() => removeDependency(depId)}
                          class="text-blue-600 hover:text-blue-800"
                          disabled={props.isSubmitting}
                        >
                          ×
                        </button>
                      </span>
                    );
                  }}
                </For>
              </div>
            </div>
          </Show>

          {/* Dependency picker */}
          <Show when={showDependencyPicker()}>
            <div class="border border-gray-200 rounded-md p-3 bg-gray-50 max-h-40 overflow-y-auto">
              <Show
                when={availableForDependencies().length > 0}
                fallback={
                  <p class="text-sm text-gray-500">No other tasks available</p>
                }
              >
                <div class="space-y-1">
                  <For each={availableForDependencies()}>
                    {(task) => (
                      <label class="flex items-center gap-2 text-sm cursor-pointer hover:bg-white p-1 rounded">
                        <input
                          type="checkbox"
                          checked={selectedDependencies().includes(task.id)}
                          onChange={() => toggleDependency(task.id)}
                          class="w-3 h-3"
                          disabled={props.isSubmitting}
                        />
                        <span class="flex-1 truncate">
                          {task.title}
                          <Show when={task.done}>
                            <span class="text-green-600 ml-1">✓</span>
                          </Show>
                        </span>
                      </label>
                    )}
                  </For>
                </div>
              </Show>
            </div>
          </Show>
        </div>

        {/* Form actions */}
        <div class="flex gap-3 pt-4">
          <button
            type="submit"
            disabled={!isValid() || props.isSubmitting}
            class="flex-1 bg-blue-500 text-white py-2 px-4 rounded-md text-sm font-medium hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {props.isSubmitting
              ? 'Saving...'
              : isEditing()
                ? 'Update Task'
                : 'Create Task'}
          </button>
          <button
            type="button"
            onClick={props.onCancel}
            disabled={props.isSubmitting}
            class="px-4 py-2 border border-gray-300 text-gray-700 rounded-md text-sm font-medium hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
        </div>
      </form>

      {/* Help text */}
      <div class="mt-4 p-3 bg-blue-50 rounded-md">
        <p class="text-xs text-blue-700">
          <strong>Dependencies:</strong> This task will be blocked until all
          selected dependency tasks are completed. Choose carefully to avoid
          creating circular dependencies.
        </p>
      </div>
    </div>
  );
};

export default TaskForm;
