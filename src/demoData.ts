import { TaskDataLayer } from './dataLayer';

export interface DemoScenario {
  name: string;
  description: string;
  tasks: {
    title: string;
    description?: string;
    dependencies?: string[];
    completed?: boolean;
  }[];
}

export const demoScenarios: DemoScenario[] = [
  {
    name: 'Simple Project',
    description: 'A basic project with linear dependencies',
    tasks: [
      {
        title: 'Project Planning',
        description: 'Define project scope and requirements',
        completed: true,
      },
      {
        title: 'Design System',
        description: 'Create wireframes and design mockups',
        dependencies: ['Project Planning'],
      },
      {
        title: 'Development',
        description: 'Implement the core functionality',
        dependencies: ['Design System'],
      },
      {
        title: 'Testing',
        description: 'Write and run comprehensive tests',
        dependencies: ['Development'],
      },
      {
        title: 'Deployment',
        description: 'Deploy to production environment',
        dependencies: ['Testing'],
      },
    ],
  },
  {
    name: 'Complex DAG',
    description:
      'A project with parallel work streams and complex dependencies',
    tasks: [
      {
        title: 'Initialize Repository',
        description: 'Set up version control and basic project structure',
        completed: true,
      },
      {
        title: 'Database Design',
        description: 'Design database schema and relationships',
        dependencies: ['Initialize Repository'],
      },
      {
        title: 'API Design',
        description: 'Design REST API endpoints and documentation',
        dependencies: ['Initialize Repository'],
      },
      {
        title: 'Frontend Setup',
        description: 'Set up frontend framework and tooling',
        dependencies: ['Initialize Repository'],
      },
      {
        title: 'User Authentication',
        description: 'Implement login, registration, and session management',
        dependencies: ['Database Design', 'API Design'],
      },
      {
        title: 'User Interface Components',
        description: 'Create reusable UI components',
        dependencies: ['Frontend Setup'],
      },
      {
        title: 'Task Management API',
        description: 'Implement CRUD operations for tasks',
        dependencies: ['Database Design', 'API Design', 'User Authentication'],
      },
      {
        title: 'Task Management UI',
        description: 'Build task management interface',
        dependencies: ['User Interface Components', 'Task Management API'],
      },
      {
        title: 'Real-time Updates',
        description: 'Implement WebSocket connections for live updates',
        dependencies: ['Task Management API', 'Task Management UI'],
      },
      {
        title: 'Unit Tests',
        description: 'Write unit tests for all components',
        dependencies: ['Task Management API', 'Task Management UI'],
      },
      {
        title: 'Integration Tests',
        description: 'Write end-to-end integration tests',
        dependencies: ['Real-time Updates', 'Unit Tests'],
      },
      {
        title: 'Performance Optimization',
        description: 'Optimize performance and add caching',
        dependencies: ['Integration Tests'],
      },
      {
        title: 'Documentation',
        description: 'Write user and developer documentation',
        dependencies: ['Performance Optimization'],
      },
      {
        title: 'Production Deployment',
        description: 'Deploy to production with monitoring',
        dependencies: ['Documentation'],
      },
    ],
  },
  {
    name: 'Team Collaboration',
    description: 'A scenario showing multiple team members working in parallel',
    tasks: [
      {
        title: 'Project Kickoff',
        description: 'Team meeting to align on goals and timeline',
        completed: true,
      },
      {
        title: 'Backend Architecture',
        description: 'Design backend services and data flow',
        dependencies: ['Project Kickoff'],
      },
      {
        title: 'Frontend Architecture',
        description: 'Design frontend components and state management',
        dependencies: ['Project Kickoff'],
      },
      {
        title: 'DevOps Setup',
        description: 'Set up CI/CD pipeline and infrastructure',
        dependencies: ['Project Kickoff'],
      },
      {
        title: 'User Service',
        description: 'Implement user management microservice',
        dependencies: ['Backend Architecture'],
      },
      {
        title: 'Task Service',
        description: 'Implement task management microservice',
        dependencies: ['Backend Architecture'],
      },
      {
        title: 'Notification Service',
        description: 'Implement notification microservice',
        dependencies: ['Backend Architecture'],
      },
      {
        title: 'Dashboard Components',
        description: 'Build dashboard and analytics components',
        dependencies: ['Frontend Architecture'],
      },
      {
        title: 'Task Components',
        description: 'Build task creation and management components',
        dependencies: ['Frontend Architecture'],
      },
      {
        title: 'Service Integration',
        description: 'Integrate frontend with backend services',
        dependencies: [
          'User Service',
          'Task Service',
          'Dashboard Components',
          'Task Components',
        ],
      },
      {
        title: 'Push Notifications',
        description: 'Implement push notification system',
        dependencies: ['Notification Service', 'Service Integration'],
      },
      {
        title: 'Load Testing',
        description: 'Perform load testing on all services',
        dependencies: ['DevOps Setup', 'Service Integration'],
      },
      {
        title: 'Security Audit',
        description: 'Conduct security review and penetration testing',
        dependencies: ['Service Integration'],
      },
      {
        title: 'Beta Release',
        description: 'Deploy to staging for beta testing',
        dependencies: ['Push Notifications', 'Load Testing', 'Security Audit'],
      },
    ],
  },
  {
    name: 'Bug Fix Scenario',
    description:
      'Handling urgent bug fixes while maintaining development velocity',
    tasks: [
      {
        title: 'Critical Bug Report',
        description: 'User reports data loss in production',
        completed: true,
      },
      {
        title: 'Bug Investigation',
        description: 'Investigate root cause of data loss',
        dependencies: ['Critical Bug Report'],
      },
      {
        title: 'Data Recovery',
        description: 'Recover lost data from backups',
        dependencies: ['Bug Investigation'],
      },
      {
        title: 'Hotfix Development',
        description: 'Develop fix for the critical bug',
        dependencies: ['Bug Investigation'],
      },
      {
        title: 'Hotfix Testing',
        description: 'Test hotfix in staging environment',
        dependencies: ['Hotfix Development'],
      },
      {
        title: 'Emergency Deployment',
        description: 'Deploy hotfix to production',
        dependencies: ['Data Recovery', 'Hotfix Testing'],
      },
      {
        title: 'Feature Development',
        description: 'Continue with planned feature development',
        dependencies: ['Critical Bug Report'], // Can work in parallel
      },
      {
        title: 'Additional Testing',
        description: 'Add regression tests to prevent similar bugs',
        dependencies: ['Emergency Deployment'],
      },
      {
        title: 'Post-mortem Analysis',
        description: 'Analyze incident and improve processes',
        dependencies: ['Emergency Deployment'],
      },
      {
        title: 'Feature Integration',
        description: 'Integrate new features with hotfixed code',
        dependencies: ['Feature Development', 'Additional Testing'],
      },
    ],
  },
];

