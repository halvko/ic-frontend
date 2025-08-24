import { Component, createSignal, Show } from 'solid-js';
import { useTaskContext } from './TaskProvider';
import TaskList from './components/TaskList';
import TaskForm, { type TaskFormData } from './components/TaskForm';

const MainApp: Component = () => {
  const taskContext = useTaskContext();

  const [showTaskForm, setShowTaskForm] = createSignal(false);
  const [editingTaskId, setEditingTaskId] = createSignal<string | null>(null);
  const [isSubmitting, setIsSubmitting] = createSignal(false);
  const [error, setError] = createSignal<string | null>(null);

  const handleCreateTask = async (data: TaskFormData) => {
    setIsSubmitting(true);
    setError(null);

    try {
      await taskContext.createTask(data);
      setShowTaskForm(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create task');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateTask = async (data: TaskFormData) => {
    const taskId = editingTaskId();
    if (!taskId) return;

    setIsSubmitting(true);
    setError(null);

    try {
      await taskContext.updateTask(taskId, {
        title: data.title,
        description: data.description,
      });

      // Handle dependency changes
      const currentTask = taskContext.getTask(taskId)();
      if (currentTask) {
        const currentDeps = new Set(currentTask.dependencies);
        const newDeps = new Set(data.dependencies);

        // Add new dependencies
        for (const depId of newDeps) {
          if (!currentDeps.has(depId)) {
            await taskContext.addDependency(taskId, depId);
          }
        }

        // Remove old dependencies
        for (const depId of currentDeps) {
          if (!newDeps.has(depId)) {
            await taskContext.removeDependency(taskId, depId);
          }
        }
      }

      setEditingTaskId(null);
      setShowTaskForm(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update task');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleTask = async (taskId: string) => {
    try {
      await taskContext.toggleTaskComplete(taskId);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to toggle task');
    }
  };

  const handleEditTask = (taskId: string) => {
    setEditingTaskId(taskId);
    setShowTaskForm(true);
  };

  const handleDeleteTask = async (taskId: string) => {
    if (!confirm('Are you sure you want to delete this task?')) return;

    try {
      await taskContext.deleteTask(taskId);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete task');
    }
  };

  const handleCancelForm = () => {
    setShowTaskForm(false);
    setEditingTaskId(null);
    setError(null);
  };

  const editingTask = () => {
    const taskId = editingTaskId();
    return taskId ? taskContext.getTask(taskId)() : undefined;
  };

  const stats = taskContext.stats;

  return (
    <div class="max-w-6xl mx-auto px-4 py-8">
      {/* Header */}
      <header class="mb-8">
        <h1 class="text-3xl font-bold text-gray-900 mb-2">My Tasks</h1>
        <p class="text-gray-600 mb-4">
          Manage your tasks with dependency tracking and smart prioritization
        </p>

        {/* Stats */}
        <div class="flex gap-6 p-4 bg-white rounded-lg shadow-sm border">
          <div class="text-center">
            <div class="text-2xl font-bold text-blue-600">
              {stats().actionable}
            </div>
            <div class="text-sm text-gray-500">Actionable</div>
          </div>
          <div class="text-center">
            <div class="text-2xl font-bold text-yellow-600">
              {stats().blocked}
            </div>
            <div class="text-sm text-gray-500">Blocked</div>
          </div>
          <div class="text-center">
            <div class="text-2xl font-bold text-green-600">
              {stats().completed}
            </div>
            <div class="text-sm text-gray-500">Completed</div>
          </div>
          <div class="text-center">
            <div class="text-2xl font-bold text-gray-600">{stats().total}</div>
            <div class="text-sm text-gray-500">Total</div>
          </div>
        </div>
      </header>

      {/* Error display */}
      <Show when={error()}>
        <div class="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p class="text-red-700 text-sm">{error()}</p>
          <button
            onClick={() => setError(null)}
            class="text-red-600 hover:text-red-800 text-xs mt-1"
          >
            Dismiss
          </button>
        </div>
      </Show>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main task lists */}
        <div class="lg:col-span-2 space-y-8">
          {/* Actionable Tasks */}
          <div class="bg-white rounded-lg shadow-sm border">
            <div class="p-6">
              <TaskList
                tasks={taskContext.actionableTasks()}
                onToggleTask={handleToggleTask}
                onEditTask={handleEditTask}
                onDeleteTask={handleDeleteTask}
                title="🚀 Ready to Work On"
                showDependencies={true}
                emptyMessage="All tasks are either completed or blocked by dependencies"
                groupBy="none"
                sortBy="dependencies"
              />
            </div>
          </div>

          {/* Blocked Tasks */}
          <Show when={taskContext.blockedTasks().length > 0}>
            <div class="bg-white rounded-lg shadow-sm border">
              <div class="p-6">
                <TaskList
                  tasks={taskContext.blockedTasks()}
                  onToggleTask={handleToggleTask}
                  onEditTask={handleEditTask}
                  onDeleteTask={handleDeleteTask}
                  title="⏸️ Blocked Tasks"
                  showDependencies={true}
                  showDependents={true}
                  compact={true}
                  groupBy="none"
                />
              </div>
            </div>
          </Show>

          {/* Completed Tasks */}
          <Show when={taskContext.completedTasks().length > 0}>
            <div class="bg-white rounded-lg shadow-sm border">
              <div class="p-6">
                <TaskList
                  tasks={taskContext.completedTasks()}
                  onToggleTask={handleToggleTask}
                  onEditTask={handleEditTask}
                  onDeleteTask={handleDeleteTask}
                  title="✅ Completed Tasks"
                  compact={true}
                  groupBy="none"
                  sortBy="updated"
                />
              </div>
            </div>
          </Show>
        </div>

        {/* Sidebar */}
        <div class="space-y-6">
          {/* Quick Actions */}
          <div class="bg-white rounded-lg shadow-sm border p-6">
            <h3 class="text-lg font-semibold text-gray-900 mb-4">
              Quick Actions
            </h3>
            <div class="space-y-3">
              <button
                onClick={() => setShowTaskForm(true)}
                class="w-full bg-blue-500 text-white py-2 px-4 rounded-md text-sm font-medium hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                + Create New Task
              </button>
            </div>
          </div>

          {/* All Tasks Overview */}
          <div class="bg-white rounded-lg shadow-sm border p-6">
            <TaskList
              tasks={taskContext.tasks().map((task) => ({
                task,
                isActionable:
                  taskContext.getTaskState(task.id)()?.isActionable || false,
                dependents:
                  taskContext.getTaskState(task.id)()?.dependents || [],
                dependencyChain:
                  taskContext.getTaskState(task.id)()?.dependencyChain || [],
              }))}
              onToggleTask={handleToggleTask}
              onEditTask={handleEditTask}
              onDeleteTask={handleDeleteTask}
              title="All Tasks"
              compact={true}
              groupBy="status"
              showDependencies={false}
            />
          </div>

          {/* Connection Status */}
          <div class="bg-white rounded-lg shadow-sm border p-6">
            <h3 class="text-lg font-semibold text-gray-900 mb-4">Status</h3>
            <div class="space-y-2">
              <div class="flex items-center gap-2">
                <div
                  class={`w-2 h-2 rounded-full ${
                    taskContext.isOnline() ? 'bg-green-500' : 'bg-red-500'
                  }`}
                />
                <span class="text-sm text-gray-600">
                  {taskContext.isOnline() ? 'Online' : 'Offline'}
                </span>
              </div>
              <div class="flex items-center gap-2">
                <div
                  class={`w-2 h-2 rounded-full ${
                    taskContext.syncStatus() === 'idle'
                      ? 'bg-gray-400'
                      : taskContext.syncStatus() === 'syncing'
                        ? 'bg-blue-500'
                        : 'bg-red-500'
                  }`}
                />
                <span class="text-sm text-gray-600">
                  Sync: {taskContext.syncStatus()}
                </span>
              </div>
              <Show when={taskContext.lastSynced()}>
                <div class="text-xs text-gray-500 mt-2">
                  Last synced: {taskContext.lastSynced()?.toLocaleTimeString()}
                </div>
              </Show>
            </div>
          </div>
        </div>
      </div>

      {/* Task Form Modal */}
      <Show when={showTaskForm()}>
        <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <TaskForm
            task={editingTask()}
            availableTasks={taskContext.tasks()}
            onSubmit={editingTask() ? handleUpdateTask : handleCreateTask}
            onCancel={handleCancelForm}
            isSubmitting={isSubmitting()}
          />
        </div>
      </Show>
    </div>
  );
};

export default MainApp;
