import { createBrowserRouter } from "react-router";
import { Layout } from "./components/Layout";
import { Home } from "./pages/Home";
import { Menu } from "./pages/Menu";
import { Order } from "./pages/Order";
import { Pedidos } from "./pages/Pedidos";
import { Auth } from "./pages/Auth";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Layout,
    children: [
      { index: true, Component: Home },
      { path: "auth", Component: Auth },
      { path: "menu", Component: Menu },
      { path: "pedido/:id", Component: Order },
      { path: "pedidos", Component: Pedidos },
      { path: "*", Component: Home }, // Fallback route
    ],
  }
]);
