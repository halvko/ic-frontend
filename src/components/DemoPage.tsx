import { Component, createSignal, For, Show } from 'solid-js';
import {
  demoScenarios,
  loadDemoScenario,
  clearAllTasks,
  createRandomTasks,
  validateCurrentDAG,
} from '../demoData';
import { TaskDataLayer, createTaskQueries } from '../dataLayer';
import TaskList from './TaskList';

const DemoPage: Component = () => {
  const queries = createTaskQueries();
  const [selectedScenario, setSelectedScenario] = createSignal<string | null>(
    null,
  );
  const [isLoading, setIsLoading] = createSignal(false);
  const [message, setMessage] = createSignal<string | null>(null);
  const [messageType, setMessageType] = createSignal<
    'success' | 'error' | 'info'
  >('info');

  const showMessage = (
    text: string,
    type: 'success' | 'error' | 'info' = 'info',
  ) => {
    setMessage(text);
    setMessageType(type);
    setTimeout(() => setMessage(null), 3000);
  };

  const handleLoadScenario = async (scenarioName: string) => {
    setIsLoading(true);
    try {
      loadDemoScenario(scenarioName);
      setSelectedScenario(scenarioName);
      showMessage(`Loaded scenario: ${scenarioName}`, 'success');
    } catch (error) {
      showMessage(`Failed to load scenario: ${error}`, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearAll = async () => {
    setIsLoading(true);
    try {
      clearAllTasks();
      setSelectedScenario(null);
      showMessage('All tasks cleared', 'success');
    } catch (error) {
      showMessage(`Failed to clear tasks: ${error}`, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateRandom = async () => {
    setIsLoading(true);
    try {
      createRandomTasks(10);
      showMessage('Created 10 random tasks', 'success');
    } catch (error) {
      showMessage(`Failed to create random tasks: ${error}`, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleValidateDAG = () => {
    const validation = validateCurrentDAG();
    showMessage(validation.message, validation.valid ? 'success' : 'error');
  };

  const handleToggleTask = (taskId: string) => {
    try {
      TaskDataLayer.toggleTaskComplete(taskId);
    } catch (error) {
      showMessage(`Failed to toggle task: ${error}`, 'error');
    }
  };

  const stats = queries.stats;
  const allTasks = queries.tasks;

  return (
    <div class="min-h-screen bg-gray-50">
      <div class="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div class="mb-8">
          <h1 class="text-4xl font-bold text-gray-900 mb-2">
            Task Management Demo
          </h1>
          <p class="text-gray-600 text-lg">
            Explore different scenarios showcasing DAG-based task dependencies
          </p>
        </div>

        {/* Message Display */}
        <Show when={message()}>
          <div
            class={`mb-6 p-4 rounded-lg border ${
              messageType() === 'success'
                ? 'bg-green-50 border-green-200 text-green-800'
                : messageType() === 'error'
                  ? 'bg-red-50 border-red-200 text-red-800'
                  : 'bg-blue-50 border-blue-200 text-blue-800'
            }`}
          >
            <div class="flex items-center">
              <span class="mr-2">
                {messageType() === 'success'
                  ? '✅'
                  : messageType() === 'error'
                    ? '❌'
                    : 'ℹ️'}
              </span>
              <span class="whitespace-pre-line">{message()}</span>
            </div>
          </div>
        </Show>

        <div class="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar - Demo Controls */}
          <div class="lg:col-span-1 space-y-6">
            {/* Demo Scenarios */}
            <div class="bg-white rounded-lg shadow-sm border p-6">
              <h3 class="text-lg font-semibold text-gray-900 mb-4">
                Demo Scenarios
              </h3>
              <div class="space-y-2">
                <For each={demoScenarios}>
                  {(scenario) => (
                    <button
                      onClick={() => handleLoadScenario(scenario.name)}
                      disabled={isLoading()}
                      class={`w-full text-left p-3 rounded-lg border transition-colors ${
                        selectedScenario() === scenario.name
                          ? 'bg-blue-50 border-blue-200 text-blue-800'
                          : 'hover:bg-gray-50 border-gray-200'
                      }`}
                    >
                      <div class="font-medium text-sm">{scenario.name}</div>
                      <div class="text-xs text-gray-500 mt-1">
                        {scenario.description}
                      </div>
                      <div class="text-xs text-gray-400 mt-1">
                        {scenario.tasks.length} tasks
                      </div>
                    </button>
                  )}
                </For>
              </div>
            </div>

            {/* Utilities */}
            <div class="bg-white rounded-lg shadow-sm border p-6">
              <h3 class="text-lg font-semibold text-gray-900 mb-4">
                Utilities
              </h3>
              <div class="space-y-3">
                <button
                  onClick={handleCreateRandom}
                  disabled={isLoading()}
                  class="w-full bg-purple-500 text-white py-2 px-4 rounded-md text-sm font-medium hover:bg-purple-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Generate Random Tasks
                </button>

                <button
                  onClick={handleValidateDAG}
                  disabled={isLoading() || allTasks().length === 0}
                  class="w-full bg-green-500 text-white py-2 px-4 rounded-md text-sm font-medium hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Validate DAG
                </button>

                <button
                  onClick={handleClearAll}
                  disabled={isLoading() || allTasks().length === 0}
                  class="w-full bg-red-500 text-white py-2 px-4 rounded-md text-sm font-medium hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Clear All Tasks
                </button>
              </div>
            </div>

            {/* Current Stats */}
            <div class="bg-white rounded-lg shadow-sm border p-6">
              <h3 class="text-lg font-semibold text-gray-900 mb-4">
                Current Stats
              </h3>
              <div class="space-y-3">
                <div class="flex justify-between">
                  <span class="text-sm text-gray-600">Total Tasks:</span>
                  <span class="font-semibold">{stats().total}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-sm text-green-600">Completed:</span>
                  <span class="font-semibold text-green-600">
                    {stats().completed}
                  </span>
                </div>
                <div class="flex justify-between">
                  <span class="text-sm text-blue-600">Actionable:</span>
                  <span class="font-semibold text-blue-600">
                    {stats().actionable}
                  </span>
                </div>
                <div class="flex justify-between">
                  <span class="text-sm text-yellow-600">Blocked:</span>
                  <span class="font-semibold text-yellow-600">
                    {stats().blocked}
                  </span>
                </div>
              </div>

              <Show when={stats().total > 0}>
                <div class="mt-4 pt-4 border-t">
                  <div class="text-xs text-gray-500 mb-2">Progress</div>
                  <div class="w-full bg-gray-200 rounded-full h-2">
                    <div
                      class="bg-green-500 h-2 rounded-full transition-all duration-300"
                      style={{
                        width: `${(stats().completed / stats().total) * 100}%`,
                      }}
                    />
                  </div>
                  <div class="text-xs text-gray-500 mt-1 text-center">
                    {Math.round((stats().completed / stats().total) * 100)}%
                    complete
                  </div>
                </div>
              </Show>
            </div>

            {/* Architecture Info */}
            <div class="bg-white rounded-lg shadow-sm border p-6">
              <h3 class="text-lg font-semibold text-gray-900 mb-4">
                Architecture Features
              </h3>
              <div class="space-y-3 text-sm text-gray-600">
                <div class="flex items-center gap-2">
                  <span class="text-green-500">✓</span>
                  <span>Reactive data layer with SolidJS stores</span>
                </div>
                <div class="flex items-center gap-2">
                  <span class="text-green-500">✓</span>
                  <span>DAG validation and cycle detection</span>
                </div>
                <div class="flex items-center gap-2">
                  <span class="text-green-500">✓</span>
                  <span>Automatic dependency resolution</span>
                </div>
                <div class="flex items-center gap-2">
                  <span class="text-green-500">✓</span>
                  <span>Reusable component architecture</span>
                </div>
                <div class="flex items-center gap-2">
                  <span class="text-yellow-500">○</span>
                  <span>Sync-ready event system</span>
                </div>
                <div class="flex items-center gap-2">
                  <span class="text-yellow-500">○</span>
                  <span>Offline-first design</span>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content - Task Lists */}
          <div class="lg:col-span-3 space-y-8">
            <Show when={allTasks().length === 0}>
              <div class="bg-white rounded-lg shadow-sm border p-12 text-center">
                <div class="text-6xl text-gray-400 mb-4">🚀</div>
                <h2 class="text-2xl font-bold text-gray-900 mb-2">
                  Welcome to the Task Management Demo
                </h2>
                <p class="text-gray-600 mb-6">
                  Choose a demo scenario from the sidebar to explore how
                  DAG-based task dependencies work.
                </p>
                <div class="text-sm text-gray-500 space-y-2">
                  <p>
                    <strong>Key Features:</strong>
                  </p>
                  <ul class="list-disc list-inside space-y-1">
                    <li>
                      Tasks become actionable only when all dependencies are
                      complete
                    </li>
                    <li>
                      Automatic cycle detection prevents invalid dependency
                      chains
                    </li>
                    <li>Real-time updates when task states change</li>
                    <li>
                      Separation of data layer from presentation components
                    </li>
                  </ul>
                </div>
              </div>
            </Show>

            <Show when={allTasks().length > 0}>
              {/* Actionable Tasks */}
              <div class="bg-white rounded-lg shadow-sm border">
                <div class="p-6">
                  <TaskList
                    tasks={queries.actionableTasks()}
                    onToggleTask={handleToggleTask}
                    title="🚀 Ready to Work On"
                    showDependencies={true}
                    emptyMessage="All tasks are either completed or blocked by dependencies"
                    groupBy="none"
                    sortBy="dependencies"
                  />
                </div>
              </div>

              {/* Blocked Tasks */}
              <Show when={queries.blockedTasks().length > 0}>
                <div class="bg-white rounded-lg shadow-sm border">
                  <div class="p-6">
                    <TaskList
                      tasks={queries.blockedTasks()}
                      onToggleTask={handleToggleTask}
                      title="⏸️ Blocked Tasks"
                      showDependencies={true}
                      showDependents={true}
                      compact={false}
                      groupBy="none"
                    />
                  </div>
                </div>
              </Show>

              {/* Completed Tasks */}
              <Show when={queries.completedTasks().length > 0}>
                <div class="bg-white rounded-lg shadow-sm border">
                  <div class="p-6">
                    <TaskList
                      tasks={queries.completedTasks()}
                      onToggleTask={handleToggleTask}
                      title="✅ Completed Tasks"
                      compact={true}
                      groupBy="none"
                      sortBy="updated"
                    />
                  </div>
                </div>
              </Show>

              {/* Dependency Visualization */}
              <div class="bg-white rounded-lg shadow-sm border">
                <div class="p-6">
                  <h3 class="text-lg font-semibold text-gray-900 mb-4">
                    🔗 Dependency Overview
                  </h3>
                  <div class="space-y-4">
                    <For each={allTasks()}>
                      {(task) => {
                        const taskState = TaskDataLayer.getTaskState(task.id);
                        if (!taskState || task.dependencies.length === 0)
                          return null;

                        return (
                          <div class="border border-gray-200 rounded-lg p-4">
                            <div class="flex items-center gap-2 mb-2">
                              <span
                                class={`w-3 h-3 rounded-full ${
                                  task.done
                                    ? 'bg-green-500'
                                    : taskState.isActionable
                                      ? 'bg-blue-500'
                                      : 'bg-gray-400'
                                }`}
                              />
                              <span class="font-medium">{task.title}</span>
                              <span
                                class={`text-xs px-2 py-1 rounded ${
                                  task.done
                                    ? 'bg-green-100 text-green-800'
                                    : taskState.isActionable
                                      ? 'bg-blue-100 text-blue-800'
                                      : 'bg-gray-100 text-gray-600'
                                }`}
                              >
                                {task.done
                                  ? 'Complete'
                                  : taskState.isActionable
                                    ? 'Ready'
                                    : 'Blocked'}
                              </span>
                            </div>
                            <div class="text-sm text-gray-600 ml-5">
                              <span class="font-medium">Depends on:</span>
                              <div class="flex flex-wrap gap-1 mt-1">
                                <For each={task.dependencies}>
                                  {(depId) => {
                                    const depTask =
                                      TaskDataLayer.getTask(depId);
                                    if (!depTask) return null;

                                    return (
                                      <span
                                        class={`px-2 py-1 text-xs rounded ${
                                          depTask.done
                                            ? 'bg-green-100 text-green-700'
                                            : 'bg-red-100 text-red-700'
                                        }`}
                                      >
                                        {depTask.done ? '✓' : '○'}{' '}
                                        {depTask.title}
                                      </span>
                                    );
                                  }}
                                </For>
                              </div>
                            </div>
                          </div>
                        );
                      }}
                    </For>
                  </div>
                </div>
              </div>
            </Show>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DemoPage;
