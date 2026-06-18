import { createBrowserRouter } from "react-router";
import Splash from "./screens/Splash";
import FarmerRegistration from "./screens/FarmerRegistration";
import CertificateUpload from "./screens/CertificateUpload";
import FarmerProductUpload from "./screens/FarmerProductUpload";
import CustomerHome from "./screens/CustomerHome";
import FarmDetails from "./screens/FarmDetails";
import AIAssistant from "./screens/AIAssistant";
import Profile from "./screens/Profile";
import NotificationCenter from "./screens/NotificationCenter";
import PickYourOwnBooking from "./screens/PickYourOwnBooking";
import HomeDelivery from "./screens/HomeDelivery";
import Login from "./screens/Login";
import Register from "./screens/Register";
import ForgotPassword from "./screens/ForgotPassword";
import ResetPassword from "./screens/ResetPassword";
import AdminDashboard from "./screens/AdminDashboard";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Splash,
  },
  {
    path: "/login",
    Component: Login,
  },
  {
    path: "/register",
    Component: Register,
  },
  {
    path: "/forgot-password",
    Component: ForgotPassword,
  },
  {
    path: "/reset-password",
    Component: ResetPassword,
  },
  {
    path: "/admin-dashboard",
    Component: AdminDashboard,
  },
  {
    path: "/farmer-registration",
    Component: FarmerRegistration,
  },
  {
    path: "/certificate-upload",
    Component: CertificateUpload,
  },
  {
    path: "/farmer-product-upload",
    Component: FarmerProductUpload,
  },
  {
    path: "/home",
    Component: CustomerHome,
  },
  {
    path: "/farm/:id",
    Component: FarmDetails,
  },
  {
    path: "/ai-assistant",
    Component: AIAssistant,
  },
  {
    path: "/profile",
    Component: Profile,
  },
  {
    path: "/notifications",
    Component: NotificationCenter,
  },
  {
    path: "/pick-your-own",
    Component: PickYourOwnBooking,
  },
  {
    path: "/home-delivery",
    Component: HomeDelivery,
  },
]);