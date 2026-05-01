import { useEffect, useState } from 'react';
import { load, save } from './storage';
import type { PacklistData, View } from './types';
import { Home } from './components/Home';
import { Editor } from './components/Editor';
import { Run } from './components/Run';

function App() {
  const [data, setData] = useState<PacklistData>(() => load());
  const [view, setView] = useState<View>({ name: 'home' });

  useEffect(() => {
    save(data);
  }, [data]);

  if (view.name === 'edit') {
    return (
      <div className="min-h-svh">
        <Editor
          data={data}
          setData={setData}
          listId={view.listId}
          onBack={() => setView({ name: 'home' })}
        />
      </div>
    );
  }

  if (view.name === 'run') {
    return (
      <div className="min-h-svh">
        <Run
          data={data}
          setData={setData}
          listId={view.listId}
          onBack={() => setView({ name: 'home' })}
          onEdit={() => setView({ name: 'edit', listId: view.listId })}
        />
      </div>
    );
  }

  return (
    <div className="min-h-svh">
      <Home
        data={data}
        setData={setData}
        onOpenEdit={(id) => setView({ name: 'edit', listId: id })}
        onOpenRun={(id) => setView({ name: 'run', listId: id })}
      />
    </div>
  );
}

export default App;
