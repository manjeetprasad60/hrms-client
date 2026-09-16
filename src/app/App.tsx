import { RouterProvider } from 'react-router-dom';
import { router } from '../routes/router';
import { Providers } from './providers';
import { ErrorBoundary } from '../components/feedback/ErrorBoundary';

export function App() {
  return (
    <ErrorBoundary>
      <Providers>
        <RouterProvider router={router} />
      </Providers>
    </ErrorBoundary>
  );
}

export default App;
