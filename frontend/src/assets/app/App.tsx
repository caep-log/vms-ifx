import { createBrowserRouter } from "react-router";
import { RouterProvider } from "react-router/dom";
import Index from '../features/public';

const router = createBrowserRouter([
  {
    path: "/",
    element: <Index />,
  },
]);

function App() {
  return (<RouterProvider router={router} />)
};

export default App;
