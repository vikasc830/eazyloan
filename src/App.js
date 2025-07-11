import { BrowserRouter, Routes, Route } from "react-router-dom";
import './App.css';
import Login from "./modules/Login";      
import Signup from "./modules/Signup";
import Dashboard from "./modules/Dashboard";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/dashboard" element={<Dashboard />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
