import {
  Component,
  JSX,
  createContext,
  useContext,
  createEffect,
  onCleanup,
  createSignal,
} from 'solid-js';
import {
  TaskDataLayer,
  createTaskQueries,
  type Task,
  type TaskEvent,
} from './dataLayer';

// Context type
interface TaskContextType {
  // Queries
  tasks: () => Task[];
  actionableTasks: () => import('./dataLayer').TaskState[];
  completedTasks: () => import('./dataLayer').TaskState[];
  blockedTasks: () => import('./dataLayer').TaskState[];
  stats: () => {
    total: number;
    completed: number;
    actionable: number;
    blocked: number;
  };
  getTask: (id: string) => () => Task | undefined;
  getTaskState: (id: string) => () => import('./dataLayer').TaskState | null;

  // Actions
  createTask: (params: {
    title: string;
    description?: string;
    dependencies?: string[];
  }) => Promise<Task>;
  updateTask: (
    id: string,
    updates: Partial<Pick<Task, 'title' | 'description'>>,
  ) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  toggleTaskComplete: (id: string) => Promise<void>;
  addDependency: (taskId: string, dependsOn: string) => Promise<void>;
  removeDependency: (taskId: string, dependsOn: string) => Promise<void>;

  // State
  isOnline: () => boolean;
  lastSynced: () => Date | null;
  syncStatus: () => 'idle' | 'syncing' | 'error';

  // Events
  events: () => TaskEvent[];
  clearEvents: () => void;
}

const TaskContext = createContext<TaskContextType>();

export interface TaskProviderProps {
  children: JSX.Element;
  // Future sync configuration
  syncEnabled?: boolean;
  syncEndpoint?: string;
  userId?: string;
}