export function loadDemoScenario(scenarioName: string): void {
  const scenario = demoScenarios.find((s) => s.name === scenarioName);
  if (!scenario) {
    throw new Error(`Demo scenario '${scenarioName}' not found`);
  }

  // Clear existing tasks
  const existingTasks = TaskDataLayer.exportTasks();
  for (const task of existingTasks) {
    try {
      TaskDataLayer.deleteTask(task.id);
    } catch (e) {
      // Ignore errors when deleting (might have dependencies)
    }
  }

  // Create task mapping for dependency resolution
  const taskMap = new Map<string, string>();

  // First pass: create all tasks without dependencies
  for (const taskData of scenario.tasks) {
    try {
      const task = TaskDataLayer.createTask({
        title: taskData.title,
        description: taskData.description,
        dependencies: [], // Add dependencies in second pass
      });
      taskMap.set(taskData.title, task.id);
    } catch (error) {
      console.error(`Failed to create task '${taskData.title}':`, error);
    }
  }

  // Second pass: add dependencies
  for (const taskData of scenario.tasks) {
    if (taskData.dependencies && taskData.dependencies.length > 0) {
      const taskId = taskMap.get(taskData.title);
      if (!taskId) continue;

      for (const depTitle of taskData.dependencies) {
        const depId = taskMap.get(depTitle);
        if (depId) {
          try {
            TaskDataLayer.addDependency(taskId, depId);
          } catch (error) {
            console.error(
              `Failed to add dependency ${depTitle} -> ${taskData.title}:`,
              error,
            );
          }
        }
      }
    }
  }

  // Third pass: mark completed tasks
  for (const taskData of scenario.tasks) {
    if (taskData.completed) {
      const taskId = taskMap.get(taskData.title);
      if (taskId) {
        try {
          TaskDataLayer.toggleTaskComplete(taskId);
        } catch (error) {
          console.error(`Failed to complete task '${taskData.title}':`, error);
        }
      }
    }
  }

  console.log(`Loaded demo scenario: ${scenario.name}`);
}

