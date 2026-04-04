import { RouterProvider } from 'react-router';
import { router } from './routes';
import { useUserContext } from './context/UserContext';
import LoginPage from './pages/LoginPage';
import UserSwitcher from './components/UserSwitcher';

function App() {
  const { isAuthenticated } = useUserContext();

  if (!isAuthenticated) {
    return <LoginPage />;
  }

  return (
    <>
      <UserSwitcher />
      <RouterProvider router={router} />
    </>
  );
}

export default App;