export const TaskProvider: Component<TaskProviderProps> = (props) => {
  const queries = createTaskQueries();

  // Sync state for future implementation
  const [isOnline, setIsOnline] = createSignal(navigator.onLine);
  const [lastSynced] = createSignal<Date | null>(null);
  // const [, setLastSynced] = createSignal<Date | null>(null); // Future: for sync implementation
  const [syncStatus] = createSignal<'idle' | 'syncing' | 'error'>('idle');
  // const [, setSyncStatus] = createSignal<'idle' | 'syncing' | 'error'>('idle'); // Future: for sync implementation

  // Handle online/offline events
  createEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    onCleanup(() => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    });
  });

  // Wrapped actions with error handling and future sync hooks
  const createTask = async (params: {
    title: string;
    description?: string;
    dependencies?: string[];
  }) => {
    try {
      const task = TaskDataLayer.createTask(params);

      // Future: Queue for sync if enabled
      if (props.syncEnabled && isOnline()) {
        // Will implement sync logic here
        console.log('Task created, queuing for sync:', task.id);
      }

      return task;
    } catch (error) {
      console.error('Failed to create task:', error);
      throw error;
    }
  };

  const updateTask = async (
    id: string,
    updates: Partial<Pick<Task, 'title' | 'description'>>,
  ) => {
    try {
      TaskDataLayer.updateTask(id, updates);

      // Future: Queue for sync
      if (props.syncEnabled && isOnline()) {
        console.log('Task updated, queuing for sync:', id);
      }
    } catch (error) {
      console.error('Failed to update task:', error);
      throw error;
    }
  };

  const deleteTask = async (id: string) => {
    try {
      TaskDataLayer.deleteTask(id);

      // Future: Queue for sync
      if (props.syncEnabled && isOnline()) {
        console.log('Task deleted, queuing for sync:', id);
      }
    } catch (error) {
      console.error('Failed to delete task:', error);
      throw error;
    }
  };

  const toggleTaskComplete = async (id: string) => {
    try {
      TaskDataLayer.toggleTaskComplete(id);

      // Future: Queue for sync
      if (props.syncEnabled && isOnline()) {
        console.log('Task completion toggled, queuing for sync:', id);
      }
    } catch (error) {
      console.error('Failed to toggle task completion:', error);
      throw error;
    }
  };

  const addDependency = async (taskId: string, dependsOn: string) => {
    try {
      TaskDataLayer.addDependency(taskId, dependsOn);

      // Future: Queue for sync
      if (props.syncEnabled && isOnline()) {
        console.log('Dependency added, queuing for sync:', {
          taskId,
          dependsOn,
        });
      }
    } catch (error) {
      console.error('Failed to add dependency:', error);
      throw error;
    }
  };

  const removeDependency = async (taskId: string, dependsOn: string) => {
    try {
      TaskDataLayer.removeDependency(taskId, dependsOn);

      // Future: Queue for sync
      if (props.syncEnabled && isOnline()) {
        console.log('Dependency removed, queuing for sync:', {
          taskId,
          dependsOn,
        });
      }
    } catch (error) {
      console.error('Failed to remove dependency:', error);
      throw error;
    }
  };

  // Event management
  const events = () => TaskDataLayer.getEvents();
  const clearEvents = () => TaskDataLayer.clearEvents();

  // Future: Auto-sync when coming online
  createEffect(() => {
    if (props.syncEnabled && isOnline() && syncStatus() === 'idle') {
      // Check if we have pending changes to sync
      const pendingEvents = events();
      if (pendingEvents.length > 0) {
        console.log(
          `Coming online with ${pendingEvents.length} pending changes`,
        );
        // Will implement actual sync logic here
      }
    }
  });

  // Future: Periodic sync
  createEffect(() => {
    if (props.syncEnabled && isOnline()) {
      const interval = setInterval(() => {
        if (syncStatus() === 'idle') {
          // Perform background sync
          console.log('Performing background sync...');
          // Will implement sync logic here
        }
      }, 30000); // Sync every 30 seconds

      onCleanup(() => clearInterval(interval));
    }
  });

  const contextValue: TaskContextType = {
    // Queries
    tasks: queries.tasks,
    actionableTasks: queries.actionableTasks,
    completedTasks: queries.completedTasks,
    blockedTasks: queries.blockedTasks,
    stats: queries.stats,
    getTask: queries.getTask,
    getTaskState: queries.getTaskState,

    // Actions
    createTask,
    updateTask,
    deleteTask,
    toggleTaskComplete,
    addDependency,
    removeDependency,

    // State
    isOnline,
    lastSynced,
    syncStatus,

    // Events
    events,
    clearEvents,
  };

  return (
    <TaskContext.Provider value={contextValue}>
      {props.children}
    </TaskContext.Provider>
  );
};

export const useTaskContext = () => {
  const context = useContext(TaskContext);
  if (!context) {
    throw new Error('useTaskContext must be used within a TaskProvider');
  }
  return context;
};

// Hook for task-specific operations
export const useTask = (taskId: string) => {
  const context = useTaskContext();

  return {
    task: context.getTask(taskId),
    taskState: context.getTaskState(taskId),
    toggle: () => context.toggleTaskComplete(taskId),
    update: (updates: Partial<Pick<Task, 'title' | 'description'>>) =>
      context.updateTask(taskId, updates),
    delete: () => context.deleteTask(taskId),
    addDependency: (dependsOn: string) =>
      context.addDependency(taskId, dependsOn),
    removeDependency: (dependsOn: string) =>
      context.removeDependency(taskId, dependsOn),
  };
};

// Hook for bulk operations
export const useTaskOperations = () => {
  const context = useTaskContext();

  return {
    createTask: context.createTask,
    bulkComplete: async (taskIds: string[]) => {
      for (const id of taskIds) {
        await context.toggleTaskComplete(id);
      }
    },
    bulkDelete: async (taskIds: string[]) => {
      for (const id of taskIds) {
        await context.deleteTask(id);
      }
    },
    importTasks: (tasks: Task[]) => {
      return TaskDataLayer.importTasks(tasks);
    },
    exportTasks: () => {
      return TaskDataLayer.exportTasks();
    },
    validateDAG: () => {
      return TaskDataLayer.validateDAG();
    },
  };
};