export function clearAllTasks(): void {
  const tasks = TaskDataLayer.exportTasks();

  // Sort tasks by dependency count (tasks with no dependents first)
  const sortedTasks = tasks.sort((a, b) => {
    const aDependents = TaskDataLayer.getAllTaskStates().filter((state) =>
      state.task.dependencies.includes(a.id),
    ).length;
    const bDependents = TaskDataLayer.getAllTaskStates().filter((state) =>
      state.task.dependencies.includes(b.id),
    ).length;
    return aDependents - bDependents;
  });

  // Delete tasks in order
  for (const task of sortedTasks) {
    try {
      TaskDataLayer.deleteTask(task.id);
    } catch (error) {
      console.error(`Failed to delete task '${task.title}':`, error);
    }
  }

  console.log('Cleared all tasks');
}

export function createRandomTasks(count: number): void {
  const taskTitles = [
    'Implement user authentication',
    'Design database schema',
    'Create API documentation',
    'Write unit tests',
    'Set up CI/CD pipeline',
    'Implement real-time features',
    'Add error handling',
    'Optimize performance',
    'Update dependencies',
    'Fix security vulnerabilities',
    'Add logging and monitoring',
    'Implement caching layer',
    'Create user onboarding',
    'Add data validation',
    'Implement search functionality',
    'Add file upload feature',
    'Create admin dashboard',
    'Implement notifications',
    'Add internationalization',
    'Write integration tests',
  ];

  const descriptions = [
    'High priority task that needs immediate attention',
    'Medium priority enhancement for better user experience',
    'Low priority maintenance task',
    'Critical bug fix required for production',
    'New feature implementation',
    'Performance optimization task',
    'Security improvement task',
    'Code refactoring for better maintainability',
    'Documentation update needed',
    'Infrastructure improvement task',
  ];

  const createdTasks: string[] = [];

  for (let i = 0; i < count; i++) {
    const title = taskTitles[Math.floor(Math.random() * taskTitles.length)];
    const description =
      descriptions[Math.floor(Math.random() * descriptions.length)];

    // Randomly add dependencies (0-3 dependencies from already created tasks)
    const dependencies: string[] = [];
    const maxDeps = Math.min(3, createdTasks.length);
    const numDeps = Math.floor(Math.random() * (maxDeps + 1));

    for (let j = 0; j < numDeps; j++) {
      const randomTask =
        createdTasks[Math.floor(Math.random() * createdTasks.length)];
      if (!dependencies.includes(randomTask)) {
        dependencies.push(randomTask);
      }
    }

    try {
      const task = TaskDataLayer.createTask({
        title: `${title} ${i + 1}`,
        description,
        dependencies,
      });

      createdTasks.push(task.id);

      // Randomly complete some tasks (20% chance)
      if (Math.random() < 0.2) {
        TaskDataLayer.toggleTaskComplete(task.id);
      }
    } catch (error) {
      console.error(`Failed to create random task ${i + 1}:`, error);
    }
  }

  console.log(`Created ${createdTasks.length} random tasks`);
}

export function validateCurrentDAG(): { valid: boolean; message: string } {
  const validation = TaskDataLayer.validateDAG();

  if (validation.valid) {
    return {
      valid: true,
      message: 'Task dependencies form a valid DAG (no cycles detected)',
    };
  } else {
    const cycleDescriptions = validation.cycles.map((cycle) =>
      cycle.join(' → '),
    );
    return {
      valid: false,
      message: `Cycles detected in task dependencies:\n${cycleDescriptions.join('\n')}`,
    };
  }
}
