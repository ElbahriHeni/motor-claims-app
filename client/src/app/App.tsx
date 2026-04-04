import { RouterProvider } from 'react-router';
import { router } from './routes';
import UserSwitcher from './components/UserSwitcher';

function App() {
  return (
    <>
      <UserSwitcher />
      <RouterProvider router={router} />
    </>
  );
}

export default App;