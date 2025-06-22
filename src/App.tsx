import { createSignal, For, type Accessor, type Setter } from 'solid-js';

import PWABadge from './PWABadge.tsx';
import { createStore } from 'solid-js/store';

type Task = {
  done: boolean;
  title: string;
};

const [tasks, setTasks] = createStore<Task[]>([]);

// TODO: Just used to give tasks different names until better task creation is implemented
let i = 0;

const createTask = () => {
  setTasks(tasks.length, { done: false, title: `title ${i++}` });
};

const Task = (props: {
  done: { get: () => boolean; set: (b: boolean) => void };
  title: Accessor<string>;
}) => {
  return (
    <div>
      <input
        type="checkbox"
        checked={props.done.get()}
        onChange={(e) => props.done.set(e.currentTarget.checked)}
      />
      <div>{props.title()}</div>
    </div>
  );
};

function App() {
  return (
    <>
      <For
        each={tasks}
        children={(task, idx) => {
          const [getDone, setDone] = createSignal(task.done);

          return (
            <Task
              done={{ get: () => task.done, set: setDone }}
              title={() => task.title}
            />
          );
        }}
      />
      <For
        each={tasks}
        children={(task, idx) => {
          const [getDone, setDone] = createSignal(task.done);

          return (
            <Task
              done={{ get: getDone, set: setDone }}
              title={() => task.title}
            />
          );
        }}
      />
      <button
        class="bg-blue-500 w-10 h-10"
        onClick={() => createTask()}
      ></button>
      <PWABadge />
    </>
  );
}

export default App;
