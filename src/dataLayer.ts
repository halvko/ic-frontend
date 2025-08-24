import { createStore, produce } from 'solid-js/store';
import { createSignal } from 'solid-js';

// Core task model
export interface Task {
  id: string;
  title: string;
  description?: string;
  done: boolean;
  dependencies: string[]; // Task IDs this task depends on
  createdAt: Date;
  updatedAt: Date;
}

// Task state computed from dependencies
export interface TaskState {
  task: Task;
  isActionable: boolean; // All dependencies are complete
  dependents: string[]; // Tasks that depend on this one
  dependencyChain: string[]; // All transitive dependencies
}

// Store type
interface TaskStore {
  tasks: Record<string, Task>;
  lastUpdated: Date;
}

// Create the main store
const [taskStore, setTaskStore] = createStore<TaskStore>({
  tasks: {},
  lastUpdated: new Date(),
});

// Event system for data layer changes
export type TaskEvent =
  | { type: 'task_created'; task: Task }
  | { type: 'task_updated'; task: Task }
  | { type: 'task_deleted'; taskId: string }
  | { type: 'task_completed'; taskId: string }
  | { type: 'dependency_added'; taskId: string; dependsOn: string }
  | { type: 'dependency_removed'; taskId: string; dependsOn: string };

const [events, setEvents] = createSignal<TaskEvent[]>([]);

// Utility functions for DAG operations
class DAGError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'DAGError';
  }
}

// Check if adding a dependency would create a cycle
function wouldCreateCycle(
  taskId: string,
  dependsOn: string,
  tasks: Record<string, Task>,
): boolean {
  const visited = new Set<string>();
  const recursionStack = new Set<string>();

  function hasCycle(currentId: string): boolean {
    if (recursionStack.has(currentId)) return true;
    if (visited.has(currentId)) return false;

    visited.add(currentId);
    recursionStack.add(currentId);

    const task = tasks[currentId];
    if (task) {
      for (const depId of task.dependencies) {
        if (hasCycle(depId)) return true;
      }
    }

    recursionStack.delete(currentId);
    return false;
  }

  // Temporarily add the dependency and check for cycles
  const tempTasks = { ...tasks };
  if (tempTasks[taskId]) {
    tempTasks[taskId] = {
      ...tempTasks[taskId],
      dependencies: [...tempTasks[taskId].dependencies, dependsOn],
    };
  }

  return hasCycle(taskId);
}

// Get all transitive dependencies of a task
function getTransitiveDependencies(
  taskId: string,
  tasks: Record<string, Task>,
): string[] {
  const visited = new Set<string>();
  const dependencies = new Set<string>();

  function collect(id: string) {
    if (visited.has(id)) return;
    visited.add(id);

    const task = tasks[id];
    if (task) {
      for (const depId of task.dependencies) {
        dependencies.add(depId);
        collect(depId);
      }
    }
  }

  collect(taskId);
  return Array.from(dependencies);
}

// Get all tasks that depend on a given task
function getDependents(taskId: string, tasks: Record<string, Task>): string[] {
  return Object.values(tasks)
    .filter((task) => task.dependencies.includes(taskId))
    .map((task) => task.id);
}

// Check if a task is actionable (all dependencies are complete)
function isTaskActionable(
  taskId: string,
  tasks: Record<string, Task>,
): boolean {
  const task = tasks[taskId];
  if (!task) return false;

  return task.dependencies.every((depId) => {
    const dep = tasks[depId];
    return dep && dep.done;
  });
}

