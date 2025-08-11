import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import Sidebar from "./components/sidebar";
import Header from "./pages/Header"; 
import Login from "./pages/Login";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import PrivateRoute from "./components/PrivateRoute";
import Dashboard from "./pages/Dashboard";
import Users from "./pages/User";
import Artists from "./pages/Artists";
import Albums from "./pages/Albums";
import Playlists from "./pages/Playlists";
import Genres from "./pages/Genre";
import Song from "./pages/Song";
import Favourite from "./pages/Favourite";
import TextEditor from "./components/TextEditor";
import Faq from "./components/Faq";

export default function App() {
  return (
    <BrowserRouter>
      <Header />
      <ToastContainer position="top-right" autoClose={3000} />

      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} /> 
        <Route path="/reset-password" element={<ResetPassword/>}/>

        <Route
          path="/"
          element={
            <PrivateRoute>
              <Sidebar />
            </PrivateRoute>
          }
        >
          <Route index element={<Dashboard />} />
          
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="users" element={<Users />} />
          <Route path="artists" element={<Artists />} />
          <Route path="albums" element={<Albums />} />
          <Route path="playlists" element={<Playlists />} />
          <Route path="genres" element={<Genres />} />
          <Route path="songs" element={<Song />} />
          <Route path="favourites" element={<Favourite />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="text-editor" element={<TextEditor />} />
          <Route path="faq" element={<Faq />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
