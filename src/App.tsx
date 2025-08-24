import { createSignal, Show } from 'solid-js';
import { TaskProvider } from './TaskProvider';
import MainApp from './MainApp';
import DemoPage from './components/DemoPage';
import PWABadge from './PWABadge';

function App() {
  const [currentView, setCurrentView] = createSignal<'app' | 'demo'>('demo');

  return (
    <TaskProvider syncEnabled={false}>
      <div class="min-h-screen bg-gray-50">
        {/* Navigation */}
        <nav class="bg-white shadow-sm border-b">
          <div class="max-w-7xl mx-auto px-4">
            <div class="flex justify-between items-center h-16">
              <div class="flex items-center gap-8">
                <h1 class="text-xl font-bold text-gray-900">Task Manager</h1>
                <div class="flex gap-4">
                  <button
                    onClick={() => setCurrentView('demo')}
                    class={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                      currentView() === 'demo'
                        ? 'bg-blue-100 text-blue-700'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    Demo
                  </button>
                  <button
                    onClick={() => setCurrentView('app')}
                    class={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                      currentView() === 'app'
                        ? 'bg-blue-100 text-blue-700'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    App
                  </button>
                </div>
              </div>

              {/* Status indicator */}
              <div class="flex items-center gap-4 text-sm text-gray-600">
                <div class="flex items-center gap-2">
                  <div class="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>Online</span>
                </div>
                <div class="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
                  MVP Demo
                </div>
              </div>
            </div>
          </div>
        </nav>

        {/* Main Content */}
        <Show when={currentView() === 'demo'}>
          <DemoPage />
        </Show>

        <Show when={currentView() === 'app'}>
          <MainApp />
        </Show>

        <PWABadge />
      </div>
    </TaskProvider>
  );
}

export default App;