// Data layer API
export const TaskDataLayer = {
  // Getters
  getTasks: () => taskStore.tasks,
  getTask: (id: string) => taskStore.tasks[id],
  getTasksArray: () => Object.values(taskStore.tasks),
  getLastUpdated: () => taskStore.lastUpdated,

  // Computed task states
  getTaskState: (taskId: string): TaskState | null => {
    const task = taskStore.tasks[taskId];
    if (!task) return null;

    return {
      task,
      isActionable: isTaskActionable(taskId, taskStore.tasks),
      dependents: getDependents(taskId, taskStore.tasks),
      dependencyChain: getTransitiveDependencies(taskId, taskStore.tasks),
    };
  },

  getAllTaskStates: (): TaskState[] => {
    return Object.keys(taskStore.tasks).map(
      (id) => TaskDataLayer.getTaskState(id)!,
    );
  },

  getActionableTasks: (): TaskState[] => {
    return TaskDataLayer.getAllTaskStates().filter(
      (state) => !state.task.done && state.isActionable,
    );
  },

  getCompletedTasks: (): TaskState[] => {
    return TaskDataLayer.getAllTaskStates().filter((state) => state.task.done);
  },

  getBlockedTasks: (): TaskState[] => {
    return TaskDataLayer.getAllTaskStates().filter(
      (state) => !state.task.done && !state.isActionable,
    );
  },

  // Mutations
  createTask: (params: {
    title: string;
    description?: string;
    dependencies?: string[];
  }): Task => {
    const id = crypto.randomUUID();
    const now = new Date();
    const task: Task = {
      id,
      title: params.title,
      description: params.description,
      done: false,
      dependencies: params.dependencies || [],
      createdAt: now,
      updatedAt: now,
    };

    // Validate dependencies exist
    for (const depId of task.dependencies) {
      if (!taskStore.tasks[depId]) {
        throw new Error(`Dependency task ${depId} does not exist`);
      }
    }

    // Check for cycles
    for (const depId of task.dependencies) {
      if (wouldCreateCycle(id, depId, { ...taskStore.tasks, [id]: task })) {
        throw new DAGError(`Adding dependency ${depId} would create a cycle`);
      }
    }

    setTaskStore(
      produce((store) => {
        store.tasks[id] = task;
        store.lastUpdated = now;
      }),
    );

    setEvents((prev) => [...prev, { type: 'task_created', task }]);
    return task;
  },

  updateTask: (
    id: string,
    updates: Partial<Pick<Task, 'title' | 'description'>>,
  ) => {
    const task = taskStore.tasks[id];
    if (!task) throw new Error(`Task ${id} not found`);

    const now = new Date();
    setTaskStore(
      produce((store) => {
        Object.assign(store.tasks[id], updates, { updatedAt: now });
        store.lastUpdated = now;
      }),
    );

    setEvents((prev) => [
      ...prev,
      { type: 'task_updated', task: taskStore.tasks[id] },
    ]);
  },

  toggleTaskComplete: (id: string) => {
    const task = taskStore.tasks[id];
    if (!task) throw new Error(`Task ${id} not found`);

    const now = new Date();
    setTaskStore(
      produce((store) => {
        store.tasks[id].done = !store.tasks[id].done;
        store.tasks[id].updatedAt = now;
        store.lastUpdated = now;
      }),
    );

    if (taskStore.tasks[id].done) {
      setEvents((prev) => [...prev, { type: 'task_completed', taskId: id }]);
    } else {
      setEvents((prev) => [
        ...prev,
        { type: 'task_updated', task: taskStore.tasks[id] },
      ]);
    }
  },

  deleteTask: (id: string) => {
    const task = taskStore.tasks[id];
    if (!task) throw new Error(`Task ${id} not found`);

    // Check if any other tasks depend on this one
    const dependents = getDependents(id, taskStore.tasks);
    if (dependents.length > 0) {
      throw new Error(
        `Cannot delete task ${id}: tasks ${dependents.join(', ')} depend on it`,
      );
    }

    const now = new Date();
    setTaskStore(
      produce((store) => {
        delete store.tasks[id];
        store.lastUpdated = now;
      }),
    );

    setEvents((prev) => [...prev, { type: 'task_deleted', taskId: id }]);
  },

  addDependency: (taskId: string, dependsOn: string) => {
    const task = taskStore.tasks[taskId];
    const dependency = taskStore.tasks[dependsOn];

    if (!task) throw new Error(`Task ${taskId} not found`);
    if (!dependency) throw new Error(`Dependency task ${dependsOn} not found`);
    if (task.dependencies.includes(dependsOn)) {
      throw new Error(`Task ${taskId} already depends on ${dependsOn}`);
    }

    // Check for cycles
    if (wouldCreateCycle(taskId, dependsOn, taskStore.tasks)) {
      throw new DAGError(`Adding dependency ${dependsOn} would create a cycle`);
    }

    const now = new Date();
    setTaskStore(
      produce((store) => {
        store.tasks[taskId].dependencies.push(dependsOn);
        store.tasks[taskId].updatedAt = now;
        store.lastUpdated = now;
      }),
    );

    setEvents((prev) => [
      ...prev,
      { type: 'dependency_added', taskId, dependsOn },
    ]);
  },

  removeDependency: (taskId: string, dependsOn: string) => {
    const task = taskStore.tasks[taskId];
    if (!task) throw new Error(`Task ${taskId} not found`);

    const index = task.dependencies.indexOf(dependsOn);
    if (index === -1) {
      throw new Error(`Task ${taskId} does not depend on ${dependsOn}`);
    }

    const now = new Date();
    setTaskStore(
      produce((store) => {
        store.tasks[taskId].dependencies.splice(index, 1);
        store.tasks[taskId].updatedAt = now;
        store.lastUpdated = now;
      }),
    );

    setEvents((prev) => [
      ...prev,
      { type: 'dependency_removed', taskId, dependsOn },
    ]);
  },

  // Event system
  getEvents: () => events(),
  clearEvents: () => setEvents([]),

  // Validation utilities
  validateDAG: (): { valid: boolean; cycles: string[][] } => {
    const cycles: string[][] = [];
    const visited = new Set<string>();
    const recursionStack = new Set<string>();
    const currentPath: string[] = [];

    function findCycles(taskId: string): void {
      if (recursionStack.has(taskId)) {
        const cycleStart = currentPath.indexOf(taskId);
        cycles.push([...currentPath.slice(cycleStart), taskId]);
        return;
      }

      if (visited.has(taskId)) return;

      visited.add(taskId);
      recursionStack.add(taskId);
      currentPath.push(taskId);

      const task = taskStore.tasks[taskId];
      if (task) {
        for (const depId of task.dependencies) {
          findCycles(depId);
        }
      }

      recursionStack.delete(taskId);
      currentPath.pop();
    }

    for (const taskId of Object.keys(taskStore.tasks)) {
      if (!visited.has(taskId)) {
        findCycles(taskId);
      }
    }

    return { valid: cycles.length === 0, cycles };
  },

  // Bulk operations
  importTasks: (tasks: Task[]) => {
    // Validate all tasks first
    const taskMap = Object.fromEntries(tasks.map((t) => [t.id, t]));

    for (const task of tasks) {
      for (const depId of task.dependencies) {
        if (!taskMap[depId] && !taskStore.tasks[depId]) {
          throw new Error(
            `Task ${task.id} depends on non-existent task ${depId}`,
          );
        }
      }
    }

    // Check for cycles in the combined graph
    const combinedTasks = { ...taskStore.tasks, ...taskMap };
    for (const task of tasks) {
      for (const depId of task.dependencies) {
        if (wouldCreateCycle(task.id, depId, combinedTasks)) {
          throw new DAGError(
            `Importing tasks would create a cycle involving ${task.id} -> ${depId}`,
          );
        }
      }
    }

    const now = new Date();
    setTaskStore(
      produce((store) => {
        for (const task of tasks) {
          store.tasks[task.id] = task;
        }
        store.lastUpdated = now;
      }),
    );

    for (const task of tasks) {
      setEvents((prev) => [...prev, { type: 'task_created', task }]);
    }
  },

  exportTasks: (): Task[] => {
    return Object.values(taskStore.tasks);
  },

  // Statistics
  getStats: () => {
    const allStates = TaskDataLayer.getAllTaskStates();
    return {
      total: allStates.length,
      completed: allStates.filter((s) => s.task.done).length,
      actionable: allStates.filter((s) => !s.task.done && s.isActionable)
        .length,
      blocked: allStates.filter((s) => !s.task.done && !s.isActionable).length,
    };
  },
};

// Reactive computed values that components can use
export const createTaskQueries = () => {
  const tasks = () => TaskDataLayer.getTasksArray();
  const actionableTasks = () => TaskDataLayer.getActionableTasks();
  const completedTasks = () => TaskDataLayer.getCompletedTasks();
  const blockedTasks = () => TaskDataLayer.getBlockedTasks();
  const stats = () => TaskDataLayer.getStats();

  return {
    tasks,
    actionableTasks,
    completedTasks,
    blockedTasks,
    stats,
    getTask: (id: string) => () => TaskDataLayer.getTask(id),
    getTaskState: (id: string) => () => TaskDataLayer.getTaskState(id),
  };
};
