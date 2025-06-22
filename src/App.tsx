import { createSignal } from 'solid-js';
import solidLogo from './assets/solid.svg';
import appLogo from '/favicon.svg';
import PWABadge from './PWABadge.tsx';

function App() {
  const [count, setCount] = createSignal(0);

  return (
    <>
      <div class="max-w-[1280px] mx-auto py-8 px-8 text-center">
        <div class="flex justify-center gap-8 mb-8">
          <a href="https://vite.dev" target="_blank" class="inline-block">
            <img
              src={appLogo}
              class="h-32 p-6 transition-[filter] duration-300 hover:drop-shadow-[0_0_2em_#646cffaa]"
              alt="ic-frontend logo"
            />
          </a>
          <a href="https://solidjs.com" target="_blank" class="inline-block">
            <img
              src={solidLogo}
              class="h-32 p-6 transition-[filter] duration-300 hover:drop-shadow-[0_0_2em_#61dafbaa]"
              alt="Solid logo"
            />
          </a>
        </div>
        <h1 class="text-[3.2em] leading-[1.1] mb-8">ic-frontend</h1>
        <div class="p-8">
          <button
            onClick={() => setCount((count) => count + 1)}
            class="rounded-lg border border-transparent px-5 py-3 text-base font-medium cursor-pointer transition-colors duration-[250ms] hover:border-[#646cff] focus:outline-4"
          >
            count is {count()}
          </button>
          <p class="mt-4">
            Edit <code>src/App.tsx</code> and save to test HMR
          </p>
        </div>
        <p class="text-[#888]">
          Click on the Vite and Solid logos to learn more
        </p>
        <PWABadge />
      </div>
    </>
  );
}

export default App;
