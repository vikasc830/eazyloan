import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./modules/Login";
import Signup from "./modules/Signup";
import DashboardLayout from "./components/DashboardLayout.jsx";
import Dashboard from "./pages/Dashboard.jsx"; // your dashboard content
import Customers from "./pages/Customer.jsx";
import Loans from "./pages/Loans/Loans.jsx";
import Reports from "./pages/Reports.jsx";


function App() {
  return (
    <BrowserRouter>
      <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/dashboard" element={<DashboardLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="customers" element={<Customers />} />
          <Route path="loans" element={<Loans />} />
          <Route path="reports" element={<Reports />} />
        
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